"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { DataTable } from "@/components/custom/data-table"
import { actionsColumns } from "@/components/custom/data-table/actions-column"
import { baseColumns } from "@/components/custom/data-table/base-columns"
import { ConfirmationDialog } from "@/components/custom/data-table/confirmation-dialog"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/trpc/react"
import { menuItemsColumns } from "./menu-items-columns"
import type { BaseEntity } from "@/components/custom/data-table/base-columns"
import type { MenuItems } from "@/server/db/schema"
import type { ColumnDef } from "@tanstack/react-table"

export function MenuItemsTable({ menuItems }: { menuItems: (MenuItems & BaseEntity)[] }) {
  const [isDialogOpen, setDialogOpen] = useState(false)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)

  const router = useRouter()
  const toast = useToast()
  const utils = api.useUtils()

  const { mutate: deleteMenuItem } = api.menuItem.deleteMenuItem.useMutation({
    onSuccess: async () => {
      toast.success("Menu item deleted successfully")
      await utils.menuItem.getMenuItems.invalidate()
      router.refresh()
    },
    onError: error => {
      toast.error(`Failed to delete menu item: ${error.message}`)
    },
  })

  const handleDeleteClick = (id: string) => {
    setSelectedItemId(id)
    setDialogOpen(true)
  }

  const columns = [...baseColumns, ...menuItemsColumns, ...actionsColumns(handleDeleteClick)]

  return (
    <>
      <DataTable<MenuItems & BaseEntity>
        columns={columns as ColumnDef<MenuItems & BaseEntity>[]}
        data={menuItems}
      />
      <ConfirmationDialog
        open={isDialogOpen}
        onOpenChange={setDialogOpen}
        title="Confirm Deletion"
        description="Are you sure you want to delete this menu item?"
        buttonText="Delete"
        onConfirm={async () => {
          if (selectedItemId) {
            deleteMenuItem({ id: selectedItemId })
            setDialogOpen(false)
          }
        }}
      />
    </>
  )
}
