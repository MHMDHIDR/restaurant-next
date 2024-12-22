import { TRPCError } from "@trpc/server"
import { eq } from "drizzle-orm"
import { z } from "zod"
import { createSlug } from "@/lib/create-slug"
import { extractS3FileName } from "@/lib/extract-s3-filename"
import { createCaller } from "@/server/api/root"
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { menuItems } from "@/server/db/schema"
import type { MenuItems } from "@/server/db/schema"

const menuItemSchema = z.object({
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

export const menuItemRouter = createTRPCRouter({
  createMenuItem: protectedProcedure.input(menuItemSchema).mutation(async ({ ctx, input }) => {
    return await ctx.db.transaction(async tx => {
      const category = await tx.query.menuCategories.findFirst({
        where: (categories, { eq }) => eq(categories.id, input.categoryId),
      })

      if (!category) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Category not found" })
      }

      // Prepare the database input with correct types
      const dbInput: Omit<MenuItems, "id"> = {
        categoryId: input.categoryId,
        name: input.name,
        slug: createSlug(input.name),
        description: input.description,
        price: input.price.toString(),
        image: input.image,
        isAvailable: input.isAvailable,
        preparationTime: input.preparationTime,
        allergens: input.allergens,
        nutritionalInfo: input.nutritionalInfo,
        addons: input.addons ?? [],
      }

      const [createdItem] = await tx.insert(menuItems).values(dbInput).returning()

      return { success: true, createdItem }
    })
  }),

  getMenuItems: protectedProcedure
    .input(z.object({ categoryId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.menuItems.findMany({
        where: (items, { eq }) => eq(items.categoryId, input.categoryId),
      })
    }),

  getMenuItemsByVendorId: protectedProcedure
    .input(z.object({ vendorId: z.string() }))
    .query(async ({ ctx, input }) => {
      const items = await ctx.db.query.menuItems.findMany({
        with: { category: { columns: { vendorId: true } } },
      })
      return items.filter(item => item.category.vendorId === input.vendorId)
    }),

  deleteMenuItem: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const menuItem = await ctx.db.query.menuItems.findFirst({
        where: (menuItems, { eq }) => eq(menuItems.id, input.id),
      })

      if (!menuItem) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Menu item not found" })
      }

      // Delete the image from S3 if it exists
      if (menuItem.image) {
        const fileKey = extractS3FileName(menuItem.image)
        if (fileKey) {
          const caller = createCaller(ctx)
          await caller.S3.deleteFile({ fileName: fileKey })
        }
      }

      await ctx.db.delete(menuItems).where(eq(menuItems.id, input.id))

      return { success: true }
    }),
})
