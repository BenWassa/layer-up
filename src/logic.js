import { ACTIVITY_LEVELS } from './constants';

export function getPhase(logCount) {
  if (logCount >= 50) return 4;
  if (logCount >= 30) return 3;
  if (logCount >= 10) return 2;
  return 1;
}

export function getPhaseLabel(phase, logCount) {
  switch (phase) {
    case 1: return 'Based on standard thermal conditions';
    case 2: return `Calibrated to your warmth profile (${logCount} logs)`;
    case 3: return `Tuned to your activity patterns (${logCount} logs)`;
    case 4: return `Matched to similar days in your history`;
    default: return '';
  }
}

export function phase1Recommend(effectiveTemp, hasPrecip, hasSnow) {
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

export function calculateOffset(logs) {
  if (!logs?.length) return 0;
  const comfortMap = { tooCold: -2, cold: -1, justRight: 0, warm: 1, tooHot: 2 };
  const total = logs.reduce((sum, l) => sum + (comfortMap[l.comfort] || 0), 0);
  return -(total / logs.length) * 1.5;
}

export function calculateActivityOffsets(logs) {
  const offsets = {};
  for (const act of ACTIVITY_LEVELS) {
    const actLogs = logs.filter(l => l.activity === act.key);
    if (actLogs.length >= 5) offsets[act.key] = calculateOffset(actLogs);
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

export function phase4Recommend(weather, activity, logs) {
  const justRightLogs = logs.filter(l => l.comfort === 'justRight' && l.activity === activity);
  if (justRightLogs.length < 3) return null;

  const scored = justRightLogs
    .map(l => ({ log: l, dist: euclideanDist(weather, l.weather) }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 5);

  if (scored[0]?.dist > 5) return null;
  return scored[0]?.log?.outfit || null;
}

export function getRecommendation(weather, activity, duration, logs) {
  const phase = getPhase(logs.length);
  const actMod = ACTIVITY_LEVELS.find(a => a.key === activity)?.modifier || 0;
  let effectiveTemp = weather.feelsLike + actMod;

  if (phase >= 2) {
    const offset = phase >= 3
      ? (calculateActivityOffsets(logs)[activity] || calculateOffset(logs))
      : calculateOffset(logs);
    effectiveTemp += offset;
  }

  if (phase === 4) {
    const p4 = phase4Recommend(weather, activity, logs);
    if (p4) return { outfit: p4, phase, effectiveTemp };
  }

  const hasPrecip = weather.precipitation > 0;
  const hasSnow = weather.weatherCode >= 71 && weather.weatherCode <= 77;
  const outfit = phase1Recommend(effectiveTemp, hasPrecip, hasSnow);

  return { outfit, phase, effectiveTemp };
}
