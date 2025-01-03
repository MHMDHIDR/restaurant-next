import Stripe from "stripe"
import { env } from "@/env"

// Initialize Stripe with your secret key
const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
})

export class PaymentService {
  // Create a payment intent for the order
  static async createPaymentIntent(order: { id: string; total: string; vendorId: string }) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(Number(order.total) * 100),
        currency: "gbp",
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          amount: order.total,
          orderId: order.id,
          vendorId: order.vendorId,
        },
      })

      return paymentIntent
    } catch (error) {
      console.error("Error creating payment intent:", error)
      throw error
    }
  }

  // Create a payout to vendor
  static async createPayout(vendorId: string, amount: number) {
    try {
      const vendor = await stripe.accounts.retrieve(vendorId)

      const transfer = await stripe.transfers.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "gbp",
        destination: vendor.id,
      })

      return transfer
    } catch (error) {
      console.error("Error creating payout:", error)
      throw error
    }
  }

  // Batch process payouts to vendors
  static async processBatchPayouts(payouts: Array<{ vendorId: string; amount: number }>) {
    const results = []

    for (const payout of payouts) {
      try {
        const transfer = await this.createPayout(payout.vendorId, payout.amount)
        results.push({
          success: true,
          vendorId: payout.vendorId,
          transferId: transfer.id,
        })
      } catch (error) {
        results.push({
          success: false,
          vendorId: payout.vendorId,
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    return results
  }
}
