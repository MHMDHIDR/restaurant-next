import { IconHome } from "@tabler/icons-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { auth } from "@/server/auth"
import { NotFoundIcon } from "../components/custom/icons"

export default async function RootNotFound() {
  const session = await auth()
  const user = session?.user

  return (
    <section>
      <div className="container mx-auto flex min-h-screen w-full flex-col items-center justify-center px-6 py-20">
        <div className="mx-auto flex max-w-lg flex-col items-center text-center">
          <NotFoundIcon />

          <h1 className="mt-3 text-2xl font-semibold text-gray-800 dark:text-white md:text-3xl">
            Page Not Found
          </h1>
          <p className="mt-4 text-gray-500 dark:text-gray-400">
            Sorry, the page you are looking for does not exist or has been moved.
          </p>

          <div className="mt-6 flex w-full shrink-0 items-center gap-x-3 sm:w-auto">
            <Link href="/" className="w-full cursor-pointer">
              <Button type="button" variant={"pressable"}>
                <IconHome className="h-5 w-5 stroke-2" />
                Go Home
              </Button>
            </Link>
            {user && (
              <Link href="/dashboard" className="w-full cursor-pointer">
                <Button type="button" variant={"pressable"}>
                  Dashboard
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
