import { notFound } from "next/navigation"
import RestaurantMenuItem from "@/components/custom/restaurant-menu-item"
import { api } from "@/trpc/server"
import type { MenuCategories } from "@/server/db/schema"

type CategoryPageProps = {
  params: Promise<{ categorySlug: MenuCategories["slug"] }>
}

export async function generateStaticParams() {
  try {
    const { menuCategories: activeCategories } = await api.menuCategory.getAllCategories({
      hasItems: true,
    })
    return activeCategories.map(category => ({ categorySlug: category.slug }))
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
    }
    return []
  }
}

export const dynamic = "force-static"
export const revalidate = 60

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { categorySlug } = await params

  try {
    const { category, items } = await api.menuCategory.getMenuItemsByCategorySlug({ categorySlug })
    if (!category) notFound()

    return (
      <div className="container px-2 py-12 mx-auto max-w-(--breakpoint-xl)">
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
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
    }
    return notFound()
  }
}
