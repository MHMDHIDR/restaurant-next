"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { LoadingPage } from "@/components/custom/loading"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import CardDetails from "@/components/ui/card-details"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useCart } from "@/hooks/use-cart"
import { useToast } from "@/hooks/use-toast"
import { autocomplete } from "@/lib/google"
import { api } from "@/trpc/react"
import type { Session } from "next-auth"

const checkoutSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Valid phone number is required"),
  deliveryAddress: z.string().min(5, "Delivery address is required"),
  specialInstructions: z.string().optional(),
})

type CheckoutFormValues = z.infer<typeof checkoutSchema>

export default function CheckoutForm({ user }: { user: Session["user"] }) {
  const router = useRouter()
  const toast = useToast()
  const { items, clearCart } = useCart()
  const [isProcessing, setIsProcessing] = useState(false)
  const [predictions, setPredictions] = useState<{ description: string; place_id: string }[]>([])
  const [input, setInput] = useState("")

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

  const createOrder = api.order.create.useMutation({
    onSuccess: () => {
      clearCart()
      toast.success("Order placed successfully!")
      router.push("/")
    },
    onError: error => {
      toast.error(error.message)
      setIsProcessing(false)
    },
  })

  useEffect(() => {
    const fetchPredictions = async () => {
      const predictions = await autocomplete(input)
      setPredictions(predictions ?? [])
    }
    if (input.length > 2) {
      void fetchPredictions()
    }
  }, [input])

  const onSubmit = async (data: CheckoutFormValues) => {
    setIsProcessing(true)

    // Group items by vendor
    const ordersByVendor = items.reduce(
      (acc, item) => {
        if (!item.vendorId) {
          throw new Error("Item missing vendor ID")
        }
        if (!acc[item.vendorId]) {
          acc[item.vendorId] = []
        }
        // only use acc if it is not null or undefined
        acc[item.vendorId]?.push(item)
        return acc
      },
      {} as Record<string, typeof items>,
    )

    // Create an order for each vendor
    for (const [vendorId, vendorItems] of Object.entries(ordersByVendor)) {
      const subtotal = vendorItems.reduce((sum, item) => sum + item.price * (item.quantity ?? 1), 0)

      await createOrder.mutateAsync({
        vendorId,
        deliveryAddress: data.deliveryAddress,
        specialInstructions: data.specialInstructions,
        subtotal,
        deliveryFee: 5.0,
        total: subtotal + 5.0,
        items: vendorItems.map(item => ({
          menuItemId: item.id,
          quantity: item.quantity ?? 1,
          unitPrice: item.price,
          totalPrice: item.price * (item.quantity ?? 1),
          specialInstructions: "",
        })),
      })
    }
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
                      <FormItem className="flex flex-col">
                        <FormLabel>Delivery Address</FormLabel>
                        <FormControl>
                          <Command className="border rounded-md">
                            <CommandInput
                              placeholder="Type your address..."
                              value={input}
                              onValueChange={setInput}
                            />
                            <CommandList>
                              <CommandEmpty>Start typing to search...</CommandEmpty>
                              <CommandGroup heading="Suggestions">
                                {predictions.map(prediction => (
                                  <CommandItem
                                    onSelect={() => {
                                      field.onChange(prediction.description)
                                      setInput(prediction.description)
                                    }}
                                  >
                                    {prediction.description}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                              <CommandSeparator />
                            </CommandList>
                          </Command>
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

                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Payment Information</h2>
                  <CardDetails />
                </div>

                <Button type="submit" className="w-full" disabled={isProcessing}>
                  {isProcessing ? "Processing..." : "Place Order"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
