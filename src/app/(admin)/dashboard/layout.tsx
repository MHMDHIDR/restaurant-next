import { ChefHatIcon, Home, LineChart, Package, ShoppingCart, Users } from "lucide-react"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import { AppSidebar } from "@/components/ui/app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
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
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">{children}</div>
          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
