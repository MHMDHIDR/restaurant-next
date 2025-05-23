import { TRPCError } from "@trpc/server"
import { observable } from "@trpc/server/observable"
import { desc, eq, sql } from "drizzle-orm"
import { Resend } from "resend"
import { z } from "zod"
import { orderItemSchema, orderStatusSchema } from "@/app/schemas/order"
import { OrderInvoiceEmail } from "@/components/custom/order-email-template"
import { env } from "@/env"
import { rateLimiter } from "@/lib/rateLimiter"
import { PaymentService } from "@/lib/stripe"
import { createTRPCRouter, protectedProcedure, subscriptionProcedure } from "@/server/api/trpc"
import { orderItems, orders } from "@/server/db/schema"
import type { orderWithOrderItems } from "@/types"

// Create a simple event emitter for SSE
const orderUpdateEmitter = new Map<string, Set<(order: orderWithOrderItems) => void>>()

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
      const [updatedOrder] = await ctx.db
        .update(orders)
        .set({ status: input.status, updatedAt: new Date() })
        .where(eq(orders.id, input.orderId))
        .returning()

      if (!updatedOrder) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        })
      }

      // Get the full order with items
      const fullOrder = await ctx.db.query.orders.findFirst({
        where: eq(orders.id, input.orderId),
        with: {
          orderItems: {
            with: {
              menuItem: true,
            },
          },
        },
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

        // Emit the update through SSE
        const callbacks = orderUpdateEmitter.get(input.orderId)
        if (callbacks) {
          callbacks.forEach(callback => callback(transformedOrder))
        }
      }

      return updatedOrder
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

  // Add subscription endpoint for order updates
  // In src/server/api/routers/order.ts
  onOrderUpdate: subscriptionProcedure
    .input(z.object({ orderIds: z.array(z.string()) }))
    .subscription(({ input }) => {
      return observable<orderWithOrderItems>(emit => {
        const onUpdate = (order: orderWithOrderItems) => {
          if (input.orderIds.includes(order.id)) {
            emit.next(order)
          }
        }

        // Add the callback to the emitter map for each order ID
        input.orderIds.forEach(orderId => {
          if (!orderUpdateEmitter.has(orderId)) {
            orderUpdateEmitter.set(orderId, new Set())
          }
          orderUpdateEmitter.get(orderId)?.add(onUpdate)
        })

        // Return cleanup function
        return () => {
          input.orderIds.forEach(orderId => {
            orderUpdateEmitter.get(orderId)?.delete(onUpdate)
            if (orderUpdateEmitter.get(orderId)?.size === 0) {
              orderUpdateEmitter.delete(orderId)
            }
          })
        }
      })
    }),
})
