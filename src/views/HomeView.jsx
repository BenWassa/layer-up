import { AppHeader } from '../components/AppHeader';
import { OutfitLayers } from '../components/OutfitLayers';
import { WeatherStrip } from '../components/WeatherStrip';
export function HomeView({
  weather,
  unit,
  phase,
  logs,
  recommendation,
  displayTemp,
  onOpenLog,
  getPhaseLabel,
  toF,
}) {
  return (
    <main className="page home-page">
      <AppHeader phase={phase} logCount={logs.length} />

      <WeatherStrip
        weather={weather}
        unit={unit}
        displayTemp={displayTemp}
        toF={toF}
      />

      {/* Output Panel follows the inputs */}
      {recommendation ? (
        <section className="content-panel recommendation-panel">
          <div className="panel-heading">
            <div>
              <h2 className="panel-title">Today&apos;s layer plan</h2>
            </div>
            <div className="rec-conf">
              {phase === 1 ? 'Learning' : 'Personalised'}
            </div>
          </div>

          <div className="eff-temp-badge">
            <span className="eff-temp-label">Feels like</span>
            <strong>
              {displayTemp(Math.round(recommendation.effectiveTemp))}
            </strong>
          </div>

          <p className="panel-copy">
            {getPhaseLabel(recommendation.phase, logs.length)}
          </p>

          <OutfitLayers outfit={recommendation.outfit} />

          <button className="log-btn" onClick={onOpenLog}>
            Log How It Went
          </button>
        </section>
      ) : null}
    </main>
  );
}

export function HomeErrorView({ error }) {
  // ... (keep as is)
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