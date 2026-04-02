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
    <div className="settings-page">
      <AppHeader compact />
      <div className="settings-title">Settings</div>

      <div className="setting-row">
        <div><div className="setting-label">Temperature Unit</div><div className="setting-desc">Switch between Celsius and Fahrenheit</div></div>
        <div className="toggle-group">
          <button className={`toggle-opt ${unit === 'C' ? 'active' : ''}`} onClick={() => onUnitChange('C')}>°C</button>
          <button className={`toggle-opt ${unit === 'F' ? 'active' : ''}`} onClick={() => onUnitChange('F')}>°F</button>
        </div>
      </div>

      <div className="setting-row">
        <div><div className="setting-label">Default Activity</div><div className="setting-desc">Pre-selected when you open the app</div></div>
        <div className="toggle-group">
          {activityOptions.map(a => (
            <button key={a.key} className={`toggle-opt ${activity === a.key ? 'active' : ''}`} onClick={() => onActivityChange(a.key)} title={a.label}>{a.icon}</button>
          ))}
        </div>
      </div>

      <button className="demo-btn" onClick={onLoadDemoLogs}>+ Load 25 Demo Logs (for testing phases)</button>
      <button className={`clear-btn ${confirmClear ? 'confirming' : ''}`} onClick={onClearLogs}>
        {confirmClear ? 'Tap again to confirm clearing' : 'Clear All Logs'}
      </button>

      <div style={{ marginTop: 48, textAlign: 'center', color: 'var(--text3)', fontSize: 12 }}>
        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 20, marginBottom: 6, color: 'var(--text)' }}>Layer<span style={{ color: 'var(--accent)' }}>Up</span></div>
        <div>{appVersion} · Beta</div>
        <div style={{ marginTop: 6 }}>Thermal Intelligence · April 2026</div>
      </div>
    </div>
  );
}
