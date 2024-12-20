import { menuCategoryRouter } from "@/server/api/routers/menuCategory"
import { optimizeImageRouter } from "@/server/api/routers/optimize-image"
import { usersRouter } from "@/server/api/routers/users"
import { vendorRouter } from "@/server/api/routers/vendor"
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc"
import { S3Router } from "./routers/s3"

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  vendor: vendorRouter,
  menuCategory: menuCategoryRouter,
  users: usersRouter,
  optimizeImage: optimizeImageRouter,
  S3: S3Router,
})

// export type definition of API
export type AppRouter = typeof appRouter

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter)
