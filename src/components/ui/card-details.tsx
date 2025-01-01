"use client"

import { CreditCard } from "lucide-react"
import { usePaymentInputs } from "react-payment-inputs"
import images from "react-payment-inputs/images"
import { Input } from "@/components/ui/input"
import type { CardImages } from "react-payment-inputs/images"

export default function CardDetails() {
  const { meta, getCardNumberProps, getExpiryDateProps, getCVCProps, getCardImageProps } =
    usePaymentInputs()

  return (
    <div className="space-y-2">
      <legend className="text-sm font-medium text-foreground">Card Details</legend>
      <div className="rounded-lg shadow-sm shadow-black/5">
        <div className="relative focus-within:z-10">
          <Input
            className="peer rounded-b-none pe-9 shadow-none [direction:inherit]"
            {...getCardNumberProps()}
          />
          <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 text-muted-foreground/80 peer-disabled:opacity-50">
            {meta.cardType ? (
              <svg
                className="overflow-hidden rounded-sm"
                {...getCardImageProps({ images: images as unknown as CardImages })}
                width={20}
              />
            ) : (
              <CreditCard size={16} strokeWidth={2} aria-hidden="true" />
            )}
          </div>
        </div>
        <div className="-mt-px flex">
          <div className="min-w-0 flex-1 focus-within:z-10">
            <Input
              className="rounded-e-none rounded-t-none shadow-none [direction:inherit]"
              {...getExpiryDateProps()}
            />
          </div>
          <div className="-ms-px min-w-0 flex-1 focus-within:z-10">
            <Input
              className="rounded-s-none rounded-t-none shadow-none [direction:inherit]"
              {...getCVCProps()}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
