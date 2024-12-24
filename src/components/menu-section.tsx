"use client"

import Image from "next/image"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useCart } from "@/hooks/use-cart"
import { useToast } from "@/hooks/use-toast"
import { DEFAULT_CURRENCY_SYMBOL } from "@/lib/constants"
import { Checkbox } from "./ui/checkbox"
import type { MenuItems, Vendors } from "@/server/db/schema"

interface MenuSectionProps {
  vendor: Vendors
  menuItems: MenuItems[]
}

export function MenuSection({ vendor, menuItems }: MenuSectionProps) {
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
    })

    toast.success(`${item.name} has been added to your cart.`)
  }

  return (
    <div>
      <h3 className="mb-4 text-xl font-semibold">{vendor.name}</h3>
      <div className="grid gap-6 md:grid-cols-3">
        {menuItems.map(item => (
          <Card key={item.id} className="overflow-clip">
            <div className="relative h-48 w-full">
              <Image src={item.image} alt={item.name} fill className="object-cover" />
            </div>
            <CardHeader>
              <h4 className="font-semibold">{item.name}</h4>
              <p className="text-sm text-muted-foreground">
                {DEFAULT_CURRENCY_SYMBOL}
                {Number(item.price).toFixed(2)}
              </p>
            </CardHeader>
            <CardContent>
              {item.addons && item.addons.length > 0 && (
                <div className="mb-4">
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
              <Button onClick={() => handleAddToCart(item)} className="w-full">
                Add to Cart
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
