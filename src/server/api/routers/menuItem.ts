import { TRPCError } from "@trpc/server"
import { and, eq, inArray, sql } from "drizzle-orm"
import { z } from "zod"
import { menuItemSchema } from "@/app/schemas/menuItem"
import { ITEMS_PER_PAGE } from "@/lib/constants"
import { createSlug } from "@/lib/create-slug"
import { extractS3FileName } from "@/lib/extract-s3-filename"
import { getBlurPlaceholder } from "@/lib/optimize-image"
import { pagination } from "@/lib/pagination"
import { createCaller } from "@/server/api/root"
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc"
import { menuItems } from "@/server/db/schema"
import type { MenuItems } from "@/server/db/schema"

const updateMenuItemSchema = z.object({
  id: z.string(),
  categoryId: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  price: z.number().positive("Price must be greater than 0").optional(),
  image: z.string().optional(),
  isAvailable: z.boolean().optional(),
  preparationTime: z.number().int().positive().optional(),
  allergens: z.array(z.string()).optional(),
  nutritionalInfo: z
    .object({
      calories: z.number().int(),
      protein: z.number().int(),
      carbs: z.number().int(),
      fat: z.number().int(),
    })
    .optional(),
  addons: z
    .array(
      z.object({
        toppingName: z.string(),
        toppingPrice: z.number().positive(),
      }),
    )
    .optional(),
})

export const menuItemRouter = createTRPCRouter({
  createMenuItem: protectedProcedure.input(menuItemSchema).mutation(async ({ ctx, input }) => {
    return await ctx.db.transaction(async tx => {
      const category = await tx.query.menuCategories.findFirst({
        where: (categories, { eq }) => eq(categories.id, input.categoryId),
      })

      if (!category) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Category not found" })
      }

      // Prepare the database input with correct types
      const dbInput: Omit<MenuItems, "id"> = {
        categoryId: input.categoryId,
        name: input.name,
        slug: createSlug(input.name),
        description: input.description,
        price: input.price.toString(),
        image: input.image,
        isAvailable: input.isAvailable,
        preparationTime: input.preparationTime,
        allergens: input.allergens,
        nutritionalInfo: input.nutritionalInfo,
        addons: input.addons ?? [],
        updatedAt: new Date(),
      }

      const [createdItem] = await tx.insert(menuItems).values(dbInput).returning()

      return { success: true, createdItem }
    })
  }),

  getMenuItems: protectedProcedure
    .input(z.object({ categoryId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.menuItems.findMany({
        where: (items, { eq }) => eq(items.categoryId, input.categoryId),
      })
    }),

  getAllMenuItems: protectedProcedure.query(async ({ ctx }) => {
    const items = await ctx.db.query.menuItems.findMany()

    const [{ count = 0 } = { count: 0 }] = await ctx.db
      .select({ count: sql<number>`count(*)::int` })
      .from(menuItems)

    return { items, count }
  }),

  getMenuItemsByVendorId: publicProcedure
    .input(
      z.object({
        vendorId: z.string(),
        addedById: z.string(),
        searchParams: z
          .object({ page: z.number().optional(), limit: z.number().optional() })
          .optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // First get relevant category IDs for the vendor
      const categories = await ctx.db.query.menuCategories.findMany({
        where: (categories, { eq, and }) =>
          and(eq(categories.vendorId, input.vendorId), eq(categories.isActive, true)),
        columns: { id: true },
      })
      const categoryIds = categories.map(cat => cat.id)

      // Determine if user should see all items
      const isUserSuperAdmin = ctx.session?.user.role === "SUPER_ADMIN"
      const isUserVendorAdmin =
        ctx.session?.user.role === "VENDOR_ADMIN" && input.addedById === ctx.session?.user.id

      // Create the where condition based on user role
      const baseCondition = inArray(menuItems.categoryId, categoryIds)
      const whereCondition =
        isUserSuperAdmin || isUserVendorAdmin
          ? baseCondition
          : and(baseCondition, eq(menuItems.isAvailable, true))

      // Get total count first
      const [{ count = 0 } = { count: 0 }] = await ctx.db
        .select({ count: sql<number>`count(*)::int` })
        .from(menuItems)
        .where(whereCondition)

      // If no searchParams provided, return all results without pagination
      if (!input?.searchParams?.page && !input?.searchParams?.limit) {
        const items = await ctx.db.query.menuItems.findMany({
          where: whereCondition,
        })

        const itemsWithBlurImages = items.map(async item => {
          const blurItemImage = await getBlurPlaceholder(item.image, 200, 200)

          return { ...item, blurImage: item.image ? blurItemImage : null }
        })

        return { items: await Promise.all(itemsWithBlurImages), count }
      }

      // Handle pagination when searchParams is provided
      const page = input.searchParams?.page ?? 1
      const limit = input.searchParams?.limit ?? ITEMS_PER_PAGE
      const paginationData = pagination.calculate({ page, limit, totalItems: count })

      const paginatedItems = await ctx.db.query.menuItems.findMany({
        where: whereCondition,
        limit: paginationData.pageSize,
        offset: paginationData.offset,
      })

      const itemsWithBlurImages = paginatedItems.map(async item => {
        const blurItemImage = await getBlurPlaceholder(item.image, 200, 200)
        return { ...item, blurImage: item.image ? blurItemImage : null }
      })
      const paginatedItemsWithBlur = await Promise.all(itemsWithBlurImages)

      return {
        items: paginatedItemsWithBlur,
        count,
        pagination: paginationData,
      }
    }),

  getMenuItemsByVendorSlug: publicProcedure
    .input(z.object({ vendorSlug: z.string().default("all") }))
    .query(async ({ ctx, input }) => {
      let items: (typeof menuItems.$inferSelect)[]

      if (input.vendorSlug === "all") {
        // Get all menu items
        items = await ctx.db.query.menuItems.findMany()
      } else {
        // First get the vendor by slug
        const vendor = await ctx.db.query.vendors.findFirst({
          where: (vendors, { eq }) => eq(vendors.slug, input.vendorSlug),
        })
        if (!vendor) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Vendor not found" })
        }
        // Get relevant category IDs for the vendor
        const categories = await ctx.db.query.menuCategories.findMany({
          where: (categories, { eq, and }) =>
            and(eq(categories.vendorId, vendor.id), eq(categories.isActive, true)),
          columns: { id: true },
        })
        const categoryIds = categories.map(cat => cat.id)
        // Create the where condition to fetch all items in these categories
        const whereCondition = inArray(menuItems.categoryId, categoryIds)
        // Fetch all menu items for the vendor
        items = await ctx.db.query.menuItems.findMany({
          where: whereCondition,
        })
      }

      // Add blur images to the items
      const itemsWithBlurImages = items.map(async item => {
        const blurItemImage = await getBlurPlaceholder(item.image, 200, 200)
        return { ...item, blurImage: item.image ? blurItemImage : null }
      })

      return { items: await Promise.all(itemsWithBlurImages) }
    }),

  getMenuItemByVendorSlugAndItemSlug: publicProcedure
    .input(z.object({ vendorSlug: z.string(), itemSlug: z.string() }))
    .query(async ({ ctx, input }) => {
      // First get the vendor by slug
      const vendor = await ctx.db.query.vendors.findFirst({
        where: (vendors, { eq }) => eq(vendors.slug, input.vendorSlug),
      })
      if (!vendor) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Vendor not found" })
      }

      // Get relevant category IDs for the vendor
      const categories = await ctx.db.query.menuCategories.findMany({
        where: (categories, { eq, and }) =>
          and(eq(categories.vendorId, vendor.id), eq(categories.isActive, true)),
        columns: { id: true },
      })
      const categoryIds = categories.map(cat => cat.id)
      // Create the where condition to fetch the item
      const whereCondition = and(
        inArray(menuItems.categoryId, categoryIds),
        eq(menuItems.slug, input.itemSlug),
      )
      // Fetch the menu item
      const item = await ctx.db.query.menuItems.findFirst({
        where: whereCondition,
      })
      if (!item) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Menu item not found" })
      }
      // Add blur image to the item
      const blurItemImage = await getBlurPlaceholder(item.image, 200, 200)
      return { item: { ...item, blurImage: item.image ? blurItemImage : null }, vendor }
    }),

  deleteMenuItem: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const menuItem = await ctx.db.query.menuItems.findFirst({
        where: (menuItems, { eq }) => eq(menuItems.id, input.id),
      })

      if (!menuItem) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Menu item not found" })
      }

      // Delete the image from S3 if it exists
      if (menuItem.image) {
        const fileKey = extractS3FileName(menuItem.image)
        if (fileKey) {
          const caller = createCaller(ctx)
          await caller.S3.deleteFile({ fileName: fileKey })
        }
      }

      await ctx.db.delete(menuItems).where(eq(menuItems.id, input.id))

      return { success: true }
    }),

  deleteBulkMenuItems: protectedProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      const menuItemsToDelete = await ctx.db.query.menuItems.findMany({
        where: (menuItems, { inArray }) => inArray(menuItems.id, input.ids),
      })

      if (menuItemsToDelete.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Menu items not found" })
      }

      // Delete the images from S3 if they exist
      const fileKeys = menuItemsToDelete.map(item => extractS3FileName(item.image)).filter(Boolean)
      if (fileKeys.length > 0) {
        for (const fileKey of fileKeys) {
          const caller = createCaller(ctx)
          await caller.S3.deleteFile({ fileName: fileKey! })
        }
      }

      await ctx.db.delete(menuItems).where(inArray(menuItems.id, input.ids))

      return { success: true }
    }),

  updateMenuItem: protectedProcedure
    .input(updateMenuItemSchema)
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.transaction(async tx => {
        const existingItem = await tx.query.menuItems.findFirst({
          where: (items, { eq }) => eq(items.id, input.id),
        })

        if (!existingItem) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Menu item not found" })
        }

        // If there's a new image, delete the old one from S3
        if (input.image && input.image !== existingItem.image) {
          const oldFileKey = extractS3FileName(existingItem.image)
          if (oldFileKey) {
            const caller = createCaller(ctx)
            await caller.S3.deleteFile({ fileName: oldFileKey })
          }
        }

        // Prepare update data, only including fields that were provided
        const updateData: Partial<MenuItems> = {}

        if (input.categoryId) updateData.categoryId = input.categoryId
        if (input.name) {
          updateData.name = input.name
          updateData.slug = createSlug(input.name)
        }
        if (input.description) updateData.description = input.description
        if (input.price) updateData.price = input.price.toString()
        if (input.image) updateData.image = input.image
        if (typeof input.isAvailable === "boolean") updateData.isAvailable = input.isAvailable
        if (input.preparationTime) updateData.preparationTime = input.preparationTime
        if (input.allergens) updateData.allergens = input.allergens
        if (input.nutritionalInfo) updateData.nutritionalInfo = input.nutritionalInfo
        if (input.addons) updateData.addons = input.addons

        const [updatedItem] = await tx
          .update(menuItems)
          .set(updateData)
          .where(eq(menuItems.id, input.id))
          .returning()

        return { success: true, updatedItem }
      })
    }),
})
