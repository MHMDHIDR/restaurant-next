import { TRPCError } from "@trpc/server"
import { eq } from "drizzle-orm"
import { z } from "zod"
import { orderItemSchema } from "@/app/schemas/order"
import { PaymentService } from "@/lib/stripe"
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { orderItems, orders, vendors } from "@/server/db/schema"

export const stripeRouter = createTRPCRouter({
  createPaymentIntent: protectedProcedure
    .input(z.object({ orderId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const order = await ctx.db.query.orders.findFirst({
        where: eq(orders.id, input.orderId),
      })

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        })
      }

      const paymentIntent = await PaymentService.createPaymentIntent(order)

      // Update order with payment intent ID
      await ctx.db
        .update(orders)
        .set({ stripePaymentIntentId: paymentIntent.id })
        .where(eq(orders.id, order.id))

      return {
        clientSecret: paymentIntent.client_secret,
      }
    }),

  //  procedure for admin to process vendor payouts
  processVendorPayouts: protectedProcedure
    .input(
      z.object({
        payouts: z.array(
          z.object({
            stripeAccountId: z.string(),
            amount: z.number().optional(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { payouts } = input

      // Ensure user is admin
      if (ctx.session.user.role !== "SUPER_ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only super admins can process payouts",
        })
      }

      try {
        // For each vendor, calculate their total revenue from orders
        const processedPayouts = await Promise.all(
          payouts.map(async payout => {
            // Find vendor by Stripe account ID
            const vendor = await ctx.db.query.vendors.findFirst({
              where: eq(vendors.stripeAccountId, payout.stripeAccountId),
            })

            if (!vendor) {
              throw new TRPCError({
                code: "NOT_FOUND",
                message: `Vendor with Stripe account ID ${payout.stripeAccountId} not found`,
              })
            }

            // Calculate total revenue from orders
            const vendorOrders = await ctx.db.query.orders.findMany({
              where: eq(orders.vendorId, vendor.id),
              columns: { total: true },
            })

            const totalRevenue = vendorOrders.reduce((sum: number, order) => {
              const orderTotal =
                typeof order.total === "string" ? parseFloat(order.total) : order.total
              return sum + orderTotal
            }, 0)

            const amount = Math.max(1, totalRevenue) // Ensure minimum amount is 1 cent

            // Create payout using PaymentService
            await PaymentService.createPayout(payout.stripeAccountId, amount)

            return {
              stripeAccountId: payout.stripeAccountId,
              amount,
            }
          }),
        )

        return {
          success: true,
          payouts: processedPayouts,
        }
      } catch (error) {
        console.error("Error processing payouts:", error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to process payouts",
        })
      }
    }),

  // Update your existing create procedure to handle payment
  create: protectedProcedure
    .input(
      z.object({
        vendorId: z.string(),
        deliveryAddress: z.string(),
        specialInstructions: z.string().optional(),
        subtotal: z.number(),
        deliveryFee: z.number(),
        total: z.number(),
        items: z.array(orderItemSchema),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.transaction(async tx => {
        // Create the order
        const [order] = await tx
          .insert(orders)
          .values({
            userId: ctx.session.user.id,
            vendorId: input.vendorId,
            status: "PENDING",
            subtotal: input.subtotal.toString(),
            deliveryFee: input.deliveryFee.toString(),
            total: input.total.toString(),
            deliveryAddress: input.deliveryAddress,
            specialInstructions: input.specialInstructions,
          })
          .returning()

        if (!order) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create order",
          })
        }

        // Create order items
        await tx.insert(orderItems).values(
          input.items.map(item => ({
            orderId: order.id,
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            unitPrice: item.unitPrice.toString(),
            totalPrice: item.totalPrice.toString(),
            specialInstructions: item.specialInstructions,
          })),
        )

        // Create payment intent
        const paymentIntent = await PaymentService.createPaymentIntent(order)

        // Update order with payment intent ID
        await tx
          .update(orders)
          .set({ stripePaymentIntentId: paymentIntent.id })
          .where(eq(orders.id, order.id))

        return {
          order,
          paymentIntent: {
            clientSecret: paymentIntent.client_secret,
          },
        }
      })
    }),
})
