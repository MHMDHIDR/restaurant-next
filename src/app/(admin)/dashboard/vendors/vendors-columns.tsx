import { ArrowUpDown, Ban, Check, CheckCircle, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/trpc/react"
import type { Users, Vendors } from "@/server/db/schema"
import type { ColumnDef } from "@tanstack/react-table"

export const vendorsColumns: ColumnDef<Vendors>[] = [
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
    accessorKey: "addedByName",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Added By Name
        <ArrowUpDown className="w-4 h-4 ml-2" />
      </Button>
    ),
    cell: ({ row }) => {
      const addedByName = (row.original as Vendors & { assignedUser: Users }).assignedUser.name
      return <span>{addedByName}</span>
    },
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
      const status = row.getValue("status") as Vendors["status"]
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
    accessorKey: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const router = useRouter()
      const status = row.getValue("status") as Vendors["status"]
      const isSuspended = row.original.suspendedAt !== null

      const toast = useToast()
      const utils = api.useUtils()
      const updateVendorMutation = api.vendor.update.useMutation({
        onSuccess: async () => {
          toast.success("Vendor status updated successfully")
          await utils.vendor.getAll.invalidate()
          router.refresh()
        },
        onError: error => {
          toast.error(`Failed to update vendor status: ${error.message}`)
        },
      })

      const handleActivate = () => {
        updateVendorMutation.mutate({ email: row.original.email, status: "ACTIVE" })
      }

      const handleDeactivate = () => {
        updateVendorMutation.mutate({ email: row.original.email, status: "DEACTIVATED" })
      }

      const handleDelete = () => {
        updateVendorMutation.mutate({ email: row.original.email, deletedAt: new Date() })
      }

      const handleSuspend = () => {
        updateVendorMutation.mutate({ email: row.original.email, suspendedAt: new Date() })
      }

      const handleUnsuspend = () => {
        updateVendorMutation.mutate({ email: row.original.email, suspendedAt: null })
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-8 h-8 p-0">
              <span className="sr-only">Actions</span>
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rtl:rtl">
            <DropdownMenuLabel className="select-none">Actions</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/vendors/${row.original.id}`}>
                <Pencil className="mr-0.5 h-4 w-4" />
                View / Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                if (status === "ACTIVE") {
                  handleDeactivate()
                } else if (["DEACTIVATED", "PENDING"].includes(status)) {
                  handleActivate()
                }
              }}
            >
              {status === "ACTIVE" ? (
                <>
                  <Ban className="mr-0.5 h-4 w-4" /> Deactivate
                </>
              ) : (
                (status === "DEACTIVATED" || status === "PENDING") && (
                  <>
                    <Check className="mr-0.5 h-4 w-4" /> Activate
                  </>
                )
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={isSuspended ? handleUnsuspend : handleSuspend}>
              {isSuspended ? (
                <>
                  <CheckCircle className="mr-0.5 h-4 w-4" /> Unsuspend
                </>
              ) : (
                <>
                  <Ban className="mr-0.5 h-4 w-4" /> Suspend
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete}>
              <Trash2 className="mr-0.5 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
