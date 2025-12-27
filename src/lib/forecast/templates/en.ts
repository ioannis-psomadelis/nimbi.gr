import type { WeatherCondition, ConfidenceLevel, TemperatureTrend, PressureTrend } from '../types'

export const en = {
  // Day names
  days: {
    Sunday: 'Sunday',
    Monday: 'Monday',
    Tuesday: 'Tuesday',
    Wednesday: 'Wednesday',
    Thursday: 'Thursday',
    Friday: 'Friday',
    Saturday: 'Saturday',
  },

  // Relative day names
  today: 'Today',
  tomorrow: 'Tomorrow',

  // Conditions
  conditions: {
    sunny: 'sunny',
    partly_cloudy: 'partly cloudy',
    cloudy: 'cloudy',
    rainy: 'rainy',
    stormy: 'stormy',
    snowy: 'snowy',
  } as Record<WeatherCondition, string>,

  // Condition descriptions (fuller form)
  conditionDescriptions: {
    sunny: 'clear skies and sunshine',
    partly_cloudy: 'a mix of sun and clouds',
    cloudy: 'overcast skies',
    rainy: 'rain expected',
    stormy: 'stormy conditions',
    snowy: 'snow expected',
  } as Record<WeatherCondition, string>,

  // Temperature trends
  trends: {
    warming: 'A warming trend develops through the week',
    cooling: 'Temperatures trend cooler as the week progresses',
    stable: 'Temperatures remain relatively stable',
  } as Record<TemperatureTrend, string>,

  // Confidence levels
  confidence: {
    high: 'High confidence',
    medium: 'Moderate confidence',
    low: 'Lower confidence',
  } as Record<ConfidenceLevel, string>,

  confidenceDescriptions: {
    high: 'Models are in strong agreement',
    medium: 'Some variation between models',
    low: 'Models show different scenarios',
  } as Record<ConfidenceLevel, string>,

  // Pressure
  pressureTrends: {
    rising: 'pressure rising',
    falling: 'pressure falling',
    stable: 'stable pressure',
  } as Record<PressureTrend, string>,

  // Templates
  templates: {
    // Day intro
    dayWillBe: '{condition} with highs near {high}\u00B0C',
    dayRange: '{high}\u00B0C / {low}\u00B0C',

    // Precipitation
    rainExpected: 'Rain expected ({amount}mm)',
    lightRain: 'Light rain possible',
    heavyRain: 'Heavy rain likely ({amount}mm)',
    snowExpected: 'Snow expected ({amount}mm)',
    lightSnow: 'Light snow possible',
    heavySnow: 'Heavy snow likely ({amount}mm)',
    noRain: 'Dry conditions expected',

    // Model agreement
    allModelsAgree: 'All models agree',
    modelsAgree: '{models} align on this forecast',
    modelsDiffer: '{models} suggest {alternative}',
    primaryShows: 'ECMWF HD shows {forecast}',

    // Specific disagreement patterns
    differOnTiming: '{models} suggest different timing',
    differOnAmount: '{models} predict {amount}mm instead',
    differOnTemp: '{models} predict {temp}\u00B0C',

    // Summary phrases
    warmStart: 'A warm start to the week',
    coolStart: 'A cool start to the week',
    mildStart: 'A mild start to the week',

    // Transitions
    butThen: 'but then',
    followedBy: 'followed by',
    beforeClearing: 'before clearing',
    withClearing: 'with gradual clearing',

    // Weekend
    weekendOutlook: 'Weekend outlook',
    weekendUncertain: 'Weekend remains uncertain',
  },

  // UI
  ui: {
    weeklyOutlook: 'Weekly Outlook',
    basedOn: 'Based on',
    updated: 'Updated',
    viewForecast: 'View forecast',
  },
}

export type TranslationKeys = typeof en
