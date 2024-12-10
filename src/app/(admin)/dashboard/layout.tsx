import { notFound } from "next/navigation"
import DashboardSidebar from "@/components/custom/dashboard-sidebar"
import MobileNav from "@/components/custom/mobile-nav"
import { checkRoleAccess } from "@/lib/check-role-access"
import { auth } from "@/server/auth"
import { UserRole } from "@/server/db/schema"

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth()
  const user = session?.user
  const ALLOWED_ROLES = [UserRole.SUPER_ADMIN] as const

  return !checkRoleAccess(user?.role, ALLOWED_ROLES) ? (
    notFound()
  ) : (
    <div className="grid md:grid-cols-4 lg:grid-cols-4">
      <DashboardSidebar />
      <main className="col-span-3 max-w-screen-xl">
        <MobileNav />
        {children}
      </main>
    </div>
  )
}
