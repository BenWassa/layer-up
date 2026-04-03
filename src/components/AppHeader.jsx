export function AppHeader({ phase, logCount, compact = false }) {
  return (
    <header className={`header ${compact ? 'header-compact' : ''}`}>
      <div className="brand-block">
        <div className="logo">
          Layer<span>Up</span>
        </div>
      </div>
      {phase ? (
        <div className="phase-pill">
          <span className="phase-pill-label">Phase {phase}</span>
          <span className="phase-pill-sep">·</span>
          <span>{logCount} logs</span>
        </div>
      ) : null}
    </header>
  );
}
