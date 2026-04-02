export function AppHeader({ phase, logCount, compact = false }) {
  return (
    <div className="header" style={compact ? { padding: 0, marginBottom: 24 } : undefined}>
      <div className="logo">Layer<span>Up</span></div>
      {phase ? <div className="phase-pill">Phase {phase} · {logCount} logs</div> : null}
    </div>
  );
}
