import { redirect } from "next/navigation"
import { api } from "@/trpc/server"
import { VendorAdminsContent } from "./vendor-admins-content"

export default async function VendorAdminsPage() {
  const vendor = await api.vendor.getBySessionUser()

  if (!vendor) {
    redirect("/")
  }

  try {
    const { items: staffMembers } = await api.vendorAdmin.getStaffMembers({ vendorId: vendor.id })

    return <VendorAdminsContent vendor={vendor} staffMembers={staffMembers} />
  } catch (error) {
    console.error("Error fetching data:", error)
    redirect("/error")
  }
}
