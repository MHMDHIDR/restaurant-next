"use client"

import { LogOutButton } from "@/app/_components/auth/logout-button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { fallbackUsername } from "@/lib/fallback-username"
import type { User } from "next-auth"

export default function AccountNav({ user }: { user: User }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Account</Button>
      </SheetTrigger>
      <SheetContent side={"right"} className="flex flex-col">
        <SheetHeader className="flex-1 flex-row gap-2">
          <SheetTitle>
            <Avatar className="h-8 w-8 rounded-full">
              <AvatarImage
                src={user.image ?? "/logo.svg"}
                alt={fallbackUsername(user.name) ?? "Restaurant App User"}
              />
              <AvatarFallback className="rounded-lg">
                {fallbackUsername(user.name) ?? "User"}
              </AvatarFallback>
            </Avatar>
          </SheetTitle>
          <SheetDescription>
            <span className="truncate font-semibold">Welcome, {user.name ?? "User"}</span>
          </SheetDescription>
        </SheetHeader>
        <SheetFooter className="self-start">
          <SheetClose asChild>
            <LogOutButton />
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
