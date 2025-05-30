"use client"

import { Trash2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ConfirmationDialog } from "@/components/custom/data-table/confirmation-dialog"
import { LoadingPage } from "@/components/custom/loading"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useCart } from "@/hooks/use-cart"
import { DELIVERY_FEE } from "@/lib/constants"
import { formatPrice } from "@/lib/format-price"

export default function CartPage() {
  const [isEmptyCartDialogIsOpen, setIsEmptyCartDialogIsOpen] = useState(false)

  const router = useRouter()
  const { items, total, updateQuantity, removeItem, isLoading, clearCart } = useCart()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">Your Cart</h1>

      {isLoading ? (
        <LoadingPage />
      ) : items.length === 0 ? (
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="mb-4 text-gray-600">Your cart is empty</p>
            <Link href="/">
              <Button>Continue Adding Items</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            {items.map(item => (
              <Card
                key={`${item.id}-${item.selectedAddons?.join("-")}`}
                className="mb-4 shadow-none hover:shadow-xs"
              >
                <CardContent className="flex items-center gap-2.5 p-2.5">
                  <div className="relative h-20 w-20 shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      className="rounded-md object-cover"
                      fill
                      sizes="80px"
                      priority
                    />
                  </div>
                  <div className="grow">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Price {item.selectedAddons?.length ? "with Add-ons " : null}
                      <strong className="text-primary">{formatPrice(item.price)}</strong>
                    </p>
                    {item.selectedAddons && item.selectedAddons.length > 0 && (
                      <>
                        {item.selectedAddons.length > 1 ? "Add-ons:" : "Add-on:"}
                        <ol className="text-sm text-muted-foreground list-decimal ml-4">
                          {item.selectedAddons.map(addon => (
                            <li key={addon}>{addon}</li>
                          ))}
                        </ol>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
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
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeItem(item.id, item.selectedAddons)}
                  >
                    <span className="sr-only">Remove</span>
                    <Trash2 size={16} />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="md:col-span-1">
            <Card className="shadow-none">
              <CardContent className="p-4">
                <h3 className="mb-4 text-lg font-semibold">Order Summary</h3>
                <div className="mb-4 flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="mb-4 flex justify-between">
                  <span>Delivery Fee</span>
                  <span>{formatPrice(DELIVERY_FEE)}</span>
                </div>
                <div className="mb-4 border-t pt-4">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{formatPrice(total + DELIVERY_FEE)}</span>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <Button className="w-full" onClick={() => router.push("/checkout")}>
                    Checkout
                  </Button>
                  <Button
                    className="w-fit"
                    variant="destructive"
                    onClick={() => setIsEmptyCartDialogIsOpen(true)}
                  >
                    <Trash2 size={7} />
                    <span className="sr-only">Empty Cart</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <ConfirmationDialog
              open={isEmptyCartDialogIsOpen}
              onOpenChange={setIsEmptyCartDialogIsOpen}
              title="Confirm Empty Cart"
              description={`${
                items.length > 0
                  ? `Are you sure you want to empty your cart from ${items.length} menu items?`
                  : "Are you sure you want to empty your cart?"
              } This action cannot be undone.`}
              buttonText="Empty Cart"
              buttonClass="bg-destructive hover:bg-destructive/90"
              onConfirm={clearCart}
            />
          </div>
        </div>
      )}
    </div>
  )
}
