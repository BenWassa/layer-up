const NAV_ITEMS = [
  { key: 'home', icon: '🌡️', label: 'Today' },
  { key: 'history', icon: '📋', label: 'History' },
  { key: 'insights', icon: '📊', label: 'Insights' },
  { key: 'settings', icon: '⚙️', label: 'Settings' },
];

export function BottomNav({ tab, onChange }) {
  return (
    <nav className="bottom-nav" role="navigation">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.key}
          className={`nav-btn ${tab === item.key ? 'active' : ''}`}
          onClick={() => onChange(item.key)}
          aria-label={item.label}
        >
          <span className="nav-icon" aria-hidden="true">
            {item.icon}
          </span>
          {item.label}
        </button>
      ))}
    </nav>
  );
}
