import { AppHeader } from '../components/AppHeader';

export function SettingsView({
  unit,
  theme,
  activity,
  activityOptions,
  onUnitChange,
  onThemeChange,
  onActivityChange,
  onLoadDemoLogs,
  confirmClear,
  onClearLogs,
  appVersion,
}) {
  return (
    <main className="page settings-page">
      <AppHeader compact />

      <section className="page-intro">
        <div className="section-kicker">Preferences</div>
        <h1 className="page-title">Control the instrument</h1>
        <p className="page-copy">Set your default readout, test with demo data, or clear the training set.</p>
      </section>

      <section className="content-panel setting-row">
        <div className="setting-info">
          <div className="setting-label">Temperature Unit</div>
          <div className="setting-desc">Switch the app between Celsius and Fahrenheit.</div>
        </div>
        <div className="toggle-group" role="group" aria-label="Temperature Unit">
          <button type="button" className={`toggle-opt ${unit === 'C' ? 'active' : ''}`} onClick={() => onUnitChange('C')}>°C</button>
          <button type="button" className={`toggle-opt ${unit === 'F' ? 'active' : ''}`} onClick={() => onUnitChange('F')}>°F</button>
        </div>
      </section>

      <section className="content-panel setting-row">
        <div className="setting-info">
          <div className="setting-label">Appearance</div>
          <div className="setting-desc">Switch between the new editorial light theme and a dark mode variant.</div>
        </div>
        <div className="toggle-group" role="group" aria-label="Appearance">
          <button type="button" className={`toggle-opt ${theme === 'light' ? 'active' : ''}`} onClick={() => onThemeChange('light')}>Light</button>
          <button type="button" className={`toggle-opt ${theme === 'dark' ? 'active' : ''}`} onClick={() => onThemeChange('dark')}>Dark</button>
        </div>
      </section>

      <section className="content-panel setting-row">
        <div className="setting-info">
          <div className="setting-label">Default Activity</div>
          <div className="setting-desc">Choose the activity that should be preselected when the app opens.</div>
        </div>
        <div className="toggle-group toggle-group-wide" role="group" aria-label="Default Activity">
          {activityOptions.map(option => (
            <button
              key={option.key}
              type="button"
              className={`toggle-opt ${activity === option.key ? 'active' : ''}`}
              onClick={() => onActivityChange(option.key)}
              title={option.label}
              aria-label={option.label}
              aria-pressed={activity === option.key}
            >
              {option.icon}
            </button>
          ))}
        </div>
      </section>

      <section className="content-panel action-panel">
        <div className="panel-heading">
          <div>
            <div className="section-kicker">Utilities</div>
            <h2 className="panel-title">Test or reset</h2>
          </div>
        </div>

        <button type="button" className="demo-btn" onClick={onLoadDemoLogs}>
          Load 25 Demo Logs
        </button>

        <button
          type="button"
          className={`clear-btn ${confirmClear ? 'confirming' : ''}`}
          onClick={onClearLogs}
        >
          {confirmClear ? 'Tap again to permanently delete logs' : 'Clear All Logs'}
        </button>
      </section>

      <footer className="settings-footer">
        <div className="brand-kicker">LayerUp</div>
        <div>{appVersion} · Beta</div>
        <div>Thermal Intelligence · 2026</div>
      </footer>
    </main>
  );
}
