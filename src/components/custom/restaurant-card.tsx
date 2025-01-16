import Image from "next/image"
import Link from "next/link"
import { Card, CardHeader } from "@/components/ui/card"
import type { Vendors } from "@/server/db/schema"

export function RestaurantCard({ vendor }: { vendor: Vendors }) {
  return (
    <Link href={`/r/${vendor.slug}`}>
      <Card className="overflow-hidden transition-shadow hover:shadow-lg">
        <div className="relative h-48 max-h-48 w-full overflow-y-clip">
          <Image
            src={vendor.logo}
            alt={vendor.name}
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
            fill
            priority
          />
        </div>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12">
              <Image
                src={vendor.logo}
                alt={`${vendor.name} logo`}
                width={48}
                height={48}
                className="w-full rounded-full object-cover aspect-square"
              />
            </div>
            <div>
              <h3 className="font-semibold">{vendor.name}</h3>
              <p className="text-sm text-muted-foreground">
                {vendor.cuisineTypes.slice(0, 2).join(", ") +
                  (vendor.cuisineTypes.length > 2 ? ", ...Other" : "")}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>
    </Link>
  )
}
