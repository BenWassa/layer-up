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
    <main className="page home-page">
      <AppHeader phase={phase} logCount={logs.length} />

      <section className="hero-panel">
        <div className="hero-copy">
          <div className="section-kicker">Current Conditions</div>
          <div className="weather-location">
            <span aria-hidden="true">◦</span>
            <span>{weather.location}</span>
          </div>
          <div className="weather-main">
            <div className="weather-temp">
              {unit === 'F' ? toF(weather.temp) : weather.temp}
              <span className="weather-temp-unit">°{unit}</span>
            </div>
            <div className="weather-status">
              <div className="weather-status-icon" aria-hidden="true">{weatherIcon(weather.weatherCode)}</div>
              <div>
                <div className="weather-desc">{weatherDesc(weather.weatherCode)}</div>
                <div className="weather-caption">Dress for how it feels, not just the headline temperature.</div>
              </div>
            </div>
          </div>
        </div>

        <div className="weather-details">
          <div className="weather-detail">
            <div className="weather-detail-label">Feels Like</div>
            <div className="weather-detail-val">{displayTemp(weather.feelsLike)}</div>
          </div>
          <div className="weather-detail">
            <div className="weather-detail-label">Wind</div>
            <div className="weather-detail-val">{weather.windSpeed} km/h</div>
          </div>
          <div className="weather-detail">
            <div className="weather-detail-label">Humidity</div>
            <div className="weather-detail-val">{weather.humidity}%</div>
          </div>
          <div className="weather-detail">
            <div className="weather-detail-label">Precipitation</div>
            <div className="weather-detail-val">{weather.precipitation} mm</div>
          </div>
        </div>
      </section>

      <section className="content-panel controls-panel">
        <div className="panel-heading">
          <div>
            <div className="section-kicker">Inputs</div>
            <h1 className="panel-title">Tune today&apos;s recommendation</h1>
          </div>
          <p className="panel-copy">Set how hard you&apos;re moving and how long you&apos;ll be outside.</p>
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
      </section>

      {recommendation ? (
        <section className="content-panel recommendation-panel">
          <div className="panel-heading">
            <div>
              <div className="section-kicker">Recommendation</div>
              <h2 className="panel-title">Today&apos;s layer plan</h2>
            </div>
            <div className="rec-conf">{phase === 1 ? 'Baseline' : 'Adaptive'}</div>
          </div>

          <p className="panel-copy">{getPhaseLabel(recommendation.phase, logs.length)}</p>

          <div className="eff-temp-badge">
            <span className="eff-temp-label">Effective temperature</span>
            <strong>{displayTemp(Math.round(recommendation.effectiveTemp))}</strong>
          </div>

          <OutfitLayers outfit={recommendation.outfit} />

          <button className="log-btn" onClick={onOpenLog}>Log How It Went</button>
        </section>
      ) : null}
    </main>
  );
}

export function HomeErrorView({ error }) {
  return (
    <main className="page home-page">
      <div className="content-panel error-panel">
        <div className="section-kicker">Weather Unavailable</div>
        <h1 className="panel-title">LayerUp couldn&apos;t load conditions.</h1>
        <p className="panel-copy">{error}</p>
        <button className="log-btn" onClick={() => window.location.reload()}>Retry</button>
      </div>
    </main>
  );
}
