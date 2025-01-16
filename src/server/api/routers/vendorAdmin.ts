import { TRPCError } from "@trpc/server"
import { and, eq, inArray, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { Resend } from "resend"
import { z } from "zod"
import { env } from "@/env"
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { UserRole, users, vendors } from "@/server/db/schema"

export const vendorAdminRouter = createTRPCRouter({
  inviteStaff: protectedProcedure
    .input(z.object({ email: z.string().email(), vendorId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Get the vendor first
      const vendor = await ctx.db.query.vendors.findFirst({
        where: (vendors, { eq }) => eq(vendors.id, input.vendorId),
      })

      if (!vendor) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Vendor not found" })
      }

      // Find the user with the provided email
      const invitedUser = await ctx.db.query.users.findFirst({
        where: (users, { eq, and }) =>
          and(eq(users.email, input.email), eq(users.status, "ACTIVE")),
      })

      if (!invitedUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found. They must be registered in the system first.",
        })
      }

      // Check if user is already a staff member or has another role
      if (invitedUser.role !== UserRole.CUSTOMER) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User already has a vendor role or is not eligible to be staff",
        })
      }

      // Check if user is already in admins
      const currentAdmins = vendor.admins as { id: string }[]
      if (currentAdmins.some(admin => admin.id === invitedUser.id)) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User is already a staff member of this vendor",
        })
      }

      // Send invitation email
      const RESEND = new Resend(env.AUTH_RESEND_KEY)
      const acceptLink = `${env.NEXT_PUBLIC_APP_URL}/accept-staff-invite?token=${invitedUser.id}&vendorId=${vendor.id}`

      await RESEND.emails.send({
        from: env.ADMIN_EMAIL,
        to: input.email,
        subject: `Invitation to join ${vendor.name} as Staff Member`,
        html: `
        <h2>You've been invited to be a staff at <u>${vendor.name}.</u>!</h2>
        <p>${vendor.name} has invited you to be a staff member to manage the vendor.</p>
        <p>Please click the link below to accept the invitation:</p>
        <br /><br />
        <a href="${acceptLink}" style="background-color: #4CAF50; color: white; padding: 14px 20px; text-decoration: none; border-radius: 4px;">Accept Invitation</a>
        <br /><br />
      `,
      })

      return { success: true }
    }),

  acceptInvitation: protectedProcedure
    .input(z.object({ userId: z.string(), vendorId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const vendor = await ctx.db.query.vendors.findFirst({
        where: (vendors, { eq }) => eq(vendors.id, input.vendorId),
      })

      if (!vendor) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Vendor not found" })
      }

      // Update user role
      await ctx.db
        .update(users)
        .set({ role: UserRole.VENDOR_STAFF })
        .where(eq(users.id, input.userId))

      // Add user to vendor admins
      const currentAdmins = vendor.admins as { id: string }[]

      // Check if user is already an admin
      if (!currentAdmins.some(admin => admin.id === input.userId)) {
        const updatedAdmins = [...currentAdmins, { id: input.userId }]

        await ctx.db
          .update(vendors)
          .set({ admins: updatedAdmins })
          .where(eq(vendors.id, input.vendorId))
      }

      return { success: true }
    }),

  removeStaff: protectedProcedure
    .input(z.object({ userId: z.string(), vendorId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const vendor = await ctx.db.query.vendors.findFirst({
        where: (vendors, { eq }) => eq(vendors.id, input.vendorId),
      })

      if (!vendor) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Vendor not found" })
      }

      // Remove user from vendor admins
      const currentAdmins = vendor.admins as { id: string }[]
      const updatedAdmins = currentAdmins.filter(admin => admin.id !== input.userId)

      // Update user role back to CUSTOMER
      await ctx.db.update(users).set({ role: UserRole.CUSTOMER }).where(eq(users.id, input.userId))

      // Update vendor admins
      await ctx.db
        .update(vendors)
        .set({ admins: updatedAdmins })
        .where(eq(vendors.id, input.vendorId))

      return { success: true }
    }),

  getStaffMembers: protectedProcedure
    .input(z.object({ vendorId: z.string() }))
    .query(async ({ ctx, input }) => {
      const vendor = await ctx.db.query.vendors.findFirst({
        where: (vendors, { eq }) => eq(vendors.id, input.vendorId),
      })

      if (!vendor) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Vendor not found" })
      }

      const currentAdmins = vendor.admins
      const adminIds = Object.values(currentAdmins)
        .flat()
        .map(admin => admin.id)

      if (adminIds.length === 0) {
        return { items: [], count: 0 }
      }

      const items = await ctx.db.query.users.findMany({
        where: (users, { inArray }) => inArray(users.id, adminIds),
      })

      const [{ count = 0 } = { count: 0 }] = await ctx.db
        .select({ count: sql<number>`count(*)::int` })
        .from(users)
        .where(inArray(users.id, adminIds))

      return { items, count }
    }),
})
