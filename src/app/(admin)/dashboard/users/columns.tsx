"use client"

import type { Users } from "@/server/db/schema"
import type { ColumnDef } from "@tanstack/react-table"

export const columns: ColumnDef<Users>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "role",
    header: "Role",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const date = row.getValue("createdAt")
      return new Date(String(date)).toLocaleDateString()
    },
  },
  {
    accessorKey: "updatedAt",
    header: "Updated At",
    cell: ({ row }) => {
      const date = row.getValue("updatedAt")
      return new Date(String(date)).toLocaleDateString()
    },
  },
]
