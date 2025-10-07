import { ArrowUpDown } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import type { Users } from "@/server/db/schema"
import type { ColumnDef } from "@tanstack/react-table"

export const staffMembersColumns: ColumnDef<Users>[] = [
  {
    accessorKey: "image",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Image
        <ArrowUpDown className="size-4 ml-2" />
      </Button>
    ),
    cell: ({ row }) => {
      const image = row.getValue("image")
      return image ? (
        <Image
          src={image as string}
          alt="staff member"
          className="size-8 rounded-full mx-auto object-contain"
          width={32}
          height={32}
        />
      ) : null
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Email
        <ArrowUpDown className="size-4 ml-2" />
      </Button>
    ),
  },
  {
    accessorKey: "phone",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Phone
        <ArrowUpDown className="size-4 ml-2" />
      </Button>
    ),
  },
]
