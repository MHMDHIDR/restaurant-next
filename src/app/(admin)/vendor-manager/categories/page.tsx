import { notFound } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { api } from "@/trpc/server"
import CategoriesTable from "./(categories)/categories-table"
import { MenuCategoryForm } from "./(new-category)/menu-category-form"

export default async function ManageCategoriesPage() {
  const vendor = await api.vendor.getBySessionUser()

  if (!vendor) {
    return notFound()
  }

  const categories = await api.menuCategory.getCategoriesByVendorId({ vendorId: vendor.id })

  return (
    <Tabs defaultValue="categories" className="container max-w-6xl md:px-3.5 px-2 py-3">
      <TabsList>
        <TabsTrigger value="categories">Categories</TabsTrigger>
        <TabsTrigger value="new-category">New Category</TabsTrigger>
      </TabsList>
      <TabsContent value="categories">
        <CategoriesTable categories={categories} />
      </TabsContent>
      <TabsContent value="new-category">
        <MenuCategoryForm vendorId={vendor.id} />
      </TabsContent>
    </Tabs>
  )
}
