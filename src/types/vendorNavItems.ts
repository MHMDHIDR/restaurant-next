export type VendorNavItem = {
  title: string
  url: string
  icon?: React.ReactNode
  items?: VendorNavItem[]
}

export type VendorNavItems = {
  navMain: VendorNavItem[]
}
