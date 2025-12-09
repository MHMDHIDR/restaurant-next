"use client"

import { Flame, Heart, Plus } from "lucide-react"
import dynamic from "next/dynamic"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { formatPrice } from "@/lib/format-price"
import { truncate } from "@/lib/truncate"
import type { MenuItems } from "@/server/db/schema"

type RestaurantMenuItemProps = {
  item: MenuItems & {
    blurImage?: string | null
  }
  vendor: {
    id: string
    name: string
    slug?: string
  }
}

// Create a client-only component for cart functionality
const AddToCartButton = dynamic(() => import("./add-to-cart-button"), {
  ssr: false,
  loading: () => (
    <Button className="w-full mt-3" disabled>
      <Plus className="size-4 mr-2" />
      Add to Cart
    </Button>
  ),
})

export default function RestaurantMenuItem({ item, vendor }: RestaurantMenuItemProps) {
  const [selectedAddons, setSelectedAddons] = useState<string[]>([])
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div
          className="group relative h-56 w-full cursor-pointer rounded-2xl select-none overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 card-premium"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Background Image */}
          <Image
            src={item.image}
            alt={item.name}
            placeholder={item.blurImage ? "blur" : "empty"}
            blurDataURL={item.blurImage!}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            priority
            loading="eager"
            sizes="(max-width: 768px) 100vw, 300px"
            fill
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/40 to-transparent group-hover:from-black/98 transition-all duration-500" />

          {/* Warm Color Accent */}
          <div className="absolute inset-0 bg-linear-to-br from-primary/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Favorite Button */}
          <button
            className="absolute top-3 right-3 p-2 rounded-full bg-white/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/40 hover:scale-110"
            onClick={e => e.stopPropagation()}
          >
            <Heart className="size-4 text-white" />
          </button>

          {/* Popular Badge */}
          <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full bg-linear-to-r from-orange-500 to-red-500 text-white text-xs font-bold shadow-lg">
            <Flame className="size-3" />
            Popular
          </div>

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            {/* Item Name */}
            <h3 className="text-white text-lg font-bold drop-shadow-lg mb-1 line-clamp-1 group-hover:text-primary-foreground transition-colors duration-300">
              {truncate(item.name)}
            </h3>

            {/* Price */}
            <div className="flex items-center justify-between">
              <span className="price-tag-premium">{formatPrice(Number(item.price))}</span>

              {/* Quick Add Button */}
              <button
                className="p-2 rounded-full bg-primary text-white shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 hover:bg-primary-dark"
                onClick={e => e.stopPropagation()}
              >
                <Plus className="size-5" />
              </button>
            </div>

            {/* Vendor Link */}
            {vendor.slug && (
              <Link
                className="inline-flex items-center mt-3 text-white/70 text-xs hover:text-white transition-colors duration-300"
                href={`/r/${vendor.slug}`}
                onClick={e => e.stopPropagation()}
              >
                <span className="mr-1">From</span>
                <span className="font-semibold text-primary border-b border-primary/50 hover:border-primary pb-0.5">
                  {vendor.name}
                </span>
              </Link>
            )}
          </div>

          {/* Bottom Accent Line */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-primary via-orange-400 to-amber-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
        </div>
      </DialogTrigger>

      {/* Dialog Content */}
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden rounded-2xl">
        {/* Dialog Image */}
        <div className="relative h-64 w-full">
          <Image
            src={item.image}
            alt={item.name}
            width={480}
            height={256}
            className="w-full h-full object-cover"
            loading="lazy"
            placeholder={item.blurImage ? "blur" : "empty"}
            blurDataURL={item.blurImage!}
            sizes="(max-width: 768px) 100vw, 480px"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />

          {/* Price Badge in Image */}
          <div className="absolute bottom-4 right-4 price-tag-premium text-base">
            {formatPrice(Number(item.price))}
          </div>
        </div>

        <div className="p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{item.name}</DialogTitle>
            <DialogDescription asChild>
              <div className="mt-2">
                <p className="text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex-col! mt-6 gap-4">
            {/* Addons */}
            {item.addons && item.addons.length > 0 && (
              <div className="w-full p-4 rounded-xl bg-muted/50">
                <p className="mb-3 text-sm font-semibold flex items-center gap-2">
                  <Plus className="size-4 text-primary" />
                  Add-ons (Optional)
                </p>
                <div className="space-y-2">
                  {item.addons.map(addon => (
                    <label
                      key={addon.toppingName}
                      className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id={`addon-${addon.toppingName}`}
                          checked={selectedAddons.includes(addon.toppingName)}
                          onCheckedChange={checked => {
                            setSelectedAddons(prev =>
                              checked
                                ? [...prev, addon.toppingName]
                                : prev.filter(name => name !== addon.toppingName),
                            )
                          }}
                          className="border-primary data-[state=checked]:bg-primary"
                        />
                        <span className="text-sm font-medium">{addon.toppingName}</span>
                      </div>
                      <span className="text-sm font-bold text-green-600">
                        +{formatPrice(addon.toppingPrice)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <AddToCartButton item={item} vendor={vendor} selectedAddons={selectedAddons} />
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
