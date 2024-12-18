import { IconCategory2 } from "@tabler/icons-react"
import { Package, ShoppingCart } from "lucide-react"
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
  const ALLOWED_ROLES = [UserRole.SUPER_ADMIN, UserRole.VENDOR_ADMIN] as const

  const vendorNavItems: VendorNavItems = {
    navMain: [
      {
        title: "Main",
        url: "#",
        items: [
          {
            title: "Dashboard",
            url: "/vendor-manager",
          },
        ],
      },
      {
        title: "Vendor",
        url: "#",
        items: [
          {
            title: "Orders",
            url: "/vendor-manager/orders",
            icon: <ShoppingCart className="w-4 h-4" />,
          },
          {
            title: "Products",
            url: "/vendor-manager/products",
            icon: <Package className="w-4 h-4" />,
          },
          {
            title: "Categories",
            url: "/vendor-manager/categories",
            icon: <IconCategory2 className="w-4 h-4" />,
          },
        ],
      },
    ],
  }

  return !checkRoleAccess(user?.role, ALLOWED_ROLES) ? (
    notFound()
  ) : (
    <SidebarProvider>
      <AppSidebar items={vendorNavItems} />
      <SidebarInset>
        <Nav user={user} />
        <div className="border-b px-4 py-1">
          <SidebarTrigger className="-ml-1" />
        </div>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="grid auto-rows-min gap-4 grid-cols-1">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
