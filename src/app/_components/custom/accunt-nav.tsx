"use client";

import { LogOutButton } from "@/app/_components/auth/logout-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { fallbackUsername } from "@/lib/fallback-username";
import { IconUser } from "@tabler/icons-react";
import type { User } from "next-auth";
import Link from "next/link";

export default function AccountNav({ user }: { user: User }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Account</Button>
      </SheetTrigger>
      <SheetContent side={"right"} className="flex flex-col">
        <SheetHeader className="flex-1 flex-col gap-2">
          <div className="flex items-center gap-x-2">
            <SheetTitle>
              <Avatar className="h-8 w-8 rounded-full shadow">
                <AvatarImage
                  src={user.image ?? "/logo.svg"}
                  alt={fallbackUsername(user.name) ?? "Restaurant App User"}
                />
                <AvatarFallback className="rounded-lg">
                  {fallbackUsername(user.name) ?? "User"}
                </AvatarFallback>
              </Avatar>
            </SheetTitle>
            <SheetDescription className="select-none truncate font-semibold">
              Welcome, {user.name ?? "User"}
            </SheetDescription>
          </div>

          <div className="flex flex-col">
            <NavLink href="/account">
              <IconUser size={20} className="mr-4" />
              Account
            </NavLink>
          </div>
        </SheetHeader>

        <SheetFooter className="self-start">
          <SheetClose asChild>
            <LogOutButton />
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <SheetClose asChild>
      <Link
        href={href}
        className="inline-flex w-full rounded-sm bg-gray-100 p-2 transition-colors hover:bg-gray-200"
      >
        {children}
      </Link>
    </SheetClose>
  );
}
