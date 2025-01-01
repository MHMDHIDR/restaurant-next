import type { MenuItems, Orders } from "@/server/db/schema"

export type VendorNavItem = {
  title: string
  url: string
  icon?: React.ReactNode
  items?: VendorNavItem[]
}

export type VendorNavItems = {
  navMain: VendorNavItem[]
}

export type orderWithOrderItems = Orders & {
  orderItems: {
    id: string
    quantity: number
    totalPrice: number
    unitPrice: number
    menuItem: MenuItems
    specialInstructions: string
  }[]
}
