import { ACTIVITY_LEVELS, COMFORT_RATINGS } from '../constants';
import { AppHeader } from '../components/AppHeader';

export function InsightsView({ logs, phase, calculateOffset, displayOffset }) {
  const overallOffset = calculateOffset(logs);
  const comfortRate = logs.length
    ? Math.round((logs.filter(log => log.comfort === 'justRight').length / logs.length) * 100)
    : 0;
  const thermalProfile = overallOffset > 0 ? 'Runs Cold' : overallOffset < 0 ? 'Runs Warm' : 'Neutral';
  const thermalSymbol = overallOffset > 0 ? '❄️' : overallOffset < 0 ? '🔥' : '◌';

  return (
    <main className="page insights-page">
      <AppHeader compact />

      <section className="page-intro">
        <div className="section-kicker">Signals</div>
        <h1 className="page-title">Thermal insights</h1>
        <p className="page-copy">This is the app&apos;s current read on how your comfort shifts with weather and effort.</p>
      </section>

      {logs.length === 0 ? (
        <section className="content-panel empty-state">
          <div className="empty-symbol" aria-hidden="true">◔</div>
          <h2 className="empty-title">Not enough data yet</h2>
          <p className="empty-copy">Add a few real-world logs to unlock your comfort patterns and activity offsets.</p>
        </section>
      ) : (
        <>
          <section className="stat-grid">
            <div className="stat-card">
              <div className="stat-label">Total Logs</div>
              <div className="stat-val">{logs.length}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Comfort Rate</div>
              <div className="stat-val stat-val-good">{comfortRate}%</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Thermal Bias</div>
              <div className="stat-val">{thermalSymbol}</div>
              <div className="stat-meta">{thermalProfile}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Model Phase</div>
              <div className="stat-val">{phase}</div>
            </div>
          </section>

          <section className="content-panel insight-section">
            <div className="panel-heading">
              <div>
                <div className="section-kicker">Distribution</div>
                <h2 className="panel-title">Comfort outcomes</h2>
              </div>
            </div>

            <div className="bar-chart">
              {COMFORT_RATINGS.map((rating) => {
                const count = logs.filter(log => log.comfort === rating.key).length;
                const percent = Math.round((count / logs.length) * 100) || 0;

                return (
                  <div key={rating.key} className="bar-row">
                    <div className="bar-label">{rating.icon} {rating.label}</div>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ width: `${Math.max(percent, 8)}%`, background: rating.color }}>
                        {percent > 12 ? `${percent}%` : ''}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="content-panel insight-section">
            <div className="panel-heading">
              <div>
                <div className="section-kicker">Calibration</div>
                <h2 className="panel-title">Warmth offset by activity</h2>
              </div>
            </div>

            <div className="bar-chart">
              {ACTIVITY_LEVELS.map((activity) => {
                const activityLogs = logs.filter(log => log.activity === activity.key);
                const offset = activityLogs.length >= 3 ? calculateOffset(activityLogs) : 0;
                const normalized = Math.min(Math.max((offset + 5) / 10, 0), 1);
                const color = offset > 0 ? 'var(--cold)' : offset < 0 ? 'var(--warm)' : 'var(--green)';

                return (
                  <div key={activity.key} className="bar-row">
                    <div className="bar-label">{activity.icon} {activity.label}</div>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ width: `${Math.max(normalized * 100, 10)}%`, background: color }}>
                        {activityLogs.length >= 3 ? displayOffset(offset) : '—'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="content-panel insight-section">
            <div className="panel-heading">
              <div>
                <div className="section-kicker">Progression</div>
                <h2 className="panel-title">Algorithm maturity</h2>
              </div>
              <p className="panel-copy">Phase 4 only unlocks once LayerUp can match current conditions against similar successful days.</p>
            </div>

            <div className="phase-grid">
              {[1, 2, 3, 4].map((value) => (
                <div key={value} className={`phase-step ${phase >= value ? 'active' : ''} ${phase === value ? 'current' : ''}`}>
                  <div className="phase-step-num">{value}</div>
                  <div className="phase-step-label">
                    {value === 1 ? 'Base' : value === 2 ? '10 logs' : value === 3 ? '30 logs' : '50 logs'}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </main>
  );
}
