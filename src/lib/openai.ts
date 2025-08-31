import OpenAI from "openai"
import { env } from "@/env"
import type { MenuCategories, MenuItems, Orders, Vendors } from "@/server/db/schema"
import type { OpenAIStructuredResponse } from "@/types/chart"

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
  ): Promise<{ content: string; tokensUsed: number; chartData?: string }> {
    const systemPrompt = this.buildSystemPrompt(context)

    const response = await this.client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.slice(-10), // sending the last 10 messages for context
      ],
      max_tokens: 1500,
      temperature: 0.3,
    })

    const aiResponse =
      response.choices[0]?.message?.content ?? "I'm sorry, I couldn't generate a response."
    const tokensUsed = response.usage?.total_tokens ?? 0

    // Try to parse structured response
    const parsedResponse = this.parseStructuredResponse(aiResponse)

    if (parsedResponse) {
      return {
        content: parsedResponse.textContent ?? "",
        tokensUsed,
        chartData: parsedResponse.chartData ? JSON.stringify(parsedResponse.chartData) : undefined,
      }
    }

    // Fallback to regular text response
    return { content: aiResponse, tokensUsed }
  }

  private parseStructuredResponse(response: string): OpenAIStructuredResponse | null {
    try {
      // Look for JSON blocks in the response
      const jsonRegex = /```json\s*([\s\S]*?)\s*```/
      const jsonMatch = jsonRegex.exec(response)
      if (jsonMatch?.[1]) {
        const parsed = JSON.parse(jsonMatch[1]) as OpenAIStructuredResponse
        return parsed
      }

      // Try to parse the entire response as JSON
      const parsed = JSON.parse(response) as OpenAIStructuredResponse
      return parsed
    } catch {
      return null
    }
  }

  private buildSystemPrompt(context: RestaurantContext): string {
    const isAdmin = context.isAdmin
    const restaurantData = this.formatRestaurantData(context)

    const chartInstructions = `
CHART CAPABILITIES:
You can create interactive charts to visualize data. When a response would benefit from visual representation, or when explicitly requested, respond with a structured JSON format.

For responses that should include charts, use this JSON structure:
\`\`\`json
{
  "responseType": "text_and_chart" | "chart" | "text",
  "textContent": "Optional explanatory text",
  "chartData": {
    "type": "bar" | "line" | "doughnut" | "pie",
    "title": "Chart title",
    "data": [
      {"label": "Label 1", "value": 100},
      {"label": "Label 2", "value": 200}
    ]
  }
}
\`\`\`

RESPONSE GUIDELINES:
- Use "chart" type when user explicitly asks for chart format or when data is purely numerical
- Use "text_and_chart" when explanation + visualization is needed
- Use "text" for general questions, explanations, or recommendations
- Choose appropriate chart types:
  * bar: Comparisons, rankings, counts
  * line: Trends over time
  * pie/doughnut: Composition, percentages, parts of whole

CHART TYPE SELECTION:
- Revenue over time → line chart
- Top items comparison → bar chart
- Order distribution → pie/doughnut chart
- Performance metrics → bar chart`

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

${chartInstructions}

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

${chartInstructions}

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
  context.allOrders
    ?.slice(0, 10)
    .map(o => `- Order #${o.id}: $${o.total} (${new Date(o.createdAt).toLocaleDateString()})`)
    .join("\n") ?? "No recent orders"
}
`
    } else {
      return `
RESTAURANT: ${context.vendorName}

BUSINESS OVERVIEW:
- Total Orders: ${context.orders?.length ?? 0}
- Total Revenue: $${context.totalRevenue?.toFixed(2) ?? "0.00"}
- Average Order Value: $${context.averageOrderValue?.toFixed(2) ?? "0.00"}
- Menu Categories: ${context.menuCategories?.length ?? 0}
- Total Menu Items: ${context.menuItems?.length ?? 0}

RECENT PERFORMANCE (Last 30 Days):
- Recent Orders: ${context.recentOrders?.length ?? 0}
- Recent Revenue: $${context.recentRevenue?.toFixed(2) ?? "0.00"}

SALES ANALYTICS:
- Total Items Sold: ${context.salesAnalytics?.totalItemsSold ?? 0}
- Unique Items Sold: ${context.salesAnalytics?.uniqueItemsSold ?? 0}
- Average Item Price: $${context.salesAnalytics?.averageItemPrice?.toFixed(2) ?? "0.00"}

BEST-SELLING MENU ITEMS (by quantity):
${
  context.topMenuItems
    ?.map(
      item =>
        `- ${item.name}: ${item.totalQuantitySold ?? 0} sold, $${Number(item.price).toFixed(2)} each, $${item.totalRevenue?.toFixed(2) ?? "0.00"} total revenue`,
    )
    .join("\n") ?? "No sales data available"
}

TOP REVENUE GENERATING ITEMS:
${
  context.topMenuItemsByRevenue
    ?.map(
      item =>
        `- ${item.name}: $${item.totalRevenue?.toFixed(2) ?? "0.00"} total revenue, ${item.totalQuantitySold ?? 0} sold`,
    )
    .join("\n") ?? "No revenue data available"
}

MENU CATEGORIES:
${
  context.menuCategories
    ?.map(
      cat =>
        `- ${cat.name}: ${context.menuItems?.filter(item => item.categoryId === cat.id).length ?? 0} items`,
    )
    .join("\n") ?? "No categories available"
}

RECENT ORDERS:
${
  context.recentOrders
    ?.slice(0, 5)
    .map(o => `- Order #${o.id}: $${o.total} (${new Date(o.createdAt).toLocaleDateString()})`)
    .join("\n") ?? "No recent orders"
}

MENU ITEM DETAILS:
${
  context.menuItems
    ?.slice(0, 20)
    .map(
      item =>
        `- ${item.name}: $${Number(item.price).toFixed(2)} (${item.isAvailable ? "Available" : "Unavailable"})`,
    )
    .join("\n") ?? "No menu items available"
}
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
  menuCategories?: MenuCategories[]
  totalRevenue?: number
  averageOrderValue?: number
  topMenuItems?: (MenuItems & {
    totalQuantitySold?: number
    totalRevenue?: number
    orderCount?: number
  })[]
  topMenuItemsByRevenue?: (MenuItems & {
    totalQuantitySold?: number
    totalRevenue?: number
    orderCount?: number
  })[]
  menuItemSalesData?: Array<{
    item: MenuItems
    totalQuantity: number
    totalRevenue: number
    orderCount: number
  }>
  recentOrders?: Orders[]
  recentRevenue?: number
  salesAnalytics?: {
    totalItemsSold: number
    uniqueItemsSold: number
    totalMenuItems: number
    averageItemPrice: number
  }

  // Admin-specific data
  allVendors?: Vendors[]
  allOrders?: Orders[]
  topVendors?: Array<{ name: string; orderCount: number; totalRevenue: number }>
}

export const openAIService = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
})
