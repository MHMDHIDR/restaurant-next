import { redirect } from "next/navigation"
import { auth } from "@/server/auth"
import { api } from "@/trpc/server"
import { OrderTrackingContent } from "./order-tracking-content"

export default async function OrderTrackingPage({
  params,
}: {
  params: Promise<{ orderId: string }>
}) {
  const { orderId } = await params
  const session = await auth()
  if (!session) {
    redirect("/signin")
  }

  const userOrders = await api.order.getOrdersByUserId()
  const order = userOrders.orders.find(order => order.id === orderId)

  if (!order) {
    redirect("/orders")
  }

  return <OrderTrackingContent order={order} />
}
