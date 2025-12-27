import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getLatestModelRun,
  getPreviousModelRuns,
  isValidRunHour,
  getNearestValidRunHour,
} from '../../src/hooks/use-model-runs'
import { MODEL_RUN_TIMES } from '../../src/lib/utils/runs'

describe('MODEL_RUN_TIMES', () => {
  it('should have correct run times for ECMWF', () => {
    expect(MODEL_RUN_TIMES['ecmwf-hres']).toEqual([0, 12])
  })

  it('should have correct run times for ICON', () => {
    expect(MODEL_RUN_TIMES.icon).toEqual([0, 6, 12, 18])
  })

  it('should have correct run times for ARPEGE', () => {
    expect(MODEL_RUN_TIMES.arpege).toEqual([0, 6, 12, 18])
  })

  it('should have correct run times for GFS', () => {
    expect(MODEL_RUN_TIMES.gfs).toEqual([0, 6, 12, 18])
  })

  it('should have correct run times for GEM', () => {
    expect(MODEL_RUN_TIMES.gem).toEqual([0, 12])
  })

  it('should have correct run times for UKMO', () => {
    expect(MODEL_RUN_TIMES.ukmo).toEqual([0, 12])
  })
})

describe('isValidRunHour', () => {
  it('should return true for valid run hours', () => {
    expect(isValidRunHour('ecmwf-hres', 0)).toBe(true)
    expect(isValidRunHour('ecmwf-hres', 12)).toBe(true)
    expect(isValidRunHour('gfs', 6)).toBe(true)
    expect(isValidRunHour('icon', 18)).toBe(true)
  })

  it('should return false for invalid run hours', () => {
    expect(isValidRunHour('ecmwf-hres', 6)).toBe(false)
    expect(isValidRunHour('ecmwf-hres', 18)).toBe(false)
    expect(isValidRunHour('gem', 6)).toBe(false)
    expect(isValidRunHour('ukmo', 18)).toBe(false)
  })
})

describe('getNearestValidRunHour', () => {
  it('should return the same hour if it is valid', () => {
    expect(getNearestValidRunHour('ecmwf-hres', 0)).toBe(0)
    expect(getNearestValidRunHour('ecmwf-hres', 12)).toBe(12)
    expect(getNearestValidRunHour('gfs', 6)).toBe(6)
    expect(getNearestValidRunHour('icon', 18)).toBe(18)
  })

  it('should return nearest valid hour for ECMWF (00z/12z only)', () => {
    // 6z should map to nearest (0 or 12) - 6 is equidistant, could be either
    expect([0, 12]).toContain(getNearestValidRunHour('ecmwf-hres', 6))
    // 18z should map to 12
    expect(getNearestValidRunHour('ecmwf-hres', 18)).toBe(12)
    // 3z should map to 0
    expect(getNearestValidRunHour('ecmwf-hres', 3)).toBe(0)
    // 9z should map to 12 (closer)
    expect(getNearestValidRunHour('ecmwf-hres', 9)).toBe(12)
  })

  it('should return nearest valid hour for GEM (00z/12z only)', () => {
    expect(getNearestValidRunHour('gem', 3)).toBe(0)
    expect(getNearestValidRunHour('gem', 9)).toBe(12)
    expect(getNearestValidRunHour('gem', 15)).toBe(12)
  })
})

describe('getLatestModelRun', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return 00z run when current UTC time is 05:00-10:59', () => {
    // At 08:00 UTC, 00z run is available (5h processing delay)
    vi.setSystemTime(new Date('2025-12-27T08:00:00Z'))
    const run = getLatestModelRun('gfs')
    expect(run.hour).toBe(0)
    expect(run.id).toBe('2025122700')
  })

  it('should return 06z run when current UTC time is 11:00-16:59 for 4x daily models', () => {
    // At 12:00 UTC, 06z run is available for GFS
    vi.setSystemTime(new Date('2025-12-27T12:00:00Z'))
    const run = getLatestModelRun('gfs')
    expect(run.hour).toBe(6)
    expect(run.id).toBe('2025122706')
  })

  it('should return 00z run when current UTC time is 11:00-16:59 for 2x daily models', () => {
    // At 12:00 UTC, ECMWF should still show 00z (no 06z run)
    vi.setSystemTime(new Date('2025-12-27T12:00:00Z'))
    const run = getLatestModelRun('ecmwf-hres')
    expect(run.hour).toBe(0)
    expect(run.id).toBe('2025122700')
  })

  it('should return 12z run when current UTC time is 17:00+ for all models', () => {
    // At 18:00 UTC, 12z run is available for all models
    vi.setSystemTime(new Date('2025-12-27T18:00:00Z'))

    const gfsRun = getLatestModelRun('gfs')
    expect(gfsRun.hour).toBe(12)

    const ecmwfRun = getLatestModelRun('ecmwf-hres')
    expect(ecmwfRun.hour).toBe(12)
  })

  it('should return 18z run from previous day early morning for 4x daily models', () => {
    // At 02:00 UTC, 18z from previous day is the latest available
    vi.setSystemTime(new Date('2025-12-27T02:00:00Z'))
    const run = getLatestModelRun('gfs')
    expect(run.hour).toBe(18)
    expect(run.id).toBe('2025122618')
  })

  it('should return 12z run from previous day early morning for 2x daily models', () => {
    // At 02:00 UTC, 12z from previous day is the latest for ECMWF
    vi.setSystemTime(new Date('2025-12-27T02:00:00Z'))
    const run = getLatestModelRun('ecmwf-hres')
    expect(run.hour).toBe(12)
    expect(run.id).toBe('2025122612')
  })
})

describe('getPreviousModelRuns', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return correct previous runs for GFS (4x daily)', () => {
    vi.setSystemTime(new Date('2025-12-27T18:00:00Z'))

    const runs = getPreviousModelRuns('gfs', 4)

    expect(runs).toHaveLength(4)
    // Latest is 12z, previous should be 6z, 0z, 18z (prev day)
    expect(runs[0].hour).toBe(6)
    expect(runs[1].hour).toBe(0)
    expect(runs[2].hour).toBe(18)
    expect(runs[3].hour).toBe(12)
  })

  it('should return correct previous runs for ECMWF (2x daily)', () => {
    vi.setSystemTime(new Date('2025-12-27T18:00:00Z'))

    const runs = getPreviousModelRuns('ecmwf-hres', 4)

    expect(runs).toHaveLength(4)
    // Latest is 12z, previous should be 0z, 12z (prev day), 0z (prev day)
    expect(runs[0].hour).toBe(0)
    expect(runs[0].id).toBe('2025122700')
    expect(runs[1].hour).toBe(12)
    expect(runs[1].id).toBe('2025122612')
    expect(runs[2].hour).toBe(0)
    expect(runs[2].id).toBe('2025122600')
    expect(runs[3].hour).toBe(12)
    expect(runs[3].id).toBe('2025122512')
  })

  it('should handle day boundary correctly', () => {
    vi.setSystemTime(new Date('2025-12-27T08:00:00Z'))

    const runs = getPreviousModelRuns('icon', 6)

    expect(runs).toHaveLength(6)
    // Latest is 00z (Dec 27), previous should go back properly
    expect(runs[0].hour).toBe(18) // Dec 26
    expect(runs[1].hour).toBe(12) // Dec 26
    expect(runs[2].hour).toBe(6)  // Dec 26
    expect(runs[3].hour).toBe(0)  // Dec 26
    expect(runs[4].hour).toBe(18) // Dec 25
    expect(runs[5].hour).toBe(12) // Dec 25
  })
})
