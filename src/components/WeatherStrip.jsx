import { weatherIcon, getTempColor } from '../constants';

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
