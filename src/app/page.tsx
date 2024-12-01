import { IconMapPin, IconSearch, IconStar } from "@tabler/icons-react"
import Image from "next/image"
import { api } from "@/trpc/server"

export default async function Home() {
  const featuredVendors = await api.vendor.getFeatured()

  return (
    <div className="container px-2 py-12 mx-auto">
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
          {featuredVendors.map(vendor => (
            <div key={vendor.id} className="overflow-hidden bg-white rounded-lg shadow-md">
              <Image
                src={vendor.coverImage}
                alt={vendor.name}
                height={192}
                width={320}
                className="object-cover w-full h-48"
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
  )
}
