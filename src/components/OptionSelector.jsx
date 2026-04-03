export function OptionSelector({
  label,
  options,
  selectedKey,
  onSelect,
  showIcons = false,
  compact = false,
}) {
  return (
    <div
      className="selector-section"
      style={compact ? { margin: '16px 0' } : undefined}
    >
      <div className="selector-label">{label}</div>
      <div className="selector-row">
        {options.map((option) => (
          <button
            key={option.key}
            className={`sel-btn ${selectedKey === option.key ? 'active' : ''}`}
            onClick={() => onSelect(option.key)}
            aria-pressed={selectedKey === option.key}
          >
            {showIcons ? <span className="sel-icon">{option.icon}</span> : null}
            <span className="sel-label">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
