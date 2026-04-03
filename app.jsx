import { useState, useEffect } from 'react';

// ─── CONSTANTS & DATA ─────────────────────────────────────────────
const ACTIVITY_LEVELS = [
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

const DURATIONS = [
  { key: 'short', label: '<30 min', minutes: 15 },
  { key: 'medium', label: '30–90 min', minutes: 60 },
  { key: 'long', label: '1.5–3 hrs', minutes: 135 },
  { key: 'extended', label: '3+ hrs', minutes: 240 },
];

const COMFORT_RATINGS = [
  { key: 'tooCold', label: 'Too Cold', icon: '🥶', color: '#4A90D9' },
  { key: 'cold', label: 'Cold', icon: '😬', color: '#7EB8DA' },
  { key: 'justRight', label: 'Just Right', icon: '😊', color: '#6ABF69' },
  { key: 'warm', label: 'Warm', icon: '😅', color: '#E8A838' },
  { key: 'tooHot', label: 'Too Hot', icon: '🥵', color: '#D94A4A' },
];

const LAYERS = {
  base: ['Tank', 'T-shirt', 'Long sleeve', 'Thermal'],
  outer: [
    'None',
    'Light layer',
    'Fleece/Hoodie',
    'Insulated jacket',
    'Heavy coat',
  ],
  bottom: ['Shorts', 'Light pants', 'Jeans', 'Warm pants', 'Thermal leggings'],
  accessories: ['None', 'Hat', 'Gloves', 'Scarf', 'Hat + Gloves', 'Full set'],
  footwear: [
    'Sandals',
    'Sneakers',
    'Closed shoes',
    'Boots',
    'Waterproof boots',
  ],
};

const LAYER_ICONS = {
  base: '👕',
  outer: '🧥',
  bottom: '👖',
  accessories: '🧤',
  footwear: '👟',
};

const LAYER_LABELS = {
  base: 'Base Layer',
  outer: 'Outer Layer',
  bottom: 'Bottoms',
  accessories: 'Accessories',
  footwear: 'Footwear',
};

// ─── ALGORITHM ENGINE ─────────────────────────────────────────────
function getPhase(logCount) {
  if (logCount >= 50) return 4;
  if (logCount >= 30) return 3;
  if (logCount >= 10) return 2;
  return 1;
}

function getPhaseLabel(phase, logCount) {
  switch (phase) {
    case 1:
      return 'Based on standard thermal conditions';
    case 2:
      return `Calibrated to your warmth profile (${logCount} logs)`;
    case 3:
      return `Tuned to your activity patterns (${logCount} logs)`;
    case 4:
      return `Matched to similar days in your history`;
    default:
      return '';
  }
}

function phase1Recommend(effectiveTemp, hasPrecip, hasSnow) {
  let outfit;
  if (effectiveTemp > 25) {
    outfit = { base: 0, outer: 0, bottom: 0, accessories: 0, footwear: 0 };
  } else if (effectiveTemp > 20) {
    outfit = { base: 1, outer: 0, bottom: 1, accessories: 0, footwear: 1 };
  } else if (effectiveTemp > 15) {
    outfit = { base: 2, outer: 1, bottom: 2, accessories: 0, footwear: 1 };
  } else if (effectiveTemp > 10) {
    outfit = { base: 3, outer: 2, bottom: 3, accessories: 0, footwear: 2 };
  } else if (effectiveTemp > 5) {
    outfit = { base: 3, outer: 3, bottom: 3, accessories: 1, footwear: 3 };
  } else {
    outfit = { base: 3, outer: 4, bottom: 3, accessories: 5, footwear: 3 };
  }
  if (hasSnow) {
    outfit.footwear = 4;
    outfit.accessories = Math.max(outfit.accessories, 5);
  } else if (hasPrecip) {
    outfit.footwear = Math.min(outfit.footwear + 1, 4);
  }
  return outfit;
}

function calculateOffset(logs) {
  if (logs.length < 10) return 0;
  const comfortMap = {
    tooCold: -2,
    cold: -1,
    justRight: 0,
    warm: 1,
    tooHot: 2,
  };
  const total = logs.reduce((sum, l) => sum + (comfortMap[l.comfort] || 0), 0);
  return -(total / logs.length) * 1.5;
}

function calculateActivityOffsets(logs) {
  const offsets = {};
  for (const act of ACTIVITY_LEVELS) {
    const actLogs = logs.filter((l) => l.activity === act.key);
    if (actLogs.length >= 5) {
      offsets[act.key] = calculateOffset(actLogs);
    }
  }
  return offsets;
}

function euclideanDist(a, b) {
  return Math.sqrt(
    ((a.feelsLike - b.feelsLike) / 10) ** 2 +
      ((a.humidity - b.humidity) / 30) ** 2 +
      ((a.windSpeed - b.windSpeed) / 10) ** 2
  );
}

function phase4Recommend(weather, activity, duration, logs) {
  const justRightLogs = logs.filter(
    (l) => l.comfort === 'justRight' && l.activity === activity
  );
  if (justRightLogs.length < 3) return null;
  const scored = justRightLogs
    .map((l) => ({
      log: l,
      dist: euclideanDist(
        {
          feelsLike: weather.feelsLike,
          humidity: weather.humidity,
          windSpeed: weather.windSpeed,
        },
        {
          feelsLike: l.weather.feelsLike,
          humidity: l.weather.humidity,
          windSpeed: l.weather.windSpeed,
        }
      ),
    }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 5);
  if (scored[0].dist > 5) return null;
  const best = scored[0].log;
  return best.outfit;
}

function getRecommendation(weather, activity, duration, logs) {
  const phase = getPhase(logs.length);
  const actMod = ACTIVITY_LEVELS.find((a) => a.key === activity)?.modifier || 0;
  let effectiveTemp = weather.feelsLike + actMod;
  if (phase >= 2) {
    const offset =
      phase >= 3
        ? calculateActivityOffsets(logs)[activity] || calculateOffset(logs)
        : calculateOffset(logs);
    effectiveTemp += offset;
  }
  if (phase === 4) {
    const p4 = phase4Recommend(weather, activity, duration, logs);
    if (p4) return { outfit: p4, phase, effectiveTemp };
  }
  const hasPrecip = weather.precipitation > 0;
  const hasSnow = weather.weatherCode >= 71 && weather.weatherCode <= 77;
  const outfit = phase1Recommend(effectiveTemp, hasPrecip, hasSnow);
  return { outfit, phase, effectiveTemp };
}

// ─── WEATHER CODE MAPPING ─────────────────────────────────────────
function weatherIcon(code) {
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

function weatherDesc(code) {
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

// ─── DEMO DATA ────────────────────────────────────────────────────
function generateDemoLogs(count = 25) {
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
    const outfit = phase1Recommend(
      effTemp,
      Math.random() > 0.7,
      Math.random() > 0.9
    );
    logs.push({
      id: `demo-${i}-${Date.now()}`,
      timestamp: Date.now() - (count - i) * 86400000,
      weather: {
        temp,
        feelsLike,
        humidity: Math.round(40 + Math.random() * 50),
        windSpeed: Math.round(Math.random() * 30),
        precipitation:
          Math.random() > 0.7 ? +(Math.random() * 5).toFixed(1) : 0,
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

// ─── STYLES ───────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,700;1,9..144,400&display=swap');

:root {
  --bg: #080A0F;
  --surface: #12151C;
  --surface2: #1B1F2A;
  --surface3: #252A38;
  --border: rgba(255, 255, 255, 0.06);
  --border-light: rgba(255, 255, 255, 0.12);
  --text: #F2F5F8;
  --text2: #A3ADB9;
  --text3: #6C7A8C;
  --accent: #5B9FE0;
  --accent2: #3876B5;
  --warm: #E8A838;
  --cold: #4A90D9;
  --green: #56B355;
  --red: #D94A4A;
  --orange: #E07B3D;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body, #root {
  font-family: 'DM Sans', sans-serif;
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
}

.app {
  max-width: 430px;
  margin: 0 auto;
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}

/* ─── Nav ─── */
.bottom-nav {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 48px);
  max-width: 380px;
  display: flex;
  justify-content: space-between;
  padding: 8px;
  background: rgba(18, 21, 28, 0.75);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 24px;
  border: 1px solid var(--border-light);
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.4);
  z-index: 100;
}

.nav-btn {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--text3);
  font-size: 11px;
  font-weight: 500;
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 0;
  border-radius: 16px;
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.nav-btn.active { 
  color: var(--accent); 
  background: rgba(91, 159, 224, 0.1);
}
.nav-btn .nav-icon { font-size: 20px; margin-bottom: 2px; }

/* ─── Header ─── */
.header {
  padding: 24px 24px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-family: 'Fraunces', serif;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.logo span { color: var(--accent); }

.phase-pill {
  font-size: 11px;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 20px;
  background: var(--surface2);
  border: 1px solid var(--border);
  color: var(--text2);
  letter-spacing: 0.3px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

/* ─── Main Pages ─── */
.home-page, .history-page, .insights-page, .settings-page {
  padding-bottom: 120px; /* Safe space for floating nav */
}

/* ─── Weather Card ─── */
.weather-card {
  margin: 24px;
  padding: 28px;
  border-radius: 28px;
  background: linear-gradient(145deg, #171B24 0%, #0D0F14 100%);
  border: 1px solid var(--border-light);
  position: relative;
  overflow: hidden;
  box-shadow: 0 16px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05);
}

.weather-card::before {
  content: '';
  position: absolute;
  top: -60%;
  right: -30%;
  width: 250px;
  height: 250px;
  background: radial-gradient(circle, rgba(91,159,224,0.12) 0%, transparent 60%);
  pointer-events: none;
}

.weather-location {
  font-size: 13px;
  font-weight: 500;
  color: var(--text2);
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.weather-main {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.weather-temp {
  font-family: 'Fraunces', serif;
  font-size: 64px;
  font-weight: 300;
  line-height: 0.9;
  letter-spacing: -2.5px;
}

.weather-temp-unit {
  font-size: 24px;
  font-weight: 400;
  color: var(--text3);
  vertical-align: top;
  margin-left: 2px;
}

.weather-icon { font-size: 48px; filter: drop-shadow(0 4px 12px rgba(0,0,0,0.2)); }
.weather-desc { font-size: 15px; font-weight: 500; color: var(--text2); margin-top: 8px;}

.weather-details {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid var(--border);
}

.weather-detail {
  text-align: center;
}

.weather-detail-val {
  font-size: 16px;
  font-weight: 600;
}

.weather-detail-label {
  font-size: 10px;
  color: var(--text3);
  margin-top: 4px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  font-weight: 600;
}

/* ─── Selectors ─── */
.selector-section {
  padding: 0 24px;
  margin-bottom: 24px;
}

.selector-label {
  font-size: 12px;
  color: var(--text3);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 12px;
  font-weight: 600;
}

.selector-row {
  display: flex;
  gap: 8px;
}

.sel-btn {
  flex: 1;
  padding: 12px 6px;
  border-radius: 16px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text2);
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.sel-btn:hover {
  background: var(--surface2);
  transform: translateY(-2px);
}

.sel-btn.active {
  background: var(--surface2);
  color: var(--text);
  border-color: var(--accent);
  box-shadow: 0 4px 16px rgba(91,159,224,0.15), inset 0 0 0 1px var(--accent);
}

.sel-btn .sel-icon { font-size: 22px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2)); }
.sel-btn .sel-label { font-size: 12px; font-weight: 600; }

/* ─── Recommendation ─── */
.rec-card {
  margin: 24px;
  padding: 28px;
  border-radius: 28px;
  background: var(--surface);
  border: 1px solid var(--border);
  box-shadow: 0 12px 24px rgba(0,0,0,0.2);
}

.rec-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.rec-title {
  font-family: 'Fraunces', serif;
  font-size: 20px;
  font-weight: 600;
}

.rec-conf {
  font-size: 11px;
  font-weight: 500;
  color: var(--text3);
  max-width: 50%;
  text-align: right;
  line-height: 1.4;
}

.outfit-layers {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.outfit-layer {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--border);
  transition: all 0.2s;
}

.outfit-layer:hover { 
  background: rgba(255, 255, 255, 0.04); 
  transform: scale(1.01);
}

.layer-icon { font-size: 22px; width: 32px; text-align: center; }

.layer-info { flex: 1; }
.layer-cat { font-size: 10px; color: var(--text3); text-transform: uppercase; letter-spacing: 0.8px; font-weight: 600;}
.layer-val { font-size: 15px; font-weight: 500; margin-top: 2px; color: var(--text); }

.layer-warmth {
  width: 40px;
  height: 6px;
  border-radius: 3px;
  background: var(--surface3);
  overflow: hidden;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.5);
}

.layer-warmth-fill {
  height: 100%;
  border-radius: 3px;
  background: linear-gradient(90deg, var(--cold), var(--warm));
  transition: width 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
}

/* ─── Log Button ─── */
.log-btn {
  display: block;
  margin: 32px auto 32px;
  padding: 16px 48px;
  border: none;
  border-radius: 20px;
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent2) 100%);
  color: white;
  font-family: 'DM Sans', sans-serif;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.3px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 8px 24px rgba(91,159,224,0.25), inset 0 1px 0 rgba(255,255,255,0.2);
}

.log-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(91,159,224,0.35), inset 0 1px 0 rgba(255,255,255,0.2); }
.log-btn:active { transform: translateY(0); box-shadow: 0 4px 12px rgba(91,159,224,0.25); }

/* ─── Log Sheet ─── */
.sheet-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.75);
  backdrop-filter: blur(4px);
  z-index: 200;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  animation: fadeIn 0.2s;
}

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }

.sheet {
  width: 100%;
  max-width: 430px;
  max-height: 90vh;
  overflow-y: auto;
  background: var(--surface);
  border-radius: 32px 32px 0 0;
  border-top: 1px solid var(--border-light);
  padding: 24px 24px max(32px, env(safe-area-inset-bottom));
  animation: slideUp 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
  box-shadow: 0 -10px 40px rgba(0,0,0,0.5);
}

.sheet-handle {
  width: 48px;
  height: 5px;
  background: var(--surface3);
  border-radius: 3px;
  margin: 0 auto 24px;
}

.sheet-title {
  font-family: 'Fraunces', serif;
  font-size: 24px;
  margin-bottom: 24px;
  text-align: center;
  font-weight: 600;
}

.comfort-row {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
}

.comfort-btn {
  flex: 1;
  padding: 14px 4px;
  border-radius: 16px;
  border: 1px solid var(--border);
  background: var(--surface2);
  cursor: pointer;
  text-align: center;
  transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
  font-family: 'DM Sans', sans-serif;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.comfort-btn:hover { background: var(--surface3); transform: translateY(-2px); }
.comfort-btn.active { 
  background: rgba(255,255,255,0.03);
  border-width: 2px;
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.2);
}
.comfort-btn .comfort-icon { font-size: 24px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2)); }
.comfort-btn .comfort-label { font-size: 10px; font-weight: 600; margin-top: 6px; color: var(--text2); }

.notes-input {
  width: 100%;
  padding: 16px;
  border-radius: 16px;
  border: 1px solid var(--border);
  background: var(--surface2);
  color: var(--text);
  font-family: 'DM Sans', sans-serif;
  font-size: 15px;
  resize: none;
  outline: none;
  margin-bottom: 24px;
  box-shadow: inset 0 2px 6px rgba(0,0,0,0.2);
  transition: border-color 0.2s;
}

.notes-input:focus { border-color: var(--accent); }
.notes-input::placeholder { color: var(--text3); }

.sheet-submit {
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 18px;
  background: var(--green);
  color: white;
  font-family: 'DM Sans', sans-serif;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 8px 24px rgba(86, 179, 85, 0.25), inset 0 1px 0 rgba(255,255,255,0.2);
}
.sheet-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(86, 179, 85, 0.35); }
.sheet-submit:disabled { opacity: 0.4; cursor: default; box-shadow: none; transform: none; }

/* ─── History & Insights Pages ─── */
.history-page { padding: 24px 24px 0; }
.insights-page { padding: 24px 24px 0; }

.history-title, .insights-title, .settings-title {
  font-family: 'Fraunces', serif;
  font-size: 28px;
  margin-bottom: 24px;
  font-weight: 600;
}

.history-item {
  padding: 20px;
  border-radius: 20px;
  background: var(--surface);
  border: 1px solid var(--border);
  margin-bottom: 12px;
  box-shadow: 0 8px 16px rgba(0,0,0,0.15);
}

.history-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.history-date { font-size: 14px; font-weight: 500; color: var(--text2); }
.history-comfort { font-size: 20px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2)); }

.history-conditions {
  display: flex;
  gap: 12px;
  font-size: 13px;
  color: var(--text3);
  flex-wrap: wrap;
}

.history-outfit {
  display: flex;
  gap: 8px;
  margin-top: 14px;
  flex-wrap: wrap;
}

.history-tag {
  padding: 6px 10px;
  border-radius: 8px;
  background: var(--surface2);
  font-size: 12px;
  font-weight: 500;
  color: var(--text2);
  border: 1px solid var(--border);
}

/* ─── Insights Details ─── */
.stat-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 32px;
}

.stat-card {
  padding: 20px;
  border-radius: 20px;
  background: var(--surface);
  border: 1px solid var(--border);
  text-align: center;
  box-shadow: 0 8px 16px rgba(0,0,0,0.15);
}

.stat-val {
  font-family: 'Fraunces', serif;
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 6px;
}

.stat-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text3);
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

.insight-section {
  margin-bottom: 32px;
  background: var(--surface);
  padding: 20px;
  border-radius: 24px;
  border: 1px solid var(--border);
  box-shadow: 0 8px 16px rgba(0,0,0,0.15);
}

.insight-section-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--text);
  letter-spacing: 0.3px;
}

.bar-chart {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.bar-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.bar-label {
  width: 75px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text2);
  text-align: right;
}

.bar-track {
  flex: 1;
  height: 28px;
  background: var(--surface2);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
}

.bar-fill {
  height: 100%;
  border-radius: 8px;
  transition: width 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
  display: flex;
  align-items: center;
  padding-left: 10px;
  font-size: 12px;
  font-weight: 600;
  color: white;
  min-width: fit-content;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.2);
}

/* ─── Settings ─── */
.settings-page { padding: 24px 24px 0; }

.setting-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-radius: 20px;
  background: var(--surface);
  border: 1px solid var(--border);
  margin-bottom: 12px;
  box-shadow: 0 8px 16px rgba(0,0,0,0.15);
}

.setting-label { font-size: 15px; font-weight: 500; }
.setting-desc { font-size: 12px; color: var(--text3); margin-top: 4px; }

.toggle-group {
  display: flex;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--border);
  background: var(--surface2);
}

.toggle-opt {
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  font-family: 'DM Sans', sans-serif;
  border: none;
  background: transparent;
  color: var(--text3);
  cursor: pointer;
  transition: all 0.2s;
}

.toggle-opt.active {
  background: var(--accent);
  color: white;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.2);
}

.demo-btn {
  width: 100%;
  padding: 16px;
  margin-top: 24px;
  border: 1px dashed var(--border-light);
  border-radius: 16px;
  background: rgba(255,255,255,0.02);
  color: var(--text2);
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.demo-btn:hover { background: var(--surface2); color: var(--text); border-color: var(--text3); }

.clear-btn {
  width: 100%;
  padding: 16px;
  margin-top: 12px;
  border: 1px solid rgba(217, 74, 74, 0.3);
  border-radius: 16px;
  background: rgba(217, 74, 74, 0.05);
  color: var(--red);
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-btn:hover { background: rgba(217, 74, 74, 0.1); border-color: var(--red); }
.clear-btn.confirming {
  background: var(--red);
  color: white;
  border-color: var(--red);
}

/* ─── Loading ─── */
.loading-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  gap: 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--surface3);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s cubic-bezier(0.6, 0.2, 0.4, 0.8) infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.loading-text { font-size: 14px; font-weight: 500; color: var(--text2); letter-spacing: 0.5px; }

/* ─── Effective Temp Badge ─── */
.eff-temp-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 10px;
  background: var(--surface2);
  font-size: 13px;
  color: var(--text2);
  margin-bottom: 20px;
  border: 1px solid var(--border);
}

.eff-temp-badge strong { color: var(--text); font-weight: 600; }
`;

// ─── MAIN APP ─────────────────────────────────────────────────────
export default function LayerUp() {
  const [tab, setTab] = useState('home');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activity, setActivity] = useState('light');
  const [duration, setDuration] = useState('medium');
  const [confirmClear, setConfirmClear] = useState(false);

  const [logs, setLogs] = useState(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('layerup_logs_v2');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [unit, setUnit] = useState(() => {
    if (typeof window === 'undefined') return 'C';
    try {
      return localStorage.getItem('layerup_unit') || 'C';
    } catch {
      return 'C';
    }
  });

  const [showLog, setShowLog] = useState(false);
  const [logComfort, setLogComfort] = useState(null);
  const [logNotes, setLogNotes] = useState('');
  const [logOutfit, setLogOutfit] = useState(null);

  // Persist logs & units safely
  useEffect(() => {
    try {
      localStorage.setItem('layerup_logs_v2', JSON.stringify(logs));
    } catch {}
  }, [logs]);

  useEffect(() => {
    try {
      localStorage.setItem('layerup_unit', unit);
    } catch {}
  }, [unit]);

  // Fetch weather
  useEffect(() => {
    let cancelled = false;
    async function fetchWeather() {
      setLoading(true);
      setError(null);
      try {
        let lat = 43.65,
          lng = -79.38; // Default Toronto

        // Hardened Geolocation with 5-second explicit Promise race fallback
        try {
          const getPos = new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 5000,
              maximumAge: 60000,
            });
          });
          const timeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), 5000)
          );

          const pos = await Promise.race([getPos, timeout]);
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
        } catch (geoErr) {
          console.warn(
            'Geolocation failed/timed out. Using default location.',
            geoErr
          );
        }

        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,precipitation,uv_index,weather_code&timezone=auto`;
        const res = await fetch(weatherUrl);
        const data = await res.json();
        const c = data.current;

        // Reverse geocode fallback
        let locationName = 'Your Location';
        try {
          const geoRes = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${lat.toFixed(2)},${lng.toFixed(2)}&count=1`
          );
          const geoData = await geoRes.json();
          if (geoData.results?.[0])
            locationName = `${geoData.results[0].name}, ${geoData.results[0].country_code}`;
        } catch {
          locationName = `${lat.toFixed(2)}°N, ${lng.toFixed(2)}°W`;
        }

        if (!cancelled) {
          setWeather({
            temp: Math.round(c.temperature_2m),
            feelsLike: Math.round(c.apparent_temperature),
            humidity: c.relative_humidity_2m,
            windSpeed: Math.round(c.wind_speed_10m),
            precipitation: c.precipitation,
            uvIndex: c.uv_index,
            weatherCode: c.weather_code,
            location: locationName,
          });
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError('Could not fetch weather data');
          setLoading(false);
        }
      }
    }
    fetchWeather();
    return () => {
      cancelled = true;
    };
  }, []);

  const toF = (c) => Math.round((c * 9) / 5 + 32);
  const displayTemp = (c) => (unit === 'F' ? `${toF(c)}°F` : `${c}°C`);

  // Format offset accounting for C vs F selection. 1 deg C = 1.8 deg F step difference.
  const displayOffset = (celsiusVal) => {
    const val = unit === 'F' ? celsiusVal * 1.8 : celsiusVal;
    return `${val > 0 ? '+' : ''}${val.toFixed(1)}°`;
  };

  const recommendation = weather
    ? getRecommendation(weather, activity, duration, logs)
    : null;

  const openLog = () => {
    if (recommendation) {
      setLogOutfit({ ...recommendation.outfit });
    }
    setLogComfort(null);
    setLogNotes('');
    setShowLog(true);
  };

  const submitLog = () => {
    if (!logComfort || !weather || !logOutfit) return;
    const entry = {
      id: `log-${Date.now()}`,
      timestamp: Date.now(),
      weather: { ...weather },
      activity,
      duration,
      outfit: { ...logOutfit },
      comfort: logComfort,
      notes: logNotes,
    };
    setLogs((prev) => [...prev, entry]);
    setShowLog(false);
  };

  const phase = getPhase(logs.length);

  if (loading) {
    return (
      <div className="app">
        <style>{CSS}</style>
        <div className="loading-screen">
          <div className="spinner" />
          <div className="loading-text">Fetching your conditions…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <style>{CSS}</style>

      {/* ─── HOME ─── */}
      {tab === 'home' && weather && (
        <div className="home-page">
          <div className="header">
            <div className="logo">
              Layer<span>Up</span>
            </div>
            <div className="phase-pill">
              Phase {phase} · {logs.length} logs
            </div>
          </div>

          <div className="weather-card">
            <div className="weather-location">📍 {weather.location}</div>
            <div className="weather-main">
              <div>
                <div className="weather-temp">
                  {unit === 'F' ? toF(weather.temp) : weather.temp}
                  <span className="weather-temp-unit">°{unit}</span>
                </div>
                <div className="weather-desc">
                  {weatherIcon(weather.weatherCode)}{' '}
                  {weatherDesc(weather.weatherCode)}
                </div>
              </div>
            </div>
            <div className="weather-details">
              <div className="weather-detail">
                <div className="weather-detail-val">
                  {displayTemp(weather.feelsLike)}
                </div>
                <div className="weather-detail-label">Feels Like</div>
              </div>
              <div className="weather-detail">
                <div className="weather-detail-val">
                  {weather.windSpeed} km/h
                </div>
                <div className="weather-detail-label">Wind</div>
              </div>
              <div className="weather-detail">
                <div className="weather-detail-val">{weather.humidity}%</div>
                <div className="weather-detail-label">Humidity</div>
              </div>
            </div>
          </div>

          <div className="selector-section">
            <div className="selector-label">Activity</div>
            <div className="selector-row">
              {ACTIVITY_LEVELS.map((a) => (
                <button
                  key={a.key}
                  className={`sel-btn ${activity === a.key ? 'active' : ''}`}
                  onClick={() => setActivity(a.key)}
                >
                  <span className="sel-icon">{a.icon}</span>
                  <span className="sel-label">{a.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="selector-section">
            <div className="selector-label">Duration</div>
            <div className="selector-row">
              {DURATIONS.map((d) => (
                <button
                  key={d.key}
                  className={`sel-btn ${duration === d.key ? 'active' : ''}`}
                  onClick={() => setDuration(d.key)}
                >
                  <span className="sel-label">{d.label}</span>
                </button>
              ))}
            </div>
          </div>

          {recommendation && (
            <div className="rec-card">
              <div className="rec-header">
                <div className="rec-title">Today&apos;s Layers</div>
                <div className="rec-conf">
                  {getPhaseLabel(recommendation.phase, logs.length)}
                </div>
              </div>
              <div className="eff-temp-badge">
                Effective temp:{' '}
                <strong>
                  {displayTemp(Math.round(recommendation.effectiveTemp))}
                </strong>
              </div>
              <div className="outfit-layers">
                {Object.keys(LAYERS).map((cat) => {
                  const idx = recommendation.outfit[cat];
                  const options = LAYERS[cat];
                  const maxIdx = options.length - 1;
                  return (
                    <div key={cat} className="outfit-layer">
                      <div className="layer-icon">{LAYER_ICONS[cat]}</div>
                      <div className="layer-info">
                        <div className="layer-cat">{LAYER_LABELS[cat]}</div>
                        <div className="layer-val">
                          {options[idx] || options[0]}
                        </div>
                      </div>
                      <div className="layer-warmth">
                        <div
                          className="layer-warmth-fill"
                          style={{
                            width: `${maxIdx > 0 ? (idx / maxIdx) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <button className="log-btn" onClick={openLog}>
            Log How It Went
          </button>
        </div>
      )}

      {tab === 'home' && error && (
        <div style={{ padding: 40, textAlign: 'center' }}>
          <div className="header">
            <div className="logo">
              Layer<span>Up</span>
            </div>
          </div>
          <p style={{ color: 'var(--text3)', marginTop: 40, fontSize: 15 }}>
            {error}
          </p>
          <button
            className="log-btn"
            style={{ marginTop: 24 }}
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      )}

      {/* ─── HISTORY ─── */}
      {tab === 'history' && (
        <div className="history-page">
          <div className="header" style={{ padding: 0, marginBottom: 24 }}>
            <div className="logo">
              Layer<span>Up</span>
            </div>
          </div>
          <div className="history-title">History</div>
          {logs.length === 0 && (
            <p style={{ color: 'var(--text3)', fontSize: 15 }}>
              No logs yet. Go outside, then log how it went.
            </p>
          )}
          {[...logs].reverse().map((log) => (
            <div key={log.id} className="history-item">
              <div className="history-top">
                <div className="history-date">
                  {new Date(log.timestamp).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </div>
                <div className="history-comfort">
                  {COMFORT_RATINGS.find((c) => c.key === log.comfort)?.icon}
                </div>
              </div>
              <div className="history-conditions">
                <span>
                  {weatherIcon(log.weather.weatherCode)}{' '}
                  {displayTemp(log.weather.feelsLike)} feels like
                </span>
                <span>
                  {ACTIVITY_LEVELS.find((a) => a.key === log.activity)?.icon}{' '}
                  {ACTIVITY_LEVELS.find((a) => a.key === log.activity)?.label}
                </span>
                <span>
                  {DURATIONS.find((d) => d.key === log.duration)?.label}
                </span>
              </div>
              <div className="history-outfit">
                {Object.keys(LAYERS).map((cat) => (
                  <span key={cat} className="history-tag">
                    {LAYER_ICONS[cat]}{' '}
                    {LAYERS[cat][log.outfit[cat]] || LAYERS[cat][0]}
                  </span>
                ))}
              </div>
              {log.notes && (
                <p
                  style={{
                    fontSize: 13,
                    color: 'var(--text3)',
                    marginTop: 12,
                    fontStyle: 'italic',
                    lineHeight: 1.4,
                  }}
                >
                  &quot;{log.notes}&quot;
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ─── INSIGHTS ─── */}
      {tab === 'insights' && (
        <div className="insights-page">
          <div className="header" style={{ padding: 0, marginBottom: 24 }}>
            <div className="logo">
              Layer<span>Up</span>
            </div>
          </div>
          <div className="insights-title">Insights</div>
          {logs.length === 0 ? (
            <p style={{ color: 'var(--text3)', fontSize: 15 }}>
              Log some outings to see your insights.
            </p>
          ) : (
            <>
              <div className="stat-grid">
                <div className="stat-card">
                  <div className="stat-val">{logs.length}</div>
                  <div className="stat-label">Total Logs</div>
                </div>
                <div className="stat-card">
                  <div className="stat-val" style={{ color: 'var(--green)' }}>
                    {Math.round(
                      (logs.filter((l) => l.comfort === 'justRight').length /
                        logs.length) *
                        100
                    )}
                    %
                  </div>
                  <div className="stat-label">Just Right</div>
                </div>
                <div className="stat-card">
                  <div className="stat-val">
                    {calculateOffset(logs) > 0
                      ? '❄️'
                      : calculateOffset(logs) < 0
                        ? '🔥'
                        : '⚖️'}
                  </div>
                  <div className="stat-label">
                    {calculateOffset(logs) > 0
                      ? 'Runs Cold'
                      : calculateOffset(logs) < 0
                        ? 'Runs Warm'
                        : 'Neutral'}
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-val">{phase}</div>
                  <div className="stat-label">Algorithm Phase</div>
                </div>
              </div>

              <div className="insight-section">
                <div className="insight-section-title">
                  Comfort Distribution
                </div>
                <div className="bar-chart">
                  {COMFORT_RATINGS.map((cr) => {
                    const count = logs.filter(
                      (l) => l.comfort === cr.key
                    ).length;
                    const pct = Math.round((count / logs.length) * 100);
                    return (
                      <div key={cr.key} className="bar-row">
                        <div className="bar-label">
                          {cr.icon} {cr.label}
                        </div>
                        <div className="bar-track">
                          <div
                            className="bar-fill"
                            style={{
                              width: `${Math.max(pct, 2)}%`,
                              background: cr.color,
                            }}
                          >
                            {pct > 10 ? `${pct}%` : ''}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="insight-section">
                <div className="insight-section-title">
                  Warmth Offset by Activity
                </div>
                <div className="bar-chart">
                  {ACTIVITY_LEVELS.map((a) => {
                    const actLogs = logs.filter((l) => l.activity === a.key);
                    const offset =
                      actLogs.length >= 3 ? calculateOffset(actLogs) : 0;
                    const normalized = Math.min(
                      Math.max((offset + 5) / 10, 0),
                      1
                    );
                    return (
                      <div key={a.key} className="bar-row">
                        <div className="bar-label">
                          {a.icon} {a.label}
                        </div>
                        <div className="bar-track">
                          <div
                            className="bar-fill"
                            style={{
                              width: `${Math.max(normalized * 100, 8)}%`,
                              background:
                                offset > 0
                                  ? 'var(--cold)'
                                  : offset < 0
                                    ? 'var(--warm)'
                                    : 'var(--green)',
                            }}
                          >
                            {actLogs.length >= 3 ? displayOffset(offset) : '—'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="insight-section">
                <div className="insight-section-title">Phase Progression</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  {[1, 2, 3, 4].map((p) => (
                    <div
                      key={p}
                      style={{
                        flex: 1,
                        padding: '16px 8px',
                        borderRadius: 16,
                        background:
                          phase >= p
                            ? 'rgba(91, 159, 224, 0.15)'
                            : 'var(--surface2)',
                        border: `1px solid ${phase >= p ? 'var(--accent)' : 'var(--border)'}`,
                        textAlign: 'center',
                        opacity: phase >= p ? 1 : 0.4,
                        transition: 'all 0.3s',
                      }}
                    >
                      <div
                        style={{
                          fontSize: 18,
                          fontWeight: 700,
                          color: phase >= p ? 'var(--accent)' : 'inherit',
                        }}
                      >
                        {p}
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 500,
                          color: phase >= p ? 'var(--text)' : 'var(--text3)',
                          marginTop: 4,
                        }}
                      >
                        {p === 1
                          ? 'Baseline'
                          : p === 2
                            ? `10 logs`
                            : p === 3
                              ? `30 logs`
                              : `50 logs`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ─── SETTINGS ─── */}
      {tab === 'settings' && (
        <div className="settings-page">
          <div className="header" style={{ padding: 0, marginBottom: 24 }}>
            <div className="logo">
              Layer<span>Up</span>
            </div>
          </div>
          <div className="settings-title">Settings</div>

          <div className="setting-row">
            <div>
              <div className="setting-label">Temperature Unit</div>
              <div className="setting-desc">
                Switch between Celsius and Fahrenheit
              </div>
            </div>
            <div className="toggle-group">
              <button
                className={`toggle-opt ${unit === 'C' ? 'active' : ''}`}
                onClick={() => setUnit('C')}
              >
                °C
              </button>
              <button
                className={`toggle-opt ${unit === 'F' ? 'active' : ''}`}
                onClick={() => setUnit('F')}
              >
                °F
              </button>
            </div>
          </div>

          <div className="setting-row">
            <div>
              <div className="setting-label">Default Activity</div>
              <div className="setting-desc">
                Pre-selected when you open the app
              </div>
            </div>
            <div className="toggle-group">
              {ACTIVITY_LEVELS.map((a) => (
                <button
                  key={a.key}
                  className={`toggle-opt ${activity === a.key ? 'active' : ''}`}
                  onClick={() => setActivity(a.key)}
                  title={a.label}
                >
                  {a.icon}
                </button>
              ))}
            </div>
          </div>

          <button
            className="demo-btn"
            onClick={() => {
              setLogs((prev) => [...prev, ...generateDemoLogs(25)]);
            }}
          >
            + Load 25 Demo Logs (for testing phases)
          </button>

          <button
            className={`clear-btn ${confirmClear ? 'confirming' : ''}`}
            onClick={() => {
              if (confirmClear) {
                setLogs([]);
                setConfirmClear(false);
              } else {
                setConfirmClear(true);
                setTimeout(() => setConfirmClear(false), 3000);
              }
            }}
          >
            {confirmClear ? 'Tap again to confirm clearing' : 'Clear All Logs'}
          </button>

          <div
            style={{
              marginTop: 48,
              textAlign: 'center',
              color: 'var(--text3)',
              fontSize: 12,
            }}
          >
            <div
              style={{
                fontFamily: "'Fraunces', serif",
                fontSize: 20,
                marginBottom: 6,
                color: 'var(--text)',
              }}
            >
              Layer<span style={{ color: 'var(--accent)' }}>Up</span>
            </div>
            <div>v1.0 · Thermal Intelligence</div>
            <div style={{ marginTop: 6 }}>Product Commission · March 2026</div>
          </div>
        </div>
      )}

      {/* ─── LOG SHEET ─── */}
      {showLog && recommendation && (
        <div
          className="sheet-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowLog(false);
          }}
        >
          <div className="sheet">
            <div className="sheet-handle" />
            <div className="sheet-title">How did it go?</div>

            <div
              className="selector-section"
              style={{ padding: 0, marginBottom: 20 }}
            >
              <div className="selector-label">Activity</div>
              <div className="selector-row">
                {ACTIVITY_LEVELS.map((a) => (
                  <button
                    key={a.key}
                    className={`sel-btn ${activity === a.key ? 'active' : ''}`}
                    onClick={() => setActivity(a.key)}
                  >
                    <span className="sel-icon">{a.icon}</span>
                    <span className="sel-label">{a.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div
              className="selector-section"
              style={{ padding: 0, marginBottom: 20 }}
            >
              <div className="selector-label">Duration</div>
              <div className="selector-row">
                {DURATIONS.map((d) => (
                  <button
                    key={d.key}
                    className={`sel-btn ${duration === d.key ? 'active' : ''}`}
                    onClick={() => setDuration(d.key)}
                  >
                    <span className="sel-label">{d.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div
              className="selector-section"
              style={{ padding: 0, marginBottom: 20 }}
            >
              <div className="selector-label">
                What You Wore (tap to adjust)
              </div>
              <div className="outfit-layers">
                {logOutfit &&
                  Object.keys(LAYERS).map((cat) => {
                    const idx = logOutfit[cat];
                    const options = LAYERS[cat];
                    return (
                      <div
                        key={cat}
                        className="outfit-layer"
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          setLogOutfit((prev) => ({
                            ...prev,
                            [cat]: (prev[cat] + 1) % options.length,
                          }));
                        }}
                      >
                        <div className="layer-icon">{LAYER_ICONS[cat]}</div>
                        <div className="layer-info">
                          <div className="layer-cat">{LAYER_LABELS[cat]}</div>
                          <div className="layer-val">
                            {options[idx] || options[0]}
                          </div>
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 500,
                            color: 'var(--text3)',
                          }}
                        >
                          Tap
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            <div className="selector-label" style={{ marginBottom: 12 }}>
              Comfort Rating
            </div>
            <div className="comfort-row">
              {COMFORT_RATINGS.map((cr) => (
                <button
                  key={cr.key}
                  className={`comfort-btn ${logComfort === cr.key ? 'active' : ''}`}
                  style={{
                    color: logComfort === cr.key ? cr.color : undefined,
                    borderColor: logComfort === cr.key ? cr.color : undefined,
                  }}
                  onClick={() => setLogComfort(cr.key)}
                >
                  <div className="comfort-icon">{cr.icon}</div>
                  <div className="comfort-label">{cr.label}</div>
                </button>
              ))}
            </div>

            <textarea
              className="notes-input"
              placeholder="Notes (optional) — illness, unusual setting…"
              rows={2}
              value={logNotes}
              onChange={(e) => setLogNotes(e.target.value)}
            />

            <button
              className="sheet-submit"
              disabled={!logComfort}
              onClick={submitLog}
            >
              Save Log
            </button>
          </div>
        </div>
      )}

      {/* ─── BOTTOM NAV ─── */}
      <div className="bottom-nav">
        <button
          className={`nav-btn ${tab === 'home' ? 'active' : ''}`}
          onClick={() => setTab('home')}
        >
          <span className="nav-icon">🌡️</span> Today
        </button>
        <button
          className={`nav-btn ${tab === 'history' ? 'active' : ''}`}
          onClick={() => setTab('history')}
        >
          <span className="nav-icon">📋</span> History
        </button>
        <button
          className={`nav-btn ${tab === 'insights' ? 'active' : ''}`}
          onClick={() => setTab('insights')}
        >
          <span className="nav-icon">📊</span> Insights
        </button>
        <button
          className={`nav-btn ${tab === 'settings' ? 'active' : ''}`}
          onClick={() => setTab('settings')}
        >
          <span className="nav-icon">⚙️</span> Settings
        </button>
      </div>
    </div>
  );
}
