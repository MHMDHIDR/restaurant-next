import { z } from "zod"

export const orderStatusSchema = z.enum([
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY_FOR_PICKUP",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
])

export const orderItemSchema = z.object({
  menuItemId: z.string(),
  quantity: z.number(),
  unitPrice: z.number(),
  totalPrice: z.number(),
  specialInstructions: z.string(),
})

export type OrderStatus = z.infer<typeof orderStatusSchema>
