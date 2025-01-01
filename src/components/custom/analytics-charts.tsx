"use client"

import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js"
import { useEffect, useState } from "react"
import { Line } from "react-chartjs-2"
import { LoadingCard } from "./data-table/loading"

type AnalyticsChartsProps = {
  chartData: {
    labels: string[] // Dates
    data: number[] // Counts
  }
}

ChartJS.register(LineElement, PointElement, LinearScale, Title, Tooltip, Legend, CategoryScale)

export function AnalyticsCharts({ chartData }: AnalyticsChartsProps) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (chartData.labels.length > 0 && chartData.data.length > 0) {
      setIsLoading(false)
    }
  }, [chartData])

  const lineChartData = {
    labels: chartData.labels,
    datasets: [
      {
        label: "",
        data: chartData.data,
        backgroundColor: "rgba(75,192,192,1)", // Fill color for label indicator
        borderColor: "rgba(75,192,192,1)", // Line color
      },
    ],
  }

  const options = {
    responsive: true,
    animation: { duration: 1000 },
    scales: {
      y: {
        beginAtZero: true, // Start the Y-axis at 0
        ticks: { stepSize: 1 },
      },
    },
  }

  return (
    <div className="my-8">
      <h3 className="text-lg font-semibold">Orders Count Over Time</h3>
      {isLoading ? (
        <LoadingCard renderedSkeletons={chartData.data.length} className="h-20" />
      ) : (
        <Line data={lineChartData} options={options} />
      )}
    </div>
  )
}
