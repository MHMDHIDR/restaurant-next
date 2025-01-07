"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { DataTable } from "@/components/custom/data-table"
import { createActionsColumn } from "@/components/custom/data-table/actions-column"
import { baseColumns } from "@/components/custom/data-table/base-columns"
import { ConfirmationDialog } from "@/components/custom/data-table/confirmation-dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/trpc/react"
import { MenuItemEdit } from "./menu-item-edit"
import { menuItemsColumns } from "./menu-items-columns"
import type { BaseEntity } from "@/components/custom/data-table/base-columns"
import type { MenuItems } from "@/server/db/schema"
import type { ColumnDef } from "@tanstack/react-table"

type MenuItemsTableProps = {
  menuItems: (MenuItems & BaseEntity)[]
  vendorId?: string
}

export function MenuItemsTable({ menuItems, vendorId }: MenuItemsTableProps) {
  const [isDialogOpen, setDialogOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItems | null>(null)
  const [selectedMenuItems, setSelectedMenuItems] = useState<MenuItems[]>([])

  const router = useRouter()
  const toast = useToast()
  const utils = api.useUtils()

  const { data } = api.menuCategory.getCategoriesByVendorId.useQuery(
    { vendorId: vendorId ?? "" },
    { enabled: !!vendorId },
  )
  const menuCategories = data?.menuCategories ?? []

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

  const { mutate: deleteBulkMenuItems } = api.menuItem.deleteBulkMenuItems.useMutation({
    onSuccess: async () => {
      toast.success("Menu Items deleted successfully")
      await utils.menuItem.getMenuItems.invalidate()
      router.refresh()
      setSelectedMenuItems([])
    },
    onError: error => {
      toast.error(`Failed to delete orders: ${error.message}`)
    },
  })

  const handleDeleteClick = (id: string) => {
    const menuItem = menuItems.find(menuItem => menuItem.id === id)
    if (menuItem) {
      setSelectedMenuItem(menuItem)
      setDialogOpen(true)
    }
  }

  const handleBulkDeleteClick = () => {
    if (selectedMenuItems.length > 0) {
      setSelectedMenuItem(null)
      setDialogOpen(true)
    }
  }

  const handleEditClick = (menuItem: MenuItems & BaseEntity) => {
    setSelectedMenuItem(menuItem)
    setIsEditOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (selectedMenuItem) {
      deleteMenuItem({ id: selectedMenuItem.id })
    } else if (selectedMenuItems.length > 0) {
      deleteBulkMenuItems({ ids: selectedMenuItems.map(menuItem => menuItem.id) })
    }
    setDialogOpen(false)
  }

  const columns = [
    ...baseColumns,
    ...menuItemsColumns,
    createActionsColumn<MenuItems & BaseEntity>(handleDeleteClick, handleEditClick),
  ]

  return (
    <>
      <DataTable<MenuItems & BaseEntity>
        columns={columns as ColumnDef<MenuItems & BaseEntity>[]}
        data={menuItems}
        onRowSelection={setSelectedMenuItems}
        emptyStateMessage="Sorry, No Menu Items Found."
      />
      <ConfirmationDialog
        open={isDialogOpen}
        onOpenChange={setDialogOpen}
        title="Confirm Deletion"
        description={`${
          selectedMenuItems.length > 0
            ? `Are you sure you want to delete these ${selectedMenuItems.length} menu items?`
            : "Are you sure you want to delete this menu item?"
        } This action cannot be undone.`}
        buttonText="Delete"
        buttonClass="bg-destructive hover:bg-destructive/90"
        onConfirm={handleConfirmDelete}
      />
      {selectedMenuItems.length > 0 && (
        <div className="mt-2 flex items-center gap-2">
          <Button
            variant="destructive"
            onClick={handleBulkDeleteClick}
            className="flex items-center gap-2"
          >
            Delete Selected ({selectedMenuItems.length})
          </Button>
        </div>
      )}
      {selectedMenuItem && (
        <MenuItemEdit
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          menuCategories={menuCategories}
          menuItem={selectedMenuItem}
        />
      )}
    </>
  )
}
