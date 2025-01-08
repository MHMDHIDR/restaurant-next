import { TRPCError } from "@trpc/server"
import { desc, eq, inArray, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { menuCategorySchema, updateCategorySchema } from "@/app/schemas/menuCategory"
import { createSlug } from "@/lib/create-slug"
import { extractS3FileName } from "@/lib/extract-s3-filename"
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
    .input(z.object({ hasItems: z.boolean().optional() }).optional())
    .query(async ({ ctx, input }) => {
      if (input?.hasItems) {
        // Get categories that have at least one menu item
        const categoriesWithItems = await ctx.db
          .select({
            id: menuCategories.id,
            name: menuCategories.name,
            description: menuCategories.description,
            image: menuCategories.image,
            isActive: menuCategories.isActive,
            slug: menuCategories.slug,
            sortOrder: menuCategories.sortOrder,
            itemCount: sql<number>`count(${menuItems.id})::int`,
          })
          .from(menuCategories)
          .where(eq(menuCategories.isActive, true))
          .innerJoin(menuItems, eq(menuItems.categoryId, menuCategories.id))
          .groupBy(menuCategories.id)
          .having(sql`count(${menuItems.id}) > 0`)

        return { menuCategories: categoriesWithItems }
      }

      // Get all categories without checking for items
      const categories = await ctx.db.query.menuCategories.findMany()
      const [{ count = 0 } = { count: 0 }] = await ctx.db
        .select({ count: sql<number>`count(*)::int` })
        .from(menuCategories)

      return { menuCategories: categories, count }
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
      const category = await ctx.db.query.menuCategories.findFirst({
        where: (categories, { eq }) => eq(categories.slug, input.categorySlug),
      })

      if (!category) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Category not found" })
      }

      const items = await ctx.db
        .select({
          menuItem: menuItems,
          vendor: { id: vendors.id, name: vendors.name },
        })
        .from(menuItems)
        .innerJoin(menuCategories, eq(menuItems.categoryId, menuCategories.id))
        .innerJoin(vendors, eq(menuCategories.vendorId, vendors.id))
        .where(eq(menuCategories.id, category.id))
        .orderBy(desc(menuItems.updatedAt))

      return { category, items }
    }),
})
