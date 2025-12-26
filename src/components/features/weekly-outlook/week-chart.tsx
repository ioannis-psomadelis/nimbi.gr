import { useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { NarrativeDay } from '../../../lib/forecast/types'

interface WeekChartProps {
  days: NarrativeDay[]
}

export function WeekChart({ days }: WeekChartProps) {
  const chartData = useMemo(() => {
    return days.map((day) => ({
      name: day.dayOfWeek.slice(0, 3),
      high: day.tempHigh,
      low: day.tempLow,
      icon: day.icon,
    }))
  }, [days])

  const minTemp = Math.min(...days.map((d) => d.tempLow)) - 2
  const maxTemp = Math.max(...days.map((d) => d.tempHigh)) + 2

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-foreground text-background rounded-lg px-3 py-2 shadow-lg border-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{data.icon}</span>
            <span className="font-medium">{label}</span>
          </div>
          <div className="text-sm">
            <span className="font-medium">{data.high}&deg;</span>
            <span className="text-background/70"> / {data.low}&deg;</span>
          </div>
        </div>
      )
    }
    return null
  }

  // Custom X-axis tick with icon
  const CustomXAxisTick = ({ x, y, payload }: any) => {
    const day = chartData.find((d) => d.name === payload.value)
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={16}
          textAnchor="middle"
          className="fill-muted-foreground text-xs"
          style={{ fontSize: '11px' }}
        >
          {payload.value}
        </text>
        {day && (
          <text x={0} y={0} dy={34} textAnchor="middle" style={{ fontSize: '14px' }}>
            {day.icon}
          </text>
        )}
      </g>
    )
  }

  return (
    <div className="w-full h-[180px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -20, bottom: 40 }}
        >
          <defs>
            {/* High temp gradient - works in both modes */}
            <linearGradient id="tempHighGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#f97316" stopOpacity={0.05} />
            </linearGradient>
            {/* Low temp gradient */}
            <linearGradient id="tempLowGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            className="stroke-border"
            strokeOpacity={0.5}
          />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={<CustomXAxisTick />}
            interval={0}
          />
          <YAxis
            domain={[minTemp, maxTemp]}
            axisLine={false}
            tickLine={false}
            className="text-muted-foreground"
            tick={{ fontSize: 11 }}
            tickFormatter={(value) => `${value}°`}
          />
          <Tooltip content={<CustomTooltip />} cursor={false} />
          {/* Low temps area */}
          <Area
            type="monotone"
            dataKey="low"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#tempLowGradient)"
            dot={{
              fill: '#3b82f6',
              strokeWidth: 0,
              r: 3,
            }}
            activeDot={{
              fill: '#3b82f6',
              strokeWidth: 0,
              r: 5,
            }}
          />
          {/* High temps area */}
          <Area
            type="monotone"
            dataKey="high"
            stroke="#f97316"
            strokeWidth={2}
            fill="url(#tempHighGradient)"
            dot={{
              fill: '#f97316',
              strokeWidth: 0,
              r: 4,
            }}
            activeDot={{
              fill: '#f97316',
              strokeWidth: 0,
              r: 6,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
      {/* Legend */}
      <div className="flex items-center justify-center gap-6 -mt-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 rounded-full bg-[#f97316]" />
          <span>High</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 rounded-full bg-[#3b82f6]" />
          <span>Low</span>
        </div>
      </div>
    </div>
  )
}
