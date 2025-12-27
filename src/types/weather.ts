import { z } from 'zod'

const HourlyDataSchema = z.object({
  time: z.array(z.string()),
  // Core fields - allow nulls at end of forecast (models have different forecast lengths)
  temperature_2m: z.array(z.number().nullable()),
  precipitation: z.array(z.number().nullable()),
  wind_speed_10m: z.array(z.number().nullable()),
  cloud_cover: z.array(z.number().nullable()),
  pressure_msl: z.array(z.number().nullable()),
  // Optional fields - not all models support these
  precipitation_probability: z.array(z.number().nullable()).optional(),
  apparent_temperature: z.array(z.number().nullable()).optional(),
  uv_index: z.array(z.number().nullable()).optional(),
  weather_code: z.array(z.number().nullable()).optional(),
})

const DailyDataSchema = z.object({
  time: z.array(z.string()),
  sunrise: z.array(z.string()),
  sunset: z.array(z.string()),
})

export const WeatherResponseSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  generationtime_ms: z.number(),
  utc_offset_seconds: z.number(),
  hourly: HourlyDataSchema,
  daily: DailyDataSchema.optional(),
})

export type WeatherResponse = z.infer<typeof WeatherResponseSchema>
