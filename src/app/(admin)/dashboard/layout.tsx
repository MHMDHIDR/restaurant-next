import { ChefHatIcon, Home, LineChart, Package, ShoppingCart, Users } from "lucide-react"
import { notFound } from "next/navigation"
import DashboardSidebar from "@/components/custom/dashboard-sidebar"
import MobileNav from "@/components/custom/mobile-nav"
import { checkRoleAccess } from "@/lib/check-role-access"
import { auth } from "@/server/auth"
import { UserRole } from "@/server/db/schema"

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth()
  const user = session?.user
  const ALLOWED_ROLES = [UserRole.SUPER_ADMIN] as const

  const adminNavItems = [
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

  return !checkRoleAccess(user?.role, ALLOWED_ROLES) ? (
    notFound()
  ) : (
    <div className="grid md:grid-cols-4 lg:grid-cols-4">
      <DashboardSidebar navItems={adminNavItems} />
      <main className="col-span-3 max-w-screen-xl">
        <MobileNav navItems={adminNavItems} />
        {children}
      </main>
    </div>
  )
}
