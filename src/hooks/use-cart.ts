import { create } from "zustand"
import { persist } from "zustand/middleware"

interface CartItem {
  id: string
  name: string
  price: number
  image: string
  vendorId: string
  vendorName: string
  quantity?: number
  selectedAddons?: string[]
}

interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (itemId: string) => void
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
          set({
            items: currentItems.map(i =>
              i.id === item.id &&
              JSON.stringify(i.selectedAddons) === JSON.stringify(item.selectedAddons)
                ? { ...i, quantity: (i.quantity ?? 1) + 1 }
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
      removeItem: itemId => {
        const currentItems = get().items
        const itemToRemove = currentItems.find(i => i.id === itemId)
        if (itemToRemove) {
          set({
            items: currentItems.filter(i => i.id !== itemId),
            total: get().total - itemToRemove.price * (itemToRemove.quantity ?? 1),
          })
        }
      },
      updateQuantity: (itemId, quantity) => {
        const currentItems = get().items
        const item = currentItems.find(i => i.id === itemId)
        if (item) {
          const oldTotal = item.price * (item.quantity ?? 1)
          const newTotal = item.price * quantity
          set({
            items: currentItems.map(i => (i.id === itemId ? { ...i, quantity } : i)),
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
