"use client"

import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import EmptyState from "@/components/custom/empty-state"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { BaseEntity } from "./base-columns"
import type { ColumnDef } from "@tanstack/react-table"

interface DataTableProps<TData extends BaseEntity> {
  columns: ColumnDef<TData>[]
  data: TData[]
}

export function DataTable<TData extends BaseEntity>({ columns, data }: DataTableProps<TData>) {
  const table = useReactTable({
    data: data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="border rounded-md mx-3">
      <Table>
        <TableHeader className="select-none">
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id} className="bg-muted/50">
              {headerGroup.headers.map(header => (
                <TableHead key={header.id}>
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
            table.getRowModel().rows.map(row => (
              <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                {row.getVisibleCells().map(cell => (
                  <TableCell key={cell.id} className="text-center whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
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
