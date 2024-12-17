import { TRPCError } from "@trpc/server"
import { eq } from "drizzle-orm"
import { z } from "zod"
import { menuCategorySchema } from "@/app/schemas/menuCategory"
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { menuCategories } from "@/server/db/schema"

export const menuCategoryRouter = createTRPCRouter({
  create: protectedProcedure.input(menuCategorySchema).mutation(async ({ ctx, input }) => {
    const { vendorId, ...data } = input

    // Ensure the vendor exists
    const vendor = await ctx.db.query.vendors.findFirst({
      where: (vendors, { eq }) => eq(vendors.id, vendorId),
    })

    if (!vendor) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Vendor not found" })
    }

    const [createdCategory] = await ctx.db
      .insert(menuCategories)
      .values({
        ...data,
        vendorId,
      })
      .returning()

    return { success: true, createdCategory }
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

      if (!updatedCategory) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Menu category not found" })
      }

      return { success: true, updatedCategory }
    }),
})
