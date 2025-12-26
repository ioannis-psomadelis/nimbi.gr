import type { WeatherResponse } from '../../types/weather'
import type { ModelId } from '../../types/models'

interface ChartDataPoint {
  time: string
  [key: string]: number | string
}

export function transformToChartData(
  models: { model: ModelId; data: WeatherResponse | undefined }[],
  variable: 'temperature_2m' | 'precipitation' | 'wind_speed_10m' | 'pressure_msl'
): ChartDataPoint[] {
  const firstValidModel = models.find((m) => m.data)
  if (!firstValidModel?.data) return []

  const times = firstValidModel.data.hourly.time

  return times.map((time, index) => {
    const point: ChartDataPoint = {
      time: new Date(time).toLocaleTimeString('en-US', {
        hour: '2-digit',
        day: 'numeric',
        month: 'short',
      }),
    }

    models.forEach(({ model, data }) => {
      if (data) {
        point[model] = data.hourly[variable][index]
      }
    })

    return point
  })
}
