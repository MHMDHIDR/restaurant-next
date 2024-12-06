"use client"

import { DataTable } from "@/components/custom/data-table"
import { baseColumns } from "@/components/custom/data-table/base-columns"
import { vendorsColumns } from "./vendors-columns"
import type { BaseEntity } from "@/components/custom/data-table/base-columns"
import type { Vendors } from "@/server/db/schema"
import type { ColumnDef } from "@tanstack/react-table"

export default function VendorsTable({ vendors }: { vendors: (Vendors & BaseEntity)[] }) {
  const columns = [...baseColumns, ...vendorsColumns]

  return (
    <DataTable<Vendors & BaseEntity>
      columns={columns as ColumnDef<Vendors & BaseEntity>[]}
      data={vendors}
    />
  )
}
