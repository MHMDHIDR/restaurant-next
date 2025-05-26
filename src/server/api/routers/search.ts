import { eq, ilike, or } from "drizzle-orm"
import { z } from "zod"
import { APP_LOGO } from "@/lib/constants"
import { getBlurPlaceholder } from "@/lib/optimize-image"
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc"
import { menuCategories, menuItems, vendors } from "@/server/db/schema"

export const searchRouter = createTRPCRouter({
  search: publicProcedure
    .input(z.object({ query: z.string(), limit: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      const searchTerm = `%${input.query}%`
      const limit = input.limit ?? undefined

      // Search for vendors
      const matchedVendors = await ctx.db.query.vendors.findMany({
        where: or(ilike(vendors.name, searchTerm), ilike(vendors.description, searchTerm)),
        ...(limit && { limit }),
      })
      const matchedVendorsWithBlugLogo = matchedVendors.map(async vendor => {
        const blurVendorLogo = await getBlurPlaceholder(vendor.logo, 50, 50)
        return { ...vendor, blurLogo: blurVendorLogo }
      })

      // Search for categories
      const matchedCategories = await ctx.db.query.menuCategories.findMany({
        where: or(
          ilike(menuCategories.name, searchTerm),
          ilike(menuCategories.description, searchTerm),
        ),
        ...(limit && { limit }),
      })
      const matchedCategoriesWithBlugLogo = matchedCategories.map(async category => {
        const blurCategoryLogo = await getBlurPlaceholder(category.image ?? APP_LOGO, 50, 50)
        return { ...category, blurLogo: blurCategoryLogo }
      })

      // Search for menu items with their associated vendors
      const matchedMenuItems = await ctx.db
        .select({
          menuItem: menuItems,
          vendor: {
            id: vendors.id,
            name: vendors.name,
            slug: vendors.slug,
          },
        })
        .from(menuItems)
        .innerJoin(menuCategories, eq(menuItems.categoryId, menuCategories.id))
        .innerJoin(vendors, eq(menuCategories.vendorId, vendors.id))
        .where(or(ilike(menuItems.name, searchTerm), ilike(menuItems.description, searchTerm)))
        .limit(limit ?? -1) // -1 means no limit in Drizzle ORM
      const matchedMenuItemsWithBlugLogo = matchedMenuItems.map(async item => {
        const blurImage = await getBlurPlaceholder(item.menuItem.image, 50, 50)
        return { ...item.menuItem, vendor: item.vendor, blurImage }
      })

      return {
        vendors: await Promise.all(matchedVendorsWithBlugLogo),
        categories: await Promise.all(matchedCategoriesWithBlugLogo),
        menuItems: await Promise.all(matchedMenuItemsWithBlugLogo),
      }
    }),
})
