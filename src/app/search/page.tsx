import { CategoriesGrid } from "@/components/custom/categories"
import EmptyState from "@/components/custom/empty-state"
import { RestaurantCard } from "@/components/custom/restaurant-card"
import RestaurantMenuItem from "@/components/custom/restaurant-menu-item"
import { truncate } from "@/lib/truncate"
import { api } from "@/trpc/server"

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const query = (await searchParams).search ?? ""
  const { vendors, categories, menuItems } = await api.search.search({ query })

  return (
    <div className="container px-2 py-12 mx-auto max-w-screen-xl">
      <h1 className="mb-8 text-xl font-bold">
        Search Results for &quot;{truncate(query, 80)}&quot;
      </h1>

      {vendors.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-semibold">Restaurants</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {vendors.map(vendor => (
              <RestaurantCard key={vendor.id} vendor={vendor} />
            ))}
          </div>
        </section>
      )}

      {categories.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-semibold">Categories</h2>
          <CategoriesGrid categories={categories} />
        </section>
      )}

      {menuItems.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-semibold">Menu Items</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {menuItems.map(({ menuItem, vendor }) => (
              <RestaurantMenuItem key={menuItem.id} item={menuItem} vendor={vendor} />
            ))}
          </div>
        </section>
      )}

      {vendors.length === 0 && categories.length === 0 && menuItems.length === 0 && (
        <EmptyState className="text-center text-muted-foreground">
          <p className="mt-4 text-sm text-gray-500 select-none dark:text-gray-400">
            No results found for &quot;{query}&quot;
          </p>
        </EmptyState>
      )}
    </div>
  )
}
