import { ChevronRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Card } from "@/components/ui/card"

interface Category {
  id: string
  name: string
  description: string | null
  image: string | null
  isActive: boolean
  slug: string
  sortOrder: number | null
  itemCount?: number
}

interface CategoriesGridProps {
  categories: Category[]
  columns?: 2 | 3 | 4
  limit?: number
}

export function CategoriesGrid({ categories, columns = 3, limit }: CategoriesGridProps) {
  const displayCategories = limit ? categories.slice(0, limit) : categories

  const gridCols = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
  }

  return (
    <div className={`grid gap-5 ${gridCols[columns]}`}>
      {displayCategories.map((category, index) => (
        <Link
          key={category.id}
          href={`/c/${category.slug}`}
          className={`group block animate-reveal-up stagger-${index + 1}`}
        >
          <Card className="relative overflow-hidden h-52 card-premium card-premium-hover">
            {/* Background Image */}
            <div className="absolute inset-0">
              <Image
                src={category.image ?? "/placeholder.jpg"}
                alt={category.name}
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                fill
                priority
              />
            </div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/50 to-black/20 group-hover:from-black/95 group-hover:via-black/60 transition-all duration-500" />

            {/* Warm Color Accent */}
            <div className="absolute inset-0 bg-linear-to-br from-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-end p-5">
              {/* Item Count Badge */}
              {category.itemCount !== undefined && category.itemCount > 0 && (
                <span className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold bg-primary/90 text-white shadow-lg">
                  {category.itemCount} items
                </span>
              )}

              {/* Category Name */}
              <h3 className="text-xl md:text-2xl font-bold text-white group-hover:text-primary-foreground transition-colors duration-300 mb-1">
                {category.name}
              </h3>

              {/* Description */}
              {category.description && (
                <p className="text-white/70 text-sm line-clamp-2 group-hover:text-white/90 transition-colors duration-300 mb-3">
                  {category.description}
                </p>
              )}

              {/* Explore Button */}
              <div className="flex items-center gap-1 text-primary font-medium text-sm opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                <span>Explore</span>
                <ChevronRight className="size-4 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </div>

            {/* Bottom Accent Line */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-primary via-orange-400 to-amber-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
          </Card>
        </Link>
      ))}
    </div>
  )
}
