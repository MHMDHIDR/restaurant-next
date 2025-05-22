import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { orderStatusSchema } from "@/app/schemas/order"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { type Orders } from "@/server/db/schema"
import { api } from "@/trpc/react"

const formSchema = z.object({
  status: orderStatusSchema,
})

type OrderStatusDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: Orders
  isMultiple?: boolean
  selectedOrders?: Orders[]
}

export function OrderStatusDialog({
  open,
  onOpenChange,
  order,
  isMultiple = false,
  selectedOrders = [],
}: OrderStatusDialogProps) {
  const router = useRouter()
  const utils = api.useUtils()
  const toast = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { status: order.status },
  })

  // Get the latest data from TRPC cache
  const orders = utils.order.getOrdersByVendorId.getData()
  const currentOrder = orders?.orders.find(currentOrder => currentOrder.id === order.id)

  useEffect(() => {
    if (open && currentOrder) {
      // Always use the most up-to-date status from the server
      form.reset({ status: currentOrder.status })
    }
  }, [open, currentOrder, form])

  const { mutate: updateOrderStatus } = api.order.updateOrderStatus.useMutation({
    onMutate: async ({ status }) => {
      // Optimistically update the form value
      form.reset({ status })
    },
    onSuccess: async (_, variables) => {
      toast.success(
        isMultiple
          ? `${selectedOrders.length} orders updated successfully`
          : "Order status updated successfully",
      )

      // Force a form reset with the new status
      form.reset({ status: variables.status })

      // Invalidate the query to refresh the data
      await utils.order.getOrdersByVendorId.invalidate()
      router.refresh()
      onOpenChange(false)
    },
    onError: error => {
      toast.error(`Failed to update order status: ${error.message}`)
      // Reset form to the current order status on error
      if (currentOrder) {
        form.reset({ status: currentOrder.status })
      }
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (isMultiple && selectedOrders) {
      for (const selectedOrder of selectedOrders) {
        updateOrderStatus({ orderId: selectedOrder.id, status: values.status })
      }
    } else {
      updateOrderStatus({ orderId: order.id, status: values.status })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Order Status</DialogTitle>
          <DialogDescription>
            {isMultiple
              ? `Change the status for ${selectedOrders.length} selected orders`
              : `Change the status for Order #${order.id}`}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex flex-col space-y-1"
                    >
                      {Object.entries({
                        PENDING: "Pending",
                        CONFIRMED: "Confirmed",
                        PREPARING: "Preparing",
                        READY_FOR_PICKUP: "Ready for Pickup",
                        OUT_FOR_DELIVERY: "Out for Delivery",
                        DELIVERED: "Delivered",
                        CANCELLED: "Cancelled",
                      }).map(([value, label]) => (
                        <FormItem key={value} className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value={value} />
                          </FormControl>
                          <FormLabel className="font-normal">{label}</FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
