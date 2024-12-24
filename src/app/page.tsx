import { IconMapPin, IconSearch } from "@tabler/icons-react"
import { MenuSection } from "@/components/menu-section"
import { RestaurantCard } from "@/components/restaurant-card"
import { api } from "@/trpc/server"

export default async function Home() {
  // Fetch featured restaurants (active vendors)
  const { items: vendors } = await api.vendor.getAll({
    status: "ACTIVE",
    limit: 6, // Limit to 6 featured restaurants
  })

  // For each vendor, fetch their menu items
  const vendorsWithMenus = await Promise.all(
    vendors.map(async vendor => {
      const menuItems = await api.menuItem.getMenuItemsByVendorId({ vendorId: vendor.id })
      return { ...vendor, menuItems }
    }),
  )

  return (
    <div className="container px-2 py-12 mx-auto max-w-screen-xl">
      <section className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold leading-loose md:leading-10">
          Discover Delicious Restaurants Near You
        </h1>
        <div className="flex items-center max-w-xl p-1 pl-2 mx-auto bg-gray-100 rounded-full">
          <IconMapPin className="mr-2 text-gray-500" />
          <input
            type="text"
            placeholder="Enter your address"
            className="flex-grow text-lg text-black bg-transparent outline-none"
          />
          <button className="flex items-center px-4 py-2 text-white rounded-full bg-primary">
            <IconSearch className="mr-2" size={20} />
            Search
          </button>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="mb-6 text-2xl font-semibold">Featured Restaurants</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {vendorsWithMenus.map(vendor => (
            <RestaurantCard key={vendor.id} vendor={vendor} />
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="mb-6 text-2xl font-semibold">Popular Menu Items</h2>
        <div className="space-y-8">
          {vendorsWithMenus.map(vendor => (
            <MenuSection key={vendor.id} vendor={vendor} menuItems={vendor.menuItems} />
          ))}
        </div>
      </section>
    </div>
  )
}
