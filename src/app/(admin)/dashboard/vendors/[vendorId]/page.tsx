import { redirect } from "next/navigation"
import { VendorApplicationForm } from "@/app/become-a-vendor/vendor-form"
import { api } from "@/trpc/server"

export default async function VendorDetails({ params }: { params: { vendorId: string } }) {
  const { vendorId } = params

  const vendor = await api.vendor.getById({ id: vendorId })

  return vendor?.status === "ACTIVE" ? (
    redirect("/account")
  ) : (
    <section className="container px-6 py-10 mx-auto max-w-5xl">
      <h1 className="mb-6 text-3xl font-bold">Become a Vendor</h1>
      <VendorApplicationForm vendor={vendor} isEditing />
    </section>
  )
}
