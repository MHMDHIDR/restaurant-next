import { TRPCError } from "@trpc/server"
import { Edit } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import EmptyState from "@/components/custom/empty-state"
import RestaurantMenuItem from "@/components/custom/restaurant-menu-item"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { env } from "@/env"
import { checkRoleAccess } from "@/lib/check-role-access"
import { ITEMS_PER_PAGE } from "@/lib/constants"
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

// Helper function to generate pagination items
function generatePaginationItems(currentPage: number, totalPages: number) {
  const items: Array<number | "ellipsis-start" | "ellipsis-end"> = []
  const maxVisiblePages = 5

  if (totalPages <= maxVisiblePages) {
    // Show all pages if total pages is less than or equal to maxVisiblePages
    for (let i = 1; i <= totalPages; i++) {
      items.push(i)
    }
  } else {
    // Always show first page
    items.push(1)

    if (currentPage > 3) {
      items.push("ellipsis-start")
    }

    // Show pages around current page
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      items.push(i)
    }

    if (currentPage < totalPages - 2) {
      items.push("ellipsis-end")
    }

    // Always show last page
    items.push(totalPages)
  }

  return items
}

type RestaurantPageProps = {
  params: Promise<{ restaurantSlug: Vendors["slug"] }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateStaticParams() {
  try {
    const { items: vendors } = await api.vendor.getAll({
      status: "ACTIVE",
      limit: 100,
    })

    return vendors.map(vendor => ({
      restaurantSlug: vendor.slug,
    }))
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
    }
    return []
  }
}

export const dynamic = "force-static"
export const revalidate = 60

export default async function RestaurantPage({ params, searchParams }: RestaurantPageProps) {
  const { restaurantSlug } = await params
  const searchParamsProp = await searchParams
  const page = searchParamsProp?.page ? Number(searchParamsProp.page) : 1
  const limit = searchParamsProp?.limit ? Number(searchParamsProp.limit) : ITEMS_PER_PAGE

  const session = await auth()
  const user = session?.user
  const ALLOWED_ROLES = [UserRole.SUPER_ADMIN] as const

  const vendor = await api.vendor
    .getBySlug({ slug: restaurantSlug, getItems: true, searchParams: { page, limit } })
    .catch((error: unknown) => {
      if (error instanceof TRPCError && error.code === "NOT_FOUND") {
        notFound()
      }
      throw error
    })
  const { pagination: paginationInfo } = vendor

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
        <div className="absolute inset-0 bg-linear-to-t from-white dark:from-black via-white/75 dark:via-black/75 to-transparent" />
        <div className="container relative h-full px-2 mx-auto max-w-(--breakpoint-xl)">
          <div className="absolute bottom-8">
            {user?.id === vendor.addedById &&
            checkRoleAccess(user?.role, [UserRole.VENDOR_ADMIN]) ? (
              <Link href="/vendor-manager/vendor-details" title={`Edit ${vendor.name} Details`}>
                <h1 className="mb-4 text-3xl font-bold leading-loose md:leading-10 select-none hover:text-gray-300">
                  {vendor.name}
                  <Edit className="inline-flex size-5 ml-2" />
                </h1>
              </Link>
            ) : checkRoleAccess(user?.role, ALLOWED_ROLES) ? (
              <Link href={`/dashboard/vendors/${vendor.id}`} title={`Edit ${vendor.name} Details`}>
                <h1 className="mb-4 text-3xl font-bold leading-loose md:leading-10 select-none hover:text-gray-300">
                  {vendor.name}
                  <Edit className="inline-flex size-5 ml-2" />
                </h1>
              </Link>
            ) : (
              <h1 className="mb-4 text-3xl font-bold leading-loose md:leading-10 select-none">
                {vendor.name}
              </h1>
            )}

            <div className="flex items-center gap-3">
              <div className="relative max-w-32 max-h-32 size-32">
                <Image
                  src={vendor.logo}
                  alt={`${vendor.name} logo`}
                  width={128}
                  height={128}
                  placeholder={vendor.blurLogoImage ? "blur" : "empty"}
                  blurDataURL={vendor.blurLogoImage!}
                  className="object-cover shadow-md rounded-md min-w-full min-h-full"
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

      <div className="container px-2 py-12 mx-auto max-w-(--breakpoint-xl)">
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

      {paginationInfo && paginationInfo.totalPages > 1 && (
        <div className="my-10">
          <Pagination>
            <PaginationContent>
              {/* Previous button */}
              <PaginationItem>
                <PaginationPrevious
                  href={
                    paginationInfo.hasPreviousPage
                      ? `/r/${restaurantSlug}?page=${paginationInfo.previousPage}&limit=${paginationInfo.pageSize}`
                      : undefined
                  }
                  aria-disabled={!paginationInfo.hasPreviousPage}
                  disabled={!paginationInfo.hasPreviousPage}
                />
              </PaginationItem>

              {/* Page numbers */}
              {generatePaginationItems(paginationInfo.currentPage, paginationInfo.totalPages).map(
                (item, index) => (
                  <PaginationItem key={`${item}-${index}`}>
                    {item === "ellipsis-start" || item === "ellipsis-end" ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        href={`/r/${restaurantSlug}?page=${item}&limit=${paginationInfo.pageSize}`}
                        isActive={item === paginationInfo.currentPage}
                        aria-disabled={item === paginationInfo.currentPage}
                        disabled={item === paginationInfo.currentPage}
                      >
                        {item}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ),
              )}

              {/* Next button */}
              <PaginationItem>
                <PaginationNext
                  href={
                    paginationInfo.hasNextPage
                      ? `/r/${restaurantSlug}?page=${paginationInfo.nextPage}&limit=${paginationInfo.pageSize}`
                      : undefined
                  }
                  aria-disabled={!paginationInfo.hasNextPage}
                  disabled={!paginationInfo.hasNextPage}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}
