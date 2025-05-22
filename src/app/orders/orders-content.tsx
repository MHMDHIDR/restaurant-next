"use client"

import { useState } from "react"
import { DataTable } from "@/components/custom/data-table"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/trpc/react"
import { customerOrdersColumns } from "./orders-columns"
import type { BaseEntity } from "@/components/custom/data-table/base-columns"
import type { Orders } from "@/server/db/schema"
import type { orderWithOrderItems } from "@/types"
import type { ColumnDef } from "@tanstack/react-table"

type OrdersContentProps = {
  orders: orderWithOrderItems[]
  count: number
}

export function OrdersContent({ orders: initialOrders, count }: OrdersContentProps) {
  const [orders, setOrders] = useState(initialOrders)
  const toast = useToast()

  // Subscribe to order updates for all orders in the list
  api.order.onOrderUpdate.useSubscription(
    { orderIds: orders.map(order => order.id) },
    {
      onData: updatedOrder => {
        setOrders(prevOrders =>
          prevOrders.map(order => {
            if (order.id === updatedOrder.id) {
              return {
                ...order,
                ...updatedOrder,
                orderItems: updatedOrder.orderItems || order.orderItems,
              }
            }
            return order
          }),
        )
        toast.success(
          `Order #${updatedOrder.id} status updated to ${updatedOrder.status.replace(/_/g, " ")}!`,
        )
      },
      onError: error => {
        console.error("Failed to subscribe to order updates:", error)
        toast.error("Failed to get real-time order updates")
      },
    },
  )

  const ordersWithName = orders.map(order => ({ ...order, name: `Order #${order.id}` }))

  return (
    <div className="container py-10 mx-auto">
      <header className="mb-8 select-none">
        <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
        <small>
          <strong className="text-primary">{count}</strong> orders
        </small>
      </header>
      <DataTable<Orders & BaseEntity>
        columns={customerOrdersColumns as ColumnDef<Orders & BaseEntity>[]}
        data={ordersWithName}
        count={count}
        emptyStateMessage="Sorry, No orders found"
      />
    </div>
  )
}
