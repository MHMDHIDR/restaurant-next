import { z } from "zod"

export const menuCategorySchema = z.object({
  name: z.string().nonempty("Category name is required"),
  description: z.string().optional(),
  image: z.string().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().nonnegative().default(0),
})
export type MenuCategoryFormValues = z.infer<typeof menuCategorySchema>

export const updateCategorySchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
})
