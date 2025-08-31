export type ChartType = "bar" | "line" | "doughnut" | "pie"

export interface ChartDataPoint {
  label: string
  value: number
  color?: string
}

export interface ChartConfig {
  type: ChartType
  title: string
  data: ChartDataPoint[]
  labels?: string[]
  datasets?: {
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string | string[]
    borderWidth?: number
  }[]
  options?: {
    responsive?: boolean
    maintainAspectRatio?: boolean
    plugins?: {
      legend?: {
        position?: "top" | "bottom" | "left" | "right"
      }
      title?: {
        display?: boolean
        text?: string
      }
    }
    scales?: Record<string, unknown>
  }
}

export interface AIChartResponse {
  hasChart: boolean
  chartConfig?: ChartConfig
  textContent: string
}

export interface OpenAIStructuredResponse {
  responseType: "text" | "chart" | "text_and_chart"
  textContent?: string
  chartData?: ChartConfig
}
