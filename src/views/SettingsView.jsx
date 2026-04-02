import { AppHeader } from '../components/AppHeader';

export function SettingsView({
  unit,
  activity,
  activityOptions,
  onUnitChange,
  onActivityChange,
  onLoadDemoLogs,
  confirmClear,
  onClearLogs,
  appVersion,
}) {
  return (
    <main className="settings-page">
      <AppHeader compact />
      <h1 className="settings-title">Settings</h1>

      <section className="setting-row">
        <div className="setting-info">
          <div className="setting-label">Temperature Unit</div>
          <div className="setting-desc">Switch between Celsius and Fahrenheit</div>
        </div>
        <div className="toggle-group" role="group" aria-label="Temperature Unit">
          <button type="button" className={`toggle-opt ${unit === 'C' ? 'active' : ''}`} onClick={() => onUnitChange('C')}>°C</button>
          <button type="button" className={`toggle-opt ${unit === 'F' ? 'active' : ''}`} onClick={() => onUnitChange('F')}>°F</button>
        </div>
      </section>

      <section className="setting-row">
        <div className="setting-info">
          <div className="setting-label">Default Activity</div>
          <div className="setting-desc">Pre-selected when you open the app</div>
        </div>
        <div className="toggle-group" role="group" aria-label="Default Activity">
          {activityOptions.map(a => (
            <button 
              key={a.key} 
              type="button"
              className={`toggle-opt ${activity === a.key ? 'active' : ''}`} 
              onClick={() => onActivityChange(a.key)} 
              title={a.label}
              aria-label={a.label}
              aria-pressed={activity === a.key}
            >
              {a.icon}
            </button>
          ))}
        </div>
      </section>

      <div style={{ marginTop: 32 }}>
        <button type="button" className="demo-btn" onClick={onLoadDemoLogs}>
          + Load 25 Demo Logs (Test Data)
        </button>
        
        <button 
          type="button" 
          className={`clear-btn ${confirmClear ? 'confirming' : ''}`} 
          onClick={onClearLogs}
        >
          {confirmClear ? '⚠️ Tap again to permanently delete' : 'Clear All Logs'}
        </button>
      </div>

      <footer style={{ marginTop: 56, textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>
        <div className="logo" style={{ justifyContent: 'center', marginBottom: 8, color: 'var(--text)' }}>
          Layer<span>Up</span>
        </div>
        <div>{appVersion} · Beta</div>
        <div style={{ marginTop: 8, fontWeight: 500 }}>Thermal Intelligence · 2026</div>
      </footer>
    </main>
  );
}