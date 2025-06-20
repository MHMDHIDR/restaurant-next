import { redirect } from "next/navigation"
import { api } from "@/trpc/server"
import { OrderTrackingContent } from "./order-tracking-content"
import type { orderWithOrderItems } from "@/types"

type OrderTrackingPageProps = { params: Promise<{ orderId: string }> }

export async function generateStaticParams() {
  try {
    const { orders, count } = await api.order.getAllOrders()
    if (!orders || count === 0) {
      return []
    }

    return orders.map(order => ({ orderId: order.id }))
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
    }
    return []
  }
}

export default async function OrderTrackingPage({ params }: OrderTrackingPageProps) {
  const { orderId } = await params

  const userOrders = await api.order.getOrdersByUserId()
  const order = userOrders.orders.find(
    order => order.id === orderId,
  ) as unknown as orderWithOrderItems

  if (!order) {
    redirect("/orders")
  }

  return <OrderTrackingContent order={order} />
}
