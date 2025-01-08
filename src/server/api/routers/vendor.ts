import { TRPCError } from "@trpc/server"
import { and, desc, eq, sql } from "drizzle-orm"
import { Resend } from "resend"
import { z } from "zod"
import { vendorFormSchema, vendorStatus } from "@/app/schemas/vendor"
import { env } from "@/env"
import { createSlug } from "@/lib/create-slug"
import { createCaller } from "@/server/api/root"
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc"
import { orders, UserRole, users, vendors } from "@/server/db/schema"
import type { Vendors } from "@/server/db/schema"
import type { RouterOutputs } from "@/trpc/react"

type VendorWithMenuItems = Vendors & {
  menuItems: RouterOutputs["menuItem"]["getMenuItemsByVendorId"]["items"]
  menuItemsCount: number
}

export const vendorRouter = createTRPCRouter({
  create: protectedProcedure
    .input(vendorFormSchema.extend({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const existingVendor = await ctx.db.query.vendors.findFirst({
        where: (vendors, { eq }) => eq(vendors.email, input.email),
      })

      if (existingVendor) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A vendor with this email already exists",
        })
      }

      // Ensure addedById is included in the schema
      const [createdVendor] = await ctx.db
        .insert(vendors)
        .values({
          ...input,
          slug: createSlug(input.name),
          addedById: ctx.session.user.id,
          latitude: input.latitude.toString(),
          longitude: input.longitude.toString(),
          minimumOrder: input.minimumOrder.toString(),
        })
        .returning()

      return { success: true, createdVendor }
    }),

  update: protectedProcedure
    .input(
      vendorFormSchema.partial().extend({
        email: z.string().email(),
        logo: z.string().optional(),
        coverImage: z.string().optional(),
        deletedAt: z.date().optional(),
        suspendedAt: z.date().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existingVendor = await ctx.db.query.vendors.findFirst({
        where: (vendors, { eq }) => eq(vendors.email, input.email),
        with: { assignedUser: true },
      })

      if (!existingVendor) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Vendor not found!" })
      }

      const RESEND = new Resend(env.AUTH_RESEND_KEY)
      const confirmLink = `${env.NEXT_PUBLIC_APP_URL}/vendor-manager/categories?view=new-category`
      const btnStyles =
        "background-color: #4CAF50; color: white; padding: 5px 12px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; margin: 4px 2px; cursor: pointer; border-radius: 12px;"

      // send an email to the vendor when their vendor gets approved (activated)
      if (input.status === "ACTIVE") {
        await RESEND.emails.send({
          from: env.ADMIN_EMAIL,
          to: existingVendor.email,
          cc: existingVendor.assignedUser.email,
          subject: "Congratulations! Your Vendor has been Approved",
          html: `<p>To Start setting up your restaurant by creating categories, adding menu items, and sell, please <a href="${confirmLink}" style="${btnStyles}">Visit Here</a> to login to your account</p><br /><br /><p>Thank you for choosing us!</p>`,
        })
      } else if (input.status === "DEACTIVATED") {
        await RESEND.emails.send({
          from: env.ADMIN_EMAIL,
          to: existingVendor.email,
          cc: existingVendor.assignedUser.email,
          subject: "Your Vendor has been Deactivated",
          html: `<p>Your Vendor has been deactivated. Please contact the admin for more information</p>`,
        })
      } else if (input.suspendedAt) {
        await RESEND.emails.send({
          from: env.ADMIN_EMAIL,
          to: existingVendor.email,
          cc: existingVendor.assignedUser.email,
          subject: "Your Vendor has been Suspended",
          html: `<p>Your Vendor has been suspended. Please contact the admin for more information</p>`,
        })
      } else if (input.deletedAt) {
        await RESEND.emails.send({
          from: env.ADMIN_EMAIL,
          to: existingVendor.email,
          cc: existingVendor.assignedUser.email,
          subject: "Your Vendor has been Deleted",
          html: `<p>Your Vendor has been deleted. Please contact the admin for more information</p>`,
        })
      }

      // Make the user who create that vendor (vendor.addedById) as the Vendor Admin
      await ctx.db
        .update(users)
        .set({ role: UserRole.VENDOR_ADMIN })
        .where(eq(users.id, existingVendor.addedById))

      // Use sql to convert numeric fields while maintaining type compatibility
      await ctx.db
        .update(vendors)
        .set({
          ...(input.name && { name: input.name }),
          ...(input.description && { description: input.description }),
          ...(input.logo && { logo: input.logo }),
          ...(input.coverImage && { coverImage: input.coverImage }),
          ...(input.status && { status: input.status }),
          ...(input.address && { address: input.address }),
          ...(input.city && { city: input.city }),
          ...(input.state && { state: input.state }),
          ...(input.postalCode && { postalCode: input.postalCode }),
          ...(input.phone && { phone: input.phone }),
          ...(input.email && { email: input.email }),
          ...(input.latitude !== undefined && { latitude: sql`${input.latitude}` }),
          ...(input.longitude !== undefined && { longitude: sql`${input.longitude}` }),
          ...(input.openingHours && { openingHours: input.openingHours }),
          ...(input.cuisineTypes && { cuisineTypes: input.cuisineTypes }),
          ...(input.minimumOrder !== undefined && { minimumOrder: sql`${input.minimumOrder}` }),
          ...(input.deliveryRadius !== undefined && {
            deliveryRadius: sql`${input.deliveryRadius}`,
          }),
          ...(input.deletedAt && { deletedAt: input.deletedAt ?? sql`now()` }),
          ...(input.suspendedAt === null
            ? { suspendedAt: null }
            : input.suspendedAt && { suspendedAt: input.suspendedAt }),
        })
        .where(eq(vendors.email, input.email))

      return { success: true }
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const vendor = await ctx.db.query.vendors.findFirst({
        where: (vendors, { eq }) => eq(vendors.id, input.id),
      })

      if (!vendor) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Vendor not found",
        })
      }

      if (
        vendor.email !== ctx.session.user.email &&
        ctx.session.user.role !== UserRole.SUPER_ADMIN
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not authorized to delete this vendor",
        })
      }

      return await ctx.db.delete(vendors).where(eq(vendors.id, input.id))
    }),

  getById: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const vendor = await ctx.db.query.vendors.findFirst({
      where: (vendors, { eq }) => eq(vendors.id, input.id),
    })

    if (!vendor) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Vendor not found" })
    }

    return vendor
  }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string(), getItems: z.boolean().default(false) }))
    .query(async ({ ctx, input }): Promise<VendorWithMenuItems> => {
      const vendor = await ctx.db.query.vendors.findFirst({
        where: (vendors, { eq }) => eq(vendors.slug, input.slug),
      })

      if (!vendor) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Vendor not found" })
      }

      if (input.getItems) {
        // Create a strongly-typed caller
        const caller = createCaller(ctx)

        // Check if menuItem router exists and get items
        if (!caller.menuItem) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Menu item router not found",
          })
        }

        const { items: menuItems, menuItemsCount } = await caller.menuItem.getMenuItemsByVendorId({
          vendorId: vendor.id,
          addedById: vendor.addedById,
        })

        return { ...vendor, menuItems, menuItemsCount }
      } else {
        return { ...vendor, menuItems: [], menuItemsCount: 0 }
      }
    }),

  getBySessionUser: protectedProcedure.query(async ({ ctx }) => {
    const vendor = await ctx.db.query.vendors.findFirst({
      where: (vendors, { eq }) => eq(vendors.addedById, ctx.session.user.id),
    })
    return vendor ?? null
  }),

  getAll: publicProcedure
    .input(
      z
        .object({
          status: vendorStatus.optional(),
          limit: z.number().min(1).max(100).default(10),
          cursor: z.number().default(0),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 10
      const cursor = input?.cursor ?? 0
      const status = input?.status

      const where = status ? and(eq(vendors.status, status)) : undefined

      const items = await ctx.db.query.vendors.findMany({
        with: { assignedUser: true },
        where,
        limit,
        offset: cursor,
        orderBy: (vendors, { desc }) => [desc(vendors.createdAt)],
      })
      // Get total count of items from vendors table with the same query as above
      const [{ count = 0 } = { count: 0 }] = await ctx.db
        .select({ count: sql<number>`count(*)::int` })
        .from(vendors)
        .where(where)
        .limit(limit + 1)

      return { items, count }
    }),

  /**
   * This procedure gets featured vendors which is the the top vendors based on the number of orders they have received
   */
  getFeatured: publicProcedure
    .input(
      z
        .object({
          status: vendorStatus.optional(),
          limit: z.number().min(1).max(100).default(10),
          cursor: z.number().default(0),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 10
      const cursor = input?.cursor ?? 0
      const status = input?.status

      // Base where condition for vendor status
      const baseCondition = status ? and(eq(vendors.status, status)) : undefined

      // Query to get vendors with their order counts
      const items = await ctx.db
        .select({
          id: vendors.id,
          name: vendors.name,
          slug: vendors.slug,
          description: vendors.description,
          logo: vendors.logo,
          coverImage: vendors.coverImage,
          status: vendors.status,
          address: vendors.address,
          city: vendors.city,
          state: vendors.state,
          postalCode: vendors.postalCode,
          phone: vendors.phone,
          email: vendors.email,
          latitude: vendors.latitude,
          longitude: vendors.longitude,
          openingHours: vendors.openingHours,
          cuisineTypes: vendors.cuisineTypes,
          deliveryRadius: vendors.deliveryRadius,
          minimumOrder: vendors.minimumOrder,
          averageRating: vendors.averageRating,
          addedById: vendors.addedById,
          createdAt: vendors.createdAt,
          updatedAt: vendors.updatedAt,
          deletedAt: vendors.deletedAt,
          suspendedAt: vendors.suspendedAt,
          stripeAccountId: vendors.stripeAccountId,
          orderCount: sql<number>`COUNT(${orders.id})::int`,
          totalRevenue: sql<string>`COALESCE(SUM(${orders.total})::text, '0')`,
        })
        .from(vendors)
        .leftJoin(orders, eq(vendors.id, orders.vendorId))
        .where(and(sql`${vendors.deletedAt} IS NULL`, baseCondition))
        .groupBy(vendors.id)
        .orderBy(sql`COUNT(${orders.id}) DESC`, desc(vendors.averageRating))
        .limit(limit)
        .offset(cursor)

      // Get total count of vendors that match the criteria
      const countQuery = await ctx.db
        .select({
          count: sql<number>`COUNT(DISTINCT ${vendors.id})::int`,
        })
        .from(vendors)
        .where(and(sql`${vendors.deletedAt} IS NULL`, baseCondition))

      const count = countQuery[0]?.count ?? 0

      // Enhance the items with additional metrics
      const enhancedItems = items.map(item => ({
        ...item,
        metrics: { orderCount: item.orderCount, totalRevenue: parseFloat(item.totalRevenue) },
      }))

      return { items: enhancedItems, count }
    }),
})
