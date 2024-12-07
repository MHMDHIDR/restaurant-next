"use client"

import { ChefHatIcon, Home, LineChart, Package, ShoppingCart, Users } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <Home className="w-4 h-4" />,
  },
  {
    label: "Vendors",
    href: "/dashboard/vendors",
    icon: <ChefHatIcon className="w-4 h-4" />,
  },
  {
    label: "Orders",
    href: "/dashboard/orders",
    icon: <ShoppingCart className="w-4 h-4" />,
  },
  {
    label: "Products",
    href: "/dashboard/products",
    icon: <Package className="w-4 h-4" />,
  },
  {
    label: "Users",
    href: "/dashboard/users",
    icon: <Users className="w-4 h-4" />,
  },
  {
    label: "Analytics",
    href: "/dashboard/analytics",
    icon: <LineChart className="w-4 h-4" />,
  },
]

export default function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden border-r bg-muted/40 md:block min-h-screen">
      <div className="flex flex-col h-full max-h-screen gap-2">
        <div className="flex-1 py-14">
          <nav className="items-start px-2 text-sm font-medium grid">
            {navItems.map(navItem => (
              <Link
                key={navItem.label}
                href={navItem.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${
                  pathname === navItem.href ? "bg-muted text-primary" : ""
                }`}
              >
                {navItem.icon}
                {navItem.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </aside>
  )
}
