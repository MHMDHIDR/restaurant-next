import { z } from "zod"

const vendorStatus = z.enum(["PENDING", "ACTIVE", "SUSPENDED", "INACTIVE"])

export const vendorFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  logo: z.string().optional(),
  coverImage: z.string().min(1, "Cover image is required"),
  status: vendorStatus.optional(),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  state: z.string().min(2, "State must be at least 2 characters"),
  postalCode: z.string().min(5, "Postal code must be at least 5 characters"),
  phone: z.string().min(10, "Phone must be at least 10 characters"),
  email: z.string().email("Invalid email address"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  openingHours: z.record(z.string(), z.object({ open: z.string(), close: z.string() })),
  cuisineTypes: z.array(z.string()).min(1, "Select at least one cuisine type"),
  deliveryRadius: z.number().min(1, "Delivery radius must be at least 1km"),
  minimumOrder: z.number().min(0, "Minimum order must be at least 0"),
})

export type VendorFormValues = z.infer<typeof vendorFormSchema>
