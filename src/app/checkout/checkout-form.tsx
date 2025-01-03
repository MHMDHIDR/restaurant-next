"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { AddressInput } from "@/components/custom/AddressInput"
import { LoadingPage } from "@/components/custom/loading"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { StripeCardDetails } from "@/components/ui/stripe-card-details"
import { useCart } from "@/hooks/use-cart"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/trpc/react"
import type { CartItem } from "@/hooks/use-cart"
import type { Session } from "next-auth"

type CartCheckoutItems = Omit<CartItem, "image" | "vendorName" | "selectedAddons">

// Zod schema for checkout form
const checkoutSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Valid phone number is required"),
  deliveryAddress: z.string().min(5, "Delivery address is required"),
  specialInstructions: z.string().optional(),
})

type CheckoutFormValues = z.infer<typeof checkoutSchema>

type CheckoutFormProps = {
  user: Session["user"]
}

export default function CheckoutForm({ user }: CheckoutFormProps) {
  const router = useRouter()
  const toast = useToast()
  const { items, clearCart } = useCart()
  const [isProcessing, setIsProcessing] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [billingDetails, setBillingDetails] = useState<{
    name: string
    email: string
    phone: string
    address: string
  } | null>(null)

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: user?.name ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
      deliveryAddress: "",
      specialInstructions: "",
    },
  })

  const createOrder = api.stripe.create.useMutation()

  const calculateOrderTotals = (items: CartCheckoutItems[]) => {
    const subtotal = items.reduce((sum, item) => sum + item.price * (item.quantity ?? 1), 0)
    const deliveryFee = 5.0
    const total = subtotal + deliveryFee

    return { subtotal, deliveryFee, total }
  }

  const onSubmit = async (formData: CheckoutFormValues) => {
    try {
      setIsProcessing(true)

      // Group items by vendor
      const ordersByVendor = items.reduce(
        (acc, item) => {
          if (!item.vendorId) throw new Error("Item missing vendor ID")
          acc[item.vendorId] = [...(acc[item.vendorId] ?? []), item]
          return acc
        },
        {} as Record<string, CartCheckoutItems[]>,
      )

      const vendorEntries = Object.entries(ordersByVendor)
      if (vendorEntries.length === 0) throw new Error("No vendor items found")

      // Create orders for all vendors
      const orders = await Promise.all(
        vendorEntries.map(async ([vendorId, vendorItems]) => {
          const { subtotal, deliveryFee, total } = calculateOrderTotals(vendorItems)
          return createOrder.mutateAsync({
            vendorId,
            deliveryAddress: formData.deliveryAddress,
            specialInstructions: formData.specialInstructions,
            subtotal,
            deliveryFee,
            total,
            items: vendorItems.map(item => ({
              menuItemId: item.id,
              quantity: item.quantity ?? 1,
              unitPrice: item.price,
              totalPrice: item.price * (item.quantity ?? 1),
              specialInstructions: "",
            })),
          })
        }),
      )

      setBillingDetails({
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.deliveryAddress,
      })

      if (orders.length > 0 && orders[0]?.paymentIntent) {
        setClientSecret(orders[0].paymentIntent.clientSecret)
      } else {
        // Handle the case where there are no orders or paymentIntent is undefined
        toast.error("Failed to retrieve payment information.")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to process order")
      setIsProcessing(false)
    }
  }

  const handlePaymentSuccess = async () => {
    clearCart()
    toast.success("Order placed successfully!")
    router.push("/order-confirmation")
  }

  const handlePaymentError = (error: Error) => {
    toast.error(error.message)
    setIsProcessing(false)
  }

  useEffect(() => {
    if (items.length === 0) {
      router.push("/cart")
    }
  }, [items, router])

  return items.length === 0 ? (
    <LoadingPage />
  ) : (
    <div className="grid gap-8 md:grid-cols-3">
      <div className="md:col-span-2">
        <Card>
          <CardContent className="p-6">
            {!clientSecret || !billingDetails ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Delivery Information</h2>
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input {...field} readOnly />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" readOnly />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="deliveryAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Delivery Address</FormLabel>
                          <FormControl>
                            <AddressInput onAddressChange={field.onChange} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="specialInstructions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Special Instructions (Optional)</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isProcessing}>
                    {isProcessing ? "Processing..." : "Continue to Payment"}
                  </Button>
                </form>
              </Form>
            ) : (
              <StripeCardDetails
                clientSecret={clientSecret}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                billingDetails={billingDetails}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
