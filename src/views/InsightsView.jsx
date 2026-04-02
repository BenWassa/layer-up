import { ACTIVITY_LEVELS, COMFORT_RATINGS } from '../constants';
import { AppHeader } from '../components/AppHeader';

export function InsightsView({ logs, phase, calculateOffset, displayOffset }) {
  return (
    <div className="insights-page">
      <AppHeader compact />
      <div className="insights-title">Insights</div>
      {logs.length === 0 ? (
        <p style={{ color: 'var(--text3)', fontSize: 15 }}>Log some outings to see your insights.</p>
      ) : (
        <>
          <div className="stat-grid">
            <div className="stat-card"><div className="stat-val">{logs.length}</div><div className="stat-label">Total Logs</div></div>
            <div className="stat-card"><div className="stat-val" style={{ color: 'var(--green)' }}>{Math.round((logs.filter(l => l.comfort === 'justRight').length / logs.length) * 100)}%</div><div className="stat-label">Just Right</div></div>
            <div className="stat-card"><div className="stat-val">{calculateOffset(logs) > 0 ? '❄️' : calculateOffset(logs) < 0 ? '🔥' : '⚖️'}</div><div className="stat-label">{calculateOffset(logs) > 0 ? 'Runs Cold' : calculateOffset(logs) < 0 ? 'Runs Warm' : 'Neutral'}</div></div>
            <div className="stat-card"><div className="stat-val">{phase}</div><div className="stat-label">Algorithm Phase</div></div>
          </div>

          <div className="insight-section">
            <div className="insight-section-title">Comfort Distribution</div>
            <div className="bar-chart">
              {COMFORT_RATINGS.map(cr => {
                const count = logs.filter(l => l.comfort === cr.key).length;
                const pct = Math.round((count / logs.length) * 100);
                return (
                  <div key={cr.key} className="bar-row">
                    <div className="bar-label">{cr.icon} {cr.label}</div>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ width: `${Math.max(pct, 2)}%`, background: cr.color }}>{pct > 10 ? `${pct}%` : ''}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="insight-section">
            <div className="insight-section-title">Warmth Offset by Activity</div>
            <div className="bar-chart">
              {ACTIVITY_LEVELS.map(a => {
                const actLogs = logs.filter(l => l.activity === a.key);
                const offset = actLogs.length >= 3 ? calculateOffset(actLogs) : 0;
                const normalized = Math.min(Math.max((offset + 5) / 10, 0), 1);
                return (
                  <div key={a.key} className="bar-row">
                    <div className="bar-label">{a.icon} {a.label}</div>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ width: `${Math.max(normalized * 100, 8)}%`, background: offset > 0 ? 'var(--cold)' : offset < 0 ? 'var(--warm)' : 'var(--green)' }}>{actLogs.length >= 3 ? displayOffset(offset) : '—'}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="insight-section">
            <div className="insight-section-title">Phase Progression</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              {[1, 2, 3, 4].map(p => (
                <div key={p} style={{ flex: 1, padding: '16px 8px', borderRadius: 16, background: phase >= p ? 'rgba(91, 159, 224, 0.15)' : 'var(--surface2)', border: `1px solid ${phase >= p ? 'var(--accent)' : 'var(--border)'}`, textAlign: 'center', opacity: phase >= p ? 1 : 0.4, transition: 'all 0.3s' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: phase >= p ? 'var(--accent)' : 'inherit' }}>{p}</div>
                  <div style={{ fontSize: 10, fontWeight: 500, color: phase >= p ? 'var(--text)' : 'var(--text3)', marginTop: 4 }}>{p === 1 ? 'Baseline' : p === 2 ? '10 logs' : p === 3 ? '30 logs' : '50 logs'}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
