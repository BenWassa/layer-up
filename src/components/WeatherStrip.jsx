import { weatherIcon } from '../constants';

function getTempColor(feelsLike) {
  const cold = { r: 75, g: 140, b: 201 }; // --cold: #4b8cc9
  const neutral = { r: 130, g: 130, b: 130 };
  const warm = { r: 209, g: 126, b: 69 }; // --warm: #d17e45

  const t = Math.max(0, Math.min(1, (feelsLike + 2) / 27)); // 0 at ≤-2°C, 1 at ≥25°C

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

export function WeatherStrip({ weather, unit, displayTemp, toF }) {
  const displayedTemp =
    unit === 'F' ? toF(weather.temp) : weather.temp;
  const tempColor = getTempColor(weather.feelsLike);

  const badges = [];
  if (weather.windSpeed > 40) {
    badges.push({ key: 'wind-strong', label: 'Strong wind', icon: '💨' });
  } else if (weather.windSpeed > 20) {
    badges.push({ key: 'wind-high', label: 'High wind', icon: '💨' });
  }
  if (weather.humidity > 75) {
    badges.push({ key: 'humid', label: 'Humid', icon: '💧' });
  }

  return (
    <div className="weather-strip">
      <span className="weather-strip-location">
        <span aria-hidden="true" className="weather-strip-dot">◦</span>
        {weather.location}
      </span>

      <span className="weather-strip-temp" style={{ color: tempColor }}>
        {displayedTemp}°{unit}
      </span>

      <span className="weather-strip-icon" aria-hidden="true">
        {weatherIcon(weather.weatherCode)}
      </span>

      {badges.map((b) => (
        <span key={b.key} className="weather-badge">
          <span aria-hidden="true">{b.icon}</span>
          {b.label}
        </span>
      ))}
    </div>
  );
}
