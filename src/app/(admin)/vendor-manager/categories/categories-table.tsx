"use client"

import { DataTable } from "@/components/custom/data-table"
import { baseColumns } from "@/components/custom/data-table/base-columns"
import { categoriesColumns } from "./categories-columns"
import type { BaseEntity } from "@/components/custom/data-table/base-columns"
import type { MenuCategories } from "@/server/db/schema"
import type { ColumnDef } from "@tanstack/react-table"

export default function CategoriesTable({
  categories,
}: {
  categories: (MenuCategories & BaseEntity)[]
}) {
  const columns = [...baseColumns, ...categoriesColumns]

  return (
    <DataTable<MenuCategories & BaseEntity>
      columns={columns as ColumnDef<MenuCategories & BaseEntity>[]}
      data={categories}
    />
  )
}
