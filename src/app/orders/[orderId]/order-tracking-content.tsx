"use client"

import { ArrowLeft, CookingPot, Loader2, MapPin, Package, Truck } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import CopyText from "@/components/custom/copy"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { formatPrice } from "@/lib/format-price"
import { api } from "@/trpc/react"
import type { orderWithOrderItems } from "@/types"

const orderStatuses = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY_FOR_PICKUP",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
] as const

export function OrderTrackingContent({ order: initialOrder }: { order: orderWithOrderItems }) {
  const [progress, setProgress] = useState(0)
  const [isSendingInvoice, setIsSendingInvoice] = useState(false)
  const toast = useToast()
  const FIVE_SECONDS_REFETCH_INTERVAL = 5000

  // Use tRPC query hook directly
  const { data: order = initialOrder } = api.order.subscribeToOrderUpdates.useQuery(
    { orderId: initialOrder.id },
    { refetchInterval: FIVE_SECONDS_REFETCH_INTERVAL },
  )

  useEffect(() => {
    const currentIndex = orderStatuses.indexOf(order.status as (typeof orderStatuses)[number])
    const progressPercentage = (currentIndex / (orderStatuses.length - 1)) * 100
    setProgress(progressPercentage)
  }, [order.status])

  // Calculate icon position
  const getIconPosition = (progress: number) => {
    const minX = 40
    const maxX = 760
    const x = minX + ((maxX - minX) * progress) / 100
    const y = 80 - Math.sin((progress / 100) * Math.PI) * 40
    return { x, y }
  }

  const iconPos = getIconPosition(progress)

  const emailInvoice = api.order.emailInvoice.useMutation({
    onMutate: () => {
      setIsSendingInvoice(true)
      toast.loading("Sending order invoice...")
    },
    onSuccess: async () => {
      toast.success("Order invoice sent successfully! Please check your email.")
      setIsSendingInvoice(false)
    },
    onError: error => {
      toast.error(`Failed to send invoice: ${error.message}`)
      setIsSendingInvoice(false)
    },
  })

  return (
    <div className="container max-w-4xl mx-auto py-10 px-4">
      <Link
        href="/orders"
        className="text-sm text-blue-500 mb-4 inline-flex gap-x-2 hover:underline underline-offset-4"
      >
        <ArrowLeft className="size-5" /> Back to Orders
      </Link>
      <h1 className="text-3xl font-bold mb-8">Order Details</h1>

      <div className="relative">
        <svg className="w-full h-32" viewBox="0 0 800 160" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="progressGradient">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset={`${progress}%`} stopColor="#22c55e" />
              <stop offset={`${progress}%`} stopColor="#e5e7eb" />
              <stop offset="100%" stopColor="#e5e7eb" />
            </linearGradient>
          </defs>
          <path
            d="M 40 80 C 200 80, 600 30, 760 80"
            stroke="url(#progressGradient)"
            strokeWidth="4"
            fill="none"
          />
          <g transform={`translate(${iconPos.x}, ${iconPos.y})`}>
            <circle r="15" fill="white" stroke="#22c55e" strokeWidth="2" />
            <g transform="translate(-10, -10) scale(0.8)">
              {order.status === "PENDING" ? (
                <Loader2 className="text-green-500" />
              ) : order.status === "CONFIRMED" ? (
                <Package className="text-gray-500" />
              ) : order.status === "PREPARING" ? (
                <CookingPot className="text-primary" />
              ) : order.status === "READY_FOR_PICKUP" ? (
                <Truck className="text-green-500" />
              ) : order.status === "OUT_FOR_DELIVERY" ? (
                <Truck className="text-orange-500" />
              ) : order.status === "DELIVERED" ? (
                <MapPin className="text-green-500" />
              ) : (
                <MapPin className="text-green-500" />
              )}
            </g>
          </g>
        </svg>
        <div className="flex justify-between px-8 mt-4">
          {orderStatuses.map((status, index) => {
            const isActive =
              orderStatuses.indexOf(order.status as (typeof orderStatuses)[number]) >= index
            return (
              <div key={status} className="flex flex-col items-center">
                <div
                  className={`w-4 h-4 rounded-full mb-2 ${isActive ? "bg-green-500" : "bg-gray-300"}`}
                />
                <span
                  className={`text-sm font-medium ${isActive ? "text-green-500" : "text-gray-500"}`}
                >
                  {status.replace(/_/g, " ")}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-10 bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between">
          <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
          <Button
            variant={"pressable"}
            title="Click here to email the invoice of your order."
            onClick={() => emailInvoice.mutate({ orderId: order.id })}
            disabled={isSendingInvoice}
          >
            Email Invoice
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Order Date</p>
            <p className="font-medium">{new Date(order.createdAt).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-600">Delivery Address</p>
            <p className="font-medium">{order.deliveryAddress}</p>
          </div>
          <div>
            <p className="text-gray-600">Total Amount</p>
            <p className="font-medium">{formatPrice(Number(order.total))}</p>
          </div>
          {order.specialInstructions && (
            <div className="col-span-2">
              <p className="text-gray-600">Special Instructions</p>
              <p className="font-medium">{order.specialInstructions}</p>
            </div>
          )}
          <div>
            <p className="text-gray-600">OrderId</p>
            <div className="flex gap-1.5 items-center">
              <CopyText text={order.id} className="inline mr-3 size-5" />
              <p className="text-sm text-gray-600">{order.id}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-2 bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Order Details</h2>
        <div className="space-y-2">
          <ul className="divide-y divide-gray-100">
            {order.orderItems.map(
              (item: {
                id: string
                menuItem: { name: string; image: string }
                quantity: number
                unitPrice: number
                totalPrice: number
                specialInstructions?: string
              }) => (
                <li key={item.id} className="py-4">
                  <div className="flex items-start gap-4">
                    <div className="relative size-16 flex-none rounded-lg overflow-hidden">
                      <Image
                        src={item.menuItem.image}
                        alt={item.menuItem.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-auto">
                      <h4 className="font-medium">{item.menuItem.name}</h4>
                      <div className="text-sm text-gray-600">
                        <span>Quantity: {item.quantity}</span>
                        <span className="mx-2">·</span>
                        <span>{formatPrice(Number(item.unitPrice))} each</span>
                      </div>
                      {item.specialInstructions && (
                        <p className="text-sm text-gray-500 mt-1">
                          Note: {item.specialInstructions}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatPrice(Number(item.totalPrice))}</p>
                    </div>
                  </div>
                </li>
              ),
            )}
          </ul>
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>{formatPrice(Number(order.subtotal))}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Delivery Fee</span>
              <span>{formatPrice(Number(order.deliveryFee))}</span>
            </div>
            <div className="flex justify-between font-medium text-base">
              <span>Total</span>
              <span>{formatPrice(Number(order.total))}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
