"use client"

import Image from "next/image"
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
import { useCart } from "@/hooks/use-cart"
import { useToast } from "@/hooks/use-toast"
import { DEFAULT_CURRENCY_SYMBOL } from "@/lib/constants"
import { truncate } from "@/lib/truncate"
import type { MenuItems } from "@/server/db/schema"

type RestaurantMenuItemProps = {
  item: MenuItems
  vendor: {
    id: string
    name: string
  }
}

export default function RestaurantMenuItem({ item, vendor }: RestaurantMenuItemProps) {
  const toast = useToast()
  const { addItem } = useCart()
  const [selectedAddons, setSelectedAddons] = useState<Record<string, string[]>>({})

  const handleAddToCart = (item: MenuItems) => {
    const itemAddons = selectedAddons[item.id] ?? []
    const addonsCost = itemAddons.reduce((total, addonName) => {
      const addon = item.addons?.find(a => a.toppingName === addonName)
      return total + (addon?.toppingPrice ?? 0)
    }, 0)

    addItem({
      id: item.id,
      name: item.name,
      price: Number(item.price) + addonsCost,
      image: item.image,
      vendorId: vendor.id,
      vendorName: vendor.name,
      selectedAddons: itemAddons,
      quantity: 1,
    })

    toast.success(`${item.name} has been added to your cart.`)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="relative h-48 max-h-48 w-full overflow-y-clip cursor-pointer">
          <Image
            src={item.image}
            alt={item.name}
            width={300}
            height={192}
            className="w-full h-full object-cover rounded-md shadow-sm hover:shadow-lg transition-shadow"
          />
          <div
            className={
              "absolute bottom-0 w-full px-2.5 py-3.5 bg-gradient-to-t from-black/90 via-black/50 to-transparent rounded-md"
            }
          >
            <h1 className="text-gray-200 text-lg font-extrabold drop-shadow-md">
              {truncate(item.name)}
            </h1>
            <span className="text-green-600">
              <strong>{DEFAULT_CURRENCY_SYMBOL}</strong>
              {Number(item.price).toFixed(2)}
            </span>
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{item.name}</DialogTitle>
          <DialogDescription asChild>
            <div>
              <div className="flex flex-col gap-2 justify-between">
                <strong className="text-sm text-muted-foreground">
                  {DEFAULT_CURRENCY_SYMBOL}
                  {Number(item.price).toFixed(2)}
                </strong>
                <p>{item.description}</p>
              </div>
              <Image
                src={item.image}
                alt={item.name}
                width={300}
                height={192}
                className="w-full max-h-72 object-cover rounded-md shadow mt-2"
              />
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="!flex-col">
          {item.addons && item.addons.length > 0 && (
            <div className="flex flex-col">
              <p className="mb-2 text-sm font-medium">Add-ons:</p>
              {item.addons.map(addon => (
                <label key={addon.toppingName} className="flex items-center gap-2">
                  <Checkbox
                    id="addon-checkbox"
                    checked={selectedAddons[item.id]?.includes(addon.toppingName)}
                    onCheckedChange={e => {
                      const current = selectedAddons[item.id] ?? []
                      setSelectedAddons({
                        ...selectedAddons,
                        [item.id]: e.valueOf()
                          ? [...current, addon.toppingName]
                          : current.filter(name => name !== addon.toppingName),
                      })
                    }}
                  />
                  <span className="text-sm">
                    {addon.toppingName} (+{DEFAULT_CURRENCY_SYMBOL}
                    {addon.toppingPrice.toFixed(2)})
                  </span>
                </label>
              ))}
            </div>
          )}
          <Button onClick={() => handleAddToCart(item)} className="w-full mt-3">
            Add to Cart
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
