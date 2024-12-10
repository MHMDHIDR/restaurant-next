import { TRPCError } from "@trpc/server"
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
})
