import { List, PoundSterling, ShoppingBag, StoreIcon, Utensils } from "lucide-react"
import Link from "next/link"
import { AnalyticsCharts } from "@/components/custom/analytics-charts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPrice } from "@/lib/format-price"
import { api } from "@/trpc/server"

export default async function DashboardPage() {
  const [
    { count: menuItemsCount },
    { count: menuCategoriesCount },
    { orders, count: ordersCount },
    { count: vendorsCount },
  ] = await Promise.all([
    api.menuItem.getAllMenuItems(),
    api.menuCategory.getAllCategories(),
    api.order.getAllOrders(),
    api.vendor.getAll(),
  ])

  // Calculate total revenue from all orders
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
      title: "Vendors",
      value: vendorsCount,
      icon: StoreIcon,
      href: "/dashboard/vendors",
    },
    {
      title: "Menu Items",
      value: menuItemsCount,
      icon: Utensils,
      href: "/dashboard/products",
    },
    {
      title: "Orders",
      value: ordersCount,
      icon: ShoppingBag,
      href: "/dashboard/orders",
    },
    {
      title: "Categories",
      value: menuCategoriesCount,
      icon: List,
      href: "/dashboard/categories",
    },
    {
      title: "Total Revenue",
      value: formatPrice(totalRevenue),
      icon: PoundSterling,
      href: "/dashboard/orders",
    },
  ]

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Restaurant Dashboard</h1>
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
