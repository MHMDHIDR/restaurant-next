import Stripe from "stripe"
import { env } from "@/env"

// Initialize Stripe with your secret key
const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
})

export class PaymentService {
  // Create a Stripe Connect account for a vendor
  static async createConnectAccount(vendor: {
    email: string
    name: string
    phone: string
    address: string
    city: string
    state: string
    postalCode: string
  }) {
    try {
      const account = await stripe.accounts.create({
        type: "express",
        country: "GB",
        email: vendor.email,
        business_type: "individual",
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_profile: {
          name: vendor.name,
          support_email: vendor.email,
          support_phone: vendor.phone,
          mcc: "5812", // Restaurant, eating places
        },
        company: {
          address: {
            line1: vendor.address,
            city: vendor.city,
            state: vendor.state,
            postal_code: vendor.postalCode,
            country: "GB",
          },
        },
      })

      return account
    } catch (error) {
      if (error instanceof Error) {
        // Check for Connect-specific errors
        if (error.message.includes("signed up for Connect")) {
          throw new Error(
            "Stripe Connect is not enabled for this account. Please visit your Stripe Dashboard and set up Connect first.",
          )
        }
        console.error("Error creating Stripe Connect account:", error.message)
        throw error
      }
      throw error
    }
  }

  // Create an account link for Stripe Connect onboarding
  static async createAccountLink(accountId: string, refreshUrl: string, returnUrl: string) {
    try {
      const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: refreshUrl,
        return_url: returnUrl,
        type: "account_onboarding",
      })

      return accountLink
    } catch (error) {
      console.error("Error creating account link:", error)
      throw error
    }
  }

  // Get Stripe Connect account status
  static async getAccountStatus(accountId: string) {
    try {
      const account = await stripe.accounts.retrieve(accountId)
      return {
        isEnabled: account.charges_enabled && account.payouts_enabled,
        details_submitted: account.details_submitted,
      }
    } catch (error) {
      console.error("Error retrieving account status:", error)
      throw error
    }
  }

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
        amount: Math.round(amount * 100), // Convert to pence
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
