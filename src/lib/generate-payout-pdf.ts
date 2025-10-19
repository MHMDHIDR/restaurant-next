import { eq } from "drizzle-orm"
import { db } from "@/server/db"
import { payouts } from "@/server/db/schema"
import type Stripe from "stripe"

export async function generatePayoutPDF(vendorId: string, stripePayoutId: string) {
  // Fetch payout data from database
  const payoutData = await db.query.payouts.findFirst({
    where: eq(payouts.stripePayoutId, stripePayoutId),
    with: {
      vendor: true,
    },
  })

  if (!payoutData) {
    throw new Error("Payout not found")
  }

  // Get detailed balance transactions
  const balanceTransactions = payoutData.balanceTransactions as Stripe.BalanceTransaction[]

  // Group transactions by type
  const groupedTransactions = balanceTransactions.reduce(
    (acc, txn) => {
      const type = txn.type
      acc[type] ??= []
      acc[type].push(txn)
      return acc
    },
    {} as Record<string, Stripe.BalanceTransaction[]>,
  )

  // Calculate totals
  const totalGross = balanceTransactions.reduce((sum, txn) => sum + txn.amount, 0)
  const totalFees = balanceTransactions.reduce((sum, txn) => sum + txn.fee, 0)
  const totalNet = totalGross - totalFees

  const pdfData = {
    vendor: payoutData.vendor,
    payout: {
      id: payoutData.stripePayoutId,
      amount: payoutData.amount,
      currency: payoutData.currency.toUpperCase(),
      arrivalDate: payoutData.arrivalDate,
      method: payoutData.method,
      status: payoutData.status,
    },
    transactions: balanceTransactions,
    groupedTransactions,
    totals: {
      gross: totalGross / 100,
      fees: totalFees / 100,
      net: totalNet / 100,
    },
  }

  // TODO: Use @react-pdf/renderer or pdfkit to generate PDF
  // For now, return the data structure
  return pdfData
}

// Helper function to format transaction type
export function formatTransactionType(type: string): string {
  const types: Record<string, string> = {
    charge: "Payment",
    refund: "Refund",
    adjustment: "Adjustment",
    application_fee: "Application Fee",
    application_fee_refund: "Application Fee Refund",
    transfer: "Transfer",
    payment: "Payment",
    payout: "Payout",
    stripe_fee: "Stripe Fee",
  }
  return types[type] ?? type
}
