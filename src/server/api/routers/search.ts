import { eq, ilike, or } from "drizzle-orm"
import { z } from "zod"
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc"
import { menuCategories, menuItems, vendors } from "@/server/db/schema"

export const searchRouter = createTRPCRouter({
  search: publicProcedure.input(z.object({ query: z.string() })).query(async ({ ctx, input }) => {
    const searchTerm = `%${input.query}%`

    // Search for vendors
    const matchedVendors = await ctx.db.query.vendors.findMany({
      where: or(ilike(vendors.name, searchTerm), ilike(vendors.description, searchTerm)),
    })

    // Search for categories
    const matchedCategories = await ctx.db.query.menuCategories.findMany({
      where: or(
        ilike(menuCategories.name, searchTerm),
        ilike(menuCategories.description, searchTerm),
      ),
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

    return {
      vendors: matchedVendors,
      categories: matchedCategories,
      menuItems: matchedMenuItems,
    }
  }),
})
