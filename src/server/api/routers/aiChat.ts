import { TRPCError } from "@trpc/server"
import { and, desc, eq, sql } from "drizzle-orm"
import { z } from "zod"
import { OpenAIService } from "@/lib/openai"
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import {
  chatMessages,
  chatSessions,
  menuItems,
  orders,
  UserRole,
  vendors,
} from "@/server/db/schema"
import type { RestaurantContext } from "@/lib/openai"

const openAIService = new OpenAIService()

export const aiChatRouter = createTRPCRouter({
  // Create a new chat session
  createChatSession: protectedProcedure
    .input(z.object({ title: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const user = ctx.session.user
      let vendorId: string | null = null

      // If user is not SUPER_ADMIN, find their vendor
      if (user.role !== UserRole.SUPER_ADMIN) {
        const vendor = await ctx.db.query.vendors.findFirst({
          where: eq(vendors.addedById, user.id),
        })

        if (!vendor) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "User is not associated with any vendor",
          })
        }

        vendorId = vendor.id
      }

      const [session] = await ctx.db
        .insert(chatSessions)
        .values({
          userId: user.id,
          vendorId,
          title: input.title || "New Chat",
        })
        .returning()

      return session
    }),

  // Get chat sessions for the current user
  getChatSessions: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.session.user

    return await ctx.db.query.chatSessions.findMany({
      where: eq(chatSessions.userId, user.id),
      orderBy: [desc(chatSessions.updatedAt)],
      with: {
        messages: {
          orderBy: [desc(chatMessages.createdAt)],
          limit: 1, // Get the last message for preview
        },
      },
    })
  }),

  // Get messages for a specific chat session
  getChatHistory: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = ctx.session.user

      // Verify user owns this session
      const session = await ctx.db.query.chatSessions.findFirst({
        where: and(eq(chatSessions.id, input.sessionId), eq(chatSessions.userId, user.id)),
      })

      if (!session) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Chat session not found",
        })
      }

      return await ctx.db.query.chatMessages.findMany({
        where: eq(chatMessages.sessionId, input.sessionId),
        orderBy: [chatMessages.createdAt],
      })
    }),

  // Send a message and get AI response
  sendMessage: protectedProcedure
    .input(
      z.object({
        sessionId: z.string(),
        message: z.string().min(1).max(1000),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.session.user

      // Verify user owns this session
      const session = await ctx.db.query.chatSessions.findFirst({
        where: and(eq(chatSessions.id, input.sessionId), eq(chatSessions.userId, user.id)),
        with: {
          vendor: true,
        },
      })

      if (!session) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Chat session not found",
        })
      }

      return await ctx.db.transaction(async tx => {
        // Save user message
        await tx.insert(chatMessages).values({
          sessionId: input.sessionId,
          role: "user",
          content: input.message,
        })

        // Get conversation history
        const conversationHistory = await tx.query.chatMessages.findMany({
          where: eq(chatMessages.sessionId, input.sessionId),
          orderBy: [chatMessages.createdAt],
          limit: 20, // Last 20 messages
        })

        // Build context based on user role
        const context = await buildRestaurantContext(ctx, user, session.vendor)

        // Format messages for OpenAI
        const messages = conversationHistory.map(msg => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        }))

        // Get AI response
        const { content: aiResponse, tokensUsed } = await openAIService.generateResponse(
          messages,
          context,
        )

        // Save AI response
        const [assistantMessage] = await tx
          .insert(chatMessages)
          .values({
            sessionId: input.sessionId,
            role: "assistant",
            content: aiResponse,
            tokensUsed,
          })
          .returning()

        // Update session timestamp
        await tx
          .update(chatSessions)
          .set({ updatedAt: new Date() })
          .where(eq(chatSessions.id, input.sessionId))

        return assistantMessage
      })
    }),

  // Get vendor-specific data for context
  getVendorData: protectedProcedure
    .input(z.object({ vendorId: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = ctx.session.user

      // Verify user has access to this vendor data
      if (user.role !== UserRole.SUPER_ADMIN) {
        const vendor = await ctx.db.query.vendors.findFirst({
          where: and(eq(vendors.id, input.vendorId), eq(vendors.addedById, user.id)),
        })

        if (!vendor) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Access denied to vendor data",
          })
        }
      }

      const [vendorOrders, vendorMenuItems, vendor] = await Promise.all([
        ctx.db.query.orders.findMany({
          where: eq(orders.vendorId, input.vendorId),
          orderBy: [desc(orders.createdAt)],
        }),
        ctx.db.query.menuItems.findMany({
          where: eq(menuItems.categoryId, input.vendorId),
        }),
        ctx.db.query.vendors.findFirst({
          where: eq(vendors.id, input.vendorId),
        }),
      ])

      const totalRevenue = vendorOrders.reduce((sum, order) => sum + Number(order.total), 0)
      const averageOrderValue = vendorOrders.length > 0 ? totalRevenue / vendorOrders.length : 0

      return {
        vendor,
        orders: vendorOrders,
        menuItems: vendorMenuItems,
        totalRevenue,
        averageOrderValue,
      }
    }),

  // Get all restaurants data (SUPER_ADMIN only)
  getAllRestaurantsData: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.session.user

    if (user.role !== UserRole.SUPER_ADMIN) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only super admins can access all restaurant data",
      })
    }

    const [allVendors, allOrders] = await Promise.all([
      ctx.db.query.vendors.findMany({
        orderBy: [desc(vendors.createdAt)],
      }),
      ctx.db.query.orders.findMany({
        orderBy: [desc(orders.createdAt)],
        limit: 100, // Last 100 orders
      }),
    ])

    const totalRevenue = allOrders.reduce((sum, order) => sum + Number(order.total), 0)
    const averageOrderValue = allOrders.length > 0 ? totalRevenue / allOrders.length : 0

    // Calculate top vendors by revenue
    const vendorRevenue = new Map<
      string,
      { name: string; orderCount: number; totalRevenue: number }
    >()

    for (const order of allOrders) {
      const vendor = allVendors.find(v => v.id === order.vendorId)
      if (vendor) {
        const existing = vendorRevenue.get(vendor.id) || {
          name: vendor.name,
          orderCount: 0,
          totalRevenue: 0,
        }
        existing.orderCount += 1
        existing.totalRevenue += Number(order.total)
        vendorRevenue.set(vendor.id, existing)
      }
    }

    const topVendors = Array.from(vendorRevenue.values())
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10)

    return {
      allVendors,
      allOrders,
      totalRevenue,
      averageOrderValue,
      topVendors,
    }
  }),
})

// Helper function to build restaurant context
async function buildRestaurantContext(
  ctx: any,
  user: any,
  vendor: any,
): Promise<RestaurantContext> {
  const isAdmin = user.role === UserRole.SUPER_ADMIN

  if (isAdmin) {
    // Get all restaurants data for admin
    const [allVendors, allOrders] = await Promise.all([
      ctx.db.query.vendors.findMany({
        orderBy: [desc(vendors.createdAt)],
      }),
      ctx.db.query.orders.findMany({
        orderBy: [desc(orders.createdAt)],
        limit: 100,
      }),
    ])

    const totalRevenue = allOrders.reduce((sum: number, order: any) => sum + Number(order.total), 0)
    const averageOrderValue = allOrders.length > 0 ? totalRevenue / allOrders.length : 0

    // Calculate top vendors by revenue
    const vendorRevenue = new Map<
      string,
      { name: string; orderCount: number; totalRevenue: number }
    >()

    for (const order of allOrders) {
      const vendorData = allVendors.find((v: any) => v.id === order.vendorId)
      if (vendorData) {
        const existing = vendorRevenue.get(vendorData.id) || {
          name: vendorData.name,
          orderCount: 0,
          totalRevenue: 0,
        }
        existing.orderCount += 1
        existing.totalRevenue += Number(order.total)
        vendorRevenue.set(vendorData.id, existing)
      }
    }

    const topVendors = Array.from(vendorRevenue.values())
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10)

    return {
      isAdmin: true,
      allVendors,
      allOrders,
      totalRevenue,
      averageOrderValue,
      topVendors,
      recentOrders: allOrders.slice(0, 20),
    }
  } else {
    // Get vendor-specific data
    if (!vendor) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Vendor not found",
      })
    }

    const [vendorOrders, vendorMenuItems] = await Promise.all([
      ctx.db.query.orders.findMany({
        where: eq(orders.vendorId, vendor.id),
        orderBy: [desc(orders.createdAt)],
      }),
      ctx.db.query.menuItems.findMany({
        where: eq(menuItems.categoryId, vendor.id),
      }),
    ])

    const totalRevenue = vendorOrders.reduce(
      (sum: number, order: any) => sum + Number(order.total),
      0,
    )
    const averageOrderValue = vendorOrders.length > 0 ? totalRevenue / vendorOrders.length : 0

    return {
      isAdmin: false,
      vendorName: vendor.name,
      vendorId: vendor.id,
      orders: vendorOrders,
      menuItems: vendorMenuItems,
      totalRevenue,
      averageOrderValue,
      topMenuItems: vendorMenuItems.slice(0, 10),
    }
  }
}
