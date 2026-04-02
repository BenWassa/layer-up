import { COMFORT_RATINGS } from '../constants';
import { OutfitLayers } from './OutfitLayers';
import { OptionSelector } from './OptionSelector';

export function LogSheet({
  show,
  recommendation,
  activity,
  duration,
  activityOptions,
  durationOptions,
  onActivityChange,
  onDurationChange,
  logOutfit,
  onCycleLayer,
  logComfort,
  onComfortChange,
  logNotes,
  onNotesChange,
  onClose,
  onSubmit,
}) {
  if (!show || !recommendation) return null;

  return (
    <div className="sheet-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="sheet">
        <div className="sheet-handle" />
        <div className="sheet-title">How did it go?</div>

        <OptionSelector
          label="Activity"
          options={activityOptions}
          selectedKey={activity}
          onSelect={onActivityChange}
          showIcons
          compact
        />

        <OptionSelector
          label="Duration"
          options={durationOptions}
          selectedKey={duration}
          onSelect={onDurationChange}
          compact
        />

        <div className="selector-section" style={{ padding: 0, marginBottom: 20 }}>
          <div className="selector-label">What You Wore (tap to adjust)</div>
          {logOutfit ? (
            <OutfitLayers
              outfit={logOutfit}
              editable
              onCycleLayer={onCycleLayer}
            />
          ) : null}
        </div>

        <div className="selector-label" style={{ marginBottom: 12 }}>Comfort Rating</div>
        <div className="comfort-row">
          {COMFORT_RATINGS.map(cr => (
            <button
              key={cr.key}
              className={`comfort-btn ${logComfort === cr.key ? 'active' : ''}`}
              style={{ color: logComfort === cr.key ? cr.color : undefined, borderColor: logComfort === cr.key ? cr.color : undefined }}
              onClick={() => onComfortChange(cr.key)}
            >
              <div className="comfort-icon">{cr.icon}</div>
              <div className="comfort-label">{cr.label}</div>
            </button>
          ))}
        </div>

        <textarea
          className="notes-input"
          placeholder="Notes (optional) — illness, unusual setting…"
          rows={2}
          value={logNotes}
          onChange={e => onNotesChange(e.target.value)}
        />
        <button className="sheet-submit" disabled={!logComfort} onClick={onSubmit}>Save Log</button>
      </div>
    </div>
  );
}
