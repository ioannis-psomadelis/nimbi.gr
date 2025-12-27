import { z } from 'zod'

const HourlyDataSchema = z.object({
  time: z.array(z.string()),
  temperature_2m: z.array(z.number()),
  precipitation: z.array(z.number()),
  wind_speed_10m: z.array(z.number()),
  cloud_cover: z.array(z.number()),
  pressure_msl: z.array(z.number()),
  // New fields for enhanced weather data (nullable for models that don't support them)
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
