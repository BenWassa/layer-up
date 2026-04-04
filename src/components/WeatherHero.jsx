import {
  LAYERS,
  OUTFIT_CATEGORIES,
  normalizeOutfit,
  weatherDesc,
  weatherIcon,
  getTempColor,
  toF,
} from '../constants';

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

function formatPrecipitationValue(value) {
  if (!value) return null;
  if (value < 1) return '<1 mm';
  return `${value.toFixed(1)} mm`;
}

function getPrecipitationLabel(code) {
  const desc = weatherDesc(code);
  if (
    desc === 'Drizzle' ||
    desc === 'Freezing drizzle' ||
    desc === 'Rain' ||
    desc === 'Freezing rain' ||
    desc === 'Snowfall' ||
    desc === 'Snow grains' ||
    desc === 'Rain showers' ||
    desc === 'Snow showers' ||
    desc === 'Thunderstorm'
  ) {
    return desc;
  }
  return 'Precip';
}

export function WeatherHero({ weather, unit }) {
  const tempColor = getTempColor(weather.feelsLike);
  const displayedTemp = unit === 'F' ? toF(weather.temp) : weather.temp;
  const displayedFeelsLike = unit === 'F' ? toF(weather.feelsLike) : weather.feelsLike;

  const precipValue = formatPrecipitationValue(weather.precipitation);
  const metricLabel = precipValue ? getPrecipitationLabel(weather.weatherCode) : 'Wind';
  const metricValue = precipValue ?? `${weather.windSpeed} km/h`;

  return (
    <div className="weather-hero-card">
      <div className="weather-hero-top">
        <span className="weather-hero-location">
          <span className="weather-hero-dot" aria-hidden="true">◦</span>
          {weather.location}
        </span>
        <span className="weather-hero-icon" aria-hidden="true">
          {weatherIcon(weather.weatherCode)}
        </span>
      </div>

      <div className="weather-hero-center">
        <span className="weather-hero-temp" style={{ color: tempColor }}>
          {displayedTemp}°{unit}
        </span>
        <span className="weather-hero-feels" style={{ color: tempColor }}>
          feels like {displayedFeelsLike}°{unit}
        </span>
      </div>

      <div className="weather-hero-meta">
        <span>{weatherDesc(weather.weatherCode)}</span>
        <span className="weather-hero-sep" aria-hidden="true">·</span>
        <span>{weather.humidity}% humidity</span>
        <span className="weather-hero-sep" aria-hidden="true">·</span>
        <span>{metricLabel} {metricValue}</span>
      </div>
    </div>
  );
}

const PLAN_LABELS = {
  base: 'Base',
  mid: 'Mid layer',
  outer: 'Outer',
  bottom: 'Bottom',
  accessories: 'Accessories',
  footwear: 'Footwear',
};

export function LayerPlan({ recommendation, onOpenLog }) {
  const normalized = normalizeOutfit(recommendation.outfit);
  const rows = OUTFIT_CATEGORIES
    .map((cat) => ({ cat, val: LAYERS[cat][normalized[cat]] }))
    .filter(({ val }) => val !== 'None');

  return (
    <div className="home-plan">
      <div className="home-plan-kicker">Today&apos;s layers</div>
      <ul className="home-plan-layers">
        {rows.map(({ cat, val }) => (
          <li key={cat} className="home-plan-row">
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
