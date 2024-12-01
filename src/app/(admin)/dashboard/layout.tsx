import { notFound } from "next/navigation"
import DashboardSidebar from "@/components/custom/dashboard-sidebar"
import Header from "@/components/ui/header"
import { auth } from "@/server/auth"
import { UserRole } from "@/server/db/schema"

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth()
  const user = session?.user
  const role = user?.role

  return !user || role !== UserRole.SUPER_ADMIN ? (
    notFound()
  ) : (
    <div className="grid md:grid-cols-4 lg:grid-cols-4">
      <DashboardSidebar />
      <main className="col-span-3">
        <Header />
        {children}
      </main>
    </div>
  )
}
