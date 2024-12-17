"use client"

import { Menu } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Logo } from "./icons"
import type { NavItemsProps } from "./dashboard-sidebar"

export default function MobileNav({ navItems }: NavItemsProps) {
  const pathname = usePathname()

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="shrink-0 m-1.5 size-9 rounded-sm md:hidden"
        >
          <Menu className="w-5 h-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <div className="border border-b w-full md:hidden" />
      <SheetContent side="left" className="flex flex-col">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <nav className="text-lg font-medium grid gap-2">
          <Link
            href="/"
            className="flex items-center text-base font-semibold select-none gap-2 text-primary"
          >
            <Logo className="w-8 h-8 p-1 rounded-sm stroke-primary shadow-sm shadow-primary" />
            Restaurant
            <span className="text-black">App</span>
          </Link>
          {navItems.map(navItem => (
            <Link
              key={navItem.label}
              href={navItem.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${
                pathname === navItem.href ? "bg-muted text-primary" : ""
              }`}
            >
              {navItem.icon}
              {navItem.label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
