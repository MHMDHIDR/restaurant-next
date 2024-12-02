import { redirect } from "next/navigation"
import { auth } from "@/server/auth"
import SiginForm from "./sigin-form"

export default async function SignInPage() {
  const session = await auth()

  return session ? (
    redirect("/")
  ) : (
    <main className="flex flex-col items-center justify-center h-screen -mt-20">
      <h1 className="mb-6 text-2xl font-bold text-center">Sigin to Your Account</h1>
      <SiginForm />
    </main>
  )
}
