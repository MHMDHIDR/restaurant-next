import OpenAI from "openai"
import { env } from "@/env"
import type { MenuItems, Orders, Vendors } from "@/server/db/schema"

export class OpenAIService {
  private client: OpenAI

  constructor() {
    this.client = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    })
  }

  async generateResponse(
    messages: { role: "system" | "user" | "assistant"; content: string }[],
    context: RestaurantContext,
  ): Promise<{ content: string; tokensUsed: number }> {
    const systemPrompt = this.buildSystemPrompt(context)

    const response = await this.client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.slice(-10), // sending the last 10 messages for context
      ],
      max_tokens: 1000,
      temperature: 0.3,
    })

    const content =
      response.choices[0]?.message?.content ?? "I'm sorry, I couldn't generate a response."
    const tokensUsed = response.usage?.total_tokens ?? 0

    return { content, tokensUsed }
  }

  private buildSystemPrompt(context: RestaurantContext): string {
    const isAdmin = context.isAdmin
    const restaurantData = this.formatRestaurantData(context)

    if (isAdmin) {
      return `You are an AI assistant specialized in restaurant business analytics for a multi-vendor restaurant platform.

You have access to data from ALL restaurants on the platform:
${restaurantData}

Your role is to:
- Provide insights across all restaurants and vendors
- Compare performance between different restaurants
- Identify platform-wide trends and opportunities
- Suggest improvements for overall platform performance
- Answer questions about aggregate business metrics

Always be professional, data-driven, and provide actionable insights. Use the provided data to support your responses with specific numbers and trends.`
    } else {
      return `You are an AI assistant specialized in restaurant business analytics. You are helping the owner/manager of "${context.vendorName}" understand their restaurant's performance.

Your restaurant data:
${restaurantData}

Your role is to:
- Analyze the restaurant's performance metrics
- Provide insights on orders, revenue, and customer behavior
- Suggest improvements for menu items and operations
- Answer questions about business trends and opportunities
- Help optimize pricing, menu offerings, and operational efficiency

Always be professional, supportive, and provide actionable insights. Use the provided data to support your responses with specific numbers and trends. Focus only on this restaurant's data.`
    }
  }

  private formatRestaurantData(context: RestaurantContext): string {
    if (context.isAdmin) {
      return `
PLATFORM OVERVIEW:
- Total Restaurants: ${context.allVendors?.length ?? 0}
- Total Orders: ${context.allOrders?.length ?? 0}
- Total Revenue: $${context.totalRevenue?.toFixed(2) ?? "0.00"}
- Average Order Value: $${context.averageOrderValue?.toFixed(2) ?? "0.00"}

TOP PERFORMING RESTAURANTS:
${context.topVendors?.map(v => `- ${v.name}: ${v.orderCount} orders, $${v.totalRevenue.toFixed(2)} revenue`).join("\n") ?? "No data available"}

RECENT ACTIVITY:
${
  context.recentOrders
    ?.slice(0, 10)
    .map(o => `- Order #${o.id}: $${o.total} (${new Date(o.createdAt).toLocaleDateString()})`)
    .join("\n") ?? "No recent orders"
}
`
    } else {
      return `
RESTAURANT: ${context.vendorName}
OVERVIEW:
- Total Orders: ${context.orders?.length ?? 0}
- Total Revenue: $${context.totalRevenue?.toFixed(2) ?? "0.00"}
- Average Order Value: $${context.averageOrderValue?.toFixed(2) ?? "0.00"}
- Menu Items: ${context.menuItems?.length ?? 0}

RECENT ORDERS:
${
  context.orders
    ?.slice(0, 10)
    .map(o => `- Order #${o.id}: $${o.total} (${new Date(o.createdAt).toLocaleDateString()})`)
    .join("\n") ?? "No recent orders"
}

TOP MENU ITEMS:
${context.topMenuItems?.map(item => `- ${item.name}: $${item.price}`).join("\n") ?? "No menu items available"}

PERFORMANCE TRENDS:
- This week vs last week order volume
- Peak ordering hours and days
- Customer feedback patterns
`
    }
  }
}

export interface RestaurantContext {
  isAdmin: boolean
  vendorName?: string
  vendorId?: string
  orders?: Orders[]
  menuItems?: MenuItems[]
  totalRevenue?: number
  averageOrderValue?: number
  topMenuItems?: MenuItems[]

  // Admin-specific data
  allVendors?: Vendors[]
  allOrders?: Orders[]
  topVendors?: Array<{ name: string; orderCount: number; totalRevenue: number }>
  recentOrders?: Orders[]
}

export const openAIService = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
})
