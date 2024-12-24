"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useCart } from "@/hooks/use-cart"
import { DEFAULT_CURRENCY_SYMBOL } from "@/lib/constants"

export default function CartPage() {
  const router = useRouter()
  const { items, total, updateQuantity, removeItem } = useCart()

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-2xl font-bold">Your Cart</h1>
        <div className="text-center">
          <p className="mb-4 text-gray-600">Your cart is empty</p>
          <Link href="/">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">Your Cart</h1>
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          {items.map(item => (
            <Card key={`${item.id}-${item.selectedAddons?.join("-")}`} className="mb-4">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="relative h-24 w-24 flex-shrink-0">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="rounded-md object-cover"
                  />
                </div>
                <div className="flex-grow">
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {DEFAULT_CURRENCY_SYMBOL}
                    {item.price.toFixed(2)}
                  </p>
                  {item.selectedAddons && item.selectedAddons.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Add-ons: {item.selectedAddons.join(", ")}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateQuantity(item.id, (item.quantity ?? 1) - 1)}
                    disabled={(item.quantity ?? 1) <= 1}
                  >
                    -
                  </Button>
                  <span>{item.quantity ?? 1}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateQuantity(item.id, (item.quantity ?? 1) + 1)}
                  >
                    +
                  </Button>
                </div>
                <Button variant="destructive" size="sm" onClick={() => removeItem(item.id)}>
                  Remove
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="md:col-span-1">
          <Card>
            <CardContent className="p-4">
              <h3 className="mb-4 text-lg font-semibold">Order Summary</h3>
              <div className="mb-4 flex justify-between">
                <span>Subtotal</span>
                <span>
                  {DEFAULT_CURRENCY_SYMBOL}
                  {total.toFixed(2)}
                </span>
              </div>
              <div className="mb-4 flex justify-between">
                <span>Delivery Fee</span>
                <span>
                  {DEFAULT_CURRENCY_SYMBOL}
                  {5.0}
                </span>
              </div>
              <div className="mb-4 border-t pt-4">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>
                    {DEFAULT_CURRENCY_SYMBOL}
                    {(total + 5).toFixed(2)}
                  </span>
                </div>
              </div>
              <Button className="w-full" onClick={() => router.push("/checkout")}>
                Proceed to Checkout
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
