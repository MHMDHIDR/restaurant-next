"use client"

import { IconShoppingCart } from "@tabler/icons-react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import AccountNav from "@/components/custom/accunt-nav"
import { Logo } from "@/components/custom/icons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useCart } from "@/hooks/use-cart"
import { LoadingCard } from "./data-table/loading"
import Notifications from "./notifications"
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
  const { data: session, status } = useSession()
  const { items } = useCart()
  const itemCount = items.reduce((total, item) => total + (item.quantity ?? 1), 0)

  // Only use the server-provided user if there's no client session
  const currentUser = session?.user ?? (status === "unauthenticated" ? undefined : user)

  return (pathname.includes("/dashboard") || pathname.includes("/vendor-manager")) &&
    isHidden ? null : (
    <header className="w-full border-b shadow-xs sticky top-0 z-40 bg-white dark:bg-black">
      <div className="flex items-center justify-between p-1.5 max-w-(--breakpoint-xl) mx-auto">
        <Link href="/" className="flex select-none gap-x-2 text-xl font-bold text-primary">
          <Logo className="mx-auto h-7 w-7 stroke-1 stroke-current" />
          <span className="hidden sm:inline-flex">
            Restaurant
            <span className="text-black">App</span>
          </span>
        </Link>
        <nav className="flex items-center gap-4">
          {itemCount > 0 && (
            <Link href="/cart">
              <Button variant="outline" size="sm" className="relative">
                <IconShoppingCart className="h-5 w-5" />
                <Badge className="absolute -right-2 -top-2 flex h-5 min-w-5 w-fit px-1 items-center justify-center rounded-full bg-primary text-xs text-white">
                  {itemCount}
                </Badge>
              </Button>
            </Link>
          )}
          {status === "loading" ? (
            <LoadingCard renderedSkeletons={1} layout="vertical" className={"h-9 w-52"} />
          ) : currentUser ? (
            <>
              <Notifications />
              <AccountNav user={currentUser} />
            </>
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
