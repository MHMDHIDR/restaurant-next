import { notFound } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { api } from "@/trpc/server"
import { MenuCategoryForm } from "./menu-category-form"

export default async function ManageCategoriesPage() {
  const vendor = await api.vendor.getBySessionUser()

  return !vendor ? (
    notFound()
  ) : (
    <Tabs defaultValue="categories" className="container max-w-3xl md:px-3.5 px-2 py-3">
      <TabsList>
        <TabsTrigger value="categories">Categories</TabsTrigger>
        <TabsTrigger value="new-category">New Category</TabsTrigger>
      </TabsList>
      <TabsContent value="account">Categories</TabsContent>
      <TabsContent value="new-category">
        <MenuCategoryForm vendorId={vendor.id} />
      </TabsContent>
    </Tabs>
  )
}
