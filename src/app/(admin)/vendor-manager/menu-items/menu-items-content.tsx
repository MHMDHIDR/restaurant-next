"use client"

import { List, PlusCircle } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useCallback, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MenuItemsTable } from "./(items)/menu-items-table"
import { MenuItemForm } from "./(new-item)/menu-item-form"
import type { MenuCategories, MenuItems } from "@/server/db/schema"

type MenuItemsContentProps = {
  vendor: { id: string }
  categories: MenuCategories[]
  menuItems: MenuItems[]
}

export function MenuItemsContent({ vendor, categories, menuItems }: MenuItemsContentProps) {
  const searchParams = useSearchParams()

  const view = searchParams.get("view") ?? "items"

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

  return (
    <Tabs
      value={view}
      defaultValue={view}
      className="container max-w-6xl md:px-3.5 px-2 py-3"
      onValueChange={handleTabChange}
    >
      <TabsList>
        <TabsTrigger value="items">
          <List className="size-4 mx-1.5" />
          Menu Items
        </TabsTrigger>
        <TabsTrigger value="new-item">
          <PlusCircle className="size-4 mx-1.5" />
          New Item
        </TabsTrigger>
      </TabsList>
      <TabsContent value="items">
        <MenuItemsTable menuItems={menuItems} vendorId={vendor.id} />
      </TabsContent>
      <TabsContent value="new-item">
        <MenuItemForm vendorId={vendor.id} categories={categories} />
      </TabsContent>
    </Tabs>
  )
}
