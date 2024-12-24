"use client"

import { IconShoppingCart } from "@tabler/icons-react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import AccountNav from "@/components/custom/accunt-nav"
import { Logo } from "@/components/custom/icons"
import { Button } from "@/components/ui/button"
import { useCart } from "@/hooks/use-cart"
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
  const { items } = useCart()
  const itemCount = items.reduce((total, item) => total + (item.quantity ?? 1), 0)

  return (pathname.includes("/dashboard") || pathname.includes("/vendor-manager")) &&
    isHidden ? null : (
    <header className="mx-auto w-full border-b shadow-sm">
      <div className="flex items-center justify-between p-1.5">
        <Link href="/" className="flex select-none gap-x-2 text-xl font-bold text-primary">
          <Logo className="mx-auto h-7 w-7 stroke-1 stroke-current" />
          Restaurant
          <span className="text-black">App</span>
        </Link>
        <nav className="flex items-center gap-4">
          {itemCount > 0 && (
            <Link href="/cart">
              <Button variant="outline" size="sm" className="relative">
                <IconShoppingCart className="h-5 w-5" />
                <span className="absolute -right-2 -top-2 flex h-5 min-w-5 w-fit px-1 items-center justify-center rounded-full bg-primary text-xs text-white">
                  {itemCount}
                </span>
              </Button>
            </Link>
          )}
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
