"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import AccountNav from "@/components/custom/accunt-nav"
import { Logo } from "@/components/custom/icons"
import { Button } from "@/components/ui/button"
import type { Session } from "next-auth"

export default function Nav({
  user,
  isHidden,
}: {
  user: Session["user"] | undefined
  isHidden?: boolean
}) {
  isHidden = isHidden ?? false
  const pathname = usePathname()
  const { data: session } = useSession()
  const currentUser = session?.user ?? user

  return (pathname.includes("/dashboard") || pathname.includes("/vendor-manager")) &&
    isHidden ? null : (
    <header className="border-b shadow-sm mx-auto w-full">
      <div className="flex items-center justify-between p-1.5">
        <Link href="/" className="flex text-xl font-bold select-none gap-x-2 text-primary">
          <Logo className="mx-auto stroke-current h-7 w-7 stroke-1" />
          Restaurant
          <span className="text-black">App</span>
        </Link>
        <nav className="inline-flex">
          {user ? (
            <AccountNav user={currentUser!} />
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
