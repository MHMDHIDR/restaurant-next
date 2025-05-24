"use client"

import { IconHome, IconPackage, IconSettings, IconUser } from "@tabler/icons-react"
import clsx from "clsx"
import { Package2 } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
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
import type { Session } from "next-auth"

export default function AccountNav({ user }: { user: Session["user"] }) {
  const [isAccountNavOpen, setIsAccountNavOpen] = useState(false)
  const NAV_ITEMS = [
    { href: "/", icon: IconHome, label: "Home" },
    { href: "/account", icon: IconUser, label: "Account" },
    { href: "/orders", icon: Package2, label: "Orders" },
    user.role === UserRole.SUPER_ADMIN && {
      href: "/dashboard",
      icon: IconSettings,
      label: "Dashboard",
    },
    // Show vendor management link if user is VENDOR_ADMIN or VENDOR_STAFF and has a vendor
    checkRoleAccess(user.role, [UserRole.VENDOR_ADMIN, UserRole.VENDOR_STAFF]) && user.hasVendor
      ? {
          href: "/vendor-manager",
          icon: IconPackage,
          label: "Manage Your Restaurant",
        }
      : // Show become a vendor link only for customers
        checkRoleAccess(user.role, [UserRole.CUSTOMER])
        ? {
            href: "/become-a-vendor",
            icon: IconPackage,
            label: "Become a Vendor",
          }
        : null,
  ].filter(Boolean)

  return (
    <Sheet open={isAccountNavOpen} onOpenChange={setIsAccountNavOpen}>
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
              <span className="hidden md:inline-flex mr-1">Welcome, </span>
              {truncateUsername(user.name, 2, 20)}
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
            <SignoutButton setIsAccountNavOpen={setIsAccountNavOpen} />
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

function Avatar({ user, className }: { user: Session["user"]; className?: string }) {
  return (
    <AvatarWrapper className={cn("h-8 w-8 select-none rounded-full shadow-sm", className)}>
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
