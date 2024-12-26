"use server"

import { eq } from "drizzle-orm"
import { signInSchema } from "@/app/schemas/auth"
import { signIn } from "@/server/auth"
import { db } from "@/server/db"
import { users } from "@/server/db/schema"

type SignInType = {
  message?: string | string[]
  success?: boolean
  callbackUrl?: string
}

export async function handleSignin(state: SignInType, formData: FormData): Promise<SignInType> {
  const validatedFields = signInSchema.safeParse({
    email: formData.get("email"),
  })

  if (!validatedFields.success) {
    return {
      message: validatedFields.error.flatten().fieldErrors.email ?? "Invalid email",
    }
  }

  const { email } = validatedFields.data

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    })

    const redirectTo =
      user?.role === "VENDOR_ADMIN" ? "/vendor-manager" : (state.callbackUrl ?? "/")

    await signIn("resend", { email, redirect: false, redirectTo })

    return { success: true, message: "Check Your Email for a Sign in link." }
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}
