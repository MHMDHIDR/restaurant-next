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
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <DashboardSidebar />
      <div className="flex flex-col">
        <Header />
        {children}
      </div>
    </div>
  )
}
