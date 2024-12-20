import { isValidPhoneNumber } from "libphonenumber-js"
import { z } from "zod"

export const vendorStatus = z.enum(["PENDING", "ACTIVE", "DEACTIVATED"])

export const vendorFormSchema = z.object({
  id: z.string().uuid().optional(),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(255, "Name cannot exceed 255 characters"),
  coverImage: z.string(),
  logo: z.string(),
  addedById: z.string(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  status: vendorStatus.optional(),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z
    .string()
    .min(2, "City must be at least 2 characters")
    .max(100, "City cannot exceed 100 characters"),
  state: z
    .string()
    .min(2, "State must be at least 2 characters")
    .max(100, "State cannot exceed 100 characters"),
  postalCode: z
    .string()
    .min(5, "Postal code must be at least 5 characters")
    .max(20, "Postal code cannot exceed 20 characters"),
  phone: z.string().refine(isValidPhoneNumber, {
    message: "Please provide a valid phone number",
  }),
  email: z.string().email("Invalid email address").max(255, "Email cannot exceed 255 characters"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  openingHours: z.record(
    z.string(),
    z.object({
      open: z.string(),
      close: z.string(),
    }),
  ),
  cuisineTypes: z.array(z.string()).min(1, "Select at least one cuisine type"),
  deliveryRadius: z.number().min(1, "Delivery radius must be at least 1km"),
  minimumOrder: z.number().min(0, "Minimum order must be at least 0"),
})

export type VendorFormValues = z.infer<typeof vendorFormSchema>
