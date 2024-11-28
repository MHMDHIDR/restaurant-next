import { IconMapPin, IconSearch, IconStar } from "@tabler/icons-react"
import { auth } from "@/server/auth"
import { api } from "@/trpc/server"

export default async function Home() {
  const session = await auth()
  const featuredVendors = await api.vendor.getFeatured()
  const nearbyVendors = await api.vendor.getNearby({
    latitude: 37.7749,
    longitude: -122.4194,
  })

  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <section className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">
            Discover Delicious Restaurants Near You
          </h1>
          <div className="mx-auto flex max-w-xl items-center rounded-full bg-gray-100 p-2">
            <IconMapPin className="mr-2 text-gray-500" />
            <input
              type="text"
              placeholder="Enter your address"
              className="flex-grow bg-transparent outline-none"
            />
            <button className="flex items-center rounded-full bg-primary px-4 py-2 text-white">
              <IconSearch className="mr-2" size={20} />
              Search
            </button>
          </div>
        </section>

        {/* Featured Restaurants */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-semibold">Featured Restaurants</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {featuredVendors.map(vendor => (
              <div key={vendor.id} className="overflow-hidden rounded-lg bg-white shadow-md">
                <img
                  src={vendor.coverImage}
                  alt={vendor.name}
                  className="h-48 w-full object-cover"
                />
                <div className="p-4">
                  <h3 className="text-xl font-bold">{vendor.name}</h3>
                  <div className="flex items-center text-yellow-500">
                    <IconStar size={16} fill="currentColor" />
                    <span className="ml-2">{vendor.averageRating}</span>
                  </div>
                  <p className="text-gray-600">{vendor.cuisineTypes.join(", ")}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
