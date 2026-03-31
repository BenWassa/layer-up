export const ACTIVITY_LEVELS = [
  { key: "stationary", label: "Stationary", icon: "🧍", modifier: 0, desc: "Standing, waiting, watching" },
  { key: "light", label: "Light", icon: "🚶", modifier: -3, desc: "Walking, casual commute" },
  { key: "moderate", label: "Moderate", icon: "🚴", modifier: -6, desc: "Cycling, brisk walking" },
  { key: "high", label: "High", icon: "🏃", modifier: -10, desc: "Running, sport, intense" },
];

export const DURATIONS = [
  { key: "short", label: "<30 min", minutes: 15 },
  { key: "medium", label: "30–90 min", minutes: 60 },
  { key: "long", label: "1.5–3 hrs", minutes: 135 },
  { key: "extended", label: "3+ hrs", minutes: 240 },
];

export const COMFORT_RATINGS = [
  { key: "tooCold", label: "Too Cold", icon: "🥶", color: "#4A90D9" },
  { key: "cold", label: "Cold", icon: "😬", color: "#7EB8DA" },
  { key: "justRight", label: "Just Right", icon: "😊", color: "#6ABF69" },
  { key: "warm", label: "Warm", icon: "😅", color: "#E8A838" },
  { key: "tooHot", label: "Too Hot", icon: "🥵", color: "#D94A4A" },
];

export const LAYERS = {
  base: ["Tank", "T-shirt", "Long sleeve", "Thermal"],
  outer: ["None", "Light layer", "Fleece/Hoodie", "Insulated jacket", "Heavy coat"],
  bottom: ["Shorts", "Light pants", "Jeans", "Warm pants", "Thermal leggings"],
  accessories: ["None", "Hat", "Gloves", "Scarf", "Hat + Gloves", "Full set"],
  footwear: ["Sandals", "Sneakers", "Closed shoes", "Boots", "Waterproof boots"],
};

export const LAYER_ICONS = {
  base: "👕",
  outer: "🧥",
  bottom: "👖",
  accessories: "🧤",
  footwear: "👟",
};

export const LAYER_LABELS = {
  base: "Base Layer",
  outer: "Outer Layer",
  bottom: "Bottoms",
  accessories: "Accessories",
  footwear: "Footwear",
};

export function weatherIcon(code) {
  if (code === 0) return "☀️";
  if (code <= 3) return "⛅";
  if (code <= 49) return "🌫️";
  if (code <= 59) return "🌧️";
  if (code <= 69) return "🌨️";
  if (code <= 79) return "❄️";
  if (code <= 82) return "🌧️";
  if (code <= 86) return "🌨️";
  if (code >= 95) return "⛈️";
  return "🌤️";
}

export function weatherDesc(code) {
  if (code === 0) return "Clear sky";
  if (code <= 3) return "Partly cloudy";
  if (code <= 49) return "Foggy";
  if (code <= 55) return "Drizzle";
  if (code <= 59) return "Freezing drizzle";
  if (code <= 65) return "Rain";
  if (code <= 69) return "Freezing rain";
  if (code <= 75) return "Snowfall";
  if (code <= 77) return "Snow grains";
  if (code <= 82) return "Rain showers";
  if (code <= 86) return "Snow showers";
  if (code >= 95) return "Thunderstorm";
  return "Overcast";
}

export function generateDemoLogs(count = 25) {
  const logs = [];
  const comforts = ["tooCold", "cold", "justRight", "justRight", "justRight", "warm", "tooHot"];
  const activities = ["stationary", "light", "moderate", "high"];
  const durations = ["short", "medium", "long", "extended"];

  for (let i = 0; i < count; i++) {
    const temp = Math.round(Math.random() * 35 - 5);
    const feelsLike = temp + Math.round((Math.random() - 0.5) * 6);
    const activity = activities[Math.floor(Math.random() * activities.length)];
    const actMod = ACTIVITY_LEVELS.find(a => a.key === activity).modifier;
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
        location: "Toronto, ON",
      },
      activity,
      duration: durations[Math.floor(Math.random() * durations.length)],
      outfit,
      comfort: comforts[Math.floor(Math.random() * comforts.length)],
      notes: "",
    });
  }
  return logs;
}

// reuse from logic; to avoid cycles we define a minimal direct version here
function phase1Recommend(effectiveTemp, hasPrecip, hasSnow) {
  let outfit;
  if (effectiveTemp > 25) outfit = { base: 0, outer: 0, bottom: 0, accessories: 0, footwear: 0 };
  else if (effectiveTemp > 20) outfit = { base: 1, outer: 0, bottom: 1, accessories: 0, footwear: 1 };
  else if (effectiveTemp > 15) outfit = { base: 2, outer: 1, bottom: 2, accessories: 0, footwear: 1 };
  else if (effectiveTemp > 10) outfit = { base: 3, outer: 2, bottom: 3, accessories: 0, footwear: 2 };
  else if (effectiveTemp > 5) outfit = { base: 3, outer: 3, bottom: 3, accessories: 1, footwear: 3 };
  else outfit = { base: 3, outer: 4, bottom: 3, accessories: 5, footwear: 3 };

  if (hasSnow) {
    outfit.footwear = 4;
    outfit.accessories = Math.max(outfit.accessories, 5);
  } else if (hasPrecip) {
    outfit.footwear = Math.min(outfit.footwear + 1, 4);
  }
  return outfit;
}
