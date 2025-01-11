import { desc, eq, sql } from "drizzle-orm"
import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { notifications } from "@/server/db/schema"

export const notificationRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.notifications.findMany({
      where: eq(notifications.userId, ctx.session.user.id),
      orderBy: [desc(notifications.createdAt)],
    })
  }),

  markAsRead: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.update(notifications).set({ isRead: true }).where(eq(notifications.id, input.id))
      return { success: true }
    }),

  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, ctx.session.user.id))
    return { success: true }
  }),

  markSoundPlayed: protectedProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(notifications)
        .set({ soundPlayed: true })
        .where(
          sql`${notifications.userId} = ${ctx.session.user.id} AND ${notifications.id} IN (${sql.join(input.ids, sql`, `)})`,
        )
      return { success: true }
    }),
})
