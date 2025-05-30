import { Suspense } from "react"
import { LoadingCard } from "@/components/custom/data-table/loading"
import { api } from "@/trpc/server"
import { PayoutButton } from "./payout-button"
import { VendorsTable } from "./vendors-table"

export default async function Vendors() {
  const { items: vendors, count } = await api.vendor.getAll()

  return (
    <div className="container max-w-6xl md:px-3.5 px-2 py-3 space-y-3">
      <PayoutButton vendors={vendors} />
      <Suspense fallback={<LoadingCard renderedSkeletons={count} />}>
        <VendorsTable vendors={vendors} count={count} />
      </Suspense>
    </div>
  )
}
