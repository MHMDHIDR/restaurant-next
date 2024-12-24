import { create } from "zustand"
import { persist } from "zustand/middleware"

type CartItem = {
  id: string
  name: string
  price: number
  image: string
  vendorId: string
  vendorName: string
  quantity?: number
  selectedAddons?: string[]
}

type CartStore = {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (itemId: string, selectedAddons?: string[]) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  total: number
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      addItem: item => {
        const currentItems = get().items
        const existingItem = currentItems.find(
          i =>
            i.id === item.id &&
            JSON.stringify(i.selectedAddons) === JSON.stringify(item.selectedAddons),
        )

        if (existingItem) {
          if ((existingItem.quantity ?? 1) >= 100) return
          set({
            items: currentItems.map(i =>
              i.id === item.id &&
              JSON.stringify(i.selectedAddons) === JSON.stringify(item.selectedAddons)
                ? { ...i, quantity: Math.min((i.quantity ?? 1) + 1, 100) }
                : i,
            ),
            total: get().total + item.price,
          })
        } else {
          set({
            items: [...currentItems, { ...item, quantity: 1 }],
            total: get().total + item.price,
          })
        }
      },
      removeItem: (itemId, selectedAddons) => {
        const currentItems = get().items
        const itemToRemove = currentItems.find(
          item =>
            item.id === itemId &&
            JSON.stringify(item.selectedAddons) === JSON.stringify(selectedAddons),
        )

        if (itemToRemove) {
          const remainingItems = currentItems.filter(
            item =>
              !(
                item.id === itemId &&
                JSON.stringify(item.selectedAddons) === JSON.stringify(selectedAddons)
              ),
          )
          set({
            items: remainingItems,
            total:
              remainingItems.length === 0
                ? 0
                : get().total - itemToRemove.price * (itemToRemove.quantity ?? 1),
          })
        }
      },
      updateQuantity: (itemId, quantity) => {
        const limitedQuantity = Math.min(quantity, 100)
        const currentItems = get().items
        const item = currentItems.find(i => i.id === itemId)
        if (item) {
          const oldTotal = item.price * (item.quantity ?? 1)
          const newTotal = item.price * limitedQuantity
          set({
            items: currentItems.map(i =>
              i.id === itemId ? { ...i, quantity: limitedQuantity } : i,
            ),
            total: get().total - oldTotal + newTotal,
          })
        }
      },
      clearCart: () => set({ items: [], total: 0 }),
    }),
    {
      name: "shopping-cart",
    },
  ),
)
