import { List, PoundSterling, ShoppingBag, Utensils } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { AnalyticsCharts } from "@/components/custom/analytics-charts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { api } from "@/trpc/server"

export default async function DashboardPage() {
  const vendor = await api.vendor.getBySessionUser()

  if (!vendor) {
    redirect("/")
  }

  // Fetch menu items and orders
  const [{ count: menuItemsCount }, { menuCategoriesCount }, { orders, count: ordersCount }] =
    await Promise.all([
      api.menuItem.getMenuItemsByVendorId({ vendorId: vendor.id, addedById: vendor.addedById }),
      api.menuCategory.getCategoriesByVendorId({ vendorId: vendor.id }),
      api.order.getOrdersByVendorId({ vendorId: vendor.id }),
    ])

  // Calculate total revenue for this vendor
  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total), 0)

  // Organize orders by date
  const ordersCountByDate: Record<string, number> = {}
  orders.forEach(order => {
    const date = new Date(order.createdAt).toLocaleDateString()
    ordersCountByDate[date] = (ordersCountByDate[date] ?? 0) + 1
  })

  const chartData = {
    labels: Object.keys(ordersCountByDate), // Dates
    data: Object.values(ordersCountByDate), // Counts
  }

  const stats = [
    {
      title: "Menu Items",
      value: menuItemsCount,
      icon: Utensils,
      href: "/vendor-manager/menu-items?view=items",
    },
    {
      title: "Orders",
      value: ordersCount,
      icon: ShoppingBag,
      href: "/vendor-manager/orders",
    },
    {
      title: "Categories",
      value: menuCategoriesCount,
      icon: List,
      href: "/vendor-manager/categories?view=categories",
    },
    {
      title: "Total Revenue",
      value: `$${totalRevenue.toFixed(2)}`,
      icon: PoundSterling,
      href: "/vendor-manager/orders",
    },
  ]

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 select-none underline text-center underline-offset-[6px] text-primary">
        {vendor.name} Dashboard
      </h1>
      <AnalyticsCharts chartData={chartData} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map(stat => (
          <Link href={stat.href} key={stat.title} className="transition-transform hover:scale-105">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
