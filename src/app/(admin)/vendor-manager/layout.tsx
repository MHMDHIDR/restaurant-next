import { IconCategory2 } from "@tabler/icons-react"
import { Home, Package, ShoppingCart } from "lucide-react"
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
  const ALLOWED_ROLES = [UserRole.SUPER_ADMIN, UserRole.VENDOR_ADMIN] as const

  const vendorNavItems = [
    {
      label: "Dashboard",
      href: "/vendor-manager",
      icon: <Home className="w-4 h-4" />,
    },
    {
      label: "Orders",
      href: "/vendor-manager/orders",
      icon: <ShoppingCart className="w-4 h-4" />,
    },
    {
      label: "Products",
      href: "/vendor-manager/products",
      icon: <Package className="w-4 h-4" />,
    },
    {
      label: "Categories",
      href: "/vendor-manager/categories",
      icon: <IconCategory2 className="w-4 h-4" />,
    },
  ]

  return !checkRoleAccess(user?.role, ALLOWED_ROLES) ? (
    notFound()
  ) : (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <DashboardSidebar navItems={vendorNavItems} />
      <div className="flex flex-col">
        <MobileNav navItems={vendorNavItems} />
        {children}
      </div>
    </div>
  )
}
