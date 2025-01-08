import { CategoriesGrid } from "@/components/custom/categories"
import { api } from "@/trpc/server"

export default async function CategoriesPage() {
  const { menuCategories } = await api.menuCategory.getAllCategories({ hasItems: true })
  const activeCategories = menuCategories.filter(category => category.isActive)

  return (
    <div className="container px-2 py-12 mx-auto max-w-screen-lg">
      <h1 className="mb-8 text-3xl font-bold text-center">All Categories</h1>
      <CategoriesGrid categories={activeCategories} columns={2} />
    </div>
  )
}
