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

  it('builds correct URL for GEM model', () => {
    const url = buildDirectTropicalTidbitsUrl('gem', '2025122800', 'wind', 18)
    expect(url).toBe('https://www.tropicaltidbits.com/analysis/models/gem/2025122800/gem_mslp_wind_eu_4.png')
  })

  it('throws error for UKMO model (not on TT - use Meteociel)', () => {
    expect(() => buildDirectTropicalTidbitsUrl('ukmo', '2025122800', 'z500', 30)).toThrow(
      'Model ukmo not available on Tropical Tidbits'
    )
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

  it('maps gem to gem', () => {
    expect(TT_MODEL_CODES['gem']).toBe('gem')
  })

  it('returns null for arpege (not on TT - use Wetterzentrale)', () => {
    expect(TT_MODEL_CODES['arpege']).toBeNull()
  })

  it('returns null for ukmo (not on TT - use Meteociel)', () => {
    expect(TT_MODEL_CODES['ukmo']).toBeNull()
  })

  it('returns null for ec-aifs (use Meteociel for reliability)', () => {
    expect(TT_MODEL_CODES['ec-aifs']).toBeNull()
  })

  it('returns null for gefs (use Meteociel for reliability)', () => {
    expect(TT_MODEL_CODES['gefs']).toBeNull()
  })

  it('returns null for eps (ensemble - different chart types)', () => {
    expect(TT_MODEL_CODES['eps']).toBeNull()
  })

  it('maps gfs to gfs', () => {
    expect(TT_MODEL_CODES['gfs']).toBe('gfs')
  })

  it('maps icon to icon', () => {
    expect(TT_MODEL_CODES['icon']).toBe('icon')
  })
})
