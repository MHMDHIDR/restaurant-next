"use client"

import { IconHome, IconSettings, IconUser } from "@tabler/icons-react"
import clsx from "clsx"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogOutButton } from "@/app/_components/auth/logout-button"
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
import { fallbackUsername, truncateUsername } from "@/lib/fallback-username"
import { cn } from "@/lib/utils"
import { UserRole } from "@/server/db/schema"
import type { User } from "next-auth"

export default function AccountNav({ user }: { user: User }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="inline-flex justify-between px-0">
          <Avatar user={user} className="h-9 w-9 rounded-sm rounded-r-none" />
          <span className="pr-2">{truncateUsername(user.name)}</span>
        </Button>
      </SheetTrigger>
      <SheetContent side={"right"} className="flex flex-col">
        <SheetHeader className="flex-1 flex-col gap-2">
          <div className="flex items-center gap-x-2">
            <SheetTitle>
              <Avatar user={user} />
            </SheetTitle>
            <SheetDescription className="select-none truncate font-semibold">
              Welcome, {truncateUsername(user.name)}
            </SheetDescription>
          </div>

          <div className="flex flex-col space-y-1.5">
            <NavLink href="/">
              <IconHome size={20} className="mr-4" />
              Home
            </NavLink>
            <NavLink href="/account">
              <IconUser size={20} className="mr-4" />
              Account
            </NavLink>
            {user.role === "SUPER_ADMIN" && (
              <NavLink href="/dashboard">
                <IconSettings size={20} className="mr-4" />
                Dashboard
              </NavLink>
            )}
          </div>
        </SheetHeader>

        <SheetFooter className="md:self-start self-stretch">
          <SheetClose asChild>
            <LogOutButton />
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

function Avatar({ user, className }: { user: User; className?: string }) {
  return (
    <AvatarWrapper className={cn("h-8 w-8 select-none rounded-full shadow", className)}>
      {user.image ? (
        <AvatarImage
          src={user.image}
          alt={fallbackUsername(user.name) ?? "Restaurant App User"}
          blurDataURL={user.blurImageDataURL ?? "/logo.svg"}
        />
      ) : (
        <AvatarFallback className="rounded-lg text-orange-600">
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
          "inline-flex items-center w-full select-none rounded-sm border bg-gray-100 p-2 transition-colors hover:bg-gray-200",
          {
            "bg-gray-300": pathname === href,
          },
        )}
      >
        {children}
      </Link>
    </SheetClose>
  )
}
