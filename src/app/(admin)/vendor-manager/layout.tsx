import Header from "@/components/ui/header"
import { checkRoleAccess } from "@/lib/check-role-access"
import { auth } from "@/server/auth"
import { UserRole } from "@/server/db/schema"

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth()
  const user = session?.user
  const ALLOWED_ROLES = [UserRole.SUPER_ADMIN, UserRole.VENDOR_ADMIN] as const

  checkRoleAccess(user?.role, ALLOWED_ROLES)

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      {/* <DashboardSidebar /> */}
      <div className="flex flex-col">
        <Header />
        {children}
      </div>
    </div>
  )
}
