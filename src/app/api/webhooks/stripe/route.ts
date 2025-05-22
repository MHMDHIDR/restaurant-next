import { eq } from "drizzle-orm"
import { headers } from "next/headers"
import { NextResponse } from "next/server"
import Stripe from "stripe"
import { env } from "@/env"
import { db } from "@/server/db"
import { orders } from "@/server/db/schema"

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-02-24.acacia",
})

export async function POST(req: Request) {
  const body = await req.text()
  const signature = (await headers()).get("Stripe-Signature")

  if (!signature) {
    return new NextResponse("No signature", { status: 400 })
  }

  try {
    const event = stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET)

    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object

        // Update order status
        await db
          .update(orders)
          .set({ status: "CONFIRMED" })
          .where(eq(orders.stripePaymentIntentId, paymentIntent.id))

        break
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object

        // Update order status
        await db
          .update(orders)
          .set({ status: "CANCELLED" })
          .where(eq(orders.stripePaymentIntentId, paymentIntent.id))

        break
      }
    }

    return new NextResponse(null, { status: 200 })
  } catch (err) {
    console.error("Error processing webhook:", err)
    return new NextResponse(
      "Webhook error: " + (err instanceof Error ? err.message : "Unknown error"),
      { status: 400 },
    )
  }
}
