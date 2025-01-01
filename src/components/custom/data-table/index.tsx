"use client"

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import EmptyState from "@/components/custom/empty-state"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { LoadingCard } from "./loading"
import type { BaseEntity } from "./base-columns"
import type { ColumnDef, Row } from "@tanstack/react-table"

type RowStatus = "inactive" | "deactivated" | "pending" | "active" | "default"

type DataTableProps<TData extends BaseEntity> = {
  columns: ColumnDef<TData>[]
  data: TData[]
  isLoading?: boolean
  count?: number
  emptyStateMessage?: string
}

export function DataTable<TData extends BaseEntity>({
  columns,
  data,
  isLoading = false,
  count = 7,
  emptyStateMessage = "Sorry we couldn't find any data.",
}: DataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const getRowStatus = (row: Row<TData>): RowStatus => {
    const original = row.original as {
      status?: string
      deletedAt?: Date
      suspendedAt?: Date
    }
    const isInactive = original.deletedAt ?? original.suspendedAt

    if (isInactive) return "inactive"

    switch (original.status) {
      case "DEACTIVATED":
        return "deactivated"
      case "PENDING":
        return "pending"
      case "ACTIVE":
        return "active"
      default:
        return "default"
    }
  }

  const statusStyles: Record<RowStatus, string> = {
    inactive:
      "text-red-700 hover:text-red-50 bg-red-200 hover:bg-red-500 dark:text-red-200 dark:bg-red-900 dark:hover:bg-red-950",
    deactivated:
      "text-orange-700 hover:text-orange-50 bg-orange-200 hover:bg-orange-500 dark:text-orange-200 dark:bg-orange-900 dark:hover:bg-orange-950",
    pending:
      "text-yellow-700 hover:text-yellow-50 bg-yellow-200 hover:bg-yellow-500 dark:text-yellow-200 dark:bg-yellow-900 dark:hover:bg-yellow-950",
    active:
      "text-green-700 hover:text-green-50 bg-green-200 hover:bg-green-500 dark:text-green-200 dark:bg-green-900 dark:hover:bg-green-950",
    default: "",
  }

  return (
    <div className="border rounded-md overflow-auto">
      <Table>
        <TableHeader className="select-none">
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id} className="bg-muted/50">
              {headerGroup.headers.map(header => (
                <TableHead key={header.id} className="text-center">
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map(row =>
              isLoading ? (
                <TableRow key={row.id}>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    <LoadingCard renderedSkeletons={count} />
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={statusStyles[getRowStatus(row)]}
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id} className="whitespace-nowrap text-center">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ),
            )
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                <EmptyState>
                  <p className="mt-4 text-lg text-gray-500 select-none dark:text-gray-400">
                    {emptyStateMessage}
                  </p>
                </EmptyState>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
