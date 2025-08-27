import {
  Bot,
  Grid2x2Plus,
  LayoutDashboard,
  List,
  Package,
  PackagePlus,
  Settings,
  ShoppingCart,
  Store,
} from "lucide-react"
import { notFound } from "next/navigation"
import Nav from "@/components/custom/nav"
import { AppSidebar } from "@/components/ui/app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { checkRoleAccess } from "@/lib/check-role-access"
import { auth } from "@/server/auth"
import { UserRole } from "@/server/db/schema"
import type { VendorNavItems } from "@/types"

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth()
  const user = session?.user
  const ALLOWED_ROLES = [
    UserRole.SUPER_ADMIN,
    UserRole.VENDOR_ADMIN,
    UserRole.VENDOR_STAFF,
  ] as const

  const vendorNavItems: VendorNavItems = {
    navMain: [
      {
        title: "Main",
        url: "#",
        items: [
          {
            title: "Dashboard",
            url: "/vendor-manager",
            icon: <Settings className="size-4" />,
          },
          {
            title: "Vendor Details",
            url: "/vendor-manager/vendor-details",
            icon: <Store className="size-4" />,
          },
          {
            title: "Vendor Admins",
            url: "/vendor-manager/vendor-admins",
            icon: <LayoutDashboard className="size-4" />,
          },
          {
            title: "AI Insights",
            url: "/vendor-manager/ai-chat",
            icon: <Bot className="size-4" />,
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
            icon: <ShoppingCart className="size-4" />,
          },
        ],
      },
      {
        title: "Menu",
        url: "#",
        items: [
          {
            title: "Items",
            url: "/vendor-manager/menu-items?view=items",
            icon: <List className="size-4" />,
          },
          {
            title: "New Menu Item",
            url: "/vendor-manager/menu-items?view=new-item",
            icon: <Grid2x2Plus className="size-4" />,
          },
        ],
      },
      {
        title: "Categories",
        url: "#",
        items: [
          {
            title: "All Categories",
            url: "/vendor-manager/categories?view=categories",
            icon: <Package className="size-4" />,
          },
          {
            title: "Create Category",
            url: "/vendor-manager/categories?view=new-category",
            icon: <PackagePlus className="size-4" />,
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
        <div className="border-b px-4 py-0">
          <SidebarTrigger className="-ml-1" />
        </div>
        <div className="flex flex-1 flex-col">
          <div className="grid auto-rows-min gap-4 grid-cols-1">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
