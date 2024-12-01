"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/custom/data-table"
import { baseColumns } from "@/components/custom/data-table/base-columns"
import { userColumns } from "./users-columns"
import type { BaseEntity } from "@/components/custom/data-table/base-columns"
import type { Users } from "@/server/db/schema"

export default function UsersTable({ users }: { users: (Users & BaseEntity)[] }) {
  const columns = [...baseColumns, ...userColumns]

  return (
    <DataTable<Users & BaseEntity>
      columns={columns as ColumnDef<Users & BaseEntity>[]}
      data={users}
    />
  )
}
