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
    <div 
      className="sheet-overlay" 
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="sheet-title"
    >
      <div className="sheet">
        <div className="sheet-handle" aria-hidden="true" />
        <h2 id="sheet-title" className="sheet-title">How did it go?</h2>

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

        <div className="selector-section" style={{ padding: 0, marginBottom: 24 }}>
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
              type="button"
              className={`comfort-btn ${logComfort === cr.key ? 'active' : ''}`}
              style={{ 
                color: logComfort === cr.key ? cr.color : undefined, 
                borderColor: logComfort === cr.key ? cr.color : undefined,
                backgroundColor: logComfort === cr.key ? `${cr.color}15` : undefined // 15 is hex for ~8% opacity
              }}
              onClick={() => onComfortChange(cr.key)}
              aria-pressed={logComfort === cr.key}
            >
              <span className="comfort-icon" aria-hidden="true">{cr.icon}</span>
              <span className="comfort-label">{cr.label}</span>
            </button>
          ))}
        </div>

        <textarea
          className="notes-input"
          placeholder="Notes (optional) — illness, unusual setting…"
          rows={3}
          value={logNotes}
          onChange={e => onNotesChange(e.target.value)}
          style={{ resize: 'none' }} /* Prevent mobile layout breaking */
        />
        
        <button 
          type="button" 
          className="sheet-submit log-btn" 
          disabled={!logComfort} 
          onClick={onSubmit}
          style={{ width: '100%', margin: '20px 0 0 0', opacity: !logComfort ? 0.5 : 1 }}
        >
          Save Log
        </button>
      </div>
    </div>
  );
}