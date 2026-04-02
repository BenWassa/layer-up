import { ACTIVITY_LEVELS, COMFORT_RATINGS } from '../constants';
import { AppHeader } from '../components/AppHeader';

export function InsightsView({ logs, phase, calculateOffset, displayOffset }) {
  return (
    <main className="insights-page">
      <AppHeader compact />
      <h1 className="insights-title">Insights</h1>
      
      {logs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text3)' }}>
          <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.5 }}>📊</div>
          <p style={{ fontSize: 16, fontWeight: 500 }}>Not enough data.</p>
          <p style={{ fontSize: 14, marginTop: 8 }}>Log some outings to see your personal thermal insights.</p>
        </div>
      ) : (
        <>
          <section className="stat-grid">
            <div className="stat-card"><div className="stat-val">{logs.length}</div><div className="stat-label">Total Logs</div></div>
            <div className="stat-card"><div className="stat-val" style={{ color: 'var(--green)' }}>{Math.round((logs.filter(l => l.comfort === 'justRight').length / logs.length) * 100)}%</div><div className="stat-label">Just Right</div></div>
            <div className="stat-card"><div className="stat-val">{calculateOffset(logs) > 0 ? '❄️' : calculateOffset(logs) < 0 ? '🔥' : '⚖️'}</div><div className="stat-label">{calculateOffset(logs) > 0 ? 'Runs Cold' : calculateOffset(logs) < 0 ? 'Runs Warm' : 'Neutral'}</div></div>
            <div className="stat-card"><div className="stat-val">{phase}</div><div className="stat-label">Algorithm Phase</div></div>
          </section>

          <section className="insight-section">
            <h2 className="insight-section-title">Comfort Distribution</h2>
            <div className="bar-chart">
              {COMFORT_RATINGS.map(cr => {
                const count = logs.filter(l => l.comfort === cr.key).length;
                const pct = Math.round((count / logs.length) * 100) || 0;
                return (
                  <div key={cr.key} className="bar-row">
                    <div className="bar-label">{cr.icon} {cr.label}</div>
                    <div className="bar-track">
                      {/* Set a min-width of 8% so the pill shape doesn't collapse on small values */}
                      <div className="bar-fill" style={{ width: `${Math.max(pct, 8)}%`, background: cr.color }}>
                        {pct > 12 ? `${pct}%` : ''}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="insight-section">
            <h2 className="insight-section-title">Warmth Offset by Activity</h2>
            <div className="bar-chart">
              {ACTIVITY_LEVELS.map(a => {
                const actLogs = logs.filter(l => l.activity === a.key);
                const offset = actLogs.length >= 3 ? calculateOffset(actLogs) : 0;
                const normalized = Math.min(Math.max((offset + 5) / 10, 0), 1);
                return (
                  <div key={a.key} className="bar-row">
                    <div className="bar-label">{a.icon} {a.label}</div>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ 
                        width: `${Math.max(normalized * 100, 10)}%`, 
                        background: offset > 0 ? 'var(--cold)' : offset < 0 ? 'var(--warm)' : 'var(--green)' 
                      }}>
                        {actLogs.length >= 3 ? displayOffset(offset) : '—'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="insight-section">
            <h2 className="insight-section-title">Phase Progression</h2>
            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              {[1, 2, 3, 4].map(p => (
                <div key={p} style={{ 
                  flex: 1, 
                  padding: '16px 4px', 
                  borderRadius: 16, 
                  background: phase >= p ? 'var(--accent-bg)' : 'var(--surface2)', 
                  border: `1px solid ${phase >= p ? 'var(--accent)' : 'var(--border)'}`, 
                  textAlign: 'center', 
                  opacity: phase >= p ? 1 : 0.5, 
                  transition: 'all 0.3s ease',
                  boxShadow: phase === p ? '0 4px 12px var(--accent-glow)' : 'none'
                }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: phase >= p ? 'var(--accent)' : 'var(--text2)' }}>{p}</div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: phase >= p ? 'var(--text)' : 'var(--text3)', marginTop: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {p === 1 ? 'Base' : p === 2 ? '10 logs' : p === 3 ? '30 logs' : '50 logs'}
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