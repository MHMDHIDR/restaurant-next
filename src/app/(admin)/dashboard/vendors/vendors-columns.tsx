import { ArrowUpDown, Ban, CheckCircle, MoreHorizontal } from "lucide-react"
import { useRouter } from "next/navigation"
import React from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/trpc/react"
import type { RouterOutputs } from "@/trpc/react"
import type { ColumnDef } from "@tanstack/react-table"

type Vendor = RouterOutputs["vendor"]["getAll"]["items"][number]

// Wrapper component to handle router and mutation logic
const VendorActionsCell: React.FC<{ vendor: Vendor }> = ({ vendor }) => {
  const router = useRouter()
  const toast = useToast()
  const utils = api.useUtils()

  const updateVendorMutation = api.vendor.update.useMutation({
    onSuccess: async () => {
      toast.success("Vendor updated successfully")
      await utils.vendor.getAll.invalidate()
      router.refresh()
    },
    onError: error => {
      toast.error(`Failed to update vendor: ${error.message}`)
    },
    onMutate: () => {
      toast.loading("Updating Vendor...")
    },
  })

  const handleAction = (action: "activate" | "deactivate" | "suspend" | "unsuspend" | "delete") => {
    switch (action) {
      case "activate":
        updateVendorMutation.mutate({ email: vendor.email, status: "ACTIVE" })
        break
      case "deactivate":
        updateVendorMutation.mutate({ email: vendor.email, status: "DEACTIVATED" })
        break
      case "suspend":
        updateVendorMutation.mutate({ email: vendor.email, suspendedAt: new Date() })
        break
      case "unsuspend":
        updateVendorMutation.mutate({ email: vendor.email, suspendedAt: null })
        break
      case "delete":
        updateVendorMutation.mutate({ email: vendor.email, deletedAt: new Date() })
        break
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleAction("activate")}>
          <CheckCircle className="mr-0.5 h-4 w-4" /> Activate
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAction("deactivate")}>
          <Ban className="mr-0.5 h-4 w-4" /> Deactivate
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAction("suspend")}>
          <Ban className="mr-0.5 h-4 w-4" /> Suspend
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAction("unsuspend")}>
          <CheckCircle className="mr-0.5 h-4 w-4" /> Unsuspend
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAction("delete")}>
          <Ban className="mr-0.5 h-4 w-4" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const vendorsColumns: ColumnDef<Vendor>[] = [
  {
    accessorKey: "email",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Email
        <ArrowUpDown className="w-4 h-4 ml-2" />
      </Button>
    ),
  },
  {
    accessorKey: "phone",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Phone
        <ArrowUpDown className="w-4 h-4 ml-2" />
      </Button>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Status
        <ArrowUpDown className="w-4 h-4 ml-2" />
      </Button>
    ),
    cell: ({ row }) => {
      const status = row.original.status
      const suspendedAt = new Date(String(row.original.suspendedAt)).toLocaleDateString()
      const isSuspended = row.original.suspendedAt !== null

      return <span>{isSuspended ? `Suspended At: ${suspendedAt}` : status}</span>
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Created At
        <ArrowUpDown className="w-4 h-4 ml-2" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = row.getValue("createdAt")
      return new Date(String(date)).toLocaleDateString()
    },
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Updated At
        <ArrowUpDown className="w-4 h-4 ml-2" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = row.getValue("updatedAt")
      return new Date(String(date)).toLocaleDateString()
    },
  },
  {
    accessorKey: "metrics.orderCount",
    header: "Orders",
  },
  {
    accessorKey: "metrics.totalRevenue",
    header: "Revenue",
    cell: ({ row }) => {
      const revenue = row.original.metrics?.totalRevenue ?? 0
      return `$${revenue.toFixed(2)}`
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <VendorActionsCell vendor={row.original} />,
  },
]
