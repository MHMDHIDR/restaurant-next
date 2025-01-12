import { isValidPhoneNumber } from "libphonenumber-js"
import { z } from "zod"

export const accountFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  email: z.string().email("Invalid email address").readonly().optional(),
  phone: z
    .string()
    .optional()
    .refine(
      value => {
        if (!value) return true // Skip validation if value is empty/undefined
        return isValidPhoneNumber(value)
      },
      { message: "Please Provide a Valid Phone Number" },
    ),
  theme: z.enum(["light", "dark"]).optional(),
  image: z.string().optional(),
  status: z.enum(["PENDING", "ACTIVE", "SUSPENDED"]).optional(),
  deletedAt: z.date().optional(),
})

export type AccountFormValues = z.infer<typeof accountFormSchema>
