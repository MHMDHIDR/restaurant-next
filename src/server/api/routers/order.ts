import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { orderItems, orders } from "@/server/db/schema"

const orderItemSchema = z.object({
  menuItemId: z.string(),
  quantity: z.number(),
  unitPrice: z.number(),
  totalPrice: z.number(),
  specialInstructions: z.string(),
})

export const orderRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        vendorId: z.string(),
        deliveryAddress: z.string(),
        specialInstructions: z.string().optional(),
        subtotal: z.number(),
        deliveryFee: z.number(),
        total: z.number(),
        items: z.array(orderItemSchema),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.transaction(async tx => {
        // Create the order
        const [order] = await tx
          .insert(orders)
          .values({
            userId: ctx.session.user.id,
            vendorId: input.vendorId,
            status: "PENDING",
            subtotal: input.subtotal.toString(),
            deliveryFee: input.deliveryFee.toString(),
            total: input.total.toString(),
            deliveryAddress: input.deliveryAddress,
            specialInstructions: input.specialInstructions,
          })
          .returning()

        // Create order items
        if (!order) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create order" })
        }

        await tx.insert(orderItems).values(
          input.items.map(item => ({
            orderId: order.id,
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            unitPrice: item.unitPrice.toString(),
            totalPrice: item.totalPrice.toString(),
            specialInstructions: item.specialInstructions,
          })),
        )

        return order
      })
    }),
})
