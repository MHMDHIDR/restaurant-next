import { notFound } from "next/navigation"
import { api } from "@/trpc/server"
import CategoriesContent from "../../vendor-manager/categories/categories-content"

export default async function ManageCategoriesPage() {
  const { menuCategories } = await api.menuCategory.getAllCategories()

  return <CategoriesContent categories={menuCategories} />
}
