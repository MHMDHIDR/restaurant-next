import EventEmitter, { on } from "node:events"
import { TRPCError } from "@trpc/server"
import { desc, eq, inArray, sql } from "drizzle-orm"
import { Resend } from "resend"
import { z } from "zod"
import { orderItemSchema, orderStatusSchema } from "@/app/schemas/order"
import { OrderInvoiceEmail } from "@/components/custom/order-email-template"
import { env } from "@/env"
import { rateLimiter } from "@/lib/rateLimiter"
import { PaymentService } from "@/lib/stripe"
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { notifications, orderItems, orders } from "@/server/db/schema"
import type { orderWithOrderItems } from "@/types"

type EventMap<T> = Record<keyof T, unknown[]>

interface OrderEvents {
  orderUpdate: [order: orderWithOrderItems]
}

class IterableEventEmitter<T extends EventMap<T>> extends EventEmitter {
  toIterable<TEventName extends keyof T & string>(
    eventName: TEventName,
    opts?: NonNullable<Parameters<typeof on>[2]>,
  ): AsyncIterable<T[TEventName]> {
    return on(this, eventName, opts) as AsyncIterable<T[TEventName]>
  }
}

// Create the event emitter instance
export const orderEventEmitter = new IterableEventEmitter<OrderEvents>()

// Helper function to emit order updates (call this from wherever you update orders)
export function emitOrderUpdate(order: orderWithOrderItems) {
  orderEventEmitter.emit("orderUpdate", order)
}

export const orderRouter = createTRPCRouter({
  createPaymentIntent: protectedProcedure
    .input(z.object({ orderId: z.string(), amount: z.number(), vendorId: z.string() }))
    .mutation(async ({ input }) => {
      const paymentIntent = await PaymentService.createPaymentIntent({
        id: input.orderId,
        vendorId: input.vendorId,
        total: String(input.amount),
      })

      return { clientSecret: paymentIntent.client_secret }
    }),

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
        paymentIntentId: z.string(),
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
            stripePaymentIntentId: input.paymentIntentId,
          })
          .returning()

        // Create order items
        if (!order) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create order" })
        }

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

        return order
      })
    }),

  getOrdersByVendorId: protectedProcedure
    .input(z.object({ vendorId: z.string() }))
    .query(async ({ ctx, input }) => {
      const where = eq(orders.vendorId, input.vendorId)
      const withClause = {
        user: { columns: { email: true } },
        orderItems: { with: { menuItem: { columns: { name: true, image: true } } } },
      }

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

  getOrdersByUserId: protectedProcedure.query(async ({ ctx }) => {
    const where = eq(orders.userId, ctx.session.user.id)
    const withClause = {
      orderItems: { with: { menuItem: { columns: { name: true, image: true } } } },
    }

    const [userOrders, [{ count = 0 } = { count: 0 }]] = await Promise.all([
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

    return { orders: userOrders, count }
  }),

  getAllOrders: protectedProcedure.query(async ({ ctx }) => {
    const withClause = {
      user: { columns: { email: true } },
      orderItems: { with: { menuItem: { columns: { name: true, image: true } } } },
    }

    const [allOrders, [{ count = 0 } = { count: 0 }]] = await Promise.all([
      ctx.db.query.orders.findMany({
        with: withClause,
        orderBy: [desc(orders.createdAt)],
      }),
      ctx.db.select({ count: sql<number>`count(*)::int` }).from(orders),
    ])

    return { orders: allOrders, count }
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

  deleteBulkOrders: protectedProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      const { ids } = input

      for (const id of ids) {
        await ctx.db.delete(orderItems).where(eq(orderItems.orderId, id))
        await ctx.db.delete(orders).where(eq(orders.id, id))
      }

      return { success: true }
    }),

  subscribeToOrderUpdates: protectedProcedure
    .input(z.object({ orderId: z.string() }))
    .query(async ({ ctx, input }) => {
      const order = await ctx.db.query.orders.findFirst({
        where: eq(orders.id, input.orderId),
        with: {
          orderItems: {
            with: {
              menuItem: true,
            },
          },
        },
      })

      if (!order) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" })
      }

      // Transform the order to match the expected type
      const transformedOrder: orderWithOrderItems = {
        ...order,
        orderItems: order.orderItems.map(item => ({
          ...item,
          unitPrice: parseFloat(item.unitPrice),
          totalPrice: parseFloat(item.totalPrice),
          specialInstructions: item.specialInstructions ?? "",
        })),
      }

      return transformedOrder
    }),

  updateOrderStatus: protectedProcedure
    .input(z.object({ orderId: z.string(), status: orderStatusSchema }))
    .mutation(async ({ ctx, input }) => {
      const orderToUpdate = await ctx.db.query.orders.findFirst({
        where: eq(orders.id, input.orderId),
        with: {
          user: true,
          orderItems: { with: { menuItem: { columns: { name: true } } } },
        },
      })
      if (!orderToUpdate) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" })
      }
      // Create notification
      const notificationTitle = `Order ${input.status.toLowerCase().replace(/_/g, " ")}`
      const itemsList = orderToUpdate.orderItems
        .map(item => `${item.quantity}x ${item.menuItem.name}`)
        .join(", ")
      return await ctx.db.transaction(async tx => {
        // Update order status
        const [updatedOrder] = await tx
          .update(orders)
          .set({ status: input.status, updatedAt: new Date() })
          .where(eq(orders.id, orderToUpdate.id))
          .returning()
        // Create notification for the user
        await tx.insert(notifications).values({
          userId: orderToUpdate.user.id,
          title: notificationTitle,
          message: `Your order (${itemsList}) has been ${input.status.toLowerCase().replace(/_/g, " ")}`,
          type: "ORDER_STATUS",
          isRead: false,
        })
        // Get the full order with items
        const fullOrder = await tx.query.orders.findFirst({
          where: eq(orders.id, input.orderId),
          with: { orderItems: { with: { menuItem: true } } },
        })
        if (fullOrder) {
          // Transform the database result to match the expected type
          const transformedOrder: orderWithOrderItems = {
            ...fullOrder,
            orderItems: fullOrder.orderItems.map(item => ({
              ...item,
              unitPrice: parseFloat(item.unitPrice),
              totalPrice: parseFloat(item.totalPrice),
              specialInstructions: item.specialInstructions ?? "",
            })),
          }
          // Emit the update through the new event emitter
          orderEventEmitter.emit("orderUpdate", transformedOrder)
        }
        // Prepare email content
        const RESEND = new Resend(env.AUTH_RESEND_KEY)
        let emailSubject = `Order Update from ${env.NEXT_PUBLIC_APP_NAME}`
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
          to: orderToUpdate.user.email,
          subject: emailSubject,
          html: emailContent,
        })
        return updatedOrder
      })
    }),

  emailInvoice: protectedProcedure
    .input(z.object({ orderId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id
      const ipAddress = ctx.headers.get("x-forwarded-for") ?? ctx.headers.get("x-real-ip")!

      // Check rate limiting
      const isAllowed = await rateLimiter({ userId, ipAddress, mins: 20 })
      if (!isAllowed) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: `You have sent the invoice too many times. Please try again later after 20 minutes.`,
        })
      }

      // Fetch order with all related data
      const order = await ctx.db.query.orders.findFirst({
        where: eq(orders.id, input.orderId),
        with: {
          user: true,
          orderItems: {
            with: {
              menuItem: {
                columns: {
                  name: true,
                  price: true,
                },
              },
            },
          },
        },
      })

      if (!order) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" })
      }

      const RESEND = new Resend(env.AUTH_RESEND_KEY)

      await RESEND.emails.send({
        from: env.ADMIN_EMAIL,
        to: order.user.email,
        replyTo: env.ADMIN_EMAIL,
        subject: `Order Invoice #${order.id}`,
        react: OrderInvoiceEmail({ order }),
      })

      return { success: true }
    }),

  onOrderUpdate: protectedProcedure
    .input(z.object({ orderIds: z.array(z.string()) }))
    .subscription(async function* (opts) {
      // Store the last known state of orders
      const lastKnownStates = new Map<string, string>()

      // Initial fetch to establish baseline
      const initialOrders = await opts.ctx.db.query.orders.findMany({
        where: inArray(orders.id, opts.input.orderIds),
        with: { orderItems: { with: { menuItem: true } } },
      })

      // Initialize last known states
      for (const order of initialOrders) {
        lastKnownStates.set(order.id, order.status)
      }

      // Polling interval (adjust as needed - 2 seconds for responsiveness)
      const POLL_INTERVAL = 2000

      while (true) {
        // Check if subscription was cancelled
        if (opts.signal?.aborted) {
          break
        }

        try {
          // Fetch current order states
          const currentOrders = await opts.ctx.db.query.orders.findMany({
            where: inArray(orders.id, opts.input.orderIds),
            with: { orderItems: { with: { menuItem: true } } },
          })

          // Check for status changes
          for (const order of currentOrders) {
            const lastKnownStatus = lastKnownStates.get(order.id)

            if (lastKnownStatus && lastKnownStatus !== order.status) {
              // Status changed - transform and yield the order
              const transformedOrder: orderWithOrderItems = {
                ...order,
                orderItems: order.orderItems.map(item => ({
                  ...item,
                  unitPrice: parseFloat(item.unitPrice),
                  totalPrice: parseFloat(item.totalPrice),
                  specialInstructions: item.specialInstructions ?? "",
                })),
              }

              // Update last known state
              lastKnownStates.set(order.id, order.status)

              // Yield the updated order
              yield transformedOrder
            } else if (!lastKnownStatus) {
              // New order - set initial state
              lastKnownStates.set(order.id, order.status)
            }
          }

          // Wait before next poll
          await new Promise(resolve => {
            const timeout = setTimeout(resolve, POLL_INTERVAL)

            // Clear timeout if subscription is cancelled
            opts.signal?.addEventListener("abort", () => {
              clearTimeout(timeout)
              resolve(undefined)
            })
          })
        } catch (error) {
          console.error("Error polling for order updates:", error)
          // Wait a bit longer on error before retrying
          await new Promise(resolve => {
            const timeout = setTimeout(resolve, POLL_INTERVAL * 2)
            opts.signal?.addEventListener("abort", () => {
              clearTimeout(timeout)
              resolve(undefined)
            })
          })
        }
      }
    }),
})
