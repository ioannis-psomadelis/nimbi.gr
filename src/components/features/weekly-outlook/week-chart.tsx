'use client'

import { useMemo, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
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

// Fixed colors that work in both display and image capture
const COLORS = {
  high: '#f97316', // orange-500
  low: '#3b82f6',  // blue-500
  grid: '#374151', // gray-700
  text: '#9ca3af', // gray-400
}

// Locale mapping for date formatting
const LOCALE_MAP: Record<string, string> = {
  en: 'en-US',
  el: 'el-GR',
}

export function WeekChart({ days }: WeekChartProps) {
  const { t, i18n } = useTranslation()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const locale = mounted ? (LOCALE_MAP[i18n.language] || 'en-US') : 'en-US'

  const chartData = useMemo(() => {
    return days.map((day) => ({
      name: day.date.toLocaleDateString(locale, { weekday: 'short' }),
      high: day.tempHigh,
      low: day.tempLow,
      icon: day.icon,
    }))
  }, [days, locale])

  const minTemp = Math.min(...days.map((d) => d.tempLow)) - 2
  const maxTemp = Math.max(...days.map((d) => d.tempHigh)) + 2

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div
          style={{
            backgroundColor: '#f5f5f5',
            color: '#1a1a1a',
            borderRadius: '8px',
            padding: '8px 12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '18px' }}>{data.icon}</span>
            <span style={{ fontWeight: 500 }}>{label}</span>
          </div>
          <div style={{ fontSize: '14px' }}>
            <span style={{ fontWeight: 500, color: COLORS.high }}>{data.high}&deg;</span>
            <span style={{ color: '#666' }}> / </span>
            <span style={{ fontWeight: 500, color: COLORS.low }}>{data.low}&deg;</span>
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
          fill={COLORS.text}
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
            {/* High temp gradient */}
            <linearGradient id="tempHighGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.high} stopOpacity={0.4} />
              <stop offset="95%" stopColor={COLORS.high} stopOpacity={0.05} />
            </linearGradient>
            {/* Low temp gradient */}
            <linearGradient id="tempLowGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.low} stopOpacity={0.3} />
              <stop offset="95%" stopColor={COLORS.low} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke={COLORS.grid}
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
            tick={{ fontSize: 11, fill: COLORS.text }}
            tickFormatter={(value) => `${value}°`}
          />
          <Tooltip content={<CustomTooltip />} cursor={false} />
          {/* Low temps area */}
          <Area
            type="monotone"
            dataKey="low"
            stroke={COLORS.low}
            strokeWidth={2}
            fill="url(#tempLowGradient)"
            dot={{
              fill: COLORS.low,
              strokeWidth: 0,
              r: 3,
            }}
            activeDot={{
              fill: COLORS.low,
              strokeWidth: 0,
              r: 5,
            }}
          />
          {/* High temps area */}
          <Area
            type="monotone"
            dataKey="high"
            stroke={COLORS.high}
            strokeWidth={2}
            fill="url(#tempHighGradient)"
            dot={{
              fill: COLORS.high,
              strokeWidth: 0,
              r: 4,
            }}
            activeDot={{
              fill: COLORS.high,
              strokeWidth: 0,
              r: 6,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
      {/* Legend */}
      <div className="flex items-center justify-center gap-6 -mt-2 text-xs" style={{ color: COLORS.text }}>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 rounded-full" style={{ backgroundColor: COLORS.high }} />
          <span>{t('tempHigh', 'High')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 rounded-full" style={{ backgroundColor: COLORS.low }} />
          <span>{t('tempLow', 'Low')}</span>
        </div>
      </div>
    </div>
  )
}
