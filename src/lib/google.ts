"use server"

import { env } from "@/env"

export const autocomplete = async (input: string) => {
  if (!input) return []

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
        input,
      )}&types=address&key=${env.GOOGLE_API_KEY}`,
    )

    const data = await response.json()

    if (data.status === "OK") {
      return data.predictions
    }

    if (data.status === "ZERO_RESULTS") {
      return []
    }

    console.error("API Error status:", data.status)
    console.error("API Error message:", data.error_message)
    return []
  } catch (error) {
    console.error("Google Places API error:", error)
    return []
  }
}
