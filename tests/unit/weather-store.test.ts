import { describe, it, expect, beforeEach } from 'vitest'
import { useWeatherStore } from '../../src/stores/weather-store'

describe('weather store', () => {
  beforeEach(() => {
    useWeatherStore.setState({
      selectedModel: 'ecmwf-hres',
      selectedScope: 'europe',
      selectedParam: 'mslp',
    })
  })

  describe('setSelectedModel', () => {
    it('switches to europe scope when selecting ensemble model', () => {
      useWeatherStore.getState().setSelectedScope('regional')
      useWeatherStore.getState().setSelectedModel('gefs')
      expect(useWeatherStore.getState().selectedScope).toBe('europe')
    })

    it('keeps scope when selecting model with regional support', () => {
      useWeatherStore.getState().setSelectedScope('regional')
      useWeatherStore.getState().setSelectedModel('icon')
      expect(useWeatherStore.getState().selectedScope).toBe('regional')
    })
  })

  describe('setSelectedScope', () => {
    it('switches to fallback model when regional scope not supported', () => {
      useWeatherStore.getState().setSelectedModel('gefs')
      useWeatherStore.getState().setSelectedScope('regional')
      expect(useWeatherStore.getState().selectedModel).toBe('ecmwf-hres')
    })

    it('switches param to mslp when TT-only param in regional scope', () => {
      useWeatherStore.getState().setSelectedParam('cape')
      useWeatherStore.getState().setSelectedScope('regional')
      expect(useWeatherStore.getState().selectedParam).toBe('mslp')
    })
  })

  describe('setSelectedParam', () => {
    it('switches to europe scope when selecting TT-only param', () => {
      useWeatherStore.getState().setSelectedScope('regional')
      useWeatherStore.getState().setSelectedParam('cape')
      expect(useWeatherStore.getState().selectedScope).toBe('europe')
    })
  })
})
