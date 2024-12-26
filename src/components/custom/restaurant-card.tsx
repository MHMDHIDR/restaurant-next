import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import type { Vendors } from "@/server/db/schema"

export function RestaurantCard({ vendor }: { vendor: Vendors }) {
  return (
    <Link href={`/restaurants/${vendor.id}`}>
      <Card className="overflow-hidden transition-shadow hover:shadow-lg">
        <div className="relative h-48 w-full">
          <Image src={vendor.coverImage} alt={vendor.name} fill className="object-cover" />
        </div>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12">
              <Image
                src={vendor.logo}
                alt={`${vendor.name} logo`}
                fill
                className="rounded-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-semibold">{vendor.name}</h3>
              <p className="text-sm text-muted-foreground">{vendor.cuisineTypes.join(", ")}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="line-clamp-2 text-sm text-muted-foreground">{vendor.description}</p>
        </CardContent>
      </Card>
    </Link>
  )
}
