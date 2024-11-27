import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { posts } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";

export const postNameSchema = z.string().min(5, {
  message: "Post name must be at least 5 characters long",
});

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  create: protectedProcedure
    .input(z.object({ name: postNameSchema }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(posts).values({
        name: input.name,
        createdById: ctx.session.user.id,
      });
    }),

  getLatest: protectedProcedure.query(async ({ ctx }) => {
    const post = await ctx.db.query.posts.findMany({
      orderBy: (posts, { desc }) => [desc(posts.createdAt)],
    });

    return post ?? null;
  }),

  delete: protectedProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(posts)
        .where(
          and(eq(posts.id, input), eq(posts.createdById, ctx.session.user.id)),
        );
    }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
