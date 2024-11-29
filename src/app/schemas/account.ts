import { z } from "zod"

export const accountFormSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address").readonly(),
  image: z.string().url("Invalid URL").optional(),
})

export type AccountFormValues = z.infer<typeof accountFormSchema>
