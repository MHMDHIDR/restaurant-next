import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ColumnDef } from "@tanstack/react-table"

export type BaseEntity = {
  id: string
  name: string
}

export const baseColumns: ColumnDef<BaseEntity>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Name
        <ArrowUpDown className="w-4 h-4 ml-2" />
      </Button>
    ),
    id: "base_name",
  },
]
