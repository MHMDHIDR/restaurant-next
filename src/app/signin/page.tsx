import { redirect } from "next/navigation"
import Sigin from "@/app/_components/auth/sigin"
import { auth } from "@/server/auth"

export default async function SignInPage() {
  const session = await auth()

  return session ? (
    redirect("/")
  ) : (
    <main className="-mt-20 flex h-screen flex-col items-center justify-center">
      <h1 className="mb-6 text-center text-2xl font-bold">Sigin to Your Account</h1>
      <Sigin />
    </main>
  )
}
