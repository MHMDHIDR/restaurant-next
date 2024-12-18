import { z } from "zod"

export const menuCategorySchema = z.object({
  vendorId: z.string().nonempty("Vendor ID is required"),
  name: z.string().nonempty("Category name is required"),
  description: z.string().optional(),
  image: z.string().nonempty("Image is required"),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().nonnegative().default(0),
})

export type MenuCategoryFormValues = z.infer<typeof menuCategorySchema>
