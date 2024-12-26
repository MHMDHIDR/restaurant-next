import { desc, eq, sql } from "drizzle-orm"
import { Resend } from "resend"
import { z } from "zod"
import { orderStatusSchema } from "@/app/schemas/order"
import { env } from "@/env"
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { orderItems, orders } from "@/server/db/schema"

export const orderRouter = createTRPCRouter({
  getOrdersByVendorId: protectedProcedure
    .input(z.object({ vendorId: z.string() }))
    .query(async ({ ctx, input }) => {
      const where = eq(orders.vendorId, input.vendorId)
      const withClause = {
        user: {
          columns: {
            email: true,
          },
        },
        orderItems: {
          with: {
            menuItem: {
              columns: {
                name: true,
              },
            },
          },
        },
      } //as const

      const [vendorOrders, [{ count = 0 } = { count: 0 }]] = await Promise.all([
        ctx.db.query.orders.findMany({
          where,
          with: withClause,
          orderBy: [desc(orders.createdAt)],
        }),
        ctx.db
          .select({ count: sql<number>`count(*)::int` })
          .from(orders)
          .where(where),
      ])

      return { orders: vendorOrders, count }
    }),

  deleteOrder: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // First delete related order items
      await ctx.db.delete(orderItems).where(eq(orderItems.orderId, input.id))
      // Then delete the order
      await ctx.db.delete(orders).where(eq(orders.id, input.id))
      return { success: true }
    }),

  updateOrderStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: orderStatusSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const order = await ctx.db.query.orders.findFirst({
        where: eq(orders.id, input.id),
        with: {
          user: true,
          orderItems: { with: { menuItem: { columns: { name: true } } } },
        },
      })

      if (!order) throw new Error("Order not found")

      await ctx.db.update(orders).set({ status: input.status }).where(eq(orders.id, input.id))

      // Prepare email content
      const itemsList = order.orderItems
        .map(item => `${item.quantity}x ${item.menuItem.name}`)
        .join(", ")

      const RESEND = new Resend(env.AUTH_RESEND_KEY)
      let emailSubject = "Order Status Update"
      let emailContent = ""

      switch (input.status) {
        case "CONFIRMED":
          emailContent = `
            <h2>Order Confirmed</h2>
            <p>Your order (${itemsList}) has been confirmed and is being processed.</p>
            <p>We'll notify you when it starts being prepared.</p>
          `
          break
        case "PREPARING":
          emailContent = `
            <h2>Order Being Prepared</h2>
            <p>Good news! Your order (${itemsList}) is now being prepared.</p>
            <p>We'll let you know when it's ready for pickup or delivery.</p>
          `
          break
        case "READY_FOR_PICKUP":
          emailContent = `
            <h2>Order Ready for Pickup</h2>
            <p>Great news! Your order (${itemsList}) is ready for pickup.</p>
            <p>Please come to our restaurant to collect your order.</p>
          `
          break
        case "OUT_FOR_DELIVERY":
          emailContent = `
            <h2>Order Out for Delivery</h2>
            <p>Your order (${itemsList}) is now out for delivery!</p>
            <p>Our delivery partner is on the way to your location.</p>
          `
          break
        case "DELIVERED":
          emailContent = `
            <h2>Order Delivered</h2>
            <p>Your order (${itemsList}) has been delivered.</p>
            <p>We hope you enjoy your meal! Thank you for choosing us.</p>
          `
          break
        case "CANCELLED":
          emailSubject = "Order Cancelled"
          emailContent = `
            <h2>Order Cancelled</h2>
            <p>We're sorry, but your order (${itemsList}) has been cancelled.</p>
            <p>If you have any questions, please contact our support team.</p>
          `
          break
        default:
          emailContent = `
            <h2>Order Status Update</h2>
            <p>Your order (${itemsList}) status has been updated to: ${input.status}</p>
          `
      }

      // Send email notification using Resend
      await RESEND.emails.send({
        from: env.ADMIN_EMAIL,
        to: order.user.email,
        subject: emailSubject,
        html: emailContent,
      })

      return { success: true }
    }),
})
