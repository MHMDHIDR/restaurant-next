"use client"

import { IconHome, IconPackage, IconSettings, IconUser } from "@tabler/icons-react"
import clsx from "clsx"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { SignoutButton } from "@/components/custom/signout-button"
import { AvatarFallback, AvatarImage, Avatar as AvatarWrapper } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { checkRoleAccess } from "@/lib/check-role-access"
import { fallbackUsername, truncateUsername } from "@/lib/fallback-username"
import { cn } from "@/lib/utils"
import { UserRole } from "@/server/db/schema"
import { api } from "@/trpc/react"
import type { Session } from "next-auth"

export default function AccountNav({ user }: { user: Session["user"] }) {
  const { data: vendor, isLoading } = api.vendor.getBySessionUser.useQuery()

  const NAV_ITEMS = [
    { href: "/", icon: IconHome, label: "Home" },
    { href: "/account", icon: IconUser, label: "Account" },
    user.role === "SUPER_ADMIN" && { href: "/dashboard", icon: IconSettings, label: "Dashboard" },
    isLoading
      ? { href: "#", icon: Loader2, label: "" }
      : vendor && checkRoleAccess(user?.role, [UserRole.VENDOR_ADMIN])
        ? {
            href: `/vendor-manager`,
            icon: IconPackage,
            label: "Manage Your Restaurant",
          }
        : { href: "/become-a-vendor", icon: IconPackage, label: "Become a Vendor" },
  ]

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="inline-flex justify-between px-0">
          <Avatar user={user} className="rounded-sm rounded-r-none h-9 w-9" />
          <span className="pr-2">{truncateUsername(user.name)}</span>
        </Button>
      </SheetTrigger>
      <SheetContent side={"right"} className="flex flex-col">
        <SheetHeader className="flex-col flex-1 gap-2">
          <div className="flex items-center gap-x-2">
            <SheetTitle>
              <Avatar user={user} />
            </SheetTitle>
            <SheetDescription className="font-semibold truncate select-none">
              Welcome, {truncateUsername(user.name)}
            </SheetDescription>
          </div>

          <div className="flex flex-col gap-y-1.5">
            {NAV_ITEMS.map(item => {
              if (!item) return null
              const Icon = item.icon
              return (
                <NavLink key={item.href} href={item.href}>
                  <Icon size={20} />
                  <span>{item.label}</span>
                </NavLink>
              )
            })}
          </div>
        </SheetHeader>

        <SheetFooter className="self-stretch md:self-start">
          <SheetClose asChild>
            <SignoutButton />
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

function Avatar({ user, className }: { user: Session["user"]; className?: string }) {
  return (
    <AvatarWrapper className={cn("h-8 w-8 select-none rounded-full shadow", className)}>
      {user.image ? (
        <AvatarImage
          src={user.image}
          alt={fallbackUsername(user.name) ?? "Restaurant App User"}
          blurDataURL={user.blurImageDataURL ?? "/logo.svg"}
          className="object-contain"
        />
      ) : (
        <AvatarFallback className="text-orange-600 rounded-lg">
          {fallbackUsername(user.name) ?? "User"}
        </AvatarFallback>
      )}
    </AvatarWrapper>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <SheetClose asChild>
      <Link
        href={href}
        className={clsx(
          "inline-flex items-center gap-x-2 w-full select-none rounded-sm border text-orange-400 p-2 transition-colors hover:bg-orange-200/50 dark:hover:bg-orange-900/50 outline-orange-300",
          {
            "text-orange-500 border-orange-500": pathname === href,
          },
        )}
      >
        {children}
      </Link>
    </SheetClose>
  )
}
