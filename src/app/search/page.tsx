import { Suspense } from "react"
import { CategoriesGrid } from "@/components/custom/categories"
import { LoadingCard } from "@/components/custom/data-table/loading"
import EmptyState from "@/components/custom/empty-state"
import { RestaurantCard } from "@/components/custom/restaurant-card"
import RestaurantMenuItem from "@/components/custom/restaurant-menu-item"
import { SearchBar } from "@/components/custom/search"
import { truncate } from "@/lib/truncate"
import { api } from "@/trpc/server"

async function VendorsSection({ query }: { query: string }) {
  const { vendors } = await api.search.search({ query })

  if (vendors.length === 0) return null

  return (
    <section className="mb-12">
      <h2 className="mb-6 text-2xl font-semibold">Restaurants</h2>
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
        {vendors.map(vendor => (
          <RestaurantCard key={vendor.id} vendor={vendor} />
        ))}
      </div>
    </section>
  )
}

async function CategoriesSection({ query }: { query: string }) {
  const { categories } = await api.search.search({ query })

  if (categories.length === 0) return null

  return (
    <section className="mb-12">
      <h2 className="mb-6 text-2xl font-semibold">Categories</h2>
      <CategoriesGrid categories={categories} />
    </section>
  )
}

async function MenuItemsSection({ query }: { query: string }) {
  const { menuItems } = await api.search.search({ query })

  if (menuItems.length === 0) return null

  return (
    <section className="mb-12">
      <h2 className="mb-6 text-2xl font-semibold">Menu Items</h2>
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
        {menuItems.map(({ menuItem, vendor }) => (
          <RestaurantMenuItem key={menuItem.id} item={menuItem} vendor={vendor} />
        ))}
      </div>
    </section>
  )
}

async function EmptyStateWrapper({ query }: { query: string }) {
  const { vendors, categories, menuItems } = await api.search.search({ query })

  if (vendors.length === 0 && categories.length === 0 && menuItems.length === 0) {
    return (
      <EmptyState className="text-center text-muted-foreground">
        <p className="mt-4 text-sm text-gray-500 select-none dark:text-gray-400">
          No results found for &quot;{query}&quot;
        </p>
      </EmptyState>
    )
  }

  return null
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const query = (await searchParams).search ?? ""

  return !query ? (
    <section className="container mx-auto mt-24 text-center">
      <h1 className="mb-4 text-4xl font-bold leading-loose md:leading-10">
        Discover Delicious Restaurants Near You
      </h1>
      <SearchBar />
    </section>
  ) : (
    <div className="container px-2 py-12 mx-auto max-w-(--breakpoint-xl)">
      <h1 className="mb-8 text-xl font-bold">
        Search Results for &quot;{truncate(query, 80)}&quot;
      </h1>

      <Suspense fallback={<LoadingCard renderedSkeletons={3} className="h-48" />}>
        <VendorsSection query={query} />
      </Suspense>

      <Suspense fallback={<LoadingCard renderedSkeletons={2} className="h-32" />}>
        <CategoriesSection query={query} />
      </Suspense>

      <Suspense fallback={<LoadingCard renderedSkeletons={3} className="h-48" />}>
        <MenuItemsSection query={query} />
      </Suspense>

      <Suspense>
        <EmptyStateWrapper query={query} />
      </Suspense>
    </div>
  )
}
