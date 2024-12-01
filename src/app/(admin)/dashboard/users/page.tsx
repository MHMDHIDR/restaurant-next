import { Suspense } from "react"
import { LoadingCard } from "@/components/custom/data-table/loading"
import { api } from "@/trpc/server"
import UsersTable from "./users-table"

export default async function Users() {
  const { users, count } = await api.users.getUsers()

  return (
    <div className="max-w-xl sm:max-w-3xl md:max-w-4xl py-4 mx-auto">
      <Suspense fallback={<LoadingCard renderedSkeletons={count} />}>
        <UsersTable users={users} />
      </Suspense>
    </div>
  )
}
