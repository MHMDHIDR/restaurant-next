import { eq } from "drizzle-orm";
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { users } from "@/server/db/schema";
import { accountFormSchema } from "@/app/schemas/account";

export const usersRouter = createTRPCRouter({
  // Public procedure to get a user by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, input.id),
      });
    }),

  // Protected procedure for updating users (requires authentication)
  update: protectedProcedure
    .input(
      accountFormSchema.pick({
        id: true,
        name: true,
        phone: true,
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
          image: input.image,
        })
        .where(eq(users.id, input.id))
        .returning();

      return updatedUser[0] ?? null;
    }),
});
