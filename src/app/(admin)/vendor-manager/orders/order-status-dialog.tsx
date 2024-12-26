import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/trpc/react"
import type { OrderStatus } from "@/app/schemas/order"
import type { Orders } from "@/server/db/schema"

interface OrderStatusDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: Orders
}

const ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY_FOR_PICKUP",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
]

export function OrderStatusDialog({ open, onOpenChange, order }: OrderStatusDialogProps) {
  const router = useRouter()
  const toast = useToast()
  const utils = api.useUtils()

  const { mutate: updateStatus } = api.order.updateOrderStatus.useMutation({
    onSuccess: async () => {
      toast.success("Order status updated successfully")
      await utils.order.getOrdersByVendorId.invalidate()
      router.refresh()
      onOpenChange(false)
    },
    onError: error => {
      toast.error(`Failed to update order status: ${error.message}`)
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Order Status</DialogTitle>
        </DialogHeader>
        <Select
          defaultValue={order.status}
          onValueChange={value => {
            updateStatus({
              id: order.id,
              status: value as OrderStatus,
            })
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {ORDER_STATUSES.map(status => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </DialogContent>
    </Dialog>
  )
}
