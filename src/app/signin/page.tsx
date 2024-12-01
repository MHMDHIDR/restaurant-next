import { redirect } from "next/navigation"
import { auth } from "@/server/auth"
import Sigin from "./sigin-form"

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
