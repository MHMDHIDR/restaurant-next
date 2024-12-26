"use server"

import { signInSchema } from "@/app/schemas/auth"
import { signIn } from "@/server/auth"

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
    await signIn("resend", { email, redirect: false, redirectTo: state.callbackUrl })

    return { success: true, message: "Check Your Email for a Sign in link." }
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}
