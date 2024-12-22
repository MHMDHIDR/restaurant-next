import { List, ShoppingBag, Utensils } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const stats = [
  {
    title: "Menu Items",
    value: 48,
    icon: Utensils,
    href: "/vendor-manager/menu-items?view=items",
  },
  {
    title: "Orders",
    value: 256,
    icon: ShoppingBag,
    href: "/vendor-manager/orders",
  },
  {
    title: "Categories",
    value: 8,
    icon: List,
    href: "/vendor-manager/categories?view=categories",
  },
]

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Restaurant Dashboard</h1>
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
