import { MapPin, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardHeader } from "@/components/ui/card"
import type { Vendors } from "@/server/db/schema"

export function RestaurantCard({ vendor }: { vendor: Vendors }) {
  return (
    <Link href={`/r/${vendor.slug}`} className="group block">
      <Card className="overflow-hidden h-full card-premium card-premium-hover image-zoom-hover">
        {/* Image Container */}
        <div className="relative h-40 w-full overflow-hidden">
          <Image
            src={vendor.logo}
            alt={vendor.name}
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
            fill
            priority
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

          {/* Rating Badge */}
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-white/90 dark:bg-black/70 backdrop-blur-sm shadow-lg">
            <Star className="size-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-bold">4.8</span>
          </div>

          {/* Shimmer Effect on Hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute inset-0 animate-shimmer" />
          </div>
        </div>

        <CardHeader className="relative p-4">
          {/* Restaurant Logo */}
          <div className="absolute -top-8 left-4">
            <div className="relative size-16 rounded-xl overflow-hidden border-4 border-card shadow-lg group-hover:shadow-xl transition-shadow duration-300">
              <Image
                src={vendor.logo}
                alt={`${vendor.name} logo`}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Content */}
          <div className="pt-8">
            <h3 className="font-bold text-lg group-hover:text-primary transition-colors duration-300 line-clamp-1">
              {vendor.name}
            </h3>

            {/* Cuisine Types */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {vendor.cuisineTypes.slice(0, 3).map((cuisine, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary/80"
                >
                  {cuisine}
                </span>
              ))}
              {vendor.cuisineTypes.length > 3 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                  +{vendor.cuisineTypes.length - 3} more
                </span>
              )}
            </div>

            {/* Delivery Info */}
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/50">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="size-3.5" />
                <span>0.5 mi</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                <span className="size-1.5 rounded-full bg-green-500 animate-pulse" />
                Open Now
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>
    </Link>
  )
}
