import { z } from "zod"

export const menuItemSchema = z.object({
  categoryId: z.string().nonempty("Category is required"),
  name: z.string().nonempty("Name is required"),
  description: z.string(),
  price: z.number().positive("Price must be greater than 0"),
  image: z.string(),
  isAvailable: z.boolean().default(true),
  preparationTime: z.number().int().positive(),
  allergens: z.array(z.string()),
  nutritionalInfo: z.object({
    calories: z.number().int(),
    protein: z.number().int(),
    carbs: z.number().int(),
    fat: z.number().int(),
  }),
  addons: z
    .array(
      z.object({
        toppingName: z.string(),
        toppingPrice: z.number().positive(),
      }),
    )
    .optional(),
})

export type MenuItemFormValues = z.infer<typeof menuItemSchema>
