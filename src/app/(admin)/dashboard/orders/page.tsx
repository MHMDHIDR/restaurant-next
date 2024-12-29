import { OrdersContent } from "@/app/(admin)/vendor-manager/orders/orders-content"
import { api } from "@/trpc/server"

export default async function OrdersPage() {
  const { orders } = await api.order.getAllOrders()

  return <OrdersContent orders={orders} />
}
