import { redirect } from "next/navigation"
import { api } from "@/trpc/server"
import { OrdersContent } from "./orders-content"

export default async function OrdersPage() {
  const vendor = await api.vendor.getBySessionUser()
  if (!vendor) {
    redirect("/")
  }

  const { orders } = await api.order.getOrdersByVendorId({ vendorId: vendor.id })

  return <OrdersContent orders={orders} />
}
