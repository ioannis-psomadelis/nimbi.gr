import { useMemo } from 'react'
import { type ModelId } from '../types/models'
import { MODEL_RUN_TIMES, type RunInfo, formatRunInfo } from '../lib/utils/runs'

// Processing delay in hours - runs become available ~5 hours after initialization
const PROCESSING_DELAY_HOURS = 5

export interface ModelRunInfo {
  /** Available run hours for this model (e.g., [0, 6, 12, 18] for GFS) */
  runTimes: number[]
  /** The latest available run */
  latestRun: RunInfo
  /** Previous available runs (default 4) */
  previousRuns: RunInfo[]
  /** Check if a specific hour is a valid run time for this model */
  isRunAvailable: (hour: number) => boolean
  /** Get the nearest valid run hour for this model */
  getNearestValidRun: (hour: number) => number
}

/**
 * Get the latest available run for a specific model
 * Takes into account the model's valid run times and processing delay
 */
export function getLatestModelRun(model: ModelId): RunInfo {
  const runTimes = MODEL_RUN_TIMES[model]
  const now = new Date()
  const utcHour = now.getUTCHours()

  // Calculate the effective hour considering processing delay
  const effectiveHour = utcHour - PROCESSING_DELAY_HOURS

  // Find the latest available run hour
  let runHour: number
  let dayOffset = 0

  // Get valid run times sorted descending
  const sortedTimes = [...runTimes].sort((a, b) => b - a)

  // Find the latest run that would be available
  const availableRun = sortedTimes.find(time => time <= effectiveHour)

  if (availableRun !== undefined) {
    runHour = availableRun
  } else {
    // No run available today yet, use the latest from yesterday
    runHour = sortedTimes[0]
    dayOffset = -1
  }

  const runDate = new Date(now)
  runDate.setUTCDate(runDate.getUTCDate() + dayOffset)
  runDate.setUTCHours(runHour, 0, 0, 0)

  return formatRunInfo(runDate, runHour)
}

/**
 * Get previous runs for a specific model
 */
export function getPreviousModelRuns(model: ModelId, count: number = 4): RunInfo[] {
  const runTimes = MODEL_RUN_TIMES[model]
  const latest = getLatestModelRun(model)
  const runs: RunInfo[] = []

  // Sort run times ascending for easier iteration
  const sortedTimes = [...runTimes].sort((a, b) => a - b)

  let currentDate = new Date(latest.date)
  let currentHour = latest.hour

  for (let i = 0; i < count; i++) {
    // Find the previous valid run time
    const currentIndex = sortedTimes.indexOf(currentHour)

    if (currentIndex > 0) {
      // Previous run same day
      currentHour = sortedTimes[currentIndex - 1]
    } else {
      // Wrap to previous day, use last run time
      currentHour = sortedTimes[sortedTimes.length - 1]
      currentDate.setUTCDate(currentDate.getUTCDate() - 1)
    }

    runs.push(formatRunInfo(new Date(currentDate), currentHour))
  }

  return runs
}

/**
 * Check if a run hour is valid for a specific model
 */
export function isValidRunHour(model: ModelId, hour: number): boolean {
  return MODEL_RUN_TIMES[model].includes(hour)
}

/**
 * Get the nearest valid run hour for a model
 * If the hour is valid, returns it unchanged
 * Otherwise returns the closest valid run hour
 */
export function getNearestValidRunHour(model: ModelId, hour: number): number {
  const runTimes = MODEL_RUN_TIMES[model]

  if (runTimes.includes(hour)) {
    return hour
  }

  // Find the closest valid run
  let closest = runTimes[0]
  let minDiff = Math.abs(hour - closest)

  for (const time of runTimes) {
    const diff = Math.abs(hour - time)
    if (diff < minDiff) {
      minDiff = diff
      closest = time
    }
  }

  return closest
}

/**
 * Hook to get model-specific run information
 */
export function useModelRuns(model: ModelId): ModelRunInfo {
  return useMemo(() => {
    const runTimes = MODEL_RUN_TIMES[model]
    const latestRun = getLatestModelRun(model)
    const previousRuns = getPreviousModelRuns(model, 4)

    return {
      runTimes,
      latestRun,
      previousRuns,
      isRunAvailable: (hour: number) => isValidRunHour(model, hour),
      getNearestValidRun: (hour: number) => getNearestValidRunHour(model, hour),
    }
  }, [model])
}
