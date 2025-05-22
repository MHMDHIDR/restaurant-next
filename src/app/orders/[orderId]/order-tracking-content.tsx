"use client"

import { CookingPot, Loader2, MapPin, Package, Truck } from "lucide-react"
import Image from "next/image"
import { useCallback, useEffect, useState } from "react"
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
  const [order, setOrder] = useState(initialOrder)
  const [progress, setProgress] = useState(0)
  const [isSendingInvoice, setIsSendingInvoice] = useState(false)
  const toast = useToast()

  // Memoize the subscription callback to prevent re-subscriptions
  const handleOrderUpdate = useCallback(
    (updatedOrder: any) => {
      console.log("📡 Received order update in tracking:", updatedOrder)

      setOrder(prevOrder => {
        const newOrder = {
          ...prevOrder,
          ...updatedOrder,
          // Preserve nested structures
          orderItems: updatedOrder.orderItems || prevOrder.orderItems,
        }
        console.log("🔄 Updated order state:", newOrder)
        return newOrder
      })

      toast.success(`Order status updated to ${updatedOrder.status.replace(/_/g, " ")}!`)
    },
    [toast],
  )

  // Subscribe to order updates with stable order ID
  const { data: subscriptionData, error: subscriptionError } =
    api.order.onOrderUpdate.useSubscription(
      { orderIds: [initialOrder.id] }, // Use initialOrder.id to prevent changing
      {
        enabled: true,
        onData: handleOrderUpdate,
        onError: error => {
          console.error("❌ Subscription error:", error)
          toast.error(`Failed to get order updates: ${error.message}`)
        },
      },
    )

  // Debug subscription status
  useEffect(() => {
    console.log("🔍 Subscription status for order:", initialOrder.id)
    console.log("📊 Subscription data:", subscriptionData)
    console.log("⚠️ Subscription error:", subscriptionError)
  }, [subscriptionData, subscriptionError, initialOrder.id])

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

  useEffect(() => {
    const currentIndex = orderStatuses.indexOf(order.status as (typeof orderStatuses)[number])
    const progressPercentage = (currentIndex / (orderStatuses.length - 1)) * 100
    setProgress(progressPercentage)
    console.log("📈 Progress updated:", { status: order.status, progress: progressPercentage })
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

  return (
    <div className="container max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">Order Details</h1>

      {/* Debug info in development */}
      {process.env.NODE_ENV === "development" && (
        <div className="mb-4 p-4 bg-gray-100 rounded-lg text-sm">
          <p>
            <strong>Debug Info:</strong>
          </p>
          <p>Order ID: {order.id}</p>
          <p>Current Status: {order.status}</p>
          <p>Progress: {progress}%</p>
          <p>Subscription Error: {subscriptionError?.message || "None"}</p>
        </div>
      )}

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

      <div className="mt-10 bg-white p-6 rounded-lg shadow">
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

      <div className="mt-2 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Order Details</h2>
        <div className="space-y-2">
          <ul className="divide-y divide-gray-100">
            {order.orderItems.map(item => (
              <li key={item.id} className="py-4">
                <div className="flex items-start gap-4">
                  <div className="relative h-16 w-16 flex-none rounded-lg overflow-hidden">
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
                      <p className="text-sm text-gray-500 mt-1">Note: {item.specialInstructions}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatPrice(Number(item.totalPrice))}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>${Number(order.subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Delivery Fee</span>
              <span>${Number(order.deliveryFee).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-medium text-base">
              <span>Total</span>
              <span>${Number(order.total).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
