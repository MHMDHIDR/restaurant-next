import { redirect } from "next/navigation"
import { auth } from "@/server/auth"
import { api } from "@/trpc/server"
import { OrdersContent } from "./orders-content"

export default async function OrdersPage() {
  const session = await auth()
  if (!session) {
    redirect("/sign-in")
  }

  const userOrders = await api.order.getOrdersByUserId()

  return <OrdersContent orders={userOrders.orders} count={userOrders.count} />
}
