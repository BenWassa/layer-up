import { ACTIVITY_LEVELS, COMFORT_RATINGS, DURATIONS, LAYERS, LAYER_ICONS, weatherIcon } from '../constants';
import { AppHeader } from '../components/AppHeader';

export function HistoryView({ logs, displayTemp }) {
  return (
    <div className="history-page">
      <AppHeader compact />
      <div className="history-title">History</div>
      {logs.length === 0 ? <p style={{ color: 'var(--text3)', fontSize: 15 }}>No logs yet. Go outside, then log how it went.</p> : null}
      {[...logs].reverse().map(log => (
        <div key={log.id} className="history-item">
          <div className="history-top">
            <div className="history-date">{new Date(log.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
            <div className="history-comfort">{COMFORT_RATINGS.find(c => c.key === log.comfort)?.icon}</div>
          </div>
          <div className="history-conditions">
            <span>{weatherIcon(log.weather.weatherCode)} {displayTemp(log.weather.feelsLike)} feels like</span>
            <span>{ACTIVITY_LEVELS.find(a => a.key === log.activity)?.icon} {ACTIVITY_LEVELS.find(a => a.key === log.activity)?.label}</span>
            <span>{DURATIONS.find(d => d.key === log.duration)?.label}</span>
          </div>
          <div className="history-outfit">
            {Object.keys(LAYERS).map(cat => (
              <span key={cat} className="history-tag">{LAYER_ICONS[cat]} {LAYERS[cat][log.outfit[cat]] || LAYERS[cat][0]}</span>
            ))}
          </div>
          {log.notes ? <p style={{ fontSize: 13, color: 'var(--text3)', marginTop: 12, fontStyle: 'italic', lineHeight: 1.4 }}>"{log.notes}"</p> : null}
        </div>
      ))}
    </div>
  );
}
