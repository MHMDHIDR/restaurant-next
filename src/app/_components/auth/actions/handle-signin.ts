"use server"

import { signInSchema } from "@/app/schemas/auth"
import { signIn } from "@/server/auth"

type SignInType = {
  message?: string | string[]
  success?: boolean
}

export async function handleSignin(_: SignInType, formData: FormData): Promise<SignInType> {
  const validatedFields = signInSchema.safeParse({
    email: formData.get("email"),
  })

  if (!validatedFields.success) {
    return {
      message: validatedFields.error.flatten().fieldErrors.email || "Invalid email",
    }
  }

  try {
    await signIn("resend", {
      email: validatedFields.data.email,
      redirect: false,
      redirectTo: "/dashboard",
    })

    return { success: true, message: "Sign in link sent to your email" }
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}
