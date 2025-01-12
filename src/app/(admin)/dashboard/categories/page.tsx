import CategoriesContent from "@/app/(admin)/vendor-manager/categories/categories-content"
import { api } from "@/trpc/server"

export default async function ManageCategoriesPage() {
  const { menuCategories } = await api.menuCategory.getAllCategories()

  return <CategoriesContent categories={menuCategories} />
}
