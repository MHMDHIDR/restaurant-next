import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { eq } from "drizzle-orm"
import { type DefaultSession, type NextAuthConfig } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import Resend from "next-auth/providers/resend"
import { env } from "@/env"
import { getBlurPlaceholder } from "@/lib/optimize-image"
import { db } from "@/server/db"
import { accounts, sessions, users, vendors, verificationTokens } from "@/server/db/schema"
import type { themeEnumType, UserRoleType, Users } from "@/server/db/schema"
import type { AdapterUser } from "@auth/core/adapters"

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string
      phone: string
      theme: themeEnumType
      hasVendor: boolean
      vendorId?: string
      vendorStatus?: string
    } & DefaultSession["user"]
  }
  interface User extends AdapterUser {
    role: UserRoleType
    blurImageDataURL: string | null
  }
}
declare module "@auth/core/adapters" {
  interface AdapterUser {
    role: UserRoleType
    blurImageDataURL: string | null
  }
}

export const authConfig = {
  providers: [
    GoogleProvider({
      clientId: env.AUTH_GOOGLE_ID,
      clientSecret: env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Resend({ name: "Email", from: env.ADMIN_EMAIL }),
  ],
  pages: { signIn: "/signin", error: "/signin" },
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-authjs.session-token"
          : "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  trustHost: true,
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" && profile) {
        try {
          // Find the user by email
          const existingUser = await db.query.users.findFirst({
            where: eq(users.email, profile.email!),
          })

          // If no user exists, create a new user
          if (!existingUser) {
            await db.insert(users).values({
              name: profile.name ?? user.name ?? "Unknown",
              email: profile.email!,
              image: profile.picture ?? user.image ?? "/logo.svg",
              phone: "",
            })
          }

          // If user exists but name is not set, then set it with Google profile name
          if (existingUser && !existingUser.name) {
            await db
              .update(users)
              .set({ name: profile.name ?? existingUser.name })
              .where(eq(users.email, user.email!))
          }
          // If user exists but image is not set, then update it with Google profile image
          if (existingUser && !existingUser.image) {
            await db
              .update(users)
              .set({ image: profile.picture ?? existingUser.image })
              .where(eq(users.email, user.email!))
          }

          // If no account exists for this user with Google provider, create one
          const existingAccount = await db.query.accounts.findFirst({
            where: (accounts, { and, eq }) =>
              and(
                eq(accounts.userId, existingUser?.id ?? user.id!),
                eq(accounts.provider, "google"),
              ),
          })

          // If no existing Google account, create a new account
          if (!existingAccount) {
            await db.insert(accounts).values({
              userId: existingUser?.id ?? user.id!,
              type: "oauth",
              provider: "google",
              providerAccountId: account.providerAccountId,
              access_token: account.access_token,
              token_type: account.token_type,
              scope: account.scope,
              id_token: account.id_token,
            })
          }

          return true
        } catch (error) {
          console.error("Google Sign-In Error:", error)
          return false
        }
      }

      // Handle email provider
      if (account?.provider === "resend" && user.email) {
        try {
          // Find the user by email
          const existingUser = await db.query.users.findFirst({
            where: eq(users.email, user.email),
          })

          // If no user exists, create a new user with a default name
          if (!existingUser) {
            const username = user.email.split("@")[0]
            await db.insert(users).values({
              name: username,
              email: user.email,
              image: `${env.NEXT_PUBLIC_APP_URL}/logo.svg`,
              phone: "",
              status: "ACTIVE",
            } as Users)
          }

          return true
        } catch (error) {
          console.error("Email Sign-In Error:", error)
          return false
        }
      }

      return true
    },
    async session({ session, user }) {
      let blurImage: string | null = null
      if (user.image) {
        blurImage = await getBlurPlaceholder(user.image)
      }

      const vendor = await db.query.vendors.findFirst({
        where: eq(vendors.addedById, user.id),
      })

      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,
          role: user.role,
          blurImageDataURL: blurImage,
          hasVendor: !!vendor,
          vendorId: vendor?.id,
          vendorStatus: vendor?.status,
        },
      }
    },
  },
} satisfies NextAuthConfig
