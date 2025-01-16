"use client"

import { useSearchParams } from "next/navigation"
import { useCallback, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InviteStaffForm } from "./(invite)/invite-staff-form"
import { StaffMembersTable } from "./(list)/staff-members-table"
import type { Users, Vendors } from "@/server/db/schema"

type VendorAdminsContentProps = {
  vendor: Vendors
  staffMembers: Users[]
}

export function VendorAdminsContent({ vendor, staffMembers }: VendorAdminsContentProps) {
  const searchParams = useSearchParams()

  const view = searchParams.get("view") ?? "staff"

  const handleTabChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set("view", value)
      window.history.pushState(null, "", `?${params.toString()}`)
    },
    [searchParams],
  )

  // Sync URL with tab view
  useEffect(() => {
    if (searchParams.get("view") !== view) {
      handleTabChange(view)
    }
  }, [view, searchParams, handleTabChange])

  return (
    <Tabs
      value={view}
      defaultValue={view}
      className="container max-w-6xl md:px-3.5 px-2 py-3"
      onValueChange={handleTabChange}
    >
      <TabsList>
        <TabsTrigger value="staff">Staff Members</TabsTrigger>
        <TabsTrigger value="invite">Invite Staff</TabsTrigger>
      </TabsList>
      <TabsContent value="staff">
        <StaffMembersTable staffMembers={staffMembers} vendorId={vendor.id} />
      </TabsContent>
      <TabsContent value="invite">
        <InviteStaffForm vendorId={vendor.id} />
      </TabsContent>
    </Tabs>
  )
}
