"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/trpc/react"
import type { RouterOutputs } from "@/trpc/react"

type Vendor = RouterOutputs["vendor"]["getAll"]["items"][number]

export function PayoutButton({ vendors }: { vendors: Vendor[] }) {
  const [isProcessing, setIsProcessing] = useState(false)
  const toast = useToast()
  const utils = api.useUtils()

  const processPayoutsMutation = api.stripe.processVendorPayouts.useMutation({
    onSuccess: async () => {
      toast.success("Successfully processed payouts")
      await utils.vendor.getAll.invalidate()
      setIsProcessing(false)
    },
    onError: error => {
      toast.error(`Failed to process payouts: ${error.message}`)
      setIsProcessing(false)
    },
  })

  const handleProcessPayouts = () => {
    setIsProcessing(true)

    const eligibleVendors = vendors.filter(vendor => vendor.stripeAccountId)

    if (eligibleVendors.length === 0) {
      toast.error("No vendors with Stripe accounts found")
      setIsProcessing(false)
      return
    }

    const payouts = eligibleVendors.map(vendor => ({
      stripeAccountId: vendor.stripeAccountId!,
      amount: vendor.metrics?.totalRevenue ?? 0,
    }))

    processPayoutsMutation.mutate({ payouts })
  }

  return (
    <Button onClick={handleProcessPayouts} disabled={isProcessing}>
      {isProcessing ? "Processing Payouts..." : "Process Vendor Payouts"}
    </Button>
  )
}
