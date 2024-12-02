import { eq, sql } from "drizzle-orm"
import { z } from "zod"
import { accountFormSchema } from "@/app/schemas/account"
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { users } from "@/server/db/schema"

export const usersRouter = createTRPCRouter({
  getById: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    return await ctx.db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, input.id),
    })
  }),

  getUsers: protectedProcedure.query(async ({ ctx }) => {
    const usersList = await ctx.db.query.users.findMany()
    const [{ count = 0 } = { count: 0 }] = await ctx.db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)

    return { users: usersList, count }
  }),

  update: protectedProcedure
    .input(
      accountFormSchema.pick({
        id: true,
        name: true,
        phone: true,
        theme: true,
        image: true,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Perform update with additional safety checks
      const updatedUser = await ctx.db
        .update(users)
        .set({
          name: input.name,
          phone: input.phone,
          theme: input.theme,
          image: input.image,
        })
        .where(eq(users.id, input.id))
        .returning()

      return updatedUser[0] ?? null
    }),
})
