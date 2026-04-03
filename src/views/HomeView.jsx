import { useMemo } from 'react';
import { AppHeader } from '../components/AppHeader';
import { WeatherInfo, LayerPlan, getWeatherColors } from '../components/WeatherHero';

export function HomeView({
  weather,
  unit,
  phase,
  logs,
  recommendation,
  onOpenLog,
  getPhaseLabel,
}) {
  const wxColors = useMemo(
    () => getWeatherColors(weather.weatherCode, weather.feelsLike),
    [weather.weatherCode, weather.feelsLike]
  );

  return (
    <main
      className="page home-page"
      style={{ '--wx-a': wxColors.a, '--wx-b': wxColors.b }}
    >
      <AppHeader phase={phase} logCount={logs.length} />

      <div className="home-body">
        <WeatherInfo weather={weather} unit={unit} />

        {recommendation ? (
          <LayerPlan
            recommendation={recommendation}
            logs={logs}
            getPhaseLabel={getPhaseLabel}
            onOpenLog={onOpenLog}
          />
        ) : null}
      </div>
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
        <button className="log-btn" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    </main>
  );
}
