import { describe, it, expect } from 'vitest'
import { CHART_PARAMS, getAvailableParams, CHART_SCOPES, buildChartUrl } from '../../src/lib/utils/runs'

describe('CHART_SCOPES', () => {
  it('has europe and regional', () => {
    expect(CHART_SCOPES).toContain('europe')
    expect(CHART_SCOPES).toContain('regional')
  })
})

describe('CHART_PARAMS', () => {
  it('has 11 parameters', () => {
    expect(CHART_PARAMS.length).toBe(11)
  })

  it('includes TT-only params with null meteocielMode', () => {
    const cape = CHART_PARAMS.find(p => p.id === 'cape')
    expect(cape?.meteocielMode).toBeNull()
    expect(cape?.ttCode).toBe('cape')
  })

  it('includes core params with meteocielMode', () => {
    const mslp = CHART_PARAMS.find(p => p.id === 'mslp')
    expect(mslp?.meteocielMode).toBe(0)
    expect(mslp?.ttCode).toBe('mslp_pcpn_frzn')
  })
})

describe('getAvailableParams', () => {
  it('returns all params for europe scope', () => {
    const params = getAvailableParams('europe')
    expect(params.length).toBe(11)
  })

  it('returns only meteociel-compatible params for regional scope', () => {
    const params = getAvailableParams('regional')
    expect(params.length).toBe(5)
    expect(params.every(p => p.meteocielMode !== null)).toBe(true)
  })
})

describe('buildChartUrl', () => {
  it('uses TT for europe scope', () => {
    const url = buildChartUrl('gfs', '2025122800', 'mslp', 6, 'europe', { lat: 38, lon: 23 })
    expect(url).toContain('tropicaltidbits.com')
  })

  it('uses Meteociel for regional scope with supported model', () => {
    const url = buildChartUrl('ecmwf-hres', '2025122800', 'mslp', 6, 'regional', { lat: 38, lon: 23 }, 'greece')
    expect(url).toContain('meteociel.fr')
  })

  it('forces europe scope for TT-only params', () => {
    const url = buildChartUrl('gfs', '2025122800', 'cape', 6, 'regional', { lat: 38, lon: 23 })
    expect(url).toContain('tropicaltidbits.com')
  })

  it('falls back to Wetterzentrale for ARPEGE', () => {
    const url = buildChartUrl('arpege', '2025122800', 'mslp', 6, 'europe', { lat: 48, lon: 2 })
    expect(url).toContain('wetterzentrale.de')
  })
})
