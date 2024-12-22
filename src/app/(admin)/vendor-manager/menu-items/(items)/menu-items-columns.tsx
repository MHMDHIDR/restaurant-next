import clsx from "clsx"
import { ArrowUpDown } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import type { MenuItems } from "@/server/db/schema"
import type { ColumnDef } from "@tanstack/react-table"

export const menuItemsColumns: ColumnDef<MenuItems>[] = [
  {
    accessorKey: "image",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Image
        <ArrowUpDown className="w-4 h-4 ml-2" />
      </Button>
    ),
    cell: ({ row }) => {
      const image = row.getValue("image")
      return image ? (
        <Image
          src={image as string}
          alt="menu item"
          className="w-12 h-12 rounded-md mx-auto object-cover"
          width={48}
          height={48}
        />
      ) : null
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Name
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
    accessorKey: "price",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Price
        <ArrowUpDown className="w-4 h-4 ml-2" />
      </Button>
    ),
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("price"))
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "GBP",
      }).format(price)
      return formatted
    },
  },
  {
    accessorKey: "isAvailable",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Status
        <ArrowUpDown className="w-4 h-4 ml-2" />
      </Button>
    ),
    cell: ({ row }) => {
      const isAvailable = row.getValue("isAvailable")
      return (
        <span
          className={clsx("rounded-md px-1.5 py-1 select-none", {
            "bg-green-200 text-green-600": isAvailable,
            "bg-red-200 text-red-600": !isAvailable,
          })}
        >
          {isAvailable ? "Available" : "Unavailable"}
        </span>
      )
    },
  },
  {
    accessorKey: "preparationTime",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Prep Time
        <ArrowUpDown className="w-4 h-4 ml-2" />
      </Button>
    ),
    cell: ({ row }) => {
      const time = row.getValue("preparationTime")
      return time ? `${time} mins` : "N/A"
    },
  },
]
