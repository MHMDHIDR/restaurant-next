"use client"

import { IconCategory } from "@tabler/icons-react"
import { PlusCircle } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useCallback, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CategoriesTable from "./(categories)/categories-table"
import { MenuCategoryForm } from "./(new-category)/menu-category-form"
import type { MenuCategories } from "@/server/db/schema"

type CategoriesContentProps = {
  vendor?: { id: string }
  categories: MenuCategories[]
}

export default function CategoriesContent({ vendor, categories }: CategoriesContentProps) {
  const searchParams = useSearchParams()

  const view = searchParams.get("view") ?? "categories"

  const handleTabChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set("view", value)
      window.history.pushState(null, "", `?${params.toString()}`)
    },
    [searchParams],
  )

  // Sync URL with tab view
  useEffect(() => {
    if (searchParams.get("view") !== view) {
      handleTabChange(view)
    }
  }, [view, searchParams, handleTabChange])

  return vendor ? (
    <Tabs
      value={view}
      defaultValue={view}
      className="container max-w-6xl md:px-3.5 px-2 py-3"
      onValueChange={handleTabChange}
    >
      <TabsList>
        <TabsTrigger value="categories">
          <IconCategory className="size-4 mx-1.5" />
          Categories
        </TabsTrigger>
        <TabsTrigger value="new-category">
          <PlusCircle className="size-4 mx-1.5" />
          New Category
        </TabsTrigger>
      </TabsList>
      <TabsContent value="categories">
        <CategoriesTable categories={categories} />
      </TabsContent>
      <TabsContent value="new-category">
        <MenuCategoryForm vendorId={vendor.id} />
      </TabsContent>
    </Tabs>
  ) : (
    <CategoriesTable categories={categories} />
  )
}
