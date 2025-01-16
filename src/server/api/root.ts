import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc"
import { menuCategoryRouter } from "./routers/menuCategory"
import { menuItemRouter } from "./routers/menuItem"
import { notificationRouter } from "./routers/notification"
import { optimizeImageRouter } from "./routers/optimize-image"
import { orderRouter } from "./routers/order"
import { S3Router } from "./routers/s3"
import { searchRouter } from "./routers/search"
import { stripeRouter } from "./routers/stripe"
import { usersRouter } from "./routers/users"
import { vendorRouter } from "./routers/vendor"
import { vendorAdminRouter } from "./routers/vendorAdmin"

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  vendor: vendorRouter,
  menuCategory: menuCategoryRouter,
  menuItem: menuItemRouter,
  users: usersRouter,
  optimizeImage: optimizeImageRouter,
  S3: S3Router,
  order: orderRouter,
  notification: notificationRouter,
  stripe: stripeRouter,
  search: searchRouter,
  vendorAdmin: vendorAdminRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter

/**
 * Create a server-side caller for the tRPC API
 * @example
 * const trpc = createCaller(ctx)
 * const user = await trpc.user.getUser({ id: "123" })
 */
export const createCaller = createCallerFactory(appRouter)
