import { Edit, MoreHorizontal, Trash } from "lucide-react"
import { useState } from "react"
import { MenuItemEdit } from "@/app/(admin)/vendor-manager/menu-items/(items)/menu-item-edit"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { MenuCategories, MenuItems } from "@/server/db/schema"
import type { CellContext, ColumnDef } from "@tanstack/react-table"

export type BaseEntity = {
  id: string
  name: string
}

const ActionCell = ({
  menuItem,
  deleteAction,
  categories,
}: {
  menuItem: MenuItems & BaseEntity
  deleteAction: (id: string) => void
  categories: MenuCategories[]
}) => {
  const [isEditOpen, setIsEditOpen] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="w-8 h-8 p-0">
            <span className="sr-only">Actions</span>
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="rtl:rtl">
          <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
            <Edit className="mr-0.5 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem className="text-red-600" onClick={() => deleteAction(menuItem.id)}>
            <Trash className="mr-0.5 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <MenuItemEdit
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        menuItem={menuItem}
        categories={categories}
      />
    </>
  )
}

export const actionsColumns: (
  deleteAction: (id: string) => void,
  categories: MenuCategories[],
) => ColumnDef<MenuItems & BaseEntity>[] = (deleteAction, categories) => [
  {
    accessorKey: "actions",
    header: "Actions",
    cell: ({ row }: CellContext<MenuItems & BaseEntity, unknown>) => (
      <ActionCell menuItem={row.original} deleteAction={deleteAction} categories={categories} />
    ),
  },
]
