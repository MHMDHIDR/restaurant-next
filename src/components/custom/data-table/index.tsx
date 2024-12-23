"use client"

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import clsx from "clsx"
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
import type { Users, Vendors } from "@/server/db/schema"
import type { ColumnDef } from "@tanstack/react-table"

interface DataTableProps<TData extends BaseEntity> {
  columns: ColumnDef<TData>[]
  data: TData[]
  isLoading?: boolean
  count?: number
}

export function DataTable<TData extends BaseEntity>({
  columns,
  data,
  isLoading = false,
  count = 7,
}: DataTableProps<TData>) {
  const table = useReactTable({
    data: data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

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
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map(row => {
              const userStatus = (row.original as unknown as Users).status
              const isDeleted = (row.original as unknown as Users).deletedAt !== null
              const vendorStatus = (row.original as unknown as Vendors).status
              const isSuspended =
                (row.original as unknown as Vendors).suspendedAt &&
                (row.original as unknown as Vendors).suspendedAt !== null

              return isLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    <LoadingCard renderedSkeletons={count} />
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={clsx({
                    "text-orange-700 hover:text-orange-50 bg-orange-200 hover:bg-orange-500 dark:text-orange-200 dark:bg-orange-900 dark:hover:bg-orange-950":
                      vendorStatus === "DEACTIVATED",
                    "text-yellow-700 hover:text-yellow-50 bg-yellow-200 hover:bg-yellow-500 dark:text-yellow-200 dark:bg-yellow-900 dark:hover:bg-yellow-950":
                      vendorStatus === "PENDING" || userStatus === "PENDING",
                    "text-green-700 hover:text-green-50 bg-green-200 hover:bg-green-500 dark:text-green-200 dark:bg-green-900 dark:hover:bg-green-950":
                      userStatus === "ACTIVE",
                    "text-red-700 hover:text-red-50 bg-red-200 hover:bg-red-500 dark:text-red-200 dark:bg-red-900 dark:hover:bg-red-950":
                      isSuspended ?? isDeleted,
                  })}
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id} className="whitespace-nowrap text-center">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              )
            })
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                <EmptyState>
                  <p className="mt-4 text-lg text-gray-500 select-none dark:text-gray-400">
                    Sorry we couldn&apos;t find any data.
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
