"use client"

import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js"
import { Bar, Doughnut, Line, Pie } from "react-chartjs-2"
import type { ChartConfig } from "@/types/chart"

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
)

interface ChartRendererProps {
  config: ChartConfig
  className?: string
}

export function ChartRenderer({ config, className = "" }: ChartRendererProps) {
  // Default color palette
  const defaultColors = [
    "#3B82F6", // blue-500
    "#EF4444", // red-500
    "#10B981", // emerald-500
    "#F59E0B", // amber-500
    "#8B5CF6", // violet-500
    "#06B6D4", // cyan-500
    "#F97316", // orange-500
    "#84CC16", // lime-500
  ]

  // Prepare chart data
  const chartData = {
    labels: config.labels ?? config.data.map(item => item.label),
    datasets: config.datasets ?? [
      {
        label: config.title,
        data: config.data.map(item => item.value),
        backgroundColor: config.data.map(
          (item, index) => item.color ?? defaultColors[index % defaultColors.length],
        ),
        borderColor: config.data.map(
          (item, index) => item.color ?? defaultColors[index % defaultColors.length],
        ),
        borderWidth: config.type === "line" ? 2 : 1,
      },
    ],
  }

  // Default options
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: config.title,
      },
    },
  } as const

  // Render appropriate chart type
  const renderChart = () => {
    switch (config.type) {
      case "bar":
        return <Bar data={chartData} options={defaultOptions} />
      case "line":
        return <Line data={chartData} options={defaultOptions} />
      case "doughnut":
        return <Doughnut data={chartData} options={defaultOptions} />
      case "pie":
        return <Pie data={chartData} options={defaultOptions} />
      default:
        return <div className="text-muted-foreground">Unsupported chart type</div>
    }
  }

  return <div className={`w-full h-64 md:h-80 ${className}`}>{renderChart()}</div>
}
