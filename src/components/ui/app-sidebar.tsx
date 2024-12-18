"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import * as React from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { VendorNavItems } from "@/types/vendorNavItems"

export function AppSidebar({ items }: { items: VendorNavItems }) {
  const pathname = usePathname()
  const isActive = (url: string) => pathname === url

  return (
    <Sidebar>
      <SidebarContent className="select-none">
        {items.navMain.map(item => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items?.map(subItem => (
                  <SidebarMenuItem key={subItem.title}>
                    <SidebarMenuButton asChild isActive={isActive(subItem.url)}>
                      <Link href={subItem.url}>{subItem.title}</Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
