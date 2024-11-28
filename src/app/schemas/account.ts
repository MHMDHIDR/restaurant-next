import { z } from "zod"

export const accountFormSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  nickname: z.string().min(1, "Nickname is required"),
  email: z.string().email("Invalid email address").readonly(),
  phoneNumber: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number")
    .readonly(),
})

export type AccountFormValues = z.infer<typeof accountFormSchema>
