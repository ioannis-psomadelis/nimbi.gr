import { describe, it, expect } from 'vitest'
import {
  buildTropicalTidbitsUrl,
  buildDirectTropicalTidbitsUrl,
  TT_MODEL_CODES
} from '../../src/lib/utils/tropicaltidbits'

describe('buildDirectTropicalTidbitsUrl', () => {
  it('builds correct URL for GFS model', () => {
    const url = buildDirectTropicalTidbitsUrl('gfs', '2025122800', 'mslp', 0)
    expect(url).toBe('https://www.tropicaltidbits.com/analysis/models/gfs/2025122800/gfs_mslp_pcpn_frzn_eu_1.png')
  })

  it('builds correct URL for ECMWF model', () => {
    const url = buildDirectTropicalTidbitsUrl('ecmwf-hres', '2025122812', 't2m', 6)
    expect(url).toBe('https://www.tropicaltidbits.com/analysis/models/ecmwf/2025122812/ecmwf_T2m_eu_2.png')
  })

  it('calculates frame number from forecast hour', () => {
    const url = buildDirectTropicalTidbitsUrl('gfs', '2025122800', 'mslp', 24)
    expect(url).toContain('_eu_5.png') // 24/6 + 1 = 5
  })

  it('builds correct URL for ICON model', () => {
    const url = buildDirectTropicalTidbitsUrl('icon', '2025122800', 't850', 12)
    expect(url).toBe('https://www.tropicaltidbits.com/analysis/models/icon/2025122800/icon_T850_eu_3.png')
  })

  it('builds correct URL for GEM model (maps to cmc)', () => {
    const url = buildDirectTropicalTidbitsUrl('gem', '2025122800', 'wind', 18)
    expect(url).toBe('https://www.tropicaltidbits.com/analysis/models/cmc/2025122800/cmc_mslp_wind_eu_4.png')
  })

  it('builds correct URL for UKMO model', () => {
    const url = buildDirectTropicalTidbitsUrl('ukmo', '2025122800', 'z500', 30)
    expect(url).toBe('https://www.tropicaltidbits.com/analysis/models/ukmo/2025122800/ukmo_z500_vort_eu_6.png')
  })

  it('throws error for unsupported model (arpege)', () => {
    expect(() => buildDirectTropicalTidbitsUrl('arpege', '2025122800', 'mslp', 0)).toThrow(
      'Model arpege not available on Tropical Tidbits'
    )
  })

  it('uses default param when param is unknown', () => {
    const url = buildDirectTropicalTidbitsUrl('gfs', '2025122800', 'unknown-param', 0)
    expect(url).toContain('gfs_mslp_pcpn_frzn_eu_1.png')
  })
})

describe('buildTropicalTidbitsUrl (proxied)', () => {
  it('returns proxied URL path', () => {
    const url = buildTropicalTidbitsUrl('gfs', '2025122800', 'mslp', 0)
    expect(url).toMatch(/^\/api\/chart-image\?url=/)
  })

  it('URL encodes the TT URL', () => {
    const url = buildTropicalTidbitsUrl('gfs', '2025122800', 'mslp', 0)
    expect(url).toContain(encodeURIComponent('https://www.tropicaltidbits.com'))
  })

  it('throws error for unsupported model', () => {
    expect(() => buildTropicalTidbitsUrl('arpege', '2025122800', 'mslp', 0)).toThrow(
      'Model arpege not available on Tropical Tidbits'
    )
  })
})

describe('TT_MODEL_CODES', () => {
  it('maps ecmwf-hres to ecmwf', () => {
    expect(TT_MODEL_CODES['ecmwf-hres']).toBe('ecmwf')
  })

  it('maps gem to cmc', () => {
    expect(TT_MODEL_CODES['gem']).toBe('cmc')
  })

  it('returns null for arpege (not on TT)', () => {
    expect(TT_MODEL_CODES['arpege']).toBeNull()
  })

  it('maps gfs to gfs', () => {
    expect(TT_MODEL_CODES['gfs']).toBe('gfs')
  })

  it('maps icon to icon', () => {
    expect(TT_MODEL_CODES['icon']).toBe('icon')
  })

  it('maps ukmo to ukmo', () => {
    expect(TT_MODEL_CODES['ukmo']).toBe('ukmo')
  })
})
