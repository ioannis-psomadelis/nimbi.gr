'use client'

import { useMemo, useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ComposedChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { NarrativeDay } from '../../../lib/forecast/types'
import { WeatherIcon } from '@/components/ui/weather-icon'

interface WeekChartProps {
  days: NarrativeDay[]
}

// Fixed colors that work in both display and image capture
const COLORS = {
  high: '#f97316', // orange-500
  low: '#3b82f6',  // blue-500
  precip: '#06b6d4', // cyan-500
  wind: '#a855f7', // purple-500
  grid: '#374151', // gray-700
  text: '#9ca3af', // gray-400
}

// Locale mapping for date formatting
const LOCALE_MAP: Record<string, string> = {
  en: 'en-US',
  el: 'el-GR',
}

// Custom tooltip - defined outside component to prevent recreation
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null

  const data = payload[0].payload
  return (
    <div className="bg-popover text-popover-foreground rounded-xl p-3 shadow-lg min-w-[140px] border border-border">
      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border">
        <WeatherIcon name={data.icon} size="lg" />
        <span className="font-semibold text-sm">{label}</span>
      </div>
      {/* Temperature */}
      <div className="text-xs mb-1.5 flex justify-between">
        <span className="text-muted-foreground">Temp</span>
        <span>
          <span className="font-semibold" style={{ color: COLORS.high }}>{data.high}°</span>
          <span className="text-muted-foreground"> / </span>
          <span className="font-semibold" style={{ color: COLORS.low }}>{data.low}°</span>
        </span>
      </div>
      {/* Feels like */}
      {data.feelsHigh !== data.high && (
        <div className="text-[11px] mb-1.5 flex justify-between text-muted-foreground">
          <span>Feels</span>
          <span>{data.feelsHigh}° / {data.feelsLow}°</span>
        </div>
      )}
      {/* Precipitation */}
      {data.precip > 0 && (
        <div className="text-xs mb-1 flex justify-between items-center">
          <span style={{ color: COLORS.precip }}>💧 Rain</span>
          <span className="font-medium" style={{ color: COLORS.precip }}>{data.precip.toFixed(1)} mm</span>
        </div>
      )}
      {/* Wind */}
      <div className="text-xs mb-1 flex justify-between items-center">
        <span style={{ color: COLORS.wind }}>💨 Wind</span>
        <span className="font-medium" style={{ color: COLORS.wind }}>{data.wind} km/h</span>
      </div>
      {/* UV Index */}
      {data.uv > 0 && (
        <div className="text-xs flex justify-between items-center">
          <span className="text-amber-400 flex items-center gap-1"><WeatherIcon name="clear-day" size="xs" /> UV</span>
          <span className="font-medium text-amber-400">{data.uv}</span>
        </div>
      )}
    </div>
  )
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
      precip: day.precipTotal,
      wind: day.windMax,
      windAvg: day.windAvg,
      feelsHigh: day.feelsLikeHigh,
      feelsLow: day.feelsLikeLow,
      uv: day.uvMax,
      icon: day.icon,
    }))
  }, [days, locale])

  const minTemp = Math.min(...days.map((d) => d.tempLow)) - 2
  const maxTemp = Math.max(...days.map((d) => d.tempHigh)) + 2

  const maxPrecip = Math.max(...days.map((d) => d.precipTotal), 1)

  // Create lookup map for efficient icon access in tick component
  const chartDataMap = useMemo(
    () => new Map(chartData.map((d) => [d.name, d])),
    [chartData]
  )

  // Memoized X-axis tick with icon
  const CustomXAxisTick = useCallback(
    ({ x, y, payload }: any) => {
      const day = chartDataMap.get(payload.value)
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
            <foreignObject x={-12} y={20} width={24} height={24}>
              <WeatherIcon name={day.icon} size="md" />
            </foreignObject>
          )}
        </g>
      )
    },
    [chartDataMap]
  )

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={200}>
        <ComposedChart
          data={chartData}
          margin={{ top: 10, right: 20, left: 0, bottom: 35 }}
        >
          <defs>
            {/* High temp gradient - warmer, more vibrant */}
            <linearGradient id="tempHighGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLORS.high} stopOpacity={0.5} />
              <stop offset="50%" stopColor={COLORS.high} stopOpacity={0.2} />
              <stop offset="100%" stopColor={COLORS.high} stopOpacity={0.02} />
            </linearGradient>
            {/* Low temp gradient - cooler */}
            <linearGradient id="tempLowGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLORS.low} stopOpacity={0.4} />
              <stop offset="50%" stopColor={COLORS.low} stopOpacity={0.15} />
              <stop offset="100%" stopColor={COLORS.low} stopOpacity={0.02} />
            </linearGradient>
            {/* Precip gradient - glass effect */}
            <linearGradient id="precipGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLORS.precip} stopOpacity={0.9} />
              <stop offset="50%" stopColor={COLORS.precip} stopOpacity={0.6} />
              <stop offset="100%" stopColor={COLORS.precip} stopOpacity={0.3} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke={COLORS.grid}
            strokeOpacity={0.3}
          />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={<CustomXAxisTick />}
            interval={0}
          />
          <YAxis
            yAxisId="temp"
            domain={[minTemp, maxTemp]}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 9, fill: COLORS.text }}
            tickFormatter={(value) => `${value}°`}
            width={25}
          />
          <YAxis
            yAxisId="precip"
            orientation="right"
            domain={[0, Math.max(maxPrecip * 1.5, 10)]}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 8, fill: COLORS.precip }}
            tickFormatter={(value) => value > 0 ? `${Math.round(value)}` : ''}
            width={20}
          />
          <Tooltip content={<ChartTooltip />} cursor={false} />
          {/* Precipitation bars */}
          <Bar
            yAxisId="precip"
            dataKey="precip"
            fill="url(#precipGradient)"
            radius={[6, 6, 0, 0]}
            maxBarSize={24}
          />
          {/* Wind line - subtle dashed */}
          <Line
            yAxisId="precip"
            type="monotone"
            dataKey="wind"
            stroke={COLORS.wind}
            strokeWidth={1.5}
            strokeDasharray="4 3"
            dot={false}
            opacity={0.6}
          />
          {/* Low temps area */}
          <Area
            yAxisId="temp"
            type="natural"
            dataKey="low"
            stroke={COLORS.low}
            strokeWidth={2.5}
            fill="url(#tempLowGradient)"
            dot={{
              fill: COLORS.low,
              strokeWidth: 2,
              stroke: '#1a1a1a',
              r: 4,
            }}
            activeDot={{
              fill: COLORS.low,
              strokeWidth: 2,
              stroke: '#fff',
              r: 6,
            }}
          />
          {/* High temps area */}
          <Area
            yAxisId="temp"
            type="natural"
            dataKey="high"
            stroke={COLORS.high}
            strokeWidth={2.5}
            fill="url(#tempHighGradient)"
            dot={{
              fill: COLORS.high,
              strokeWidth: 2,
              stroke: '#1a1a1a',
              r: 4,
            }}
            activeDot={{
              fill: COLORS.high,
              strokeWidth: 2,
              stroke: '#fff',
              r: 6,
            }}
          />
        </ComposedChart>
      </ResponsiveContainer>
      {/* Legend */}
      <div className="flex items-center justify-center gap-2 mt-1 text-[9px]" style={{ color: COLORS.text }}>
        <span className="flex items-center gap-0.5">
          <span className="w-2 h-0.5 rounded-full inline-block" style={{ backgroundColor: COLORS.high }} />
          {t('tempHigh', 'High')}
        </span>
        <span className="flex items-center gap-0.5">
          <span className="w-2 h-0.5 rounded-full inline-block" style={{ backgroundColor: COLORS.low }} />
          {t('tempLow', 'Low')}
        </span>
        <span className="flex items-center gap-0.5">
          <span className="w-1.5 h-1.5 rounded-sm inline-block" style={{ backgroundColor: COLORS.precip, opacity: 0.7 }} />
          mm
        </span>
        <span className="flex items-center gap-0.5">
          <span className="w-2 h-0 border-t border-dashed inline-block" style={{ borderColor: COLORS.wind }} />
          {t('wind', 'Wind')}
        </span>
      </div>
    </div>
  )
}
