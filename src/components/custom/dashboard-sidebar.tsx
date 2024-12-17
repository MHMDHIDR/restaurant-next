"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { JSX } from "react"

export type NavItemsProps = {
  navItems: { label: string; href: string; icon: JSX.Element }[]
}

export default function DashboardSidebar({ navItems }: NavItemsProps) {
  const pathname = usePathname()

  return (
    <aside className="hidden border-r bg-muted/40 md:block min-h-screen">
      <div className="flex flex-col h-full max-h-screen gap-2">
        <div className="flex-1 py-14">
          <nav className="items-start px-2 text-sm font-medium grid">
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
        </div>
      </div>
    </aside>
  )
}
