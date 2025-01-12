import { VendorApplicationForm } from "@/app/become-a-vendor/vendor-form"
import { api } from "@/trpc/server"
import type { Vendors } from "@/server/db/schema"

export default async function VendorDetails({
  params,
}: {
  params: Promise<{ vendorId: Vendors["id"] }>
}) {
  const { vendorId } = await params

  const vendor = await api.vendor.getById({ id: vendorId })

  return (
    <section className="container px-6 py-10 mx-auto max-w-5xl">
      <h1 className="mb-6 text-3xl font-bold">Become a Vendor</h1>
      <VendorApplicationForm vendor={vendor} isEditing />
    </section>
  )
}
