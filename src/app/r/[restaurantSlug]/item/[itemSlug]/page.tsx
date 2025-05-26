import { notFound } from "next/navigation"
import RestaurantMenuItem from "@/components/custom/restaurant-menu-item"
import { api } from "@/trpc/server"
import type { MenuItems, Vendors } from "@/server/db/schema"

type ItemPageProps = {
  params: Promise<{ restaurantSlug: Vendors["slug"]; itemSlug: MenuItems["slug"] }>
}

export async function generateStaticParams() {
  try {
    // Fetch all menu items to generate static paths
    const { items } = await api.menuItem.getMenuItemsByVendorSlug({ vendorSlug: "all" })
    return items.map(item => ({ slug: item.slug }))
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
    }
    return []
  }
}

export const dynamic = "force-static"
export const revalidate = 60

export default async function ItemPage({ params }: ItemPageProps) {
  const { restaurantSlug: vendorSlug, itemSlug } = await params

  try {
    const { item, vendor } = await api.menuItem.getMenuItemByVendorSlugAndItemSlug({
      vendorSlug,
      itemSlug,
    })
    if (!item) notFound()

    return (
      <div className="container px-2 py-12 mx-auto max-w-(--breakpoint-xl)">
        <h1 className="mb-8 text-3xl font-bold text-center">{item.name}</h1>
        {item.description && (
          <p className="mb-8 text-center text-muted-foreground">{item.description}</p>
        )}
        <div className="grid gap-6 md:grid-cols-3">
          <RestaurantMenuItem item={item} vendor={vendor} />
        </div>
      </div>
    )
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
    }
    return notFound()
  }
}
