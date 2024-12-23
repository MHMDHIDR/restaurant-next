"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { DataTable } from "@/components/custom/data-table"
import { createActionsColumn } from "@/components/custom/data-table/actions-column"
import { baseColumns } from "@/components/custom/data-table/base-columns"
import { ConfirmationDialog } from "@/components/custom/data-table/confirmation-dialog"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/trpc/react"
import { categoriesColumns } from "./categories-columns"
import { CategoryEdit } from "./category-edit"
import type { BaseEntity } from "@/components/custom/data-table/base-columns"
import type { MenuCategories } from "@/server/db/schema"
import type { ColumnDef } from "@tanstack/react-table"

type CategoriesTableProps = {
  categories: (MenuCategories & BaseEntity)[]
}

export default function CategoriesTable({ categories }: CategoriesTableProps) {
  const [isDialogOpen, setDialogOpen] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<MenuCategories | null>(null)

  const router = useRouter()
  const toast = useToast()
  const utils = api.useUtils()

  const { mutate: deleteCategory } = api.menuCategory.deleteCategoryWithImage.useMutation({
    onSuccess: async () => {
      toast.success("Category deleted successfully")
      await utils.menuCategory.getCategoriesByVendorId.invalidate()
      router.refresh()
    },
    onError: error => {
      toast.error(`Failed to delete category: ${error.message}`)
    },
  })

  const handleDeleteClick = (id: string) => {
    setSelectedCategoryId(id)
    setDialogOpen(true)
  }

  const handleEditClick = (category: MenuCategories & BaseEntity) => {
    setSelectedCategory(category)
    setIsEditOpen(true)
  }

  const columns = [
    ...baseColumns,
    ...categoriesColumns,
    createActionsColumn<MenuCategories & BaseEntity>(handleDeleteClick, handleEditClick),
  ]

  return (
    <>
      <DataTable<MenuCategories & BaseEntity>
        columns={columns as ColumnDef<MenuCategories & BaseEntity>[]}
        data={categories}
      />
      <ConfirmationDialog
        open={isDialogOpen}
        onOpenChange={setDialogOpen}
        title="Confirm Deletion"
        description="Are you sure you want to delete this category?"
        buttonText="Delete"
        onConfirm={async () => {
          if (selectedCategoryId) {
            deleteCategory({ id: selectedCategoryId })
            setDialogOpen(false)
          }
        }}
      />
      {selectedCategory && (
        <CategoryEdit open={isEditOpen} onOpenChange={setIsEditOpen} category={selectedCategory} />
      )}
    </>
  )
}
