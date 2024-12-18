export type VendorNavItem = {
  title: string
  url: string
  icon?: React.ReactNode
  isActive?: boolean
  items?: VendorNavItem[]
}

export type VendorNavItems = {
  navMain: VendorNavItem[]
}
