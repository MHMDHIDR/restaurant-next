import { IconMapPin, IconSearch } from "@tabler/icons-react"
import { RestaurantCard } from "@/components/custom/restaurant-card"
import RestaurantMenuItem from "@/components/custom/restaurant-menu-item"
import { api } from "@/trpc/server"

export default async function Home() {
  const { items: vendors } = await api.vendor.getFeatured({ status: "ACTIVE", limit: 3 })

  const vendorsWithMenus = await Promise.all(
    vendors.map(async vendor => {
      const menuItems = await api.menuItem.getMenuItemsByVendorId({
        vendorId: vendor.id,
        addedById: vendor.addedById,
      })
      return { ...vendor, menuItems: menuItems.items, menuItemsCount: menuItems.menuItemsCount }
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

      {vendorsWithMenus.some(vendor => vendor.menuItemsCount > 0) && (
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-semibold">Popular Menu Items</h2>
          <div className="space-y-8">
            {vendorsWithMenus
              .filter(vendor => vendor.menuItemsCount > 0)
              .map(vendor => (
                <div key={vendor.id}>
                  <h3 className="mb-4 text-xl font-semibold">{vendor.name}</h3>
                  <div className="grid gap-6 md:grid-cols-3">
                    {vendor.menuItems.map(item => (
                      <RestaurantMenuItem
                        key={item.id}
                        item={item}
                        vendor={{ id: vendor.id, name: vendor.name }}
                      />
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </section>
      )}
    </div>
  )
}
