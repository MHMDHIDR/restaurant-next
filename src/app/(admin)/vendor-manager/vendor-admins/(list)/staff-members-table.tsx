"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { DataTable } from "@/components/custom/data-table"
import { createActionsColumn } from "@/components/custom/data-table/actions-column"
import { baseColumns } from "@/components/custom/data-table/base-columns"
import { ConfirmationDialog } from "@/components/custom/data-table/confirmation-dialog"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/trpc/react"
import { staffMembersColumns } from "./staff-members-columns"
import type { BaseEntity } from "@/components/custom/data-table/base-columns"
import type { Users } from "@/server/db/schema"
import type { ColumnDef } from "@tanstack/react-table"

type StaffMember = Users & BaseEntity
type StaffMembersTableProps = {
  staffMembers: StaffMember[]
  vendorId: string
}

export function StaffMembersTable({ staffMembers, vendorId }: StaffMembersTableProps) {
  const [isDialogOpen, setDialogOpen] = useState(false)
  const [selectedStaffMember, setSelectedStaffMember] = useState<Users | null>(null)

  const router = useRouter()
  const toast = useToast()
  const utils = api.useUtils()

  const { mutate: removeStaff } = api.vendorAdmin.removeStaff.useMutation({
    onSuccess: async () => {
      toast.success("Staff member removed successfully")
      await utils.vendorAdmin.getStaffMembers.invalidate()
      router.refresh()
    },
    onError: error => {
      toast.error(`Failed to remove staff member: ${error.message}`)
    },
  })

  const handleDeleteClick = (id: string) => {
    const staffMember = staffMembers.find(staff => staff.id === id)
    if (staffMember) {
      setSelectedStaffMember(staffMember)
      setDialogOpen(true)
    }
  }

  const handleConfirmDelete = async () => {
    if (selectedStaffMember) {
      removeStaff({ userId: selectedStaffMember.id, vendorId })
    }
    setDialogOpen(false)
  }

  const columns: ColumnDef<StaffMember>[] = [
    ...baseColumns<StaffMember>(),
    ...staffMembersColumns,
    createActionsColumn<StaffMember>(id => handleDeleteClick(id)),
  ]

  return (
    <>
      <DataTable<StaffMember>
        columns={columns}
        data={staffMembers}
        emptyStateMessage="No staff members found."
      />
      <ConfirmationDialog
        open={isDialogOpen}
        onOpenChange={setDialogOpen}
        title="Confirm Removal"
        description="Are you sure you want to remove this staff member? This action cannot be undone."
        buttonText="Remove"
        buttonClass="bg-destructive hover:bg-destructive/90"
        onConfirm={handleConfirmDelete}
      />
    </>
  )
}
