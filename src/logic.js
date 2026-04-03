import {
  ACTIVITY_LEVELS,
  BODY_ZONES,
  DURATIONS,
  LAYERS,
  OUTFIT_CATEGORIES,
  normalizeOutfit,
} from './constants';

const CATEGORY_WEIGHTS = {
  base: 1.1,
  mid: 1.3,
  outer: 1.6,
  bottom: 1.1,
  accessories: 0.9,
  footwear: 1,
};

const TEMPERATURE_ANCHORS = [
  {
    temp: 30,
    outfit: {
      base: 0,
      mid: 0,
      outer: 0,
      bottom: 0,
      accessories: 0,
      footwear: 0,
    },
  },
  {
    temp: 23,
    outfit: {
      base: 1,
      mid: 0,
      outer: 0,
      bottom: 1,
      accessories: 0,
      footwear: 1,
    },
  },
  {
    temp: 18,
    outfit: {
      base: 1,
      mid: 1,
      outer: 0,
      bottom: 2,
      accessories: 0,
      footwear: 1,
    },
  },
  {
    temp: 13,
    outfit: {
      base: 2,
      mid: 2,
      outer: 1,
      bottom: 2,
      accessories: 0,
      footwear: 2,
    },
  },
  {
    temp: 8,
    outfit: {
      base: 2,
      mid: 3,
      outer: 2,
      bottom: 3,
      accessories: 1,
      footwear: 3,
    },
  },
  {
    temp: 0,
    outfit: {
      base: 3,
      mid: 3,
      outer: 4,
      bottom: 4,
      accessories: 5,
      footwear: 3,
    },
  },
];

const BODY_ZONE_CATEGORY_MAP = {
  feet: [{ category: 'footwear', weight: 1 }],
  legs: [{ category: 'bottom', weight: 1 }],
  core: [
    { category: 'base', weight: 0.8 },
    { category: 'mid', weight: 1 },
    { category: 'outer', weight: 0.9 },
  ],
  hands: [{ category: 'accessories', weight: 1 }],
  head: [{ category: 'accessories', weight: 0.8 }],
};

const BODY_ZONE_KEYS = new Set(BODY_ZONES.map((zone) => zone.key));

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function interpolateOutfit(a, b, ratio) {
  return OUTFIT_CATEGORIES.reduce((outfit, category) => {
    outfit[category] =
      a[category] + (b[category] - a[category]) * clamp(ratio, 0, 1);
    return outfit;
  }, {});
}

function getIdealOutfit(effectiveTemp) {
  if (effectiveTemp >= TEMPERATURE_ANCHORS[0].temp) {
    return { ...TEMPERATURE_ANCHORS[0].outfit };
  }
  if (effectiveTemp <= TEMPERATURE_ANCHORS[TEMPERATURE_ANCHORS.length - 1].temp) {
    return { ...TEMPERATURE_ANCHORS[TEMPERATURE_ANCHORS.length - 1].outfit };
  }

  for (let i = 0; i < TEMPERATURE_ANCHORS.length - 1; i += 1) {
    const warmer = TEMPERATURE_ANCHORS[i];
    const cooler = TEMPERATURE_ANCHORS[i + 1];
    if (effectiveTemp <= warmer.temp && effectiveTemp >= cooler.temp) {
      const ratio =
        (warmer.temp - effectiveTemp) / (warmer.temp - cooler.temp || 1);
      return interpolateOutfit(warmer.outfit, cooler.outfit, ratio);
    }
  }

  return { ...TEMPERATURE_ANCHORS[TEMPERATURE_ANCHORS.length - 1].outfit };
}

function shiftOutfit(outfit, offsets = {}) {
  return OUTFIT_CATEGORIES.reduce((shifted, category) => {
    shifted[category] = clamp(
      outfit[category] + (offsets[category] || 0),
      0,
      LAYERS[category].length - 1
    );
    return shifted;
  }, {});
}

function* generateCandidates(idealOutfit, categories = OUTFIT_CATEGORIES, index = 0, current = {}) {
  if (index >= categories.length) {
    yield current;
    return;
  }

  const category = categories[index];
  const target = Math.round(idealOutfit[category]);
  const min = Math.max(0, target - 1);
  const max = Math.min(LAYERS[category].length - 1, target + 1);

  for (let value = min; value <= max; value += 1) {
    yield* generateCandidates(idealOutfit, categories, index + 1, {
      ...current,
      [category]: value,
    });
  }
}

function scoreOutfit(outfit, idealOutfit, hasPrecip, hasSnow) {
  let score = OUTFIT_CATEGORIES.reduce((total, category) => {
    const delta = outfit[category] - idealOutfit[category];
    return total + CATEGORY_WEIGHTS[category] * delta * delta;
  }, 0);

  if (hasPrecip) {
    if (outfit.outer < 1) score += 2.4;
    if (outfit.footwear < 1) score += 1.8;
  }

  if (hasSnow) {
    if (outfit.outer < 2) score += 2.4;
    if (outfit.accessories < 4) score += 2;
    if (outfit.footwear < LAYERS.footwear.length - 1) score += 3;
  }

  return score;
}

function getComfortSignal(log) {
  const comfortMap = {
    tooCold: 2,
    cold: 1,
    justRight: 0,
    warm: -1,
    tooHot: -2,
  };

  return comfortMap[log.comfort] || 0;
}

function addZoneSignal(totals, counts, zones, amount) {
  for (const zone of zones || []) {
    if (!BODY_ZONE_KEYS.has(zone)) continue;
    for (const target of BODY_ZONE_CATEGORY_MAP[zone] || []) {
      totals[target.category] += amount * target.weight;
      counts[target.category] += target.weight;
    }
  }
}

export function calculateLayerOffsets(logs) {
  if (!logs?.length) return {};

  const totals = OUTFIT_CATEGORIES.reduce((acc, category) => {
    acc[category] = 0;
    return acc;
  }, {});
  const counts = OUTFIT_CATEGORIES.reduce((acc, category) => {
    acc[category] = 0;
    return acc;
  }, {});

  for (const log of logs) {
    const signal = getComfortSignal(log);
    if (!signal && !(log.coldZones?.length || log.hotZones?.length)) continue;

    for (const category of OUTFIT_CATEGORIES) {
      totals[category] += signal * 0.18;
      counts[category] += 0.18;
    }

    addZoneSignal(totals, counts, log.coldZones, Math.max(signal, 1));
    addZoneSignal(totals, counts, log.hotZones, Math.min(signal, -1));
  }

  return OUTFIT_CATEGORIES.reduce((offsets, category) => {
    const avg = counts[category] ? totals[category] / counts[category] : 0;
    offsets[category] = clamp(Math.round(avg * 0.7), -1, 1);
    return offsets;
  }, {});
}

export function getPhase(logCount) {
  if (logCount >= 50) return 4;
  if (logCount >= 30) return 3;
  if (logCount >= 10) return 2;
  return 1;
}

export function getPhaseLabel(phase, logCount) {
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

export function phase1Recommend(effectiveTemp, hasPrecip, hasSnow) {
  return phase1RecommendWithOffsets(effectiveTemp, hasPrecip, hasSnow);
}

export function phase1RecommendWithOffsets(
  effectiveTemp,
  hasPrecip,
  hasSnow,
  layerOffsets = {}
) {
  const idealOutfit = shiftOutfit(getIdealOutfit(effectiveTemp), layerOffsets);
  let bestOutfit = null;
  let bestScore = Number.POSITIVE_INFINITY;

  for (const candidate of generateCandidates(idealOutfit)) {
    const score = scoreOutfit(candidate, idealOutfit, hasPrecip, hasSnow);
    if (score < bestScore) {
      bestScore = score;
      bestOutfit = candidate;
    }
  }

  return normalizeOutfit(bestOutfit || idealOutfit);
}

export function calculateOffset(logs) {
  if (!logs?.length) return 0;
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

export function calculateActivityOffsets(logs) {
  const offsets = {};
  for (const act of ACTIVITY_LEVELS) {
    const actLogs = logs.filter((l) => l.activity === act.key);
    if (actLogs.length >= 5) offsets[act.key] = calculateOffset(actLogs);
  }
  return offsets;
}

function euclideanDist(a, b) {
  const aSnow = a.weatherCode >= 71 && a.weatherCode <= 77 ? 1 : 0;
  const bSnow = b.weatherCode >= 71 && b.weatherCode <= 77 ? 1 : 0;
  const aWet = a.precipitation > 0 ? 1 : 0;
  const bWet = b.precipitation > 0 ? 1 : 0;

  return Math.sqrt(
    ((a.feelsLike - b.feelsLike) / 10) ** 2 +
      ((a.humidity - b.humidity) / 30) ** 2 +
      ((a.windSpeed - b.windSpeed) / 10) ** 2 +
      ((a.precipitation - b.precipitation) / 4) ** 2 +
      (aSnow - bSnow) ** 2 +
      (aWet - bWet) ** 2
  );
}

export function phase4Recommend(weather, activity, duration, logs) {
  const activityLogs = logs.filter(
    (l) => l.comfort === 'justRight' && l.activity === activity
  );
  if (activityLogs.length < 3) return null;

  const durationLogs = activityLogs.filter((l) => l.duration === duration);
  const candidateLogs = durationLogs.length >= 3 ? durationLogs : activityLogs;

  const scored = candidateLogs
    .map((l) => {
      const ageDays = Math.max(0, (Date.now() - (l.timestamp || 0)) / 86400000);
      const dist = euclideanDist(weather, l.weather);
      const recencyWeight = 1 / (1 + ageDays / 45);
      return {
        log: l,
        dist,
        weight: recencyWeight / (1 + dist),
      };
    })
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 5);

  if (!scored.length || scored[0].dist > 5.5) return null;

  const totalWeight = scored.reduce((sum, entry) => sum + entry.weight, 0);
  if (!totalWeight) return null;

  const blended = OUTFIT_CATEGORIES.reduce((outfit, category) => {
    const weightedValue = scored.reduce((sum, entry) => {
      const value = normalizeOutfit(entry.log.outfit)[category];
      return sum + value * entry.weight;
    }, 0);
    outfit[category] = Math.round(weightedValue / totalWeight);
    return outfit;
  }, {});

  return normalizeOutfit(blended);
}

export function getRecommendation(weather, activity, duration, logs) {
  const phase = getPhase(logs.length);
  const actMod = ACTIVITY_LEVELS.find((a) => a.key === activity)?.modifier || 0;
  const durationMod = DURATIONS.find((d) => d.key === duration)?.modifier || 0;
  let effectiveTemp = weather.feelsLike + actMod + durationMod;
  const activityLogs = logs.filter((log) => log.activity === activity);
  const layerOffsets =
    phase >= 3 && activityLogs.length >= 3
      ? calculateLayerOffsets(activityLogs)
      : calculateLayerOffsets(logs);

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
  const outfit = phase1RecommendWithOffsets(
    effectiveTemp,
    hasPrecip,
    hasSnow,
    layerOffsets
  );

  return { outfit, phase, effectiveTemp };
}
