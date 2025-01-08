import { notFound } from "next/navigation"
import RestaurantMenuItem from "@/components/custom/restaurant-menu-item"
import { api } from "@/trpc/server"
import type { MenuCategories } from "@/server/db/schema"

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ categorySlug: MenuCategories["slug"] }>
}) {
  const { categorySlug } = await params
  const { category, items } = await api.menuCategory.getMenuItemsByCategorySlug({ categorySlug })

  return !category ? (
    notFound()
  ) : (
    <div className="container px-2 py-12 mx-auto max-w-screen-xl">
      <h1 className="mb-8 text-3xl font-bold text-center">{category.name}</h1>
      {category.description && (
        <p className="mb-8 text-center text-muted-foreground">{category.description}</p>
      )}
      <div className="grid gap-6 md:grid-cols-3">
        {items.map(({ menuItem, vendor }) => (
          <RestaurantMenuItem key={menuItem.id} item={menuItem} vendor={vendor} />
        ))}
      </div>
    </div>
  )
}
