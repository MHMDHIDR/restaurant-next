import { notFound } from "next/navigation"
import { api } from "@/trpc/server"
import { MenuCategoryForm } from "./MenuCategoryForm"

export default async function ManageCategoriesPage() {
  const vendor = await api.vendor.getBySessionUser()

  return !vendor ? (
    notFound()
  ) : (
    <section className="container max-w-3xl md:px-3.5 px-2 py-5 md:py-10">
      <h1>Create New Menu Category</h1>
      <MenuCategoryForm vendorId={vendor.id} />
    </section>
  )
}
