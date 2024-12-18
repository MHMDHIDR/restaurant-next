import { ChefHatIcon, Home, LineChart, Package, ShoppingCart, Users } from "lucide-react"
import { notFound } from "next/navigation"
import Nav from "@/components/custom/nav"
import { AppSidebar } from "@/components/ui/app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { checkRoleAccess } from "@/lib/check-role-access"
import { auth } from "@/server/auth"
import { UserRole } from "@/server/db/schema"
import type { VendorNavItems } from "@/types/vendorNavItems"

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth()
  const user = session?.user
  const ALLOWED_ROLES = [UserRole.SUPER_ADMIN] as const

  const adminNavItems: VendorNavItems = {
    navMain: [
      {
        title: "Main",
        url: "#",
        items: [
          {
            title: "Dashboard",
            url: "/dashboard",
            icon: <Home className="w-4 h-4" />,
          },
          {
            title: "Vendors",
            url: "/dashboard/vendors",
            icon: <ChefHatIcon className="w-4 h-4" />,
          },
          {
            title: "Orders",
            url: "/dashboard/orders",
            icon: <ShoppingCart className="w-4 h-4" />,
          },
          {
            title: "Products",
            url: "/dashboard/products",
            icon: <Package className="w-4 h-4" />,
          },
          {
            title: "Users",
            url: "/dashboard/users",
            icon: <Users className="w-4 h-4" />,
          },
          {
            title: "Analytics",
            url: "/dashboard/analytics",
            icon: <LineChart className="w-4 h-4" />,
          },
        ],
      },
    ],
  }

  return !checkRoleAccess(user?.role, ALLOWED_ROLES) ? (
    notFound()
  ) : (
    <SidebarProvider>
      <AppSidebar items={adminNavItems} />
      <SidebarInset>
        <Nav user={user} />
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="grid auto-rows-min gap-4 grid-cols-1">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
