import { api } from "@/trpc/server"
import { OrdersContent } from "./orders-content"
import type { orderWithOrderItems } from "@/types"

export default async function OrdersPage() {
  const userOrders = await api.order.getOrdersByUserId()

  return (
    <OrdersContent
      orders={userOrders.orders as unknown as orderWithOrderItems[]}
      count={userOrders.count}
    />
  )
}
