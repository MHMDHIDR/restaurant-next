import type { ChartConfig, ChartType, OpenAIStructuredResponse } from "@/types/chart"

/**
 * Validates if a chart configuration is valid
 */
export function validateChartConfig(config: unknown): config is ChartConfig {
  if (!config || typeof config !== "object") return false

  const validTypes: ChartType[] = ["bar", "line", "doughnut", "pie"]
  const configObj = config as Record<string, unknown>

  return (
    typeof configObj.title === "string" &&
    typeof configObj.type === "string" &&
    validTypes.includes(configObj.type as ChartType) &&
    Array.isArray(configObj.data) &&
    configObj.data.every((item: unknown) => {
      if (!item || typeof item !== "object") return false
      const itemObj = item as Record<string, unknown>
      return typeof itemObj.label === "string" && typeof itemObj.value === "number"
    })
  )
}

/**
 * Generates default chart colors based on data length
 */
export function generateChartColors(length: number): string[] {
  const baseColors = [
    "#3B82F6", // blue-500
    "#EF4444", // red-500
    "#10B981", // emerald-500
    "#F59E0B", // amber-500
    "#8B5CF6", // violet-500
    "#06B6D4", // cyan-500
    "#F97316", // orange-500
    "#84CC16", // lime-500
    "#EC4899", // pink-500
    "#6B7280", // gray-500
  ]

  const colors: string[] = []
  for (let i = 0; i < length; i++) {
    colors.push(baseColors[i % baseColors.length]!)
  }

  return colors
}

/**
 * Suggests the best chart type based on data characteristics
 */
export function suggestChartType(data: { label: string; value: number }[]): ChartType {
  if (data.length <= 2) return "bar"
  if (data.length > 10) return "line"

  // Check if values represent parts of a whole (percentages)
  const total = data.reduce((sum, item) => sum + item.value, 0)
  const allLessThan100 = data.every(item => item.value <= 100)
  const sumNear100 = Math.abs(total - 100) < 5

  if (allLessThan100 && sumNear100) {
    return "pie"
  }

  // Check if labels suggest time series
  const timeIndicators = ["day", "week", "month", "year", "jan", "feb", "mar", "apr", "may", "jun"]
  const hasTimeLabels = data.some(item =>
    timeIndicators.some(indicator => item.label.toLowerCase().includes(indicator)),
  )

  if (hasTimeLabels) return "line"

  return "bar"
}

/**
 * Formats chart data for display
 */
export function formatChartData(config: ChartConfig): ChartConfig {
  return {
    ...config,
    data: config.data.map((item, index) => ({
      ...item,
      color: item.color ?? generateChartColors(config.data.length)[index],
    })),
  }
}

/**
 * Safely parses an AI response that might contain chart data
 */
export function parseAIResponse(response: string): {
  hasChart: boolean
  textContent: string
  chartConfig?: ChartConfig
} {
  try {
    // Try to parse as JSON first
    const parsed = JSON.parse(response) as OpenAIStructuredResponse

    if (parsed.responseType === "chart" && parsed.chartData) {
      return {
        hasChart: true,
        textContent: "",
        chartConfig: validateChartConfig(parsed.chartData) ? parsed.chartData : undefined,
      }
    }

    if (parsed.responseType === "text_and_chart" && parsed.chartData) {
      return {
        hasChart: true,
        textContent: parsed.textContent ?? "",
        chartConfig: validateChartConfig(parsed.chartData) ? parsed.chartData : undefined,
      }
    }

    return {
      hasChart: false,
      textContent: parsed.textContent ?? response,
    }
  } catch {
    // If parsing fails, look for JSON blocks in the response
    const jsonRegex = /```json\s*([\s\S]*?)\s*```/
    const jsonMatch = jsonRegex.exec(response)
    if (jsonMatch?.[1]) {
      try {
        const parsed = JSON.parse(jsonMatch[1]) as OpenAIStructuredResponse

        // Extract text content outside of JSON block
        const textBeforeJson = response.substring(0, response.indexOf("```json")).trim()
        const fullJsonBlockRegex = /```json\s*[\s\S]*?\s*```/
        const fullJsonMatch = fullJsonBlockRegex.exec(response)
        const textAfterJson = fullJsonMatch
          ? response.substring(response.indexOf("```") + fullJsonMatch[0].length).trim()
          : ""
        const extractedText = [textBeforeJson, textAfterJson].filter(Boolean).join("\n\n")

        if (parsed.chartData && validateChartConfig(parsed.chartData)) {
          return {
            hasChart: true,
            textContent: parsed.textContent ?? extractedText,
            chartConfig: parsed.chartData,
          }
        }
      } catch {
        // Continue to fallback
      }
    }

    // Fallback to plain text
    return {
      hasChart: false,
      textContent: response,
    }
  }
}
