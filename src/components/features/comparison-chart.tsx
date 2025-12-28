'use client'

import { memo, useMemo, useState } from 'react'
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartSkeleton } from '@/components/skeletons/chart-skeleton'
import { MODEL_CONFIG, MODELS } from '../../types/models'
import { transformToChartData } from '../../lib/utils/chart-data'
import type { WeatherResponse } from '../../types/weather'
import type { ModelId } from '../../types/models'

interface ComparisonChartProps {
  models: { model: ModelId; data: WeatherResponse | undefined }[]
  variable: 'temperature_2m' | 'precipitation' | 'wind_speed_10m' | 'pressure_msl'
  title: string
  unit: string
  isLoading?: boolean
}

// Custom tooltip component
function CustomTooltip({ active, payload, label, unit }: any) {
  if (!active || !payload?.length) return null

  // Sort by value descending
  const sortedPayload = [...payload].sort((a, b) => (b.value || 0) - (a.value || 0))

  return (
    <div className="bg-card border border-border rounded-xl shadow-lg p-3 min-w-[160px]">
      <p className="text-xs font-medium text-foreground mb-2 pb-2 border-b border-border">
        {label}
      </p>
      <div className="space-y-1.5">
        {sortedPayload.map((entry: any) => (
          <div key={entry.name} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs text-muted-foreground">{entry.name}</span>
            </div>
            <span className="text-xs font-medium text-foreground">
              {typeof entry.value === 'number' ? entry.value.toFixed(1) : '-'}{unit}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export const ComparisonChart = memo(function ComparisonChart({ models, variable, title, unit, isLoading }: ComparisonChartProps) {
  const { t } = useTranslation()
  const [hoveredModel, setHoveredModel] = useState<ModelId | null>(null)

  const chartData = useMemo(
    () => transformToChartData(models, variable),
    [models, variable]
  )

  // Calculate spread (uncertainty range) for each time point
  const dataWithSpread = useMemo(() => {
    return chartData.map((point) => {
      const values = MODELS
        .map((m) => point[m] as number | undefined)
        .filter((v): v is number => v !== undefined)

      if (values.length < 2) {
        return { ...point, min: values[0] || 0, max: values[0] || 0 }
      }

      return {
        ...point,
        min: Math.min(...values),
        max: Math.max(...values),
      }
    })
  }, [chartData])

  if (isLoading) {
    return <ChartSkeleton />
  }

  if (chartData.length === 0) {
    return (
      <Card className="border-border shadow-sm">
        <CardContent className="py-8">
          <p className="text-muted-foreground text-center">{t('noDataAvailable')}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border shadow-sm overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Interactive legend */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mb-3 pb-3 border-b border-border">
          {MODELS.map((model) => (
            <button
              key={model}
              className={`flex items-center gap-1.5 transition-opacity ${
                hoveredModel && hoveredModel !== model ? 'opacity-30' : 'opacity-100'
              }`}
              onMouseEnter={() => setHoveredModel(model)}
              onMouseLeave={() => setHoveredModel(null)}
            >
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: MODEL_CONFIG[model].color }}
              />
              <span className="text-[10px] text-muted-foreground hover:text-foreground transition-colors">
                {MODEL_CONFIG[model].name}
              </span>
            </button>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={280} debounce={200}>
          <ComposedChart data={dataWithSpread} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id={`spread-${variable}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="currentColor" stopOpacity={0.15} />
                <stop offset="100%" stopColor="currentColor" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="currentColor"
              strokeOpacity={0.1}
            />
            <XAxis
              dataKey="time"
              tick={{ fill: 'currentColor', fontSize: 10, opacity: 0.5 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              minTickGap={50}
            />
            <YAxis
              tick={{ fill: 'currentColor', fontSize: 10, opacity: 0.5 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}${unit}`}
              width={45}
            />
            {/* Zero reference line for temperature */}
            {variable === 'temperature_2m' && (
              <ReferenceLine
                y={0}
                stroke="currentColor"
                strokeOpacity={0.3}
                strokeDasharray="3 3"
              />
            )}
            <Tooltip
              content={<CustomTooltip unit={unit} />}
              cursor={{ stroke: 'currentColor', strokeOpacity: 0.2, strokeWidth: 1 }}
            />
            {/* Model spread area (uncertainty band) */}
            <Area
              type="monotone"
              dataKey="max"
              stroke="none"
              fill={`url(#spread-${variable})`}
              fillOpacity={1}
              className="text-muted-foreground"
            />
            <Area
              type="monotone"
              dataKey="min"
              stroke="none"
              fill="var(--color-card)"
              fillOpacity={1}
            />
            {/* Model lines */}
            {MODELS.map((model) => (
              <Line
                key={model}
                type="monotone"
                dataKey={model}
                name={MODEL_CONFIG[model].name}
                stroke={MODEL_CONFIG[model].color}
                strokeWidth={hoveredModel === model ? 3 : hoveredModel ? 1 : 2}
                strokeOpacity={hoveredModel && hoveredModel !== model ? 0.3 : 1}
                dot={false}
                activeDot={{
                  r: 4,
                  fill: MODEL_CONFIG[model].color,
                  strokeWidth: 0,
                }}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
})
