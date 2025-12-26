import { z } from 'zod'

const HourlyDataSchema = z.object({
  time: z.array(z.string()),
  temperature_2m: z.array(z.number()),
  precipitation: z.array(z.number()),
  wind_speed_10m: z.array(z.number()),
  cloud_cover: z.array(z.number()),
  pressure_msl: z.array(z.number()),
})

export const WeatherResponseSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  generationtime_ms: z.number(),
  utc_offset_seconds: z.number(),
  hourly: HourlyDataSchema,
})

export type WeatherResponse = z.infer<typeof WeatherResponseSchema>
