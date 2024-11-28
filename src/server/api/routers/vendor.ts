import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { vendors } from "@/server/db/schema";
import { desc, sql } from "drizzle-orm";

// Constant for Earth's radius in kilometers
const EARTH_RADIUS_KM = 6371;

export const vendorRouter = createTRPCRouter({
  getFeatured: publicProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(20).default(6),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 6;

      return await ctx.db.query.vendors.findMany({
        where: (vendors, { eq }) => eq(vendors.status, "ACTIVE"),
        orderBy: [desc(vendors.averageRating), desc(vendors.createdAt)],
        limit: limit,
      });
    }),

  getNearby: publicProcedure
    .input(
      z.object({
        latitude: z.number(),
        longitude: z.number(),
        radius: z.number().min(1).max(50).default(10), // kilometers
        limit: z.number().min(1).max(20).default(10),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { latitude, longitude, radius, limit } = input;

      // Improved Haversine formula with more robust distance calculation
      const nearbyVendorsQuery = await ctx.db.execute(sql`
        WITH nearby_vendors AS (
          SELECT
            *,
            ${EARTH_RADIUS_KM} * 2 * ASIN(
              SQRT(
                POWER(SIN((RADIANS(${latitude}) - RADIANS(latitude)) / 2), 2) +
                COS(RADIANS(${latitude})) * COS(RADIANS(latitude)) *
                POWER(SIN((RADIANS(${longitude}) - RADIANS(longitude)) / 2), 2)
              )
            ) AS distance_km
          FROM restaurant_vendor
          WHERE
            status = 'ACTIVE' AND
            latitude IS NOT NULL AND
            longitude IS NOT NULL
        )
        SELECT
          *
        FROM nearby_vendors
        WHERE distance_km <= ${radius}
        ORDER BY distance_km
        LIMIT ${limit}
      `);

      // Type-safe transformation of raw query results
      return nearbyVendorsQuery.map((vendor) => ({
        ...vendor,
        distance: Number(vendor.distance_km),
      }));
    }),
});

export type VendorRouter = typeof vendorRouter;
