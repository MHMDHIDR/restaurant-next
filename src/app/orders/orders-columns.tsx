import { ArrowUpDown } from "lucide-react"
import CopyText from "@/components/custom/copy"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Orders } from "@/server/db/schema"
import type { ColumnDef } from "@tanstack/react-table"

export const customerOrdersColumns: ColumnDef<Orders>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Order Number
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      return (
        <>
          <CopyText text={row.original.id} className="inline mr-3 w-3.5" />
          <span>{row.original.id}</span>
        </>
      )
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Status
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const status = row.original.status
      return (
        <Badge
          variant={
            status === "CANCELLED"
              ? "destructive"
              : status === "DELIVERED"
                ? "success"
                : "secondary"
          }
        >
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: "total",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Total
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("total"))
      return new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: "GBP",
      }).format(amount)
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Order Time
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      return new Date(row.getValue("createdAt")).toLocaleString()
    },
  },
]
