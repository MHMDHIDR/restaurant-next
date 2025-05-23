import { NextResponse } from "next/server"
import { api } from "@/trpc/server"
import type { NextRequest } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const { orderId } = await params

  // Set SSE headers
  const response = new NextResponse(
    new ReadableStream({
      async start(controller) {
        try {
          // Send initial order data
          const order = await api.order.subscribeToOrderUpdates({ orderId })
          controller.enqueue(`data: ${JSON.stringify(order)}\n\n`)

          // Keep the connection alive
          const keepAlive = setInterval(() => {
            controller.enqueue(": keepalive\n\n")
          }, 30000)

          // Cleanup on close
          request.signal.addEventListener("abort", () => {
            clearInterval(keepAlive)
          })
        } catch (error) {
          console.error("Error in SSE stream:", error)
          controller.close()
        }
      },
    }),
    {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    },
  )

  return response
}
