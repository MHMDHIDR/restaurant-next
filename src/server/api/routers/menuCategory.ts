import { TRPCError } from "@trpc/server"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { menuCategorySchema, updateCategorySchema } from "@/app/schemas/menuCategory"
import { createSlug } from "@/lib/create-slug"
import { extractS3FileName } from "@/lib/extract-s3-filename"
import { createCaller } from "@/server/api/root"
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { menuCategories } from "@/server/db/schema"

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

  getCategoriesByVendorId: protectedProcedure
    .input(z.object({ vendorId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.menuCategories.findMany({
        where: (categories, { eq }) => eq(categories.vendorId, input.vendorId),
      })
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
})
