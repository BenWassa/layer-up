import { useState, useEffect } from 'react';
import {
  ACTIVITY_LEVELS,
  DURATIONS,
  COMFORT_RATINGS,
  LAYERS,
  LAYER_ICONS,
  LAYER_LABELS,
  weatherIcon,
  weatherDesc,
  generateDemoLogs,
} from './constants';
import {
  getRecommendation,
  getPhase,
  getPhaseLabel,
  calculateOffset,
  phase4Recommend,
} from './logic';
import { loadAppState, saveAppState } from './storage';
import './styles.css';

export default function LayerUp() {
  const [tab, setTab] = useState('home');
  const [weather, setWeather] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [error, setError] = useState(null);
  const [activity, setActivity] = useState('light');
  const [duration, setDuration] = useState('medium');
  const [confirmClear, setConfirmClear] = useState(false);
  const [logs, setLogs] = useState([]);
  const [unit, setUnit] = useState('C');
  const [showLog, setShowLog] = useState(false);
  const [logComfort, setLogComfort] = useState(null);
  const [logNotes, setLogNotes] = useState('');
  const [logOutfit, setLogOutfit] = useState(null);
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      const saved = await loadAppState();
      if (cancelled) return;
      setLogs(saved.logs || []);
      setUnit(saved.unit || 'C');
      setBootstrapped(true);
    }
    init();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!bootstrapped) return;
    saveAppState({ logs, unit });
  }, [logs, unit, bootstrapped]);

  useEffect(() => {
    let cancelled = false;
    async function fetchWeather() {
      setError(null);
      setLoadingWeather(true);

      const defaultLoc = { lat: 43.65, lng: -79.38 };
      let lat = defaultLoc.lat;
      let lng = defaultLoc.lng;

      if (navigator?.geolocation) {
        try {
          const getPos = new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000, maximumAge: 60000 });
          });
          const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000));
          const pos = await Promise.race([getPos, timeout]);
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
        } catch (geoErr) {
          console.warn('Geolocation failed or timed out:', geoErr);
        }
      }

      try {
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,precipitation,uv_index,weather_code&timezone=auto`;
        const res = await fetch(weatherUrl);
        const data = await res.json();
        const c = data.current;

        let locationName = `${lat.toFixed(2)}°, ${lng.toFixed(2)}°`;
        try {
          const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${lat.toFixed(2)},${lng.toFixed(2)}&count=1`);
          const geoData = await geoRes.json();
          if (geoData.results?.[0]) locationName = `${geoData.results[0].name}, ${geoData.results[0].country_code}`;
        } catch {
          // keep fallback coords
        }

        if (!cancelled) {
          setWeather({
            temp: Math.round(c.temperature_2m),
            feelsLike: Math.round(c.apparent_temperature),
            humidity: c.relative_humidity_2m,
            windSpeed: Math.round(c.wind_speed_10m),
            precipitation: c.precipitation,
            uvIndex: c.uv_index,
            weatherCode: c.weather_code,
            location: locationName,
          });
          setLoadingWeather(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError('Could not fetch weather data. Please check network and retry.');
          setLoadingWeather(false);
        }
      }
    }

    fetchWeather();
    return () => { cancelled = true; };
  }, []);

  const toF = c => Math.round(c * 9 / 5 + 32);
  const displayTemp = c => (unit === 'F' ? `${toF(c)}°F` : `${c}°C`);
  const displayOffset = celsiusVal => {
    const val = unit === 'F' ? celsiusVal * 1.8 : celsiusVal;
    return `${val > 0 ? '+' : ''}${val.toFixed(1)}°`;
  };

  const recommendation = weather ? getRecommendation(weather, activity, duration, logs) : null;

  const openLog = () => {
    if (recommendation) setLogOutfit({ ...recommendation.outfit });
    setLogComfort(null);
    setLogNotes('');
    setShowLog(true);
  };

  const submitLog = () => {
    if (!logComfort || !weather || !logOutfit) return;
    const entry = {
      id: `log-${Date.now()}`,
      timestamp: Date.now(),
      weather: { ...weather },
      activity,
      duration,
      outfit: { ...logOutfit },
      comfort: logComfort,
      notes: logNotes,
    };
    setLogs(prev => [...prev, entry]);
    setShowLog(false);
  };

  const phase = getPhase(logs.length);

  if (!bootstrapped || loadingWeather) {
    return (
      <div className="app">
        <div className="loading-screen">
          <div className="spinner" />
          <div className="loading-text">Loading LayerUp…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {tab === 'home' && weather && (
        <div className="home-page">
          <div className="header">
            <div className="logo">Layer<span>Up</span></div>
            <div className="phase-pill">Phase {phase} · {logs.length} logs</div>
          </div>

          <div className="weather-card">
            <div className="weather-location">📍 {weather.location}</div>
            <div className="weather-main">
              <div>
                <div className="weather-temp">
                  {unit === 'F' ? toF(weather.temp) : weather.temp}
                  <span className="weather-temp-unit">°{unit}</span>
                </div>
                <div className="weather-desc">{weatherIcon(weather.weatherCode)} {weatherDesc(weather.weatherCode)}</div>
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

          <div className="selector-section">
            <div className="selector-label">Activity</div>
            <div className="selector-row">
              {ACTIVITY_LEVELS.map(a => (
                <button key={a.key} className={`sel-btn ${activity === a.key ? 'active' : ''}`} onClick={() => setActivity(a.key)}>
                  <span className="sel-icon">{a.icon}</span>
                  <span className="sel-label">{a.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="selector-section">
            <div className="selector-label">Duration</div>
            <div className="selector-row">
              {DURATIONS.map(d => (
                <button key={d.key} className={`sel-btn ${duration === d.key ? 'active' : ''}`} onClick={() => setDuration(d.key)}>
                  <span className="sel-label">{d.label}</span>
                </button>
              ))}
            </div>
          </div>

          {recommendation && (
            <div className="rec-card">
              <div className="rec-header">
                <div className="rec-title">Today's Layers</div>
                <div className="rec-conf">{getPhaseLabel(recommendation.phase, logs.length)}</div>
              </div>
              <div className="eff-temp-badge">
                Effective temp: <strong>{displayTemp(Math.round(recommendation.effectiveTemp))}</strong>
              </div>
              <div className="outfit-layers">
                {Object.keys(LAYERS).map(cat => {
                  const idx = recommendation.outfit[cat];
                  const options = LAYERS[cat];
                  const maxIdx = options.length - 1;
                  return (
                    <div key={cat} className="outfit-layer">
                      <div className="layer-icon">{LAYER_ICONS[cat]}</div>
                      <div className="layer-info">
                        <div className="layer-cat">{LAYER_LABELS[cat]}</div>
                        <div className="layer-val">{options[idx] || options[0]}</div>
                      </div>
                      <div className="layer-warmth">
                        <div className="layer-warmth-fill" style={{ width: `${maxIdx > 0 ? (idx / maxIdx) * 100 : 0}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <button className="log-btn" onClick={openLog}>Log How It Went</button>
        </div>
      )}

      {tab === 'home' && error && (
        <div style={{ padding: 40, textAlign: 'center' }}>
          <div className="header"><div className="logo">Layer<span>Up</span></div></div>
          <p style={{ color: 'var(--text3)', marginTop: 40, fontSize: 15 }}>{error}</p>
          <button className="log-btn" style={{ marginTop: 24 }} onClick={() => window.location.reload()}>Retry</button>
        </div>
      )}

      {tab === 'history' && (
        <div className="history-page">
          <div className="header" style={{ padding: 0, marginBottom: 24 }}><div className="logo">Layer<span>Up</span></div></div>
          <div className="history-title">History</div>
          {logs.length === 0 && <p style={{ color: 'var(--text3)', fontSize: 15 }}>No logs yet. Go outside, then log how it went.</p>}
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
              {log.notes && <p style={{ fontSize: 13, color: 'var(--text3)', marginTop: 12, fontStyle: 'italic', lineHeight: 1.4 }}>"{log.notes}"</p>}
            </div>
          ))}
        </div>
      )}

      {tab === 'insights' && (
        <div className="insights-page">
          <div className="header" style={{ padding: 0, marginBottom: 24 }}><div className="logo">Layer<span>Up</span></div></div>
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
      )}

      {tab === 'settings' && (
        <div className="settings-page">
          <div className="header" style={{ padding: 0, marginBottom: 24 }}><div className="logo">Layer<span>Up</span></div></div>
          <div className="settings-title">Settings</div>

          <div className="setting-row">
            <div><div className="setting-label">Temperature Unit</div><div className="setting-desc">Switch between Celsius and Fahrenheit</div></div>
            <div className="toggle-group">
              <button className={`toggle-opt ${unit === 'C' ? 'active' : ''}`} onClick={() => setUnit('C')}>°C</button>
              <button className={`toggle-opt ${unit === 'F' ? 'active' : ''}`} onClick={() => setUnit('F')}>°F</button>
            </div>
          </div>

          <div className="setting-row">
            <div><div className="setting-label">Default Activity</div><div className="setting-desc">Pre-selected when you open the app</div></div>
            <div className="toggle-group">
              {ACTIVITY_LEVELS.map(a => (
                <button key={a.key} className={`toggle-opt ${activity === a.key ? 'active' : ''}`} onClick={() => setActivity(a.key)} title={a.label}>{a.icon}</button>
              ))}
            </div>
          </div>

          <button className="demo-btn" onClick={() => setLogs(prev => [...prev, ...generateDemoLogs(25)])}>+ Load 25 Demo Logs (for testing phases)</button>
          <button className={`clear-btn ${confirmClear ? 'confirming' : ''}`} onClick={() => {
            if (confirmClear) { setLogs([]); setConfirmClear(false); } else { setConfirmClear(true); setTimeout(() => setConfirmClear(false), 3000); }
          }}>{confirmClear ? 'Tap again to confirm clearing' : 'Clear All Logs'}</button>

          <div style={{ marginTop: 48, textAlign: 'center', color: 'var(--text3)', fontSize: 12 }}>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 20, marginBottom: 6, color: 'var(--text)' }}>Layer<span style={{ color: 'var(--accent)' }}>Up</span></div>
            <div>v1.0 · Thermal Intelligence</div>
            <div style={{ marginTop: 6 }}>Product Commission · March 2026</div>
          </div>
        </div>
      )}

      {showLog && recommendation && (
        <div className="sheet-overlay" onClick={e => { if (e.target === e.currentTarget) setShowLog(false); }}>
          <div className="sheet">
            <div className="sheet-handle" />
            <div className="sheet-title">How did it go?</div>

            <div className="selector-section" style={{ padding: 0, marginBottom: 20 }}>
              <div className="selector-label">Activity</div>
              <div className="selector-row">
                {ACTIVITY_LEVELS.map(a => (
                  <button key={a.key} className={`sel-btn ${activity === a.key ? 'active' : ''}`} onClick={() => setActivity(a.key)}>
                    <span className="sel-icon">{a.icon}</span>
                    <span className="sel-label">{a.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="selector-section" style={{ padding: 0, marginBottom: 20 }}>
              <div className="selector-label">Duration</div>
              <div className="selector-row">
                {DURATIONS.map(d => (
                  <button key={d.key} className={`sel-btn ${duration === d.key ? 'active' : ''}`} onClick={() => setDuration(d.key)}>
                    <span className="sel-label">{d.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="selector-section" style={{ padding: 0, marginBottom: 20 }}>
              <div className="selector-label">What You Wore (tap to adjust)</div>
              <div className="outfit-layers">
                {logOutfit && Object.keys(LAYERS).map(cat => {
                  const idx = logOutfit[cat];
                  const options = LAYERS[cat];
                  return (
                    <div key={cat} className="outfit-layer" style={{ cursor: 'pointer' }} onClick={() => setLogOutfit(prev => ({ ...prev, [cat]: (prev[cat] + 1) % options.length }))}>
                      <div className="layer-icon">{LAYER_ICONS[cat]}</div>
                      <div className="layer-info"><div className="layer-cat">{LAYER_LABELS[cat]}</div><div className="layer-val">{options[idx] || options[0]}</div></div>
                      <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text3)' }}>Tap</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="selector-label" style={{ marginBottom: 12 }}>Comfort Rating</div>
            <div className="comfort-row">
              {COMFORT_RATINGS.map(cr => (
                <button key={cr.key} className={`comfort-btn ${logComfort === cr.key ? 'active' : ''}`} style={{ color: logComfort === cr.key ? cr.color : undefined, borderColor: logComfort === cr.key ? cr.color : undefined }} onClick={() => setLogComfort(cr.key)}>
                  <div className="comfort-icon">{cr.icon}</div>
                  <div className="comfort-label">{cr.label}</div>
                </button>
              ))}
            </div>

            <textarea className="notes-input" placeholder="Notes (optional) — illness, unusual setting…" rows={2} value={logNotes} onChange={e => setLogNotes(e.target.value)} />
            <button className="sheet-submit" disabled={!logComfort} onClick={submitLog}>Save Log</button>
          </div>
        </div>
      )}

      <div className="bottom-nav">
        <button className={`nav-btn ${tab === 'home' ? 'active' : ''}`} onClick={() => setTab('home')}><span className="nav-icon">🌡️</span> Today</button>
        <button className={`nav-btn ${tab === 'history' ? 'active' : ''}`} onClick={() => setTab('history')}><span className="nav-icon">📋</span> History</button>
        <button className={`nav-btn ${tab === 'insights' ? 'active' : ''}`} onClick={() => setTab('insights')}><span className="nav-icon">📊</span> Insights</button>
        <button className={`nav-btn ${tab === 'settings' ? 'active' : ''}`} onClick={() => setTab('settings')}><span className="nav-icon">⚙️</span> Settings</button>
      </div>
    </div>
  );
}
