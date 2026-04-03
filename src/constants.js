export const ACTIVITY_LEVELS = [
  {
    key: 'stationary',
    label: 'Stationary',
    icon: '🧍',
    modifier: 0,
    desc: 'Standing, waiting, watching',
  },
  {
    key: 'light',
    label: 'Light',
    icon: '🚶',
    modifier: -3,
    desc: 'Walking, casual commute',
  },
  {
    key: 'moderate',
    label: 'Moderate',
    icon: '🚴',
    modifier: -6,
    desc: 'Cycling, brisk walking',
  },
  {
    key: 'high',
    label: 'High',
    icon: '🏃',
    modifier: -10,
    desc: 'Running, sport, intense',
  },
];

export const DURATIONS = [
  { key: 'short', label: '<30 min', minutes: 15, modifier: 2 },
  { key: 'medium', label: '30–90 min', minutes: 60, modifier: 0 },
  { key: 'long', label: '1.5–3 hrs', minutes: 135, modifier: -2 },
  { key: 'extended', label: '3+ hrs', minutes: 240, modifier: -4 },
];

export const COMFORT_RATINGS = [
  { key: 'tooCold', label: 'Freezing', icon: '🥶', color: '#4A90D9' },
  { key: 'cold', label: 'Chilly', icon: '🧊', color: '#7EB8DA' },
  { key: 'justRight', label: 'Comfortable', icon: '😊', color: '#6ABF69' },
  { key: 'warm', label: 'Sweating', icon: '😓', color: '#E8A838' },
  { key: 'tooHot', label: 'Sweltering', icon: '🥵', color: '#D94A4A' },
];

export const LAYERS = {
  base: ['Tank', 'T-shirt', 'Long sleeve', 'Thermal'],
  mid: ['None', 'Overshirt', 'Hoodie', 'Fleece'],
  outer: ['None', 'Rain jacket', 'Light jacket', 'Insulated jacket', 'Parka'],
  bottom: ['Shorts', 'Light pants', 'Jeans', 'Warm pants', 'Thermal leggings'],
  accessories: [
    'None',
    'Toque',
    'Gloves',
    'Scarf',
    'Toque + Gloves',
    'Full set',
  ],
  footwear: ['Slides', 'Trainers', 'Boots', 'Winter boots'],
};

export const BODY_ZONES = [
  { key: 'feet', label: 'Feet', emoji: '🦶' },
  { key: 'legs', label: 'Legs', emoji: '🦵' },
  { key: 'core', label: 'Core', emoji: '🫁' },
  { key: 'hands', label: 'Hands', emoji: '🤲' },
  { key: 'head', label: 'Head', emoji: '🧢' },
];

export const OUTFIT_CATEGORIES = Object.keys(LAYERS);

export const LAYER_ICONS = {
  base: '👕',
  mid: '👔',
  outer: '🧥',
  bottom: '👖',
  accessories: '🧤',
  footwear: '👟',
};

export const LAYER_LABELS = {
  base: 'Base Layer',
  mid: 'Mid Layer',
  outer: 'Outer Layer',
  bottom: 'Bottoms',
  accessories: 'Accessories',
  footwear: 'Footwear',
};

export function normalizeOutfit(outfit = {}) {
  return OUTFIT_CATEGORIES.reduce((normalized, category) => {
    const maxIndex = LAYERS[category].length - 1;
    const value = Number.isInteger(outfit[category]) ? outfit[category] : 0;
    normalized[category] = Math.min(Math.max(value, 0), maxIndex);
    return normalized;
  }, {});
}

export function weatherIcon(code) {
  if (code === 0) return '☀️';
  if (code <= 3) return '⛅';
  if (code <= 49) return '🌫️';
  if (code <= 59) return '🌧️';
  if (code <= 69) return '🌨️';
  if (code <= 79) return '❄️';
  if (code <= 82) return '🌧️';
  if (code <= 86) return '🌨️';
  if (code >= 95) return '⛈️';
  return '🌤️';
}

export function weatherDesc(code) {
  if (code === 0) return 'Clear sky';
  if (code <= 3) return 'Partly cloudy';
  if (code <= 49) return 'Foggy';
  if (code <= 55) return 'Drizzle';
  if (code <= 59) return 'Freezing drizzle';
  if (code <= 65) return 'Rain';
  if (code <= 69) return 'Freezing rain';
  if (code <= 75) return 'Snowfall';
  if (code <= 77) return 'Snow grains';
  if (code <= 82) return 'Rain showers';
  if (code <= 86) return 'Snow showers';
  if (code >= 95) return 'Thunderstorm';
  return 'Overcast';
}

export const toC = (f) => Math.round(((f - 32) * 5) / 9);
export const toF = (c) => Math.round((c * 9) / 5 + 32);

export function getTempColor(feelsLike) {
  const cold = { r: 75, g: 140, b: 201 };
  const neutral = { r: 130, g: 130, b: 130 };
  const warm = { r: 209, g: 126, b: 69 };
  const t = Math.max(0, Math.min(1, (feelsLike + 2) / 27)); // 0 at ≤-2°C, 1 at ≥25°C
  const lerp = (a, b, s) => Math.round(a + (b - a) * s);
  let from, to, s;
  if (t < 0.5) { from = cold; to = neutral; s = t * 2; }
  else { from = neutral; to = warm; s = (t - 0.5) * 2; }
  return `rgb(${lerp(from.r, to.r, s)}, ${lerp(from.g, to.g, s)}, ${lerp(from.b, to.b, s)})`;
}

export function generateDemoLogs(count = 25) {
  const logs = [];
  const comforts = [
    'tooCold',
    'cold',
    'justRight',
    'justRight',
    'justRight',
    'warm',
    'tooHot',
  ];
  const activities = ['stationary', 'light', 'moderate', 'high'];
  const durations = ['short', 'medium', 'long', 'extended'];

  for (let i = 0; i < count; i++) {
    const temp = Math.round(Math.random() * 35 - 5);
    const feelsLike = temp + Math.round((Math.random() - 0.5) * 6);
    const activity = activities[Math.floor(Math.random() * activities.length)];
    const actMod = ACTIVITY_LEVELS.find((a) => a.key === activity).modifier;
    const effTemp = feelsLike + actMod;
    const hasPrecip = Math.random() > 0.7;
    const hasSnow = Math.random() > 0.9;
    const outfit = phase1Recommend(effTemp, hasPrecip, hasSnow);

    logs.push({
      id: `demo-${i}-${Date.now()}`,
      timestamp: Date.now() - (count - i) * 86400000,
      weather: {
        temp,
        feelsLike,
        humidity: Math.round(40 + Math.random() * 50),
        windSpeed: Math.round(Math.random() * 30),
        precipitation: hasPrecip ? +(Math.random() * 5).toFixed(1) : 0,
        uvIndex: Math.round(Math.random() * 10),
        weatherCode: [0, 1, 2, 3, 51, 61, 71][Math.floor(Math.random() * 7)],
        location: 'Toronto, ON',
      },
      activity,
      duration: durations[Math.floor(Math.random() * durations.length)],
      outfit,
      comfort: comforts[Math.floor(Math.random() * comforts.length)],
      notes: '',
    });
  }
  return logs;
}

// reuse from logic; to avoid cycles we define a minimal direct version here
function phase1Recommend(effectiveTemp, hasPrecip, hasSnow) {
  let outfit;
  if (effectiveTemp > 25)
    outfit = {
      base: 0,
      mid: 0,
      outer: 0,
      bottom: 0,
      accessories: 0,
      footwear: 0,
    };
  else if (effectiveTemp > 20)
    outfit = {
      base: 1,
      mid: 0,
      outer: 0,
      bottom: 1,
      accessories: 0,
      footwear: 1,
    };
  else if (effectiveTemp > 15)
    outfit = {
      base: 1,
      mid: 1,
      outer: 0,
      bottom: 2,
      accessories: 0,
      footwear: 1,
    };
  else if (effectiveTemp > 10)
    outfit = {
      base: 2,
      mid: 2,
      outer: 1,
      bottom: 2,
      accessories: 0,
      footwear: 2,
    };
  else if (effectiveTemp > 5)
    outfit = {
      base: 2,
      mid: 3,
      outer: 2,
      bottom: 3,
      accessories: 1,
      footwear: 3,
    };
  else
    outfit = {
      base: 3,
      mid: 3,
      outer: 4,
      bottom: 4,
      accessories: 5,
      footwear: 3,
    };

  if (hasSnow) {
    outfit.footwear = LAYERS.footwear.length - 1;
    outfit.accessories = Math.max(outfit.accessories, 5);
  } else if (hasPrecip) {
    outfit.footwear = Math.min(outfit.footwear + 1, LAYERS.footwear.length - 1);
    outfit.outer = Math.max(outfit.outer, 1);
  }
  return normalizeOutfit(outfit);
}
