import Link from "next/link"
import AccountNav from "@/components/custom/accunt-nav"
import { Logo } from "@/components/custom/icons"
import { Button } from "@/components/ui/button"
import { auth } from "@/server/auth"
import type { Session } from "next-auth"

export default async function Nav() {
  const session = await auth()
  const user = session?.user as Session["user"]

  return (
    <header className="shadow-sm border-b">
      <div className="container mx-auto flex items-center justify-between p-1.5 md:px-0">
        <Link href="/" className="flex select-none gap-x-2 text-xl font-bold text-primary">
          <Logo className="mx-auto h-7 w-7 stroke-current stroke-1" />
          Restaurant
          <span className="text-black">App</span>
        </Link>
        <nav className="space-x-4">
          {session ? (
            <AccountNav user={user} />
          ) : (
            <Link href="/signin">
              <Button>Sign in</Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
