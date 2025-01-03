import { redirect } from "next/navigation"
import CheckoutForm from "@/app/checkout/checkout-form"
import { auth } from "@/server/auth"

export default async function CheckoutPage() {
  const session = await auth()

  return !session ? (
    redirect("/signin?callbackUrl=/checkout")
  ) : (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">Checkout</h1>
      <CheckoutForm user={session.user} />
    </div>
  )
}
