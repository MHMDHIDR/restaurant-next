"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { DataTable } from "@/components/custom/data-table"
import { baseColumns } from "@/components/custom/data-table/base-columns"
import { api } from "@/trpc/react"
import { vendorsColumns } from "./vendors-columns"
import type { BaseEntity } from "@/components/custom/data-table/base-columns"
import type { Users, Vendors } from "@/server/db/schema"
import type { ColumnDef } from "@tanstack/react-table"

export default function VendorsTable({
  vendors: initialVendors,
  count,
}: {
  vendors: (Vendors & BaseEntity & { assignedUser: Users })[]
  count: number
}) {
  const router = useRouter()
  const { data: vendorsData, isLoading } = api.vendor.getAll.useQuery(undefined, {
    initialData: { items: initialVendors, count },
    refetchOnMount: true,
  })

  // Refresh the page when mutations occur
  useEffect(() => {
    router.refresh()
  }, [vendorsData, router])

  const columns = [...baseColumns, ...vendorsColumns]

  return (
    <DataTable<Vendors & BaseEntity>
      columns={columns as ColumnDef<Vendors & BaseEntity>[]}
      data={vendorsData.items}
      isLoading={isLoading}
      count={count}
      emptyStateMessage="Sorry, No Vendors Found."
    />
  )
}
