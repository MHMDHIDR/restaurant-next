import { notFound, redirect } from "next/navigation"
import { auth } from "@/server/auth"
import { api } from "@/trpc/server"
import { VendorApplicationForm } from "./vendor-form"

export default async function BecomeVendor() {
  const session = await auth()

  if (!session) {
    notFound()
  }

  const vendor = await api.vendor.getBySessionUser()

  return vendor?.status === "ACTIVE" ? (
    redirect("/account")
  ) : (
    <section className="container px-6 py-10 mx-auto max-w-5xl">
      {vendor?.status === "PENDING" ? (
        <div className="p-6 mb-6 text-center border rounded-lg">
          <h1 className="mb-4 text-3xl font-bold">Vendor Application Pending</h1>
          <p className="text-lg text-muted-foreground">
            Your vendor application is currently under review. We will contact you soon with the
            status of your application.
          </p>
        </div>
      ) : (
        <>
          <h1 className="mb-6 text-3xl font-bold">Become a Vendor</h1>
          <VendorApplicationForm vendor={vendor} />
        </>
      )}
    </section>
  )
}
