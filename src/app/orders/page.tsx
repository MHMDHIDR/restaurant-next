import { redirect } from "next/navigation"
import { auth } from "@/server/auth"
import { api } from "@/trpc/server"
import { OrdersContent } from "./orders-content"
import type { orderWithOrderItems } from "@/types"

export default async function OrdersPage() {
  const session = await auth()
  if (!session) {
    redirect("/signin")
  }

  const userOrders = await api.order.getOrdersByUserId()

  return (
    <OrdersContent
      orders={userOrders.orders as unknown as orderWithOrderItems[]}
      count={userOrders.count}
    />
  )
}
