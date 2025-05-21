import { ArrowUpDown } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import CopyText from "@/components/custom/copy"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/format-price"
import { truncate } from "@/lib/truncate"
import type { MenuItems, Orders } from "@/server/db/schema"
import type { ColumnDef } from "@tanstack/react-table"

export const customerOrdersColumns: ColumnDef<Orders>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Order Number
        <ArrowUpDown className="ml-2 size-4" />
      </Button>
    ),
    cell: ({ row }) => {
      return (
        <>
          <CopyText text={row.original.id} className="inline mr-3 w-3.5" />
          <Link href={`/orders/${row.original.id}`}>{truncate(row.original.id, 10)}</Link>
        </>
      )
    },
  },
  {
    accessorKey: "orderItems",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Order Items
        <ArrowUpDown className="ml-2 size-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const items = row.original as unknown as {
        orderItems: { id: string; quantity: number; totalPrice: number; menuItem: MenuItems }[]
      }

      return (
        <ul className="space-y-1.5 text-left min-w-80">
          {items.orderItems.map(item => (
            <li key={item.id} className="flex items-center gap-2">
              <Image
                src={item.menuItem.image}
                alt={item.menuItem.name}
                width={40}
                height={40}
                className="rounded-sm shadow-sm"
              />
              {item.quantity}x {item.menuItem.name} ({formatPrice(item.totalPrice)})
            </li>
          ))}
        </ul>
      )
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Status
        <ArrowUpDown className="ml-2 size-4" />
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
        <ArrowUpDown className="ml-2 size-4" />
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
        <ArrowUpDown className="ml-2 size-4" />
      </Button>
    ),
    cell: ({ row }) => {
      return new Date(row.getValue("createdAt")).toLocaleString()
    },
  },
]
