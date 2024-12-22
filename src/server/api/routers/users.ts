import { TRPCError } from "@trpc/server"
import { eq, sql } from "drizzle-orm"
import { z } from "zod"
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
      z.object({
        id: z.string().optional(),
        email: z.string().email().optional(),
        name: z.string().optional(),
        phone: z.string().optional(),
        theme: z.enum(["light", "dark"]).optional(),
        image: z.string().optional(),
        status: z.enum(["PENDING", "ACTIVE", "SUSPENDED"]).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Find user by id or email
      const whereClause = input.id ? eq(users.id, input.id) : eq(users.email, input.email!)
      const existingUser = await ctx.db.query.users.findFirst({
        where: () => whereClause,
      })

      if (!existingUser) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found!" })
      }

      // Update user with provided fields
      const [updatedUser] = await ctx.db
        .update(users)
        .set({
          ...(input.name && { name: input.name }),
          ...(input.phone && { phone: input.phone }),
          ...(input.theme && { theme: input.theme }),
          ...(input.image && { image: input.image }),
          ...(input.status && { status: input.status }),
          updatedAt: new Date(),
        })
        .where(whereClause)
        .returning()

      return updatedUser
    }),
})
