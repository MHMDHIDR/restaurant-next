import { TRPCError } from "@trpc/server"
import { and, eq, sql } from "drizzle-orm"
import { Resend } from "resend"
import { z } from "zod"
import { vendorFormSchema, vendorStatus } from "@/app/schemas/vendor"
import { env } from "@/env"
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc"
import { UserRole, users, vendors } from "@/server/db/schema"

export const vendorRouter = createTRPCRouter({
  create: protectedProcedure.input(vendorFormSchema).mutation(async ({ ctx, input }) => {
    const existingVendor = await ctx.db.query.vendors.findFirst({
      where: (vendors, { eq }) => eq(vendors.email, input.email),
    })

    if (existingVendor) {
      throw new TRPCError({ code: "CONFLICT", message: "A vendor with this email already exists" })
    }

    // Convert input data to match database types explicitly
    const [createdVendor] = await ctx.db
      .insert(vendors)
      .values({
        ...input,
        addedById: ctx.session.user.id,
        status: "PENDING",
        averageRating: sql`0.00`,
        stripeAccountId: "",
        latitude: sql`${input.latitude}`,
        longitude: sql`${input.longitude}`,
        minimumOrder: sql`${input.minimumOrder}`,
        deliveryRadius: sql`${input.deliveryRadius}`,
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
      })

      if (!existingVendor) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Vendor not found" })
      }

      const RESEND = new Resend(env.AUTH_RESEND_KEY)
      const confirmLink = `${env.NEXT_PUBLIC_APP_URL}/vendor-manager/categories`
      const btnStyles =
        "background-color: #4CAF50; color: white; padding: 5px 12px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; margin: 4px 2px; cursor: pointer; border-radius: 12px;"

      // send an email to the vendor when their vendor gets approved (activated)
      if (input.status === "ACTIVE") {
        await RESEND.emails.send({
          from: env.ADMIN_EMAIL,
          to: input.email,
          subject: "Congratulations! Your Vendor has been Approved",
          html: `<p>To Start setting up your restaurant, and sell, please <a href="${confirmLink}" style="${btnStyles}">Click here</a> to login to your account</p><br /><br /><p>Thank you for choosing us!</p>`,
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
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Vendor not found",
      })
    }

    return vendor
  }),

  getBySessionUser: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.vendors.findFirst({
      where: (vendors, { eq }) => eq(vendors.addedById, ctx.session.user.id),
    })
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
        limit: limit + 1,
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
})
