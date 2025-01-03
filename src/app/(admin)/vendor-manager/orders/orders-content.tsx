"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { DataTable } from "@/components/custom/data-table"
import { createActionsColumn } from "@/components/custom/data-table/actions-column"
import { ConfirmationDialog } from "@/components/custom/data-table/confirmation-dialog"
import { Button } from "@/components/ui/button"
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
  const [selectedOrders, setSelectedOrders] = useState<Orders[]>([])

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
    onMutate: () => {
      toast.loading("Deleting ...")
    },
  })

  const { mutate: deleteBulkOrders } = api.order.deleteBulkOrders.useMutation({
    onSuccess: async () => {
      toast.success("Orders deleted successfully")
      await utils.order.getOrdersByVendorId.invalidate()
      router.refresh()
      setSelectedOrders([])
    },
    onError: error => {
      toast.error(`Failed to delete orders: ${error.message}`)
    },
  })

  const handleDeleteClick = (id: string) => {
    const order = orders.find(order => order.id === id)
    if (order) {
      setSelectedOrder(order)
      setDeleteDialogOpen(true)
    }
  }

  const handleBulkDeleteClick = () => {
    if (selectedOrders.length > 0) {
      setSelectedOrder(null)
      setDeleteDialogOpen(true)
    }
  }

  const handleStatusClick = (order: Orders) => {
    setSelectedOrder(order)
    setStatusDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (selectedOrder) {
      deleteOrder({ id: selectedOrder.id })
    } else if (selectedOrders.length > 0) {
      deleteBulkOrders({ ids: selectedOrders.map(order => order.id) })
    }
    setDeleteDialogOpen(false)
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
        onRowSelection={setSelectedOrders}
        emptyStateMessage="Sorry, No Orders Found."
      />
      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={selectedOrder ? "Delete Order" : "Delete Selected Orders"}
        description={
          selectedOrder
            ? "Are you sure you want to delete this order? This action cannot be undone."
            : `Are you sure you want to delete ${selectedOrders.length} ${orders.length > 1 ? "orders" : "order"} This action cannot be undone.`
        }
        buttonText="Delete"
        buttonClass="bg-destructive hover:bg-destructive/90"
        onConfirm={handleConfirmDelete}
      />
      {selectedOrders.length > 0 && (
        <div className="mt-2 flex justify-start">
          <Button
            variant="destructive"
            onClick={handleBulkDeleteClick}
            className="flex items-center gap-2"
          >
            Delete Selected ({selectedOrders.length})
          </Button>
        </div>
      )}
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
