import { TRPCError } from "@trpc/server"
import { and, desc, eq, sql } from "drizzle-orm"
import { Resend } from "resend"
import { z } from "zod"
import { vendorFormSchema, vendorStatus } from "@/app/schemas/vendor"
import { env } from "@/env"
import { createSlug } from "@/lib/create-slug"
import { extractS3FileName } from "@/lib/extract-s3-filename"
import { getBlurPlaceholder } from "@/lib/optimize-image"
import { createCaller } from "@/server/api/root"
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc"
import { orders, UserRole, users, vendors } from "@/server/db/schema"
import type { PaginationResult } from "@/lib/pagination"
import type { Vendors } from "@/server/db/schema"
import type { RouterOutputs } from "@/trpc/react"

type VendorWithMenuItems = Vendors & {
  menuItems: RouterOutputs["menuItem"]["getMenuItemsByVendorId"]["items"]
  menuItemsCount: number
  blurCoverImage: string | null
  pagination: PaginationResult | undefined
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
      return await ctx.db.transaction(async tx => {
        const existingVendor = await tx.query.vendors.findFirst({
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

        // Handle email notifications based on status changes
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

        // Update user role
        await tx
          .update(users)
          .set({ role: UserRole.VENDOR_ADMIN })
          .where(eq(users.id, existingVendor.addedById))

        // Handle image deletions
        const caller = createCaller(ctx)

        if (input.logo !== existingVendor.logo) {
          const oldLogoKey = extractS3FileName(existingVendor.logo)
          if (oldLogoKey) {
            await caller.S3.deleteFile({ fileName: oldLogoKey })
          }
        }

        if (input.coverImage !== existingVendor.coverImage) {
          const oldCoverKey = extractS3FileName(existingVendor.coverImage)
          if (oldCoverKey) {
            await caller.S3.deleteFile({ fileName: oldCoverKey })
          }
        }

        // Update vendor record
        const [updatedVendor] = await tx
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
          .returning()

        return { success: true, updatedVendor }
      })
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
    .input(
      z.object({
        slug: z.string(),
        getItems: z.boolean().default(false),
        searchParams: z
          .object({ page: z.number().optional(), limit: z.number().optional() })
          .optional(),
      }),
    )
    .query(async ({ ctx, input }): Promise<VendorWithMenuItems> => {
      const vendor = await ctx.db.query.vendors.findFirst({
        where: (vendors, { eq, and }) =>
          and(eq(vendors.slug, input.slug), eq(vendors.status, "ACTIVE")),
      })

      if (!vendor) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Vendor not found" })
      }

      const blurCoverImage = await getBlurPlaceholder(vendor.coverImage, 300, 90)

      if (input.getItems) {
        const caller = createCaller(ctx)
        if (!caller.menuItem) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Menu item router not found",
          })
        }

        const {
          items: menuItems,
          count: menuItemsCount,
          pagination,
        } = await caller.menuItem.getMenuItemsByVendorId({
          vendorId: vendor.id,
          addedById: vendor.addedById,
          searchParams: input.searchParams,
        })

        return { ...vendor, blurCoverImage, menuItems, pagination, menuItemsCount }
      }

      return { ...vendor, blurCoverImage, menuItems: [], pagination: undefined, menuItemsCount: 0 }
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

      const [{ count = 0 } = { count: 0 }] = await ctx.db
        .select({ count: sql<number>`count(*)::int` })
        .from(vendors)
        .where(where)
        .limit(limit + 1)

      return { items, count }
    }),

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

      const baseCondition = status ? and(eq(vendors.status, status)) : undefined

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

      const countQuery = await ctx.db
        .select({
          count: sql<number>`COUNT(DISTINCT ${vendors.id})::int`,
        })
        .from(vendors)
        .where(and(sql`${vendors.deletedAt} IS NULL`, baseCondition))

      const count = countQuery[0]?.count ?? 0

      const enhancedItems = items.map(item => ({
        ...item,
        metrics: { orderCount: item.orderCount, totalRevenue: parseFloat(item.totalRevenue) },
      }))

      return { items: enhancedItems, count }
    }),
})
