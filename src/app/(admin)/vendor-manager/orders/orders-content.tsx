"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { DataTable } from "@/components/custom/data-table"
import { createActionsColumn } from "@/components/custom/data-table/actions-column"
import { ConfirmationDialog } from "@/components/custom/data-table/confirmation-dialog"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/trpc/react"
import { OrderStatusDialog } from "./order-status-dialog"
import { ordersColumns } from "./orders-columns"
import type { BaseEntity } from "@/components/custom/data-table/base-columns"
import type { Orders } from "@/server/db/schema"
import type { ColumnDef } from "@tanstack/react-table"

type OrdersContentProps = {
  orders: Orders[]
}

export function OrdersContent({ orders }: OrdersContentProps) {
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isStatusDialogOpen, setStatusDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Orders | null>(null)

  const router = useRouter()
  const toast = useToast()
  const utils = api.useUtils()

  const { mutate: deleteOrder } = api.order.deleteOrder.useMutation({
    onSuccess: async () => {
      toast.success("Order deleted successfully")
      await utils.order.getOrdersByVendorId.invalidate()
      router.refresh()
    },
    onError: error => {
      toast.error(`Failed to delete order: ${error.message}`)
    },
  })

  const handleDeleteClick = (id: string) => {
    const order = orders.find(o => o.id === id)
    if (order) {
      setSelectedOrder(order)
      setDeleteDialogOpen(true)
    }
  }

  const handleStatusClick = (order: Orders) => {
    setSelectedOrder(order)
    setStatusDialogOpen(true)
  }

  const ordersWithName = orders.map(order => ({ ...order, name: `Order #${order.id}` }))

  const columns = [
    ...ordersColumns,
    createActionsColumn<Orders & BaseEntity>(handleDeleteClick, row => handleStatusClick(row)),
  ]

  return (
    <div className="container max-w-6xl md:px-3.5 px-2 py-3">
      <DataTable<Orders & BaseEntity>
        columns={columns as ColumnDef<Orders & BaseEntity>[]}
        data={ordersWithName}
      />
      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Order"
        description="Are you sure you want to delete this order? This action cannot be undone."
        buttonText="Delete"
        buttonClass="bg-destructive hover:bg-destructive/90"
        onConfirm={async () => {
          if (selectedOrder) {
            deleteOrder({ id: selectedOrder.id })
            setDeleteDialogOpen(false)
          }
        }}
      />
      {selectedOrder && (
        <OrderStatusDialog
          open={isStatusDialogOpen}
          onOpenChange={setStatusDialogOpen}
          order={selectedOrder}
        />
      )}
    </div>
  )
}
