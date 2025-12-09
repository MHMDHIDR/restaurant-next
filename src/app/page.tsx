import { StoreIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { CategoriesGrid } from "@/components/custom/categories"
import { RestaurantCard } from "@/components/custom/restaurant-card"
import RestaurantMenuItem from "@/components/custom/restaurant-menu-item"
import { SearchBar } from "@/components/custom/search"
import { Badge } from "@/components/ui/badge"
import { getBlurPlaceholder } from "@/lib/optimize-image"
import { api } from "@/trpc/server"
import type { RouterOutputs } from "@/trpc/react"

type VendorWithMenuItems = RouterOutputs["vendor"]["getFeatured"]["items"][number] & {
  menuItems: RouterOutputs["menuItem"]["getMenuItemsByVendorId"]["items"]
  menuItemsCount: number
}

type MenuItem = RouterOutputs["menuItem"]["getMenuItemsByVendorId"]["items"][number]

export const dynamic = "force-dynamic"

export default async function Home() {
  const { items: vendors } = await api.vendor.getFeatured({
    status: "ACTIVE",
    limit: 3,
    cursor: 0,
  })
  const { menuCategories: activeCategories } = await api.menuCategory.getAllCategories({
    hasItems: true,
  })

  const vendorsWithMenus: VendorWithMenuItems[] = await Promise.all(
    vendors.map(async vendor => {
      const menuItems = await api.menuItem.getMenuItemsByVendorId({
        vendorId: vendor.id,
        addedById: vendor.addedById,
      })
      return { ...vendor, menuItems: menuItems.items, menuItemsCount: menuItems.count }
    }),
  )

  const heroImagePath = "/hero-bg.webp"
  const blurHeroImage = await getBlurPlaceholder(heroImagePath, 300, 90)

  return (
    <>
      <section className="relative w-full h-[480px] flex items-center justify-center">
        <Image
          src={heroImagePath}
          alt="Hero Background"
          width={1920}
          height={480}
          className="absolute inset-0 object-cover w-full h-full"
          blurDataURL={blurHeroImage ?? heroImagePath}
          placeholder="blur"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/70 to-transparent" />
        <div className="container relative z-10 px-4 mx-auto text-center">
          <h1 className="mt-14 mb-10 text-2xl md:text-3xl lg:text-5xl select-none max-md:text-balance text-pretty font-bold text-white leading-loose">
            Discover Delicious Restaurants, takeaways, Near You.
          </h1>
          <SearchBar />
        </div>
      </section>
      <div className="container px-2 py-12 mx-auto max-w-(--breakpoint-xl)">
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-semibold">Featured Restaurants</h2>
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {vendorsWithMenus.map(vendor => (
              <RestaurantCard key={vendor.id} vendor={vendor} />
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-semibold space-x-3">
            <span>Popular Categories</span>
            <Link href="/c">
              <Badge>view all</Badge>
            </Link>
          </h2>
          <CategoriesGrid categories={activeCategories} limit={6} />
        </section>

        {vendorsWithMenus.some(vendor => vendor.menuItemsCount > 0) && (
          <section className="mb-12">
            <h2 className="mb-6 text-2xl font-semibold">Popular Menu Items</h2>
            <div className="space-y-8">
              {vendorsWithMenus
                .filter(vendor => vendor.menuItemsCount > 0)
                .map(vendor => (
                  <div key={vendor.id}>
                    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
                      {vendor.menuItems.map((item: MenuItem) => (
                        <RestaurantMenuItem
                          key={item.id}
                          item={item}
                          vendor={{ id: vendor.id, name: vendor.name }}
                        />
                      ))}
                    </div>
                    <Link href={`/r/${vendor.slug}`}>
                      <h3 className="mt-2 font-semibold items-center flex gap-x-1.5 select-none rounded-sm bg-primary/50 p-1 w-fit shadow-sm hover:bg-primary/70">
                        <StoreIcon className="size-4" />
                        {vendor.name}
                      </h3>
                    </Link>
                  </div>
                ))}
            </div>
          </section>
        )}
      </div>
    </>
  )
}
