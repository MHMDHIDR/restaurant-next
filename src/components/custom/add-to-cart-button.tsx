"use client"

import { Button } from "@/components/ui/button"
import { useCart } from "@/hooks/use-cart"
import { useToast } from "@/hooks/use-toast"
import type { MenuItems } from "@/server/db/schema"

type AddToCartButtonProps = {
  item: MenuItems
  vendor: {
    id: string
    name: string
  }
  selectedAddons: string[]
}

export default function AddToCartButton({ item, vendor, selectedAddons }: AddToCartButtonProps) {
  const toast = useToast()
  const { addItem } = useCart()

  const handleAddToCart = () => {
    const addonsCost = selectedAddons.reduce((total, addonName) => {
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
      selectedAddons,
      quantity: 1,
    })

    toast.success(`${item.name} has been added to your cart.`)
  }

  return (
    <Button onClick={handleAddToCart} className="w-full mt-3">
      Add to Cart
    </Button>
  )
}
