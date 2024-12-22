import { redirect } from "next/navigation"
import { auth } from "@/server/auth"
import { api } from "@/trpc/server"
import { MenuItemsContent } from "./menu-items-content"

export default async function MenuItemsPage({ searchParams }: { searchParams: { view?: string } }) {
  const session = await auth()
  const user = session?.user

  if (!user) {
    redirect("/auth/signin")
  }

  const vendor = await api.vendor.getBySessionUser()

  if (!vendor) {
    redirect("/")
  }

  // Fetch menu categories for the dropdown in the form
  const categories = await api.menuCategory.getCategoriesByVendorId({
    vendorId: vendor.id,
  })

  const menuItems = await api.menuItem.getMenuItemsByVendorId({
    vendorId: vendor.id,
  })

  return <MenuItemsContent vendor={vendor} categories={categories} menuItems={menuItems} />
}
