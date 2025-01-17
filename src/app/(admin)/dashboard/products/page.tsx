import { MenuItemsTable } from "@/app/(admin)/vendor-manager/menu-items/(items)/menu-items-table"
import { api } from "@/trpc/server"

export default async function Products() {
  const { items } = await api.menuItem.getAllMenuItems()

  return <MenuItemsTable menuItems={items} />
}
