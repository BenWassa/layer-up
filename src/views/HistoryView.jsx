import {
  ACTIVITY_LEVELS,
  COMFORT_RATINGS,
  DURATIONS,
  LAYERS,
  LAYER_ICONS,
  OUTFIT_CATEGORIES,
  normalizeOutfit,
  weatherIcon,
} from '../constants';
import { AppHeader } from '../components/AppHeader';

export function HistoryView({ logs, displayTemp }) {
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <main className="page history-page">
      <AppHeader compact />

      <section className="page-intro">
        <div className="section-kicker">Training Data</div>
        <h1 className="page-title">Your outing history</h1>
        <p className="page-copy">
          Every log helps the model learn how your body reads the weather.
        </p>
      </section>

      {logs.length === 0 ? (
        <section className="content-panel empty-state">
          <div className="empty-symbol" aria-hidden="true">
            ⌁
          </div>
          <h2 className="empty-title">No logs yet</h2>
          <p className="empty-copy">
            After your next outing, record how the recommendation felt and this
            timeline will start filling in.
          </p>
        </section>
      ) : null}

      {[...logs].reverse().map((log) => {
        const comfort = COMFORT_RATINGS.find(
          (item) => item.key === log.comfort
        );
        const activity = ACTIVITY_LEVELS.find(
          (item) => item.key === log.activity
        );
        const duration = DURATIONS.find((item) => item.key === log.duration);
        const outfit = normalizeOutfit(log.outfit);

        return (
          <article key={log.id} className="history-item">
            <div className="history-top">
              <div>
                <time
                  className="history-date"
                  dateTime={new Date(log.timestamp).toISOString()}
                >
                  {formatDate(log.timestamp)}
                </time>
                <div className="history-location">{log.weather.location}</div>
              </div>
              <div className="history-comfort" title={comfort?.label}>
                {comfort?.icon}
              </div>
            </div>

            <div className="history-conditions">
              <span>
                {weatherIcon(log.weather.weatherCode)}{' '}
                {displayTemp(log.weather.feelsLike)} feels like
              </span>
              <span>
                {activity?.icon} {activity?.label}
              </span>
              <span>{duration?.label}</span>
            </div>

            <div className="history-outfit">
              {OUTFIT_CATEGORIES.map((category) => (
                <span key={category} className="history-tag">
                  {LAYER_ICONS[category]}{' '}
                  {LAYERS[category][outfit[category]] || LAYERS[category][0]}
                </span>
              ))}
            </div>

            {log.notes ? <p className="history-notes">{log.notes}</p> : null}
          </article>
        );
      })}
    </main>
  );
}
