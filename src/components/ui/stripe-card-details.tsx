import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { env } from "@/env"

const stripePromise = loadStripe(env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY)

type PaymentFormProps = {
  clientSecret: string
  onSuccess: (paymentIntentId: string) => void
  onError: (error: Error) => void
  billingDetails: {
    name: string
    email: string
    phone: string
    address: string
  }
}

export function StripeCardDetails({
  clientSecret,
  onSuccess,
  onError,
  billingDetails,
}: PaymentFormProps) {
  if (!clientSecret) return null

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <PaymentForm onSuccess={onSuccess} onError={onError} billingDetails={billingDetails} />
    </Elements>
  )
}

function PaymentForm({
  onSuccess,
  onError,
  billingDetails,
}: Omit<PaymentFormProps, "clientSecret">) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>("")

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setErrorMessage("")

    try {
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          payment_method_data: {
            billing_details: {
              name: billingDetails.name,
              email: billingDetails.email,
              phone: billingDetails.phone,
              address: {
                line1: billingDetails.address,
              },
            },
          },
          return_url: "https://localhost:3000/orders",
        },
        redirect: "if_required",
      })

      if (result.error) {
        setErrorMessage(result.error.message ?? "An unknown error occurred")
        onError(new Error(result.error.message ?? "Payment failed"))
      } else if (result.paymentIntent?.status === "succeeded") {
        onSuccess(result.paymentIntent.id)
      }
    } catch (e) {
      const error = e instanceof Error ? e : new Error("Payment failed")
      setErrorMessage(error.message)
      onError(error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Payment Details</h2>
        <PaymentElement />
      </div>

      {errorMessage && (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={!stripe || isProcessing} className="w-full">
        {isProcessing ? "Processing..." : "Pay Now"}
      </Button>
    </form>
  )
}
