import { TRPCError } from "@trpc/server"
import Image from "next/image"
import { notFound } from "next/navigation"
import { env } from "@/env"
import { Vendors } from "@/server/db/schema"
import { api } from "@/trpc/server"
import RestaurantMenuItem from "./restaurant-menu-item"
import type { Metadata } from "next"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ restaurantSlug: Vendors["slug"] }>
}): Promise<Metadata> {
  const { restaurantSlug } = await params

  try {
    const vendor = await api.vendor.getBySlug({ slug: restaurantSlug, getItems: true })

    return {
      title: vendor.name,
      description: vendor.description,
      openGraph: {
        title: vendor.name,
        description: vendor.description,
        url: `${env.NEXT_PUBLIC_APP_URL}/r/${vendor.slug}`,
        images: [{ url: vendor.logo, width: 1200, height: 630, alt: vendor.name }],
        type: "website",
      },
    }
  } catch (error) {
    if (error instanceof TRPCError && error.code === "NOT_FOUND") {
      return {
        title: "Vendor Not Found",
        description: "The requested restaurant could not be found.",
      }
    }
    throw error
  }
}

export default async function RestaurantPage({
  params,
}: {
  params: Promise<{ restaurantSlug: Vendors["slug"] }>
}) {
  const { restaurantSlug } = await params

  const vendor = await api.vendor
    .getBySlug({ slug: restaurantSlug, getItems: true })
    .catch(error => {
      if (error.code === "NOT_FOUND") notFound()
      throw error
    })

  return (
    <div className="container px-2 py-12 mx-auto max-w-screen-xl">
      <section className="mb-12">
        <h1 className="mb-4 text-4xl font-bold leading-loose md:leading-10">{vendor.name}</h1>
        <div className="flex items-center gap-3">
          <div className="relative w-36">
            <Image
              src={vendor.logo}
              alt={`${vendor.name} logo`}
              width={128}
              height={128}
              className="object-contain shadow-md rounded-md"
            />
          </div>
          <div>
            <p className="text-muted-foreground">{vendor.cuisineTypes.join(", ")}</p>
            <p className="text-muted-foreground">{vendor.description}</p>
          </div>
        </div>
      </section>

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
  )
}
