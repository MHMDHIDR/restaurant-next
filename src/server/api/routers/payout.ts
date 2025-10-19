import { TRPCError } from "@trpc/server"
import { desc, eq } from "drizzle-orm"
import { z } from "zod"
import { generatePayoutPDF } from "@/lib/generate-payout-pdf"
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { payouts, UserRole } from "@/server/db/schema"

export const payoutRouter = createTRPCRouter({
  getByVendorId: protectedProcedure
    .input(z.object({ vendorId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Check authorization
      if (
        ctx.session.user.role !== UserRole.SUPER_ADMIN &&
        ctx.session.user.role !== UserRole.VENDOR_ADMIN
      ) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized" })
      }

      const payoutList = await ctx.db.query.payouts.findMany({
        where: eq(payouts.vendorId, input.vendorId),
        orderBy: [desc(payouts.createdAt)],
        with: {
          vendor: true,
        },
      })

      return payoutList
    }),

  getById: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const payout = await ctx.db.query.payouts.findFirst({
      where: eq(payouts.id, input.id),
      with: {
        vendor: true,
      },
    })

    if (!payout) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Payout not found" })
    }

    return payout
  }),

  generatePDF: protectedProcedure
    .input(z.object({ payoutId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const payout = await ctx.db.query.payouts.findFirst({
        where: eq(payouts.id, input.payoutId),
      })

      if (!payout) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Payout not found" })
      }

      // Generate PDF
      const pdfData = await generatePayoutPDF(payout.vendorId, payout.stripePayoutId)

      // TODO: Upload PDF to S3 and update payout record with PDF URL

      return { success: true, data: pdfData }
    }),
})
