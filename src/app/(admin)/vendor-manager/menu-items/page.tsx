import { redirect } from "next/navigation"
import { api } from "@/trpc/server"
import { MenuItemsContent } from "./menu-items-content"

export default async function MenuItemsPage() {
  const vendor = await api.vendor.getBySessionUser()

  if (!vendor) {
    redirect("/")
  }

  try {
    // Use Promise.all to fetch data in parallel
    const [{ menuCategories }, { items }] = await Promise.all([
      api.menuCategory.getCategoriesByVendorId({ vendorId: vendor.id }),
      api.menuItem.getMenuItemsByVendorId({ vendorId: vendor.id, addedById: vendor.addedById }),
    ])

    return <MenuItemsContent vendor={vendor} categories={menuCategories} menuItems={items} />
  } catch (error) {
    console.error("Error fetching data:", error)
    redirect("/error")
  }
}
