"use client"

import { Ban, Check, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { DataTable } from "@/components/custom/data-table"
import { baseColumns } from "@/components/custom/data-table/base-columns"
import { ConfirmationDialog } from "@/components/custom/data-table/confirmation-dialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/trpc/react"
import { vendorsColumns } from "./vendors-columns"
import type { BaseEntity } from "@/components/custom/data-table/base-columns"
import type { Users, Vendors } from "@/server/db/schema"
import type { ColumnDef } from "@tanstack/react-table"

export default function VendorsTable({
  vendors: initialVendors,
  count,
}: {
  vendors: (Vendors & BaseEntity & { assignedUser: Users })[]
  count: number
}) {
  const [selectedVendors, setSelectedVendors] = useState<(Vendors & BaseEntity)[]>([])
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const router = useRouter()
  const toast = useToast()
  const utils = api.useUtils()

  const { data: vendorsData, isLoading } = api.vendor.getAll.useQuery(undefined, {
    initialData: { items: initialVendors, count },
    refetchOnMount: true,
  })

  const updateVendorMutation = api.vendor.update.useMutation({
    onSuccess: async () => {
      toast.success("Vendors updated successfully")
      await utils.vendor.getAll.invalidate()
      router.refresh()
      setSelectedVendors([])
    },
    onError: error => {
      toast.error(`Failed to update vendors: ${error.message}`)
    },
    onMutate: () => {
      toast.loading("Updating Vendors...")
    },
  })

  const handleBulkDelete = () => {
    if (selectedVendors.length > 0) {
      setDeleteDialogOpen(true)
    }
  }

  const handleConfirmDelete = () => {
    for (const vendor of selectedVendors) {
      updateVendorMutation.mutate({ email: vendor.email, deletedAt: new Date() })
    }
    setDeleteDialogOpen(false)
  }

  const handleBulkAction = (action: "activate" | "deactivate" | "suspend" | "unsuspend") => {
    for (const vendor of selectedVendors) {
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
      }
    }
  }

  // Refresh the page when mutations occur
  useEffect(() => {
    router.refresh()
  }, [vendorsData, router])

  const columns = [...baseColumns, ...vendorsColumns]

  return (
    <>
      <DataTable<Vendors & BaseEntity>
        columns={columns as ColumnDef<Vendors & BaseEntity>[]}
        data={vendorsData.items}
        isLoading={isLoading}
        count={count}
        emptyStateMessage="Sorry, No Vendors Found."
        onRowSelection={setSelectedVendors}
      />
      {selectedVendors.length > 0 && (
        <div className="mt-2 flex items-center gap-2">
          <Button
            variant="destructive"
            onClick={handleBulkDelete}
            className="flex items-center gap-2"
          >
            Delete Selected ({selectedVendors.length})
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="flex items-center gap-2">
                Actions ({selectedVendors.length})
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleBulkAction("activate")}>
                <Check className="mr-0.5 h-4 w-4" /> Activate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkAction("deactivate")}>
                <Ban className="mr-0.5 h-4 w-4" /> Deactivate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkAction("suspend")}>
                <Ban className="mr-0.5 h-4 w-4" /> Suspend
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkAction("unsuspend")}>
                <CheckCircle className="mr-0.5 h-4 w-4" /> Unsuspend
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Selected Vendors"
        description={`Are you sure you want to delete these ${selectedVendors.length} vendors? This action cannot be undone.`}
        buttonText="Delete"
        buttonClass="bg-destructive hover:bg-destructive/90"
        onConfirm={handleConfirmDelete}
      />
    </>
  )
}
