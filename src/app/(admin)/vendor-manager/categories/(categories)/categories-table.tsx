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
import { categoriesColumns } from "./categories-columns"
import { CategoryEdit } from "./category-edit"
import { CategoryStatusDialog } from "./category-status-dialog"
import type { BaseEntity } from "@/components/custom/data-table/base-columns"
import type { MenuCategories } from "@/server/db/schema"
import type { ColumnDef } from "@tanstack/react-table"

export default function CategoriesTable({
  categories,
}: {
  categories: (MenuCategories & BaseEntity)[]
}) {
  const [isDialogOpen, setDialogOpen] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<MenuCategories | null>(null)
  const [selectedCategories, setSelectedCategories] = useState<MenuCategories[]>([])
  const [isStatusDialogOpen, setStatusDialogOpen] = useState(false)

  const router = useRouter()
  const toast = useToast()
  const utils = api.useUtils()

  const { mutate: deleteCategory } = api.menuCategory.deleteCategoryWithImage.useMutation({
    onSuccess: async () => {
      toast.success("Category deleted")
      await utils.menuCategory.getCategoriesByVendorId.invalidate()
      router.refresh()
    },
    onError: error => toast.error(error.message),
  })

  const { mutate: deleteBulkCategories } = api.menuCategory.deleteBulkCategories.useMutation({
    onSuccess: async () => {
      toast.success(`${selectedCategories.length} categories deleted`)
      await utils.menuCategory.getCategoriesByVendorId.invalidate()
      router.refresh()
      setSelectedCategories([])
    },
    onError: error => toast.error(error.message),
  })

  const handleDeleteClick = (id: string) => {
    setSelectedCategoryId(id)
    setDialogOpen(true)
  }

  const handleBulkDeleteClick = () => {
    if (selectedCategories.length > 0) {
      setSelectedCategoryId(null)
      setDialogOpen(true)
    }
  }

  const handleBulkStatusClick = () => {
    if (selectedCategories.length > 0) {
      const firstCategory = selectedCategories[0]
      if (firstCategory) {
        setSelectedCategory(firstCategory)
        setStatusDialogOpen(true)
      }
    }
  }

  const handleConfirmDelete = () => {
    if (selectedCategoryId) {
      deleteCategory({ id: selectedCategoryId })
    } else if (selectedCategories.length > 0) {
      deleteBulkCategories({ ids: selectedCategories.map(cat => cat.id) })
    }
    setDialogOpen(false)
  }

  const handleEditClick = (category: MenuCategories & BaseEntity) => {
    setSelectedCategory(category)
    setIsEditOpen(true)
  }

  const columns = [
    ...baseColumns(),
    ...categoriesColumns,
    createActionsColumn<MenuCategories & BaseEntity>(handleDeleteClick, handleEditClick),
  ]

  return (
    <>
      <DataTable<MenuCategories & BaseEntity>
        columns={columns as ColumnDef<MenuCategories & BaseEntity>[]}
        data={categories}
        onRowSelection={setSelectedCategories}
      />
      {selectedCategories.length > 0 && (
        <div className="mt-2 flex items-center gap-2">
          <Button variant="destructive" onClick={handleBulkDeleteClick}>
            Delete Selected ({selectedCategories.length})
          </Button>
          <Button onClick={handleBulkStatusClick}>
            Update Status ({selectedCategories.length})
          </Button>
        </div>
      )}
      <ConfirmationDialog
        open={isDialogOpen}
        onOpenChange={setDialogOpen}
        title="Confirm Deletion"
        description={
          selectedCategories.length > 0
            ? `Are you sure you want to delete these ${selectedCategories.length} categories?`
            : "Are you sure you want to delete this category?"
        }
        buttonText="Delete"
        onConfirm={handleConfirmDelete}
      />
      {selectedCategory && (
        <>
          <CategoryEdit
            open={isEditOpen}
            onOpenChange={setIsEditOpen}
            category={selectedCategory}
          />
          <CategoryStatusDialog
            open={isStatusDialogOpen}
            onOpenChange={setStatusDialogOpen}
            category={selectedCategory}
            isMultiple={selectedCategories.length > 1}
            selectedItems={selectedCategories}
          />
        </>
      )}
    </>
  )
}
