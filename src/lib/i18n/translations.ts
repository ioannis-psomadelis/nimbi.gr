export const translations = {
  en: {
    translation: {
      // App
      appName: 'nimbi.gr',
      weatherObservatory: 'Weather Observatory',
      stormObservatory: 'Storm Observatory',

      // Header
      searchPlaceholder: 'Search location...',

      // Location
      currentLocation: 'Current Location',
      savedLocations: 'Saved Locations',
      noSavedLocations: 'No saved locations',
      saveLocation: 'Save',
      europeanRegion: 'European Region',
      northAmericanRegion: 'North American Region',

      // Weather
      forecast: 'Forecast',
      sevenDayForecast: '7-Day Forecast',
      forecastFor: 'Forecast for',
      humidity: 'Humidity',
      next24h: 'Next 24h',
      loading: 'Loading...',
      updating: 'Updating...',
      loadingChart: 'Loading chart...',
      chartNotAvailable: 'Chart not available',
      chartNotReady: 'This forecast hour may not be ready yet',
      tryAgain: 'Try again',
      retry: 'Retry',
      noChartLoaded: 'No chart loaded',
      noDataAvailable: 'No data available',
      tempHigh: 'High',
      tempLow: 'Low',

      // Models
      models: 'Models',
      gfs: 'GFS',
      ecmwf: 'ECMWF',
      gem: 'GEM',
      ukmo: 'UKMO',

      // Chart Parameters
      pressure: 'Pressure',
      pressureDesc: 'Mean Sea Level Pressure & 500hPa Geopotential',
      pressureInfo: 'Shows surface pressure patterns (highs and lows) combined with the 500hPa geopotential height. This helps identify weather systems, fronts, and the overall atmospheric flow pattern.',

      temp2m: 'Temp 2m',
      temp2mDesc: 'Temperature at 2 meters',
      temp2mInfo: 'The forecasted air temperature at 2 meters above ground level - what you would feel outside. This is the standard height for measuring air temperature.',

      temp850: 'Temp 850',
      temp850Desc: 'Temperature at 850hPa (~1500m altitude)',
      temp850Info: 'Temperature at the 850hPa pressure level, approximately 1,500 meters above sea level. Useful for tracking air masses and predicting precipitation type.',

      precip: 'Precip',
      precipDesc: 'Accumulated Precipitation',
      precipInfo: 'Total precipitation accumulation including rain, snow, sleet, and other forms. Values shown as millimeters of liquid water equivalent.',

      wind: 'Wind',
      windDesc: 'Wind Speed at 10 meters',
      windInfo: 'Wind speed and direction at 10 meters above ground level - the standard measurement height for surface winds.',

      jetStream: 'Jet Stream',
      jetStreamDesc: 'Upper-level Jet Stream',
      jetStreamInfo: 'The jet stream is a fast-flowing river of air at high altitude. It steers weather systems and separates air masses.',

      // Chart Parameter Labels (CHART_PARAMS)
      paramPressure: 'Pressure & Heights',
      paramPressureShort: 'MSLP',
      paramPressureDesc: 'Mean Sea Level Pressure & 500hPa Geopotential Height',
      paramPressureInfo: 'Mean Sea Level Pressure (MSLP) shows surface pressure patterns normalized to sea level, displayed as isobars (lines of equal pressure). High pressure (anticyclones) typically brings stable, clear weather, while low pressure (depressions/cyclones) brings unsettled conditions with clouds and precipitation.',
      paramPressureUsage: 'The 500hPa geopotential height (approximately 5.5km altitude) shows upper-level troughs and ridges that steer surface weather systems. The spacing between isobars indicates wind strength - closer lines mean stronger winds. This chart is essential for understanding the large-scale atmospheric flow.',

      paramTemp2m: 'Surface Temperature',
      paramTemp2mShort: 'T2m',
      paramTemp2mDesc: 'Air Temperature at 2 meters above ground',
      paramTemp2mInfo: 'The forecasted air temperature at 2 meters above ground level - this is the standard meteorological measurement height and represents what you would actually feel outside. It accounts for terrain effects and local conditions.',
      paramTemp2mUsage: 'Use this to plan daily activities, determine clothing needs, and assess heating/cooling requirements. Temperature gradients (rapid changes over distance) often indicate frontal boundaries where weather changes occur.',

      paramTemp850: 'Temperature at 850hPa',
      paramTemp850Short: 'T850',
      paramTemp850Desc: 'Temperature at ~1,500m altitude (850hPa pressure level)',
      paramTemp850Info: 'Temperature at the 850hPa pressure level, approximately 1,500 meters above sea level. This level is above most terrain effects and is excellent for tracking air masses. The 0°C isotherm at 850hPa is a key indicator for precipitation type.',
      paramTemp850Usage: 'When 850hPa temperature is below 0°C, precipitation is more likely to fall as snow at lower elevations. Warm air advection (temperatures rising) indicates approaching warm fronts, while cold air advection signals cold front passages. This is the primary level meteorologists use to predict snow vs rain.',

      paramPrecip: 'Precipitation',
      paramPrecipShort: 'Precip',
      paramPrecipDesc: 'Total Accumulated Precipitation',
      paramPrecipInfo: 'Total precipitation accumulation including all forms: rain, drizzle, snow, sleet, freezing rain, and hail. Values are shown in millimeters of liquid water equivalent. For snow, multiply by approximately 10-15 to estimate snow depth.',
      paramPrecipUsage: 'Use accumulated totals to assess flood risk, water resources, and travel impacts. Light rain is typically 0.1-2.5mm/hour, moderate 2.5-7.5mm/hour, and heavy rain exceeds 7.5mm/hour. Snow accumulation depends on temperature and moisture - cold dry snow has higher ratios (15:1) while wet snow is lower (5:1).',

      paramWind: 'Surface Wind',
      paramWindShort: 'Wind',
      paramWindDesc: '10-meter Wind Speed and Direction',
      paramWindInfo: 'Wind speed and direction at 10 meters above ground level - the World Meteorological Organization standard for surface wind measurements. Wind barbs or arrows show direction (where wind comes FROM), while colors/contours show speed.',
      paramWindUsage: 'Light breeze: 5-15 km/h, Moderate: 20-40 km/h, Strong: 40-60 km/h, Gale: 60-90 km/h, Storm: >90 km/h. Wind direction shifts clockwise (veering) with warm fronts and counter-clockwise (backing) with cold fronts. Strongest winds occur in the tightest pressure gradients.',

      paramJet: 'Jet Stream',
      paramJetShort: 'Jet',
      paramJetDesc: 'Upper-level Jet Stream (250-300hPa)',
      paramJetInfo: 'The jet stream is a narrow band of very strong winds at 9-12km altitude, typically flowing west to east at speeds of 100-400 km/h. It forms at the boundary between cold polar air and warm tropical air, and its position largely determines surface weather patterns.',
      paramJetUsage: 'The jet stream steers surface low pressure systems and determines storm tracks. Areas under the jet\'s left exit region often see storm development. Jet streaks (speed maxima) create areas of rising and sinking air that influence clouds and precipitation. Flight times are significantly affected by jet stream position.',

      learnAbout: 'Learn about',

      // Time
      hours: 'hours',
      days: 'days',

      // Charts
      temperature: 'Temperature',
      precipitation: 'Precipitation',
      windSpeed: 'Wind Speed',
      pressureChart: 'Pressure',
      chartsFrom: 'Charts from',

      // Actions
      compare: 'Compare',
      live: 'Live',

      // Language
      language: 'Language',
      english: 'English',
      greek: 'Greek',

      // New keys
      modelOverview: 'Model Overview',
      currentTemperatureForecasts: 'Current temperature forecasts',
      modelComparison: 'Model Comparison',
      compareAllModelsSideBySide: 'Compare all models side by side',
      observing: 'Observing',
      charts: 'Charts',
      visualization: 'visualization',
      latest: 'Latest',
      error: 'Error',
      yes: 'Yes',
      no: 'No',
      resolution: 'Resolution',
      updateTimes: 'Updates',
      forecastLength: 'Forecast',
      modelInfo: '{{model}} info',
      modelDetails: 'Model details',
      runInfoTooltip: 'Model runs are initialized every 6 hours (00z, 06z, 12z, 18z) and become available ~5 hours later.',
      nextRunAvailable: 'Next run available',
      runTimingInfo: 'Run timing info',
      unitedStates: 'United States',
      removeLocation: 'Remove',
      location: 'Location',
      forecastTime: 'Forecast Time',
      selectRun: 'Select Run',
      meteocielVisualization: 'Meteociel visualization',

      // Regions
      region: 'Region',
      europe: 'Europe',
      regional: 'Regional',
      regionalNotAvailable: 'Regional charts not available for this model',
      paramNotAvailable: 'Parameter not available for this model',
      greece: 'Greece',
      france: 'France',
      italy: 'Italy',
      spain: 'Spain',
      uk: 'United Kingdom',
      germany: 'Germany',
      balkans: 'Balkans',
      central_europe: 'Central Europe',
      scandinavia: 'Scandinavia',
      netherlands: 'Benelux',
      denmark: 'Denmark',
      turkey: 'Turkey',

      // Home page
      multiModelWeatherObservatory: 'Multi-model weather observatory',
      useMyLocation: 'Use my location',
      searchForACity: 'Search for a city...',
      orExplore: 'or explore',
      findingYourLocation: 'Finding your location...',
      locationError: 'Could not detect location. Try searching instead.',
      locationPermissionDenied: 'Location permission denied. Please use search.',
      locationUnavailable: 'Location unavailable. Try searching instead.',
      locationTimeout: 'Location request timed out. Try again or search.',
      noResultsFound: 'No cities found. Try a different search.',

      // EU Region Error
      euOnlyTitle: 'Region Not Supported',
      euOnlyDescription: 'nimbi.gr currently only supports locations within Europe.',
      euOnlyHint: 'Please search for a location within the European region.',

      // Weekly Outlook
      weeklyOutlook: 'Weekly Outlook',
      basedOn: 'Based on',
      updated: 'Updated',
      viewForecast: 'View forecast',
      allModelsAgree: 'All models agree',
      highConfidence: 'High confidence',
      moderateConfidence: 'Moderate confidence',
      lowerConfidence: 'Lower confidence',
      confidenceExplanation: 'Based on agreement between ECMWF HD, GFS, GEM, and UKMO weather models.',

      // Simple Mode
      today: 'Today',
      now: 'Now',
      feelsLike: 'Feels like',
      kmh: 'km/h',
      conditionSunny: 'Sunny',
      conditionPartlyCloudy: 'Partly Cloudy',
      conditionCloudy: 'Cloudy',
      conditionRainy: 'Rainy',
      conditionStormy: 'Stormy',
      conditionSnowy: 'Snowy',

      // UV Index
      uvIndex: 'UV Index',
      uvLow: 'Low',
      uvModerate: 'Moderate',
      uvHigh: 'High',
      uvVeryHigh: 'Very High',
      uvExtreme: 'Extreme',

      // Precipitation
      precipChance: 'Rain chance',
      precipProbability: 'Precipitation',

      // Sun Times
      sunrise: 'Sunrise',
      sunset: 'Sunset',

      // Pro Mode
      proModeLabel: 'Pro Mode',
      proModeEnabled: 'Pro Mode ON',
      proModeDisabled: 'Pro Mode OFF',
      proModeDescription: 'Show all weather models and advanced charts',

      // Search
      noResults: 'No results found',
      minSearchChars: 'Type at least 3 characters',
      tryDifferentSearch: 'Try a different search term',
      toNavigate: 'navigate',
      toSelect: 'select',
      toClose: 'close',
      searchLocation: 'Search Location',
      searchResults: 'Results',
      findYourLocation: 'Find your location',
      searchCitiesHint: 'Search for cities, towns, or places',

      // 404 Page
      pageNotFound: 'Page not found',
      pageNotFoundDescription: 'The page you\'re looking for doesn\'t exist or has been moved.',
      backToHome: 'Back to Home',

      // Download
      download: 'Download',
      downloadForecast: 'Download forecast as image',
      downloading: 'Downloading...',

      // SEO Meta
      metaHomeTitle: 'nimbi.gr - Weather Observatory | Multi-Model Forecasts',
      metaHomeDescription:
        'Compare weather forecasts from ECMWF, GFS, GEM & UKMO models. Get accurate 7-day predictions with hourly temperature, precipitation, wind & humidity charts for any location.',
      metaObservatoryTitle: '{{location}} Weather Forecast | nimbi.gr',
      metaObservatoryDescription:
        'Accurate weather forecast for {{location}}. Compare ECMWF, GFS, GEM & UKMO models with hourly charts for temperature, rain, wind, humidity & pressure.',
      meta404Title: 'Page Not Found | nimbi.gr',

      // Air Quality
      airQuality: 'Air Quality',
      aqiGood: 'Good',
      aqiFair: 'Fair',
      aqiModerate: 'Moderate',
      aqiPoor: 'Poor',
      aqiVeryPoor: 'Very Poor',
      aqiExtremelyPoor: 'Extremely Poor',
      aqiExplanation: 'European Air Quality Index (EAQI) based on PM2.5, PM10, O3, and NO2 concentrations. Lower values indicate better air quality.',
      aqiOzone: 'Ozone',
      aqiNO2: 'NO2',

      // Weather Alerts
      weatherAlerts: 'Weather Alerts',
      noActiveAlerts: 'No active alerts',
      noActiveAlertsDesc: 'There are no weather warnings for this area',
      alertValidUntil: 'Valid until',
      alertsSource: 'Source',
      more: 'more',

      // Alert Severity
      'alertSeverity.minor': 'Minor',
      'alertSeverity.moderate': 'Moderate',
      'alertSeverity.severe': 'Severe',
      'alertSeverity.extreme': 'Extreme',

      // Alert Types
      'alertType.wind': 'Strong Wind',
      'alertType.snow-ice': 'Snow/Ice',
      'alertType.thunderstorm': 'Thunderstorm',
      'alertType.fog': 'Dense Fog',
      'alertType.high-temperature': 'Extreme Heat',
      'alertType.low-temperature': 'Extreme Cold',
      'alertType.coastal-event': 'Coastal Hazard',
      'alertType.forest-fire': 'Fire Risk',
      'alertType.avalanche': 'Avalanche Risk',
      'alertType.rain': 'Heavy Rain',
      'alertType.flood': 'Flood Risk',
      'alertType.rain-flood': 'Rain/Flood',

      // Recent Searches
      recentSearches: 'Recent',

      // Keyboard Shortcuts
      keyboardShortcutModels: 'models',
      keyboardShortcutTime: 'time',

      // Share
      share: 'Share',
      linkCopied: 'Link copied!',
      shareForecastText: 'Weather forecast for {{location}}',

      // Model Groups
      'modelGroup.high-res': 'High Resolution',
      'modelGroup.ensemble': 'Ensemble',

      // Model Names
      'modelName.ecmwf-hres': 'ECMWF HD',
      'modelName.icon': 'ICON',
      'modelName.arpege': 'ARPEGE',
      'modelName.gfs': 'GFS',
      'modelName.gem': 'GEM',
      'modelName.ukmo': 'UKMO',
      'modelName.ec-aifs': 'EC-AIFS',
      'modelName.gefs': 'GEFS',
      'modelName.eps': 'EPS',

      // Chart Parameters (Tropical Tidbits)
      'param.mslp': 'Pressure & Precip',
      'param.t2m': 'Temp 2m',
      'param.t850': 'Temp 850',
      'param.wind': 'Wind',
      'param.jet': 'Jet Stream',
      'param.z500': '500mb Heights',
      'param.cape': 'CAPE',
      'param.precip24': 'Precip 24h',
      'param.snow': 'Snowfall',
      'param.pwat': 'PWAT',
      'param.ir': 'Satellite',

      // Scope
      'scope.europe': 'Europe',
      'scope.regional': 'Regional',
    },
  },
  el: {
    translation: {
      // App
      appName: 'nimbi.gr',
      weatherObservatory: 'Μετεωρολογικό Παρατηρητήριο',
      stormObservatory: 'Μετεωρολογικό Παρατηρητήριο',

      // Header
      searchPlaceholder: 'Αναζήτηση τοποθεσίας...',

      // Location
      currentLocation: 'Τρέχουσα Τοποθεσία',
      savedLocations: 'Αποθηκευμένες Τοποθεσίες',
      noSavedLocations: 'Δεν υπάρχουν αποθηκευμένες τοποθεσίες',
      saveLocation: 'Αποθήκευση',
      europeanRegion: 'Ευρωπαϊκή Περιοχή',
      northAmericanRegion: 'Βορειοαμερικανική Περιοχή',

      // Weather
      forecast: 'Πρόγνωση',
      sevenDayForecast: 'Πρόγνωση 7 Ημερών',
      forecastFor: 'Πρόγνωση για',
      humidity: 'Υγρασία',
      next24h: 'Επόμενες 24ώ',
      loading: 'Φόρτωση...',
      updating: 'Ενημέρωση...',
      loadingChart: 'Φόρτωση χάρτη...',
      chartNotAvailable: 'Ο χάρτης δεν είναι διαθέσιμος',
      chartNotReady: 'Αυτή η ώρα πρόγνωσης μπορεί να μην είναι έτοιμη ακόμα',
      tryAgain: 'Δοκιμάστε ξανά',
      retry: 'Επανάληψη',
      noChartLoaded: 'Δεν φορτώθηκε χάρτης',
      noDataAvailable: 'Δεν υπάρχουν διαθέσιμα δεδομένα',
      tempHigh: 'Μέγιστη',
      tempLow: 'Ελάχιστη',

      // Models
      models: 'Μοντέλα',
      gfs: 'GFS',
      ecmwf: 'ECMWF',
      gem: 'GEM',
      ukmo: 'UKMO',

      // Chart Parameters
      pressure: 'Πίεση',
      pressureDesc: 'Ατμοσφαιρική Πίεση & Γεωδυναμικό 500hPa',
      pressureInfo: 'Δείχνει τα πρότυπα επιφανειακής πίεσης (υψηλά και χαμηλά) σε συνδυασμό με το γεωδυναμικό ύψος 500hPa. Βοηθά στον εντοπισμό καιρικών συστημάτων και μετώπων.',

      temp2m: 'Θερμ. 2μ',
      temp2mDesc: 'Θερμοκρασία στα 2 μέτρα',
      temp2mInfo: 'Η προβλεπόμενη θερμοκρασία αέρα στα 2 μέτρα πάνω από το έδαφος - αυτό που θα αισθανόσασταν έξω.',

      temp850: 'Θερμ. 850',
      temp850Desc: 'Θερμοκρασία στα 850hPa (~1500μ υψόμετρο)',
      temp850Info: 'Θερμοκρασία στο επίπεδο πίεσης 850hPa, περίπου 1.500 μέτρα πάνω από τη θάλασσα. Χρήσιμη για την παρακολούθηση αέριων μαζών.',

      precip: 'Βροχή',
      precipDesc: 'Συσσωρευμένες Βροχοπτώσεις',
      precipInfo: 'Συνολική συσσώρευση βροχοπτώσεων συμπεριλαμβανομένων βροχής, χιονιού και άλλων μορφών.',

      wind: 'Άνεμος',
      windDesc: 'Ταχύτητα Ανέμου στα 10 μέτρα',
      windInfo: 'Ταχύτητα και κατεύθυνση ανέμου στα 10 μέτρα πάνω από το έδαφος - το τυπικό ύψος μέτρησης για επιφανειακούς ανέμους.',

      jetStream: 'Αεροχείμαρρος',
      jetStreamDesc: 'Αεροχείμαρρος Ανωτέρων Στρωμάτων',
      jetStreamInfo: 'Ο αεροχείμαρρος είναι ένα ταχύτατο ρεύμα αέρα σε μεγάλο υψόμετρο. Κατευθύνει τα καιρικά συστήματα και διαχωρίζει τις αέριες μάζες.',

      // Chart Parameter Labels (CHART_PARAMS)
      paramPressure: 'Πίεση & Ύψη',
      paramPressureShort: 'MSLP',
      paramPressureDesc: 'Ατμοσφαιρική Πίεση Επιφανείας & Γεωδυναμικό Ύψος 500hPa',
      paramPressureInfo: 'Η Μέση Πίεση Θαλάσσιας Επιφάνειας (MSLP) εμφανίζει τα πρότυπα επιφανειακής πίεσης κανονικοποιημένα στο επίπεδο της θάλασσας, με ισοβαρείς καμπύλες (γραμμές ίσης πίεσης). Η υψηλή πίεση (αντικυκλώνες) φέρνει συνήθως σταθερό, αίθριο καιρό, ενώ η χαμηλή πίεση (ύφεση/κυκλώνες) φέρνει ασταθείς συνθήκες με νέφη και βροχοπτώσεις.',
      paramPressureUsage: 'Το γεωδυναμικό ύψος 500hPa (περίπου 5.5km υψόμετρο) δείχνει τα τρούφ και τις ράχες των ανωτέρων στρωμάτων που κατευθύνουν τα επιφανειακά καιρικά συστήματα. Η απόσταση μεταξύ των ισοβαρών δείχνει την ένταση του ανέμου - πιο κοντινές γραμμές σημαίνουν ισχυρότερους ανέμους. Αυτός ο χάρτης είναι απαραίτητος για την κατανόηση της μεγάλης κλίμακας ατμοσφαιρικής ροής.',

      paramTemp2m: 'Θερμοκρασία Επιφ.',
      paramTemp2mShort: 'Θ2μ',
      paramTemp2mDesc: 'Θερμοκρασία Αέρα στα 2 μέτρα από το έδαφος',
      paramTemp2mInfo: 'Η προβλεπόμενη θερμοκρασία αέρα στα 2 μέτρα πάνω από το έδαφος - αυτό είναι το τυπικό μετεωρολογικό ύψος μέτρησης και αντιπροσωπεύει αυτό που πραγματικά θα αισθανόσασταν έξω. Λαμβάνει υπόψη τις επιδράσεις του εδάφους και τις τοπικές συνθήκες.',
      paramTemp2mUsage: 'Χρησιμοποιήστε το για σχεδιασμό καθημερινών δραστηριοτήτων, επιλογή ρουχισμού και εκτίμηση αναγκών θέρμανσης/ψύξης. Οι θερμοκρασιακές διαβαθμίσεις (ραγδαίες αλλαγές σε απόσταση) συχνά υποδεικνύουν μετωπικά όρια όπου αλλάζει ο καιρός.',

      paramTemp850: 'Θερμοκρασία 850hPa',
      paramTemp850Short: 'Θ850',
      paramTemp850Desc: 'Θερμοκρασία στο επίπεδο ~1.500μ (850hPa)',
      paramTemp850Info: 'Θερμοκρασία στο επίπεδο πίεσης 850hPa, περίπου 1.500 μέτρα πάνω από τη θάλασσα. Αυτό το επίπεδο είναι πάνω από τις περισσότερες εδαφικές επιδράσεις και είναι εξαιρετικό για την παρακολούθηση αέριων μαζών. Η ισόθερμη 0°C στα 850hPa είναι βασικός δείκτης για τον τύπο υετού.',
      paramTemp850Usage: 'Όταν η θερμοκρασία 850hPa είναι κάτω από 0°C, ο υετός είναι πιθανότερο να πέσει ως χιόνι σε χαμηλότερα υψόμετρα. Η μεταφορά θερμού αέρα (αυξανόμενες θερμοκρασίες) υποδεικνύει προσεγγίζοντα θερμά μέτωπα, ενώ η μεταφορά ψυχρού αέρα σηματοδοτεί διέλευση ψυχρών μετώπων. Αυτό είναι το κύριο επίπεδο που χρησιμοποιούν οι μετεωρολόγοι για πρόβλεψη χιονιού έναντι βροχής.',

      paramPrecip: 'Υετός',
      paramPrecipShort: 'Υετός',
      paramPrecipDesc: 'Συνολικός Αθροιστικός Υετός',
      paramPrecipInfo: 'Συνολική συσσώρευση υετού που περιλαμβάνει όλες τις μορφές: βροχή, ψιχάλα, χιόνι, χιονόνερο, παγωμένη βροχή και χαλάζι. Οι τιμές εμφανίζονται σε χιλιοστά ισοδύναμου νερού. Για χιόνι, πολλαπλασιάστε περίπου επί 10-15 για εκτίμηση του ύψους χιονιού.',
      paramPrecipUsage: 'Χρησιμοποιήστε τα αθροιστικά σύνολα για αξιολόγηση κινδύνου πλημμύρας, υδάτινων πόρων και επιπτώσεων στις μετακινήσεις. Ελαφριά βροχή: 0.1-2.5mm/ώρα, μέτρια: 2.5-7.5mm/ώρα, έντονη: >7.5mm/ώρα. Η συσσώρευση χιονιού εξαρτάται από τη θερμοκρασία και την υγρασία - το κρύο ξηρό χιόνι έχει υψηλότερες αναλογίες (15:1) ενώ το υγρό χιόνι χαμηλότερες (5:1).',

      paramWind: 'Επιφανειακός Άνεμος',
      paramWindShort: 'Άνεμος',
      paramWindDesc: 'Ταχύτητα και Κατεύθυνση Ανέμου στα 10 μέτρα',
      paramWindInfo: 'Ταχύτητα και κατεύθυνση ανέμου στα 10 μέτρα πάνω από το έδαφος - το πρότυπο του Παγκόσμιου Μετεωρολογικού Οργανισμού για μετρήσεις επιφανειακού ανέμου. Τα βέλη δείχνουν την κατεύθυνση (ΑΠΟΠΟΥ φυσάει ο άνεμος), ενώ τα χρώματα/ισόγραμμες δείχνουν την ταχύτητα.',
      paramWindUsage: 'Ελαφρύ αεράκι: 5-15 km/h, Μέτριος: 20-40 km/h, Ισχυρός: 40-60 km/h, Θυελλώδης: 60-90 km/h, Καταιγίδα: >90 km/h. Η κατεύθυνση του ανέμου στρέφεται δεξιόστροφα με θερμά μέτωπα και αριστερόστροφα με ψυχρά μέτωπα. Οι ισχυρότεροι άνεμοι εμφανίζονται στις στενότερες βαρομετρικές διαβαθμίσεις.',

      paramJet: 'Αεροχείμαρρος',
      paramJetShort: 'Jet',
      paramJetDesc: 'Αεροχείμαρρος Ανωτέρων Στρωμάτων (250-300hPa)',
      paramJetInfo: 'Ο αεροχείμαρρος είναι μια στενή ζώνη πολύ ισχυρών ανέμων σε ύψος 9-12km, που ρέει τυπικά από δυτικά προς ανατολικά με ταχύτητες 100-400 km/h. Σχηματίζεται στο όριο μεταξύ ψυχρού πολικού αέρα και θερμού τροπικού αέρα, και η θέση του καθορίζει σε μεγάλο βαθμό τα επιφανειακά καιρικά πρότυπα.',
      paramJetUsage: 'Ο αεροχείμαρρος κατευθύνει τα επιφανειακά συστήματα χαμηλής πίεσης και καθορίζει τις διαδρομές των καταιγίδων. Περιοχές κάτω από την αριστερή έξοδο του jet συχνά βλέπουν ανάπτυξη καταιγίδων. Τα jet streaks (μέγιστα ταχύτητας) δημιουργούν περιοχές ανόδου και καθόδου αέρα που επηρεάζουν τα νέφη και τον υετό. Οι χρόνοι πτήσης επηρεάζονται σημαντικά από τη θέση του αεροχείμαρρου.',

      learnAbout: 'Μάθετε για',

      // Time
      hours: 'ώρες',
      days: 'ημέρες',

      // Charts
      temperature: 'Θερμοκρασία',
      precipitation: 'Βροχόπτωση',
      windSpeed: 'Ταχύτητα Ανέμου',
      pressureChart: 'Πίεση',
      chartsFrom: 'Χάρτες από',

      // Actions
      compare: 'Σύγκριση',
      live: 'Ζωντανά',

      // Language
      language: 'Γλώσσα',
      english: 'Αγγλικά',
      greek: 'Ελληνικά',

      // New keys
      modelOverview: 'Επισκόπηση Μοντέλων',
      currentTemperatureForecasts: 'Τρέχουσες θερμοκρασιακές προβλέψεις',
      modelComparison: 'Σύγκριση Μοντέλων',
      compareAllModelsSideBySide: 'Σύγκριση όλων των μοντέλων',
      observing: 'Παρατήρηση',
      charts: 'Χάρτες',
      visualization: 'απεικόνιση',
      latest: 'Πιο πρόσφατο',
      error: 'Σφάλμα',
      yes: 'Ναι',
      no: 'Όχι',
      resolution: 'Ανάλυση',
      updateTimes: 'Ενημερώσεις',
      forecastLength: 'Πρόγνωση',
      modelInfo: 'Πληροφορίες {{model}}',
      modelDetails: 'Λεπτομέρειες μοντέλου',
      runInfoTooltip: 'Τα μοντέλα εκτελούνται κάθε 6 ώρες (00z, 06z, 12z, 18z) και διατίθενται ~5 ώρες αργότερα.',
      nextRunAvailable: 'Επόμενη εκτέλεση',
      runTimingInfo: 'Πληροφορίες χρονισμού εκτέλεσης',
      unitedStates: 'Ηνωμένες Πολιτείες',
      removeLocation: 'Αφαίρεση',
      location: 'Τοποθεσία',
      forecastTime: 'Χρόνος Πρόγνωσης',
      selectRun: 'Επιλογή Εκτέλεσης',
      meteocielVisualization: 'Απεικόνιση Meteociel',

      // Regions
      region: 'Περιοχή',
      europe: 'Ευρώπη',
      regional: 'Τοπικά',
      regionalNotAvailable: 'Δεν υπάρχουν τοπικά χάρτες για αυτό το μοντέλο',
      paramNotAvailable: 'Η παράμετρος δεν είναι διαθέσιμη για αυτό το μοντέλο',
      greece: 'Ελλάδα',
      france: 'Γαλλία',
      italy: 'Ιταλία',
      spain: 'Ισπανία',
      uk: 'Ηνωμένο Βασίλειο',
      germany: 'Γερμανία',
      balkans: 'Βαλκάνια',
      central_europe: 'Κεντρική Ευρώπη',
      scandinavia: 'Σκανδιναβία',
      netherlands: 'Μπενελούξ',
      denmark: 'Δανία',
      turkey: 'Τουρκία',

      // Home page
      multiModelWeatherObservatory: 'Μετεωρολογικό παρατηρητήριο πολλαπλών μοντέλων',
      useMyLocation: 'Χρήση τοποθεσίας μου',
      searchForACity: 'Αναζήτηση πόλης...',
      orExplore: 'ή εξερευνήστε',
      findingYourLocation: 'Εντοπισμός τοποθεσίας...',
      locationError: 'Δεν ήταν δυνατός ο εντοπισμός. Δοκιμάστε αναζήτηση.',
      locationPermissionDenied: 'Η πρόσβαση τοποθεσίας απορρίφθηκε. Χρησιμοποιήστε αναζήτηση.',
      locationUnavailable: 'Η τοποθεσία δεν είναι διαθέσιμη. Δοκιμάστε αναζήτηση.',
      locationTimeout: 'Λήξη χρόνου αναμονής. Δοκιμάστε ξανά ή αναζητήστε.',
      noResultsFound: 'Δεν βρέθηκαν πόλεις. Δοκιμάστε διαφορετική αναζήτηση.',

      // EU Region Error
      euOnlyTitle: 'Μη Υποστηριζόμενη Περιοχή',
      euOnlyDescription: 'Το nimbi.gr υποστηρίζει προς το παρόν μόνο τοποθεσίες εντός Ευρώπης.',
      euOnlyHint: 'Παρακαλώ αναζητήστε μια τοποθεσία εντός της ευρωπαϊκής περιοχής.',

      // Weekly Outlook
      weeklyOutlook: 'Εβδομαδιαία Πρόβλεψη',
      basedOn: 'Βασισμένο στο',
      updated: 'Ενημερώθηκε',
      viewForecast: 'Δείτε πρόβλεψη',
      allModelsAgree: 'Όλα τα μοντέλα συμφωνούν',
      highConfidence: 'Υψηλή αξιοπιστία',
      moderateConfidence: 'Μέτρια αξιοπιστία',
      lowerConfidence: 'Χαμηλότερη αξιοπιστία',
      confidenceExplanation: 'Βασίζεται στη συμφωνία μεταξύ των μοντέλων ECMWF HD, GFS, GEM και UKMO.',

      // Simple Mode
      today: 'Σήμερα',
      now: 'Τώρα',
      feelsLike: 'Αίσθηση',
      kmh: 'χλμ/ω',
      conditionSunny: 'Ηλιόλουστο',
      conditionPartlyCloudy: 'Μερικώς Νεφελώδες',
      conditionCloudy: 'Νεφελώδες',
      conditionRainy: 'Βροχερό',
      conditionStormy: 'Καταιγίδα',
      conditionSnowy: 'Χιονόπτωση',

      // UV Index
      uvIndex: 'Δείκτης UV',
      uvLow: 'Χαμηλός',
      uvModerate: 'Μέτριος',
      uvHigh: 'Υψηλός',
      uvVeryHigh: 'Πολύ Υψηλός',
      uvExtreme: 'Ακραίος',

      // Precipitation
      precipChance: 'Πιθανότητα βροχής',
      precipProbability: 'Βροχόπτωση',

      // Sun Times
      sunrise: 'Ανατολή',
      sunset: 'Δύση',

      // Pro Mode
      proModeLabel: 'Pro Mode',
      proModeEnabled: 'Pro Mode ΕΝΕΡΓΟ',
      proModeDisabled: 'Pro Mode ΑΝΕΝΕΡΓΟ',
      proModeDescription: 'Εμφάνιση όλων των μοντέλων και προηγμένων γραφημάτων',

      // Search
      noResults: 'Δεν βρέθηκαν αποτελέσματα',
      minSearchChars: 'Πληκτρολογήστε τουλάχιστον 3 χαρακτήρες',
      tryDifferentSearch: 'Δοκιμάστε διαφορετικό όρο αναζήτησης',
      toNavigate: 'πλοήγηση',
      toSelect: 'επιλογή',
      toClose: 'κλείσιμο',
      searchLocation: 'Αναζήτηση Τοποθεσίας',
      searchResults: 'Αποτελέσματα',
      findYourLocation: 'Βρείτε την τοποθεσία σας',
      searchCitiesHint: 'Αναζητήστε πόλεις, κωμοπόλεις ή τοποθεσίες',

      // 404 Page
      pageNotFound: 'Η σελίδα δεν βρέθηκε',
      pageNotFoundDescription: 'Η σελίδα που ψάχνετε δεν υπάρχει ή έχει μετακινηθεί.',
      backToHome: 'Επιστροφή στην Αρχική',

      // Download
      download: 'Λήψη',
      downloadForecast: 'Λήψη πρόγνωσης ως εικόνα',
      downloading: 'Λήψη...',

      // SEO Meta
      metaHomeTitle: 'nimbi.gr - Μετεωρολογικό Παρατηρητήριο | Προγνώσεις Πολλαπλών Μοντέλων',
      metaHomeDescription:
        'Συγκρίνετε προγνώσεις καιρού από ECMWF, GFS, GEM & UKMO. Ακριβείς 7ήμερες προβλέψεις με ωριαία γραφήματα θερμοκρασίας, βροχόπτωσης, ανέμου & υγρασίας για κάθε τοποθεσία.',
      metaObservatoryTitle: 'Πρόγνωση Καιρού {{location}} | nimbi.gr',
      metaObservatoryDescription:
        'Ακριβής πρόγνωση καιρού για {{location}}. Συγκρίνετε μοντέλα ECMWF, GFS, GEM & UKMO με ωριαία γραφήματα θερμοκρασίας, βροχής, ανέμου, υγρασίας & πίεσης.',
      meta404Title: 'Η Σελίδα Δεν Βρέθηκε | nimbi.gr',

      // Air Quality
      airQuality: 'Ποιότητα Αέρα',
      aqiGood: 'Καλή',
      aqiFair: 'Μέτρια',
      aqiModerate: 'Μέτρια προς Κακή',
      aqiPoor: 'Κακή',
      aqiVeryPoor: 'Πολύ Κακή',
      aqiExtremelyPoor: 'Εξαιρετικά Κακή',
      aqiExplanation: 'Ευρωπαϊκός Δείκτης Ποιότητας Αέρα (EAQI) βασισμένος σε συγκεντρώσεις PM2.5, PM10, O3 και NO2. Χαμηλότερες τιμές υποδεικνύουν καλύτερη ποιότητα αέρα.',
      aqiOzone: 'Όζον',
      aqiNO2: 'NO2',

      // Weather Alerts
      weatherAlerts: 'Ειδοποιήσεις Καιρού',
      noActiveAlerts: 'Χωρίς ενεργές ειδοποιήσεις',
      noActiveAlertsDesc: 'Δεν υπάρχουν προειδοποιήσεις καιρού για αυτήν την περιοχή',
      alertValidUntil: 'Ισχύει έως',
      alertsSource: 'Πηγή',
      more: 'ακόμα',

      // Alert Severity
      'alertSeverity.minor': 'Ήπια',
      'alertSeverity.moderate': 'Μέτρια',
      'alertSeverity.severe': 'Σοβαρή',
      'alertSeverity.extreme': 'Ακραία',

      // Alert Types
      'alertType.wind': 'Ισχυροί Άνεμοι',
      'alertType.snow-ice': 'Χιόνι/Πάγος',
      'alertType.thunderstorm': 'Καταιγίδα',
      'alertType.fog': 'Πυκνή Ομίχλη',
      'alertType.high-temperature': 'Καύσωνας',
      'alertType.low-temperature': 'Ψύχος',
      'alertType.coastal-event': 'Παράκτιος Κίνδυνος',
      'alertType.forest-fire': 'Κίνδυνος Πυρκαγιάς',
      'alertType.avalanche': 'Κίνδυνος Χιονοστιβάδας',
      'alertType.rain': 'Έντονη Βροχόπτωση',
      'alertType.flood': 'Κίνδυνος Πλημμύρας',
      'alertType.rain-flood': 'Βροχή/Πλημμύρα',

      // Recent Searches
      recentSearches: 'Πρόσφατα',

      // Keyboard Shortcuts
      keyboardShortcutModels: 'μοντέλα',
      keyboardShortcutTime: 'χρόνος',

      // Share
      share: 'Κοινοποίηση',
      linkCopied: 'Ο σύνδεσμος αντιγράφηκε!',
      shareForecastText: 'Πρόγνωση καιρού για {{location}}',

      // Model Groups
      'modelGroup.high-res': 'Υψηλή Ανάλυση',
      'modelGroup.ensemble': 'Ensemble',

      // Model Names
      'modelName.ecmwf-hres': 'ECMWF HD',
      'modelName.icon': 'ICON',
      'modelName.arpege': 'ARPEGE',
      'modelName.gfs': 'GFS',
      'modelName.gem': 'GEM',
      'modelName.ukmo': 'UKMO',
      'modelName.ec-aifs': 'EC-AIFS',
      'modelName.gefs': 'GEFS',
      'modelName.eps': 'EPS',

      // Chart Parameters (Tropical Tidbits)
      'param.mslp': 'Πίεση & Υετός',
      'param.t2m': 'Θερμ. 2m',
      'param.t850': 'Θερμ. 850',
      'param.wind': 'Άνεμος',
      'param.jet': 'Jet Stream',
      'param.z500': 'Ύψη 500mb',
      'param.cape': 'CAPE',
      'param.precip24': 'Υετός 24ω',
      'param.snow': 'Χιονόπτωση',
      'param.pwat': 'PWAT',
      'param.ir': 'Δορυφόρος',

      // Scope
      'scope.europe': 'Ευρώπη',
      'scope.regional': 'Περιφέρεια',
    },
  },
}
