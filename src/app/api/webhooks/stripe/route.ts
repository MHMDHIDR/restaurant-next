import { eq } from "drizzle-orm"
import { headers } from "next/headers"
import { NextResponse } from "next/server"
import Stripe from "stripe"
import { env } from "@/env"
import { db } from "@/server/db"
import { orders, payouts, vendors } from "@/server/db/schema"

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

      case "payout.paid": {
        const payout = event.data.object

        console.log("Payout paid event received:", {
          payoutId: payout.id,
          amount: payout.amount,
          account: event.account,
        })

        // Find the vendor by Stripe account ID
        const vendor = await db.query.vendors.findFirst({
          where: eq(vendors.stripeAccountId, event.account!),
        })

        if (!vendor) {
          console.error("Vendor not found for Stripe account:", event.account)
          return new NextResponse("Vendor not found", { status: 404 })
        }

        // Fetch balance transactions for this payout
        const balanceTransactions = await stripe.balanceTransactions.list(
          {
            payout: payout.id,
            limit: 100, // Adjust as needed
          },
          {
            stripeAccount: event.account!,
          },
        )

        // Store payout event in database
        await db.insert(payouts).values({
          vendorId: vendor.id,
          stripePayoutId: payout.id,
          stripeAccountId: event.account!,
          amount: (payout.amount / 100).toString(), // Convert from cents to dollars
          currency: payout.currency,
          status: "PAID",
          arrivalDate: new Date(payout.arrival_date * 1000),
          method: payout.method,
          type: payout.type,
          description: payout.description ?? null,
          stripePayoutData: payout as unknown as Record<string, unknown>,
          balanceTransactions: balanceTransactions.data,
        })

        // TODO: Trigger PDF generation here
        // await generatePayoutPDF(vendor.id, payout.id)

        break
      }

      case "payout.failed": {
        const payout = event.data.object

        const vendor = await db.query.vendors.findFirst({
          where: eq(vendors.stripeAccountId, event.account!),
        })

        if (vendor) {
          await db.insert(payouts).values({
            vendorId: vendor.id,
            stripePayoutId: payout.id,
            stripeAccountId: event.account!,
            amount: (payout.amount / 100).toString(),
            currency: payout.currency,
            status: "FAILED",
            arrivalDate: new Date(payout.arrival_date * 1000),
            method: payout.method,
            type: payout.type,
            description: payout.description ?? null,
            failureCode: payout.failure_code ?? null,
            failureMessage: payout.failure_message ?? null,
            stripePayoutData: payout as unknown as Record<string, unknown>,
          })
        }
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
