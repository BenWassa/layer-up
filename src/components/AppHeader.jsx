export function AppHeader({ phase, logCount, compact = false }) {
  return (
    <header className={`header ${compact ? 'header-compact' : ''}`}>
      <div className="brand-block">
        <div className="brand-kicker">Personal Climate Log</div>
        <div className="logo">
          Layer<span>Up</span>
        </div>
      </div>
      {phase ? (
        <div className="phase-pill">
          <span className="phase-pill-label">Phase {phase}</span>
          <span>{logCount} logs trained</span>
        </div>
      ) : null}
    </header>
  );
}
