import { api } from "@/trpc/server"
import { columns } from "./columns"
import { DataTable } from "./data-table"
import type { Users } from "@/server/db/schema"

export default async function Users() {
  const users = await api.users.getUsers()

  return (
    <div className="container mx-auto py-10">
      <DataTable<Users, unknown> columns={columns} data={users} />
    </div>
  )
}
