"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CategoriesTable from "./(categories)/categories-table"
import { MenuCategoryForm } from "./(new-category)/menu-category-form"
import type { MenuCategories } from "@/server/db/schema"

interface CategoriesContentProps {
  vendor: { id: string }
  categories: MenuCategories[]
}

export default function CategoriesContent({ vendor, categories }: CategoriesContentProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const view = searchParams.get("view") ?? "categories"

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("view", value)
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  // Ensure tabs are in sync with URL parameters
  useEffect(() => {
    const currentView = searchParams.get("view")
    if (currentView && (currentView === "categories" || currentView === "new-category")) {
      handleTabChange(currentView)
    }
  }, [searchParams])

  return (
    <Tabs
      value={view}
      defaultValue={view}
      className="container max-w-6xl md:px-3.5 px-2 py-3"
      onValueChange={handleTabChange}
    >
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
