import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Users } from "@/server/db/schema"
import type { ColumnDef } from "@tanstack/react-table"

export const categoriesColumns: ColumnDef<Users>[] = [
  {
    accessorKey: "image",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Image
        <ArrowUpDown className="w-4 h-4 ml-2" />
      </Button>
    ),
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Description
        <ArrowUpDown className="w-4 h-4 ml-2" />
      </Button>
    ),
  },
  {
    accessorKey: "isActive",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Status
        <ArrowUpDown className="w-4 h-4 ml-2" />
      </Button>
    ),
    cell: ({ row }) => {
      return row.getValue("isActive") ? "Active" : "Inactive"
    },
  },
  {
    accessorKey: "sortOrder",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Sort Order
        <ArrowUpDown className="w-4 h-4 ml-2" />
      </Button>
    ),
  },
]
