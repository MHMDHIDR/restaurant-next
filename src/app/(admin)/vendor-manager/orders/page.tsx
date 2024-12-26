import { redirect } from "next/navigation"
import { api } from "@/trpc/server"
import { OrdersContent } from "./orders-content"

export default async function OrdersPage() {
  try {
    const vendor = await api.vendor.getBySessionUser()
    if (!vendor) {
      redirect("/")
    }

    const { orders } = await api.order.getOrdersByVendorId({ vendorId: vendor.id })

    return <OrdersContent vendor={vendor} orders={orders} />
  } catch (error) {
    console.error("Error fetching data:", error)
    redirect("/error")
  }
}
