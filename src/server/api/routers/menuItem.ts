import { TRPCError } from "@trpc/server"
import { eq, inArray, sql } from "drizzle-orm"
import { z } from "zod"
import { menuItemSchema } from "@/app/schemas/menuItem"
import { createSlug } from "@/lib/create-slug"
import { extractS3FileName } from "@/lib/extract-s3-filename"
import { createCaller } from "@/server/api/root"
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
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

  getMenuItemsByVendorId: protectedProcedure
    .input(z.object({ vendorId: z.string() }))
    .query(async ({ ctx, input }) => {
      // First get relevant category IDs for the vendor
      const categories = await ctx.db.query.menuCategories.findMany({
        where: (categories, { eq }) => eq(categories.vendorId, input.vendorId),
        columns: { id: true },
      })
      const categoryIds = categories.map(cat => cat.id)

      // Then get menu items for these categories
      const items = await ctx.db.query.menuItems.findMany({
        where: (items, { inArray }) => inArray(items.categoryId, categoryIds),
      })

      const [{ count: menuItemsCount = 0 } = { count: 0 }] = await ctx.db
        .select({ count: sql<number>`count(*)::int` })
        .from(menuItems)
        .where(inArray(menuItems.categoryId, categoryIds))

      return { items, menuItemsCount }
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
