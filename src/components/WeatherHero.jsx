import { LAYERS, OUTFIT_CATEGORIES, normalizeOutfit, weatherDesc } from '../constants';

function getTempColor(feelsLike) {
  const cold = { r: 75, g: 140, b: 201 };
  const neutral = { r: 130, g: 130, b: 130 };
  const warm = { r: 209, g: 126, b: 69 };
  const t = Math.max(0, Math.min(1, (feelsLike + 2) / 27));
  let r, g, b;
  if (t < 0.5) {
    const s = t * 2;
    r = Math.round(cold.r + (neutral.r - cold.r) * s);
    g = Math.round(cold.g + (neutral.g - cold.g) * s);
    b = Math.round(cold.b + (neutral.b - cold.b) * s);
  } else {
    const s = (t - 0.5) * 2;
    r = Math.round(neutral.r + (warm.r - neutral.r) * s);
    g = Math.round(neutral.g + (warm.g - neutral.g) * s);
    b = Math.round(neutral.b + (warm.b - neutral.b) * s);
  }
  return `rgb(${r}, ${g}, ${b})`;
}

// Returns two rgba color stops for the atmospheric page gradient.
// Applied at low opacity so they tint rather than replace the existing bg.
export function getWeatherColors(code, feelsLike) {
  if (code >= 95)
    return { a: 'rgba(75, 55, 120, 0.32)', b: 'rgba(50, 40, 88, 0.2)' };
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86))
    return { a: 'rgba(165, 208, 242, 0.38)', b: 'rgba(200, 225, 248, 0.18)' };
  if (code >= 51 && code <= 82)
    return { a: 'rgba(58, 98, 148, 0.3)', b: 'rgba(80, 118, 162, 0.16)' };
  if (code >= 40 && code <= 49)
    return { a: 'rgba(148, 162, 172, 0.28)', b: 'rgba(168, 180, 188, 0.14)' };
  if (code >= 1 && code <= 3) {
    return feelsLike > 12
      ? { a: 'rgba(95, 158, 212, 0.22)', b: 'rgba(228, 162, 75, 0.18)' }
      : { a: 'rgba(108, 152, 202, 0.25)', b: 'rgba(158, 192, 222, 0.14)' };
  }
  if (feelsLike > 18)
    return { a: 'rgba(48, 148, 222, 0.24)', b: 'rgba(238, 162, 48, 0.22)' };
  if (feelsLike > 8)
    return { a: 'rgba(42, 132, 208, 0.26)', b: 'rgba(102, 172, 232, 0.14)' };
  return { a: 'rgba(28, 78, 172, 0.28)', b: 'rgba(68, 118, 198, 0.16)' };
}

// Left-column weather content — no card wrapper.
export function WeatherInfo({ weather, unit }) {
  const tempColor = getTempColor(weather.feelsLike);
  const displayedTemp = unit === 'F'
    ? Math.round((weather.temp * 9) / 5 + 32)
    : weather.temp;
  const displayedFeelsLike = unit === 'F'
    ? Math.round((weather.feelsLike * 9) / 5 + 32)
    : weather.feelsLike;

  const badges = [];
  if (weather.windSpeed > 40) badges.push({ key: 'wind', label: 'Strong wind', icon: '💨' });
  else if (weather.windSpeed > 20) badges.push({ key: 'wind', label: 'Windy', icon: '💨' });
  if (weather.humidity > 75) badges.push({ key: 'humid', label: 'Humid', icon: '💧' });
  if (weather.precipitation > 0) badges.push({ key: 'precip', label: 'Rain', icon: '🌧️' });

  return (
    <div className="home-weather">
      <div className="home-location">
        <span className="home-location-dot" aria-hidden="true">◦</span>
        {weather.location}
      </div>

      <div className="home-temps">
        <span className="home-temp" style={{ color: tempColor }}>
          {displayedTemp}°{unit}
        </span>
        <span className="home-feels" style={{ color: tempColor }}>
          feels {displayedFeelsLike}°
        </span>
      </div>

      <div className="home-condition">
        {weatherDesc(weather.weatherCode)}
      </div>

      {badges.length > 0 && (
        <div className="home-badges">
          {badges.map((b) => (
            <span key={b.key} className="home-badge">
              <span aria-hidden="true">{b.icon}</span>
              {b.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

const PLAN_ICONS = { base: '👕', mid: '🧣', outer: '🧥', bottom: '👖', accessories: '🧤', footwear: '👟' };
const PLAN_LABELS = { base: 'Base', mid: 'Mid', outer: 'Outer', bottom: 'Bottom', accessories: 'Acc', footwear: 'Feet' };

// Right-column layer plan — compact frosted card.
export function LayerPlan({ recommendation, logs, getPhaseLabel, onOpenLog }) {
  const normalized = normalizeOutfit(recommendation.outfit);
  const rows = OUTFIT_CATEGORIES
    .map((cat) => ({ cat, val: LAYERS[cat][normalized[cat]] }))
    .filter(({ val }) => val !== 'None');

  return (
    <div className="home-plan">
      <div className="home-plan-label">
        {getPhaseLabel(recommendation.phase, logs.length)}
      </div>

      <ul className="home-plan-layers">
        {rows.map(({ cat, val }) => (
          <li key={cat} className="home-plan-row">
            <span className="home-plan-icon" aria-hidden="true">{PLAN_ICONS[cat]}</span>
            <span className="home-plan-cat">{PLAN_LABELS[cat]}</span>
            <span className="home-plan-val">{val}</span>
          </li>
        ))}
      </ul>

      <button className="home-log-btn" onClick={onOpenLog}>
        Log how it went
      </button>
    </div>
  );
}
