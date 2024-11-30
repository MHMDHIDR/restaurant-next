import Link from "next/link"
import { Button } from "@/components/ui/button"
import { auth } from "@/server/auth"
import AccountNav from "./accunt-nav"
import { Logo } from "./icons"
import type { Session } from "next-auth"

export default async function Nav() {
  const session = await auth()
  const user = session?.user as Session["user"]

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto flex items-center justify-between py-1.5 px-2">
        <Link href="/" className="flex select-none gap-x-2 text-xl font-bold text-primary">
          <Logo className="mx-auto h-7 w-7 stroke-current stroke-1" />
          Restaurant
          <span className="text-black">App</span>
        </Link>
        <nav className="space-x-4">
          {session ? (
            <AccountNav user={user} />
          ) : (
            <Link href="/sigin">
              <Button>Sigin</Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
