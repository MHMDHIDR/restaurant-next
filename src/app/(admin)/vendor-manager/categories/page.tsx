import { notFound } from "next/navigation"
import { api } from "@/trpc/server"
import { MenuCategoryForm } from "./MenuCategoryForm"

export default async function ManageCategoriesPage() {
  const vendor = await api.vendor.getBySessionUser()

  return !vendor ? (
    notFound()
  ) : (
    <div>
      <h1>Create New Menu Category</h1>
      <MenuCategoryForm vendorId={vendor.id} />
    </div>
  )
}
