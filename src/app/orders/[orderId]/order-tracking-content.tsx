"use client"

import { MapPin, Package, Truck } from "lucide-react"
import { useEffect, useState } from "react"
import { type Orders } from "@/server/db/schema"

const orderStatuses = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY_FOR_PICKUP",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
] as const

export function OrderTrackingContent({ order }: { order: Orders }) {
  const [progress, setProgress] = useState(0)

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

  return (
    <div className="container max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">Order #{order.id}</h1>

      <div className="relative">
        {/* SVG Path */}
        <svg className="w-full h-32" viewBox="0 0 800 160" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="progressGradient">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset={`${progress}%`} stopColor="#22c55e" />
              <stop offset={`${progress}%`} stopColor="#e5e7eb" />
              <stop offset="100%" stopColor="#e5e7eb" />
            </linearGradient>
          </defs>

          {/* Curved tracking path aligned with markers */}
          <path
            d="M 40 80 C 200 80, 600 30, 760 80"
            stroke="url(#progressGradient)"
            strokeWidth="4"
            fill="none"
          />

          {/* Moving delivery icon */}
          <g transform={`translate(${iconPos.x}, ${iconPos.y})`}>
            <circle r="15" fill="white" stroke="#22c55e" strokeWidth="2" />
            <g transform="translate(-10, -10) scale(0.8)">
              {order.status === "OUT_FOR_DELIVERY" ? (
                <Truck className="text-green-500" />
              ) : order.status === "PREPARING" ? (
                <Package className="text-green-500" />
              ) : (
                <MapPin className="text-green-500" />
              )}
            </g>
          </g>
        </svg>

        {/* Status markers */}
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

      {/* Order details */}
      <div className="mt-12 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Order Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Delivery Address</p>
            <p className="font-medium">{order.deliveryAddress}</p>
          </div>
          <div>
            <p className="text-gray-600">Total Amount</p>
            <p className="font-medium">${Number(order.total).toFixed(2)}</p>
          </div>
          {order.specialInstructions && (
            <div className="col-span-2">
              <p className="text-gray-600">Special Instructions</p>
              <p className="font-medium">{order.specialInstructions}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
