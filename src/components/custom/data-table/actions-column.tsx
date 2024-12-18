import { MoreHorizontal, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { CellContext, ColumnDef } from "@tanstack/react-table"

export type BaseEntity = {
  id: string
  name: string
}

export const actionsColumns: (
  deleteAction: (id: string) => void,
) => ColumnDef<BaseEntity>[] = deleteAction => [
  {
    accessorKey: "actions",
    header: "Actions",
    cell: ({ row }: CellContext<BaseEntity, unknown>) => {
      const entity = row.original

      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-8 h-8 p-0">
                <span className="sr-only">Delete</span>
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rtl:rtl">
              <DropdownMenuItem className="text-red-600" onClick={() => deleteAction(entity.id)}>
                <Trash className="mr-0.5 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )
    },
  },
]
