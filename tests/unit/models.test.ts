import { describe, it, expect } from 'vitest'
import { MODELS, MODEL_CONFIG, MODEL_GROUPS, getModelGroup } from '../../src/types/models'

describe('MODELS', () => {
  it('includes new ensemble models', () => {
    expect(MODELS).toContain('ec-aifs')
    expect(MODELS).toContain('gefs')
    expect(MODELS).toContain('eps')
  })
})

describe('MODEL_GROUPS', () => {
  it('has high-res group with deterministic models', () => {
    expect(MODEL_GROUPS['high-res']).toContain('ecmwf-hres')
    expect(MODEL_GROUPS['high-res']).toContain('ec-aifs')
  })

  it('has ensemble group with ensemble models', () => {
    expect(MODEL_GROUPS['ensemble']).toContain('gefs')
    expect(MODEL_GROUPS['ensemble']).toContain('eps')
  })
})

describe('getModelGroup', () => {
  it('returns high-res for deterministic models', () => {
    expect(getModelGroup('ecmwf-hres')).toBe('high-res')
    expect(getModelGroup('gfs')).toBe('high-res')
  })

  it('returns ensemble for ensemble models', () => {
    expect(getModelGroup('gefs')).toBe('ensemble')
    expect(getModelGroup('eps')).toBe('ensemble')
  })
})

describe('MODEL_CONFIG', () => {
  it('has config for new models', () => {
    expect(MODEL_CONFIG['ec-aifs']).toBeDefined()
    expect(MODEL_CONFIG['ec-aifs'].name).toBe('EC-AIFS')
    expect(MODEL_CONFIG['gefs'].hasRegional).toBe(false)
  })
})
