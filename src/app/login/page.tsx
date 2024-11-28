import { redirect } from "next/navigation"
import Login from "@/app/_components/auth/login"
import { auth } from "@/server/auth"

export default async function LoginPage() {
  const session = await auth()

  return session ? (
    redirect("/")
  ) : (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-bold">Login to Your Account</h1>
        <Login />
      </div>
    </main>
  )
}
