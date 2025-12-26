'use client'

import { memo, useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
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

export const ComparisonChart = memo(function ComparisonChart({ models, variable, title, unit, isLoading }: ComparisonChartProps) {
  const { t } = useTranslation()
  const chartData = useMemo(
    () => transformToChartData(models, variable),
    [models, variable]
  )

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
    <Card className="border-border shadow-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300} debounce={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
            <XAxis
              dataKey="time"
              className="text-muted-foreground"
              tick={{ fill: 'currentColor', fontSize: 11 }}
              tickLine={{ stroke: 'currentColor', opacity: 0.3 }}
              axisLine={{ stroke: 'currentColor', opacity: 0.3 }}
            />
            <YAxis
              className="text-muted-foreground"
              tick={{ fill: 'currentColor', fontSize: 11 }}
              tickLine={{ stroke: 'currentColor', opacity: 0.3 }}
              axisLine={{ stroke: 'currentColor', opacity: 0.3 }}
              unit={unit}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-card)',
                border: '1px solid var(--border-default)',
                borderRadius: '10px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                padding: '12px 16px',
              }}
              labelStyle={{
                color: 'var(--text-primary)',
                fontWeight: 600,
                marginBottom: '8px',
              }}
              itemStyle={{
                color: 'var(--text-secondary)',
                padding: '2px 0',
              }}
              cursor={{ stroke: 'var(--color-accent)', strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            <Legend />
            {MODELS.map((model) => (
              <Line
                key={model}
                type="monotone"
                dataKey={model}
                name={MODEL_CONFIG[model].name}
                stroke={MODEL_CONFIG[model].color}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
})
