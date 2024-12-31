"use client"

import { DataTable } from "@/components/custom/data-table"
import { customerOrdersColumns } from "./orders-columns"
import type { BaseEntity } from "@/components/custom/data-table/base-columns"
import type { Orders } from "@/server/db/schema"
import type { ColumnDef } from "@tanstack/react-table"

type OrdersContentProps = {
  orders: Orders[]
  count: number
}

export function OrdersContent({ orders, count }: OrdersContentProps) {
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
