import { Suspense } from "react"
import { LoadingCard } from "@/components/custom/data-table/loading"
import { api } from "@/trpc/server"
import VendorsTable from "./vendors-table"

export default async function Vendors() {
  const { items: vendors, count } = await api.vendor.getAll()

  return (
    <div className="max-w-[24rem] sm:max-w-xl md:max-w-2xl lg:max-w-3xl py-4 mx-auto">
      <Suspense fallback={<LoadingCard renderedSkeletons={count} />}>
        <VendorsTable vendors={vendors} count={count} />
      </Suspense>
    </div>
  )
}
