import { TRPCError } from "@trpc/server"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { menuCategorySchema } from "@/app/schemas/menuCategory"
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { menuCategories } from "@/server/db/schema"

export const menuCategoryRouter = createTRPCRouter({
  createWithImage: protectedProcedure.input(menuCategorySchema).mutation(async ({ ctx, input }) => {
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
        .values({ vendorId, ...data })
        .returning()

      return { success: true, createdCategory }
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
      const imageId = category?.image
      // get the string from /menu-category inside imageId
      const imageKeyToDelete = imageId?.split("/").slice(-1)[0]
      if (imageKeyToDelete) {
        // await api.S3.deleteFile({ fileName: imageKeyToDelete })
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
