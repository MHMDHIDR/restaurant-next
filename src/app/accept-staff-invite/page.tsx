import { redirect } from "next/navigation"
import { auth } from "@/server/auth"
import { api } from "@/trpc/server"

export default async function AcceptStaffInvitePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const searchParamsProp = await searchParams
  const token = searchParamsProp?.token as string
  const vendorId = searchParamsProp?.vendorId as string
  const session = await auth()
  if (!session) {
    redirect(`/signin?callbackUrl=/accept-staff-invite?token=${token}&vendorId=${vendorId}`)
  }

  if (token && vendorId) {
    await api.vendorAdmin.acceptInvitation({ userId: token, vendorId })
    redirect("/")
  } else {
    redirect("/")
  }
}
