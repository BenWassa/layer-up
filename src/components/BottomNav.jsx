const NAV_ITEMS = [
  { key: 'home', icon: '🌡️', label: 'Today' },
  { key: 'history', icon: '📋', label: 'History' },
  { key: 'insights', icon: '📊', label: 'Insights' },
  { key: 'settings', icon: '⚙️', label: 'Settings' },
];

export function BottomNav({ tab, onChange }) {
  return (
    <div className="bottom-nav">
      {NAV_ITEMS.map(item => (
        <button
          key={item.key}
          className={`nav-btn ${tab === item.key ? 'active' : ''}`}
          onClick={() => onChange(item.key)}
        >
          <span className="nav-icon">{item.icon}</span>
          {item.label}
        </button>
      ))}
    </div>
  );
}
