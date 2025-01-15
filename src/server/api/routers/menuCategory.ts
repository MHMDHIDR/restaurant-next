import { TRPCError } from "@trpc/server"
import { and, desc, eq, inArray, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { menuCategorySchema, updateCategorySchema } from "@/app/schemas/menuCategory"
import { ITEMS_PER_PAGE } from "@/lib/constants"
import { createSlug } from "@/lib/create-slug"
import { extractS3FileName } from "@/lib/extract-s3-filename"
import { pagination } from "@/lib/pagination"
import { createCaller } from "@/server/api/root"
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc"
import { menuCategories, menuItems, vendors } from "@/server/db/schema"

export const menuCategoryRouter = createTRPCRouter({
  createWithImage: protectedProcedure
    .input(menuCategorySchema.extend({ vendorId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { vendorId, ...data } = input

      return await ctx.db.transaction(async tx => {
        const vendor = await tx.query.vendors.findFirst({
          where: (vendors, { eq }) => eq(vendors.id, vendorId),
        })

        if (!vendor) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Vendor not found" })
        }

        // Create the category
        const [createdCategory] = await tx
          .insert(menuCategories)
          .values({ vendorId, slug: createSlug(data.name), ...data })
          .returning()

        return { success: true, createdCategory }
      })
    }),

  updateCategory: protectedProcedure
    .input(updateCategorySchema)
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.transaction(async tx => {
        const existingCategory = await tx.query.menuCategories.findFirst({
          where: (categories, { eq }) => eq(categories.id, input.id),
        })

        if (!existingCategory) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Category not found" })
        }

        // If there's a new image, delete the old one from S3
        if (input.image && input.image !== existingCategory.image) {
          const oldFileKey = extractS3FileName(existingCategory.image ?? "")
          if (oldFileKey) {
            const caller = createCaller(ctx)
            try {
              await caller.S3.deleteFile({ fileName: oldFileKey })
            } catch (error) {
              console.error("Failed to delete old image from S3:", error)
              // Continue with the update even if S3 deletion fails
            }
          }
        }

        // Prepare update data, only including fields that were provided
        const updateData: Partial<typeof menuCategories.$inferSelect> = {}

        if (input.name) {
          updateData.name = input.name
          updateData.slug = createSlug(input.name)
        }
        if (input.description !== undefined) updateData.description = input.description
        if (input.image !== undefined) updateData.image = input.image
        if (typeof input.isActive === "boolean") updateData.isActive = input.isActive
        if (typeof input.sortOrder === "number") updateData.sortOrder = input.sortOrder

        // Only perform update if there are fields to update
        if (Object.keys(updateData).length === 0) {
          return { success: true, updatedCategory: existingCategory }
        }

        const [updatedCategory] = await tx
          .update(menuCategories)
          .set(updateData)
          .where(eq(menuCategories.id, input.id))
          .returning()

        return { success: true, updatedCategory }
      })
    }),

  updateImage: protectedProcedure
    .input(z.object({ id: z.string(), image: z.string().url() }))
    .mutation(async ({ ctx, input }) => {
      const { id, image } = input

      // Update the category with the image URL
      const [updatedCategory] = await ctx.db
        .update(menuCategories)
        .set({ image })
        .where(eq(menuCategories.id, id))
        .returning()
      revalidatePath("/vendor-manager/categories")

      if (!updatedCategory) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Menu category not found" })
      }

      return { success: true, updatedCategory }
    }),

  getAllCategories: publicProcedure
    .input(
      z
        .object({
          hasItems: z.boolean().optional(),
          searchParams: z
            .object({ page: z.number().optional(), limit: z.number().optional() })
            .optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      if (input?.hasItems) {
        // Get total count first for categories with items
        const [{ count = 0 } = { count: 0 }] = await ctx.db
          .select({ count: sql<number>`count(distinct ${menuCategories.id})::int` })
          .from(menuCategories)
          .where(eq(menuCategories.isActive, true))
          .innerJoin(menuItems, eq(menuItems.categoryId, menuCategories.id))
          .innerJoin(
            vendors,
            and(eq(menuCategories.vendorId, vendors.id), eq(vendors.status, "ACTIVE")),
          )
          .having(sql`count(${menuItems.id}) > 0`)

        // If no searchParams provided, return all results without pagination
        if (!input?.searchParams?.page && !input?.searchParams?.limit) {
          const categoriesWithItems = await ctx.db
            .select({
              id: menuCategories.id,
              name: menuCategories.name,
              description: menuCategories.description,
              image: menuCategories.image,
              isActive: menuCategories.isActive,
              slug: menuCategories.slug,
              sortOrder: menuCategories.sortOrder,
              vendorId: menuCategories.vendorId,
              itemCount: sql<number>`count(${menuItems.id})::int`,
            })
            .from(menuCategories)
            .where(eq(menuCategories.isActive, true))
            .innerJoin(menuItems, eq(menuItems.categoryId, menuCategories.id))
            .innerJoin(
              vendors,
              and(eq(menuCategories.vendorId, vendors.id), eq(vendors.status, "ACTIVE")),
            )
            .groupBy(menuCategories.id)
            .having(sql`count(${menuItems.id}) > 0`)

          return { menuCategories: categoriesWithItems, count }
        }

        // Handle pagination
        const page = input.searchParams?.page ?? 1
        const limit = input.searchParams?.limit ?? ITEMS_PER_PAGE
        const paginationData = pagination.calculate({ page, limit, totalItems: count })

        const paginatedCategoriesWithItems = await ctx.db
          .select({
            id: menuCategories.id,
            name: menuCategories.name,
            description: menuCategories.description,
            image: menuCategories.image,
            isActive: menuCategories.isActive,
            slug: menuCategories.slug,
            sortOrder: menuCategories.sortOrder,
            vendorId: menuCategories.vendorId,
            itemCount: sql<number>`count(${menuItems.id})::int`,
          })
          .from(menuCategories)
          .where(eq(menuCategories.isActive, true))
          .innerJoin(menuItems, eq(menuItems.categoryId, menuCategories.id))
          .innerJoin(
            vendors,
            and(eq(menuCategories.vendorId, vendors.id), eq(vendors.status, "ACTIVE")),
          )
          .groupBy(menuCategories.id)
          .having(sql`count(${menuItems.id}) > 0`)
          .limit(paginationData.pageSize)
          .offset(paginationData.offset)

        return {
          menuCategories: paginatedCategoriesWithItems,
          count,
          pagination: paginationData,
        }
      }

      // Get total count first
      const [{ count = 0 } = { count: 0 }] = await ctx.db
        .select({ count: sql<number>`count(*)::int` })
        .from(menuCategories)

      // If no searchParams provided, return all results without pagination
      if (!input?.searchParams?.page && !input?.searchParams?.limit) {
        const categories = await ctx.db.query.menuCategories.findMany()
        return { menuCategories: categories, count }
      }

      // Handle pagination when searchParams is provided
      const page = input.searchParams?.page ?? 1
      const limit = input.searchParams?.limit ?? ITEMS_PER_PAGE
      const paginationData = pagination.calculate({ page, limit, totalItems: count })

      const paginatedCategories = await ctx.db.query.menuCategories.findMany({
        limit: paginationData.pageSize,
        offset: paginationData.offset,
      })

      return {
        menuCategories: paginatedCategories,
        count,
        pagination: paginationData,
      }
    }),

  getCategoriesByVendorId: protectedProcedure
    .input(z.object({ vendorId: z.string() }))
    .query(async ({ ctx, input }) => {
      const where = eq(menuCategories.vendorId, input.vendorId)
      const [categories, [{ count = 0 } = { count: 0 }]] = await Promise.all([
        ctx.db.query.menuCategories.findMany({ where }),
        ctx.db
          .select({ count: sql<number>`count(*)::int` })
          .from(menuCategories)
          .where(where),
      ])

      return { menuCategories: categories, menuCategoriesCount: count }
    }),

  getCategoriesByMenuItemId: protectedProcedure
    .input(z.object({ menuItemId: z.string() }))
    .query(async ({ ctx, input }) => {
      // First get the menu item to find its category and vendor
      const menuItem = await ctx.db.query.menuItems.findFirst({
        where: (items, { eq }) => eq(items.id, input.menuItemId),
        with: { category: { columns: { vendorId: true } } },
      })

      if (!menuItem?.category?.vendorId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Menu item or vendor not found" })
      }

      // Then get all categories for this vendor
      const categories = await ctx.db.query.menuCategories.findMany({
        where: (categories, { eq }) => eq(categories.vendorId, menuItem.category.vendorId),
      })

      return { menuCategories: categories }
    }),

  deleteCategoryWithImage: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const category = await ctx.db.query.menuCategories.findFirst({
        where: (menuCategories, { eq }) => eq(menuCategories.id, input.id),
      })

      if (!category?.image) {
        await ctx.db.delete(menuCategories).where(eq(menuCategories.id, input.id))
        return { success: true }
      }

      const fileKey = extractS3FileName(category.image)
      if (fileKey) {
        const caller = createCaller(ctx)
        await caller.S3.deleteFile({ fileName: fileKey })
      }

      await ctx.db.delete(menuCategories).where(eq(menuCategories.id, input.id))
      return { success: true }
    }),

  deleteCategory: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(menuCategories).where(eq(menuCategories.id, input.id))
      return { success: true }
    }),

  deleteBulkCategories: protectedProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      const categoriesToDelete = await ctx.db.query.menuCategories.findMany({
        where: (menuCategories, { inArray }) => inArray(menuCategories.id, input.ids),
      })

      if (categoriesToDelete.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Categories not found" })
      }

      // Delete images from S3
      const fileKeys = categoriesToDelete
        .map(cat => (cat.image ? extractS3FileName(cat.image) : null))
        .filter(Boolean)

      if (fileKeys.length > 0) {
        const caller = createCaller(ctx)
        for (const fileKey of fileKeys) {
          await caller.S3.deleteFile({ fileName: fileKey! })
        }
      }

      await ctx.db.delete(menuCategories).where(inArray(menuCategories.id, input.ids))
      return { success: true }
    }),

  getMenuItemsByCategorySlug: publicProcedure
    .input(z.object({ categorySlug: z.string() }))
    .query(async ({ ctx, input }) => {
      // Get categories that have at least one menu item and belong to active vendors
      const categories = await ctx.db
        .select({
          id: menuCategories.id,
          name: menuCategories.name,
          description: menuCategories.description,
          image: menuCategories.image,
          isActive: menuCategories.isActive,
          slug: menuCategories.slug,
          sortOrder: menuCategories.sortOrder,
          vendorId: menuCategories.vendorId,
        })
        .from(menuCategories)
        .innerJoin(
          vendors,
          and(eq(menuCategories.vendorId, vendors.id), eq(vendors.status, "ACTIVE")),
        )
        .where(eq(menuCategories.slug, input.categorySlug))

      if (!categories || categories.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Category not found" })
      }

      // Get all category IDs
      const categoryIds = categories.map(cat => cat.id)

      // Get all menu items from all matching categories
      const items = await ctx.db
        .select({
          menuItem: menuItems,
          vendor: {
            id: vendors.id,
            name: vendors.name,
            slug: vendors.slug,
            logo: vendors.logo,
          },
        })
        .from(menuItems)
        .innerJoin(menuCategories, eq(menuItems.categoryId, menuCategories.id))
        .innerJoin(
          vendors,
          and(eq(menuCategories.vendorId, vendors.id), eq(vendors.status, "ACTIVE")),
        )
        .where(inArray(menuCategories.id, categoryIds))
        .orderBy(desc(menuItems.updatedAt))

      // Use the first category for basic category info since they all have the same name/slug
      const categoryInfo = categories[0]

      return {
        category: categoryInfo,
        items,
        vendorCount: new Set(items.map(item => item.vendor.id)).size,
      }
    }),
})
