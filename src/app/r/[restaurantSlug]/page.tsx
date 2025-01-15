import { TRPCError } from "@trpc/server"
import { Edit } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import EmptyState from "@/components/custom/empty-state"
import RestaurantMenuItem from "@/components/custom/restaurant-menu-item"
import { env } from "@/env"
import { checkRoleAccess } from "@/lib/check-role-access"
import { auth } from "@/server/auth"
import { UserRole } from "@/server/db/schema"
import { api } from "@/trpc/server"
import type { Vendors } from "@/server/db/schema"
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
  const session = await auth()
  const user = session?.user
  const ALLOWED_ROLES = [UserRole.SUPER_ADMIN] as const

  const vendor = await api.vendor
    .getBySlug({ slug: restaurantSlug, getItems: true })
    .catch((error: unknown) => {
      if (error instanceof TRPCError && error.code === "NOT_FOUND") {
        notFound()
      }
      throw error
    })

  return (
    <div>
      <section className="relative w-full h-72 mb-20">
        <Image
          src={vendor.coverImage}
          alt={`${vendor.name} cover`}
          className="object-cover"
          placeholder={vendor.blurCoverImage ? "blur" : "empty"}
          blurDataURL={vendor.blurCoverImage!}
          fill
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-black via-white/75 dark:via-black/75 to-transparent" />
        <div className="container relative h-full px-2 mx-auto max-w-screen-xl">
          <div className="absolute bottom-8">
            {user?.id === vendor.addedById &&
            checkRoleAccess(user?.role, [UserRole.VENDOR_ADMIN]) ? (
              <Link href="/vendor-manager/vendor-details" title={`Edit ${vendor.name} Details`}>
                <h1 className="mb-4 text-3xl font-bold leading-loose md:leading-10 select-none hover:text-gray-300">
                  {vendor.name}
                  <Edit className="inline-flex w-5 h-5 ml-2" />
                </h1>
              </Link>
            ) : checkRoleAccess(user?.role, ALLOWED_ROLES) ? (
              <Link href={`/dashboard/vendors/${vendor.id}`} title={`Edit ${vendor.name} Details`}>
                <h1 className="mb-4 text-3xl font-bold leading-loose md:leading-10 select-none hover:text-gray-300">
                  {vendor.name}
                  <Edit className="inline-flex w-5 h-5 ml-2" />
                </h1>
              </Link>
            ) : (
              <h1 className="mb-4 text-3xl font-bold leading-loose md:leading-10 select-none">
                {vendor.name}
              </h1>
            )}

            <div className="flex items-center gap-3">
              <div className="relative w-36">
                <Image
                  src={vendor.logo}
                  alt={`${vendor.name} logo`}
                  width={128}
                  height={128}
                  className="object-contain shadow-md rounded-md w-full"
                />
              </div>
              <div className="select-none">
                <p className="opacity-90">{vendor.cuisineTypes.join(", ")}</p>
                <p className="opacity-90">{vendor.description}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container px-2 py-12 mx-auto max-w-screen-xl">
        <div className="grid gap-6 md:grid-cols-3">
          {vendor.menuItemsCount === 0 ? (
            <EmptyState className="col-span-full">
              <p className="mt-4 text-lg text-gray-500 select-none dark:text-gray-400">
                This Restaurant has no menu items yet.
              </p>
            </EmptyState>
          ) : (
            vendor.menuItems.map(item => (
              <RestaurantMenuItem
                key={item.id}
                item={item}
                vendor={{ id: vendor.id, name: vendor.name }}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
