import { TRPCError } from "@trpc/server"
import { and, eq, sql } from "drizzle-orm"
import { z } from "zod"
import { vendorFormSchema } from "@/app/schemas/vendor"
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc"
import { UserRole, vendors } from "@/server/db/schema"

export const vendorRouter = createTRPCRouter({
  create: protectedProcedure.input(vendorFormSchema).mutation(async ({ ctx, input }) => {
    const existingVendor = await ctx.db.query.vendors.findFirst({
      where: (vendors, { eq }) => eq(vendors.email, input.email),
    })

    if (existingVendor) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "A vendor with this email already exists",
      })
    }

    // Convert input data to match database types explicitly
    await ctx.db.insert(vendors).values({
      ...input,
      status: "PENDING",
      averageRating: sql`0.00`,
      stripeAccountId: "",
      latitude: sql`${input.latitude}`,
      longitude: sql`${input.longitude}`,
      minimumOrder: sql`${input.minimumOrder}`,
      deliveryRadius: sql`${input.deliveryRadius}`,
    })

    return { success: true }
  }),

  update: protectedProcedure
    .input(vendorFormSchema.partial().extend({ email: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      // Use sql to convert numeric fields while maintaining type compatibility
      await ctx.db
        .update(vendors)
        .set({
          ...(input.name && { name: input.name }),
          ...(input.description && { description: input.description }),
          ...(input.logo && { logo: input.logo }),
          ...(input.coverImage && { coverImage: input.coverImage }),
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
      where: (vendors, { eq }) => eq(vendors.email, ctx.session.user.email!),
    })
  }),

  getAll: publicProcedure
    .input(
      z
        .object({
          status: z.enum(["PENDING", "ACTIVE", "SUSPENDED", "INACTIVE"]).optional(),
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
        where,
        limit: limit + 1,
        offset: cursor,
        orderBy: (vendors, { desc }) => [desc(vendors.createdAt)],
      })

      let nextCursor: number | undefined
      if (items.length > limit) {
        items.pop()
        nextCursor = cursor + limit
      }

      return { items, nextCursor }
    }),
})
