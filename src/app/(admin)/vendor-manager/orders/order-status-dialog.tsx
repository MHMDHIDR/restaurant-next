import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
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

interface OrderStatusDialogProps {
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
    defaultValues: {
      status: order.status,
    },
  })

  const { mutate: updateOrderStatus } = api.order.updateOrderStatus.useMutation({
    onSuccess: async () => {
      toast.success(
        isMultiple
          ? `${selectedOrders.length} orders updated successfully`
          : "Order status updated successfully",
      )
      await utils.order.getOrdersByVendorId.invalidate()
      router.refresh()
      onOpenChange(false)
      form.reset()
    },
    onError: error => {
      toast.error(`Failed to update order status: ${error.message}`)
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (isMultiple && selectedOrders) {
      // Update all selected orders
      for (const selectedOrder of selectedOrders) {
        updateOrderStatus({
          id: selectedOrder.id,
          status: values.status,
        })
      }
    } else {
      // Update single order
      updateOrderStatus({
        id: order.id,
        status: values.status,
      })
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
                      defaultValue={field.value}
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
