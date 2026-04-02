import { weatherDesc, weatherIcon } from '../constants';
import { AppHeader } from '../components/AppHeader';
import { OptionSelector } from '../components/OptionSelector';
import { OutfitLayers } from '../components/OutfitLayers';

export function HomeView({
  weather,
  unit,
  phase,
  logs,
  activity,
  duration,
  activityOptions,
  durationOptions,
  recommendation,
  displayTemp,
  onActivityChange,
  onDurationChange,
  onOpenLog,
  getPhaseLabel,
  toF,
}) {
  return (
    <main className="home-page">
      <AppHeader phase={phase} logCount={logs.length} />

      <div className="weather-card">
        <div className="weather-location">📍 {weather.location}</div>
        <div className="weather-main">
          <div>
            <div className="weather-temp">
              {unit === 'F' ? toF(weather.temp) : weather.temp}
              <span className="weather-temp-unit">°{unit}</span>
            </div>
            <div className="weather-desc">
              <span>{weatherIcon(weather.weatherCode)}</span> 
              <span>{weatherDesc(weather.weatherCode)}</span>
            </div>
          </div>
        </div>
        <div className="weather-details">
          <div className="weather-detail">
            <div className="weather-detail-val">{displayTemp(weather.feelsLike)}</div>
            <div className="weather-detail-label">Feels Like</div>
          </div>
          <div className="weather-detail">
            <div className="weather-detail-val">{weather.windSpeed} km/h</div>
            <div className="weather-detail-label">Wind</div>
          </div>
          <div className="weather-detail">
            <div className="weather-detail-val">{weather.humidity}%</div>
            <div className="weather-detail-label">Humidity</div>
          </div>
        </div>
      </div>

      <OptionSelector
        label="Activity"
        options={activityOptions}
        selectedKey={activity}
        onSelect={onActivityChange}
        showIcons
      />

      <OptionSelector
        label="Duration"
        options={durationOptions}
        selectedKey={duration}
        onSelect={onDurationChange}
      />

      {recommendation ? (
        <div className="rec-card">
          <div className="rec-header">
            <div className="rec-title">Today's Layers</div>
            <div className="rec-conf">{getPhaseLabel(recommendation.phase, logs.length)}</div>
          </div>
          <div className="eff-temp-badge">
            Effective temp: <strong>{displayTemp(Math.round(recommendation.effectiveTemp))}</strong>
          </div>
          <OutfitLayers outfit={recommendation.outfit} />
        </div>
      ) : null}

      <button className="log-btn" onClick={onOpenLog}>Log How It Went</button>
    </main>
  );
}

export function HomeErrorView({ error }) {
  return (
    <div style={{ padding: 40, textAlign: 'center', minHeight: '100dvh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div className="header" style={{ justifyContent: 'center' }}><div className="logo">Layer<span>Up</span></div></div>
      <p style={{ color: 'var(--text3)', marginTop: 24, fontSize: 16 }}>{error}</p>
      <button className="log-btn" style={{ marginTop: 32 }} onClick={() => window.location.reload()}>Retry</button>
    </div>
  );
}
