import { ACTIVITY_LEVELS, COMFORT_RATINGS, DURATIONS, LAYERS, LAYER_ICONS, OUTFIT_CATEGORIES, normalizeOutfit, weatherIcon } from '../constants';
import { AppHeader } from '../components/AppHeader';

export function HistoryView({ logs, displayTemp }) {
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(date);
  };

  return (
    <main className="history-page">
      <AppHeader compact />
      <h1 className="history-title">History</h1>
      
      {logs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text3)' }}>
          <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.5 }}>📋</div>
          <p style={{ fontSize: 16, fontWeight: 500 }}>No logs yet.</p>
          <p style={{ fontSize: 14, marginTop: 8 }}>Go outside, then log how it went to start training your algorithm.</p>
        </div>
      ) : null}

      {[...logs].reverse().map(log => {
        const comfort = COMFORT_RATINGS.find(c => c.key === log.comfort);
        const activity = ACTIVITY_LEVELS.find(a => a.key === log.activity);
        const outfit = normalizeOutfit(log.outfit);
        
        return (
          <article key={log.id} className="history-item">
            <div className="history-top">
              <time className="history-date" dateTime={log.timestamp}>{formatDate(log.timestamp)}</time>
              <div className="history-comfort" title={comfort?.label}>{comfort?.icon}</div>
            </div>
            <div className="history-conditions">
              <span>{weatherIcon(log.weather.weatherCode)} {displayTemp(log.weather.feelsLike)} feels like</span>
              <span>{activity?.icon} {activity?.label}</span>
              <span>{DURATIONS.find(d => d.key === log.duration)?.label}</span>
            </div>
            <div className="history-outfit">
              {OUTFIT_CATEGORIES.map(cat => (
                <span key={cat} className="history-tag">
                  {LAYER_ICONS[cat]} {LAYERS[cat][outfit[cat]] || LAYERS[cat][0]}
                </span>
              ))}
            </div>
            {log.notes ? (
              <p style={{ fontSize: 13, color: 'var(--text3)', marginTop: 14, fontStyle: 'italic', lineHeight: 1.5, background: 'var(--surface)', padding: '10px 12px', borderRadius: 12 }}>
                "{log.notes}"
              </p>
            ) : null}
          </article>
        );
      })}
    </main>
  );
}
