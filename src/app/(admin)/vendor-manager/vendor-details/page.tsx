import { notFound } from "next/navigation"
import { VendorApplicationForm } from "@/app/become-a-vendor/vendor-form"
import { auth } from "@/server/auth"
import { api } from "@/trpc/server"

export default async function VendorDetailsPage() {
  const session = await auth()
  if (!session) notFound()

  const vendor = await api.vendor.getBySessionUser()
  if (!vendor) notFound()

  return (
    <section className="container px-6 py-10 mx-auto max-w-5xl">
      <h1 className="mb-6 text-3xl font-bold">Edit Vendor Details</h1>
      <VendorApplicationForm vendor={vendor} isEditing />
    </section>
  )
}
