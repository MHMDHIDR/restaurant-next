import Link from "next/link"
import AccountNav from "@/components/custom/accunt-nav"
import { Logo } from "@/components/custom/icons"
import { Button } from "@/components/ui/button"
import type { Session } from "next-auth"

export default function Nav({ user }: { user: Session["user"] }) {
  return (
    <header className="border-b shadow-sm mx-auto">
      <div className="flex items-center justify-between p-1.5">
        <Link href="/" className="flex text-xl font-bold select-none gap-x-2 text-primary">
          <Logo className="mx-auto stroke-current h-7 w-7 stroke-1" />
          Restaurant
          <span className="text-black">App</span>
        </Link>
        <nav className="inline-flex">
          {user ? (
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
