import { notFound } from "next/navigation"
import { api } from "@/trpc/server"
import CategoriesContent from "./categories-content"

export default async function ManageCategoriesPage() {
  const vendor = await api.vendor.getBySessionUser()

  if (!vendor) {
    return notFound()
  }

  const categories = await api.menuCategory.getCategoriesByVendorId({ vendorId: vendor.id })

  return <CategoriesContent vendor={vendor} categories={categories} />
}
