import { isValidPhoneNumber } from "libphonenumber-js"
import { z } from "zod"

export const accountFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  email: z.string().email("Invalid email address").readonly().optional(),
  phone: z
    .string()
    .refine(isValidPhoneNumber, {
      message: "Please Provide a Valid Phone Number",
    })
    .optional(),
  theme: z.enum(["light", "dark"]).optional(),
  image: z.string().url("Invalid URL").optional(),
  status: z.enum(["PENDING", "ACTIVE", "SUSPENDED"]).optional(),
  deletedAt: z.date().optional(),
})

export type AccountFormValues = z.infer<typeof accountFormSchema>
