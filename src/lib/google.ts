"use server"

import { env } from "@/env"

type fetchResponseType = {
  status: string
  predictions: { description: string; place_id: string }[]
  error_message?: string
}

export const autocomplete = async (
  input: string,
): Promise<{ description: string; place_id: string }[]> => {
  if (!input) return []

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
        input,
      )}&types=address&key=${env.GOOGLE_API_KEY}`,
    )

    const data: fetchResponseType = await response.json()

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
