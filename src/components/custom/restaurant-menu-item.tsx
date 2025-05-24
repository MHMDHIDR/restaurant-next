"use client"

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
      Loading...
    </Button>
  ),
})

export default function RestaurantMenuItem({ item, vendor }: RestaurantMenuItemProps) {
  const [selectedAddons, setSelectedAddons] = useState<string[]>([])

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="relative h-48 max-h-48 w-full cursor-pointer rounded-md select-none overflow-clip">
          <Image
            src={item.image}
            alt={item.name}
            width={300}
            height={192}
            placeholder={item.blurImage ? "blur" : "empty"}
            blurDataURL={item.blurImage!}
            className="w-full h-auto object-cover shadow-xs hover:shadow-lg transition-shadow"
          />
          <div
            className={
              "absolute bottom-0 w-full px-2.5 py-3.5 bg-linear-to-t from-black/90 via-black/50 to-transparent rounded-md"
            }
          >
            <h1 className="text-gray-200 text-lg font-extrabold drop-shadow-md">
              {truncate(item.name)}
            </h1>
            <span className="text-green-600">{formatPrice(Number(item.price))}</span>
          </div>
          {vendor.slug && (
            <Link className="text-muted-foreground group text-sm" href={`/r/${vendor.slug}`}>
              By{" "}
              <strong className="text-primary border-b-2 border-b-current group-hover:border-b-4 transition-all">
                {vendor.name}
              </strong>
            </Link>
          )}
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{item.name}</DialogTitle>
          <DialogDescription asChild>
            <div>
              <div className="flex flex-col gap-2 justify-between">
                <strong className="text-sm text-green-600">
                  {formatPrice(Number(item.price))}
                </strong>
                <p>{item.description}</p>
              </div>
              <Image
                src={item.image}
                alt={item.name}
                width={300}
                height={192}
                className="w-full max-h-72 object-cover rounded-md shadow-sm mt-2"
              />
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col!">
          {item.addons && item.addons.length > 0 && (
            <div className="flex flex-col">
              <p className="mb-2 text-sm font-medium">Add-ons:</p>
              {item.addons.map(addon => (
                <label key={addon.toppingName} className="flex items-center gap-2">
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
                  />
                  <span className="text-sm space-x-1">
                    <span>{addon.toppingName}</span>
                    <span className="text-green-600">(+{formatPrice(addon.toppingPrice)})</span>
                  </span>
                </label>
              ))}
            </div>
          )}
          <AddToCartButton item={item} vendor={vendor} selectedAddons={selectedAddons} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
