export function AppHeader({ phase, logCount, compact = false }) {
  return (
    <header className="header" style={compact ? { paddingBottom: 0 } : undefined}>
      <div className="logo">Layer<span>Up</span></div>
      {phase ? <div className="phase-pill">Phase {phase} · {logCount} logs</div> : null}
    </header>
  );
}
