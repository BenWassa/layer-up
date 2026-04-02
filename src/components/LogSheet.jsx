import { useEffect, useRef } from 'react';
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
  const swipeStartY = useRef(null);

  useEffect(() => {
    if (!show) return undefined;

    const handleKeyDown = event => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [show, onClose]);

  useEffect(() => {
    if (!show) return undefined;

    const scrollY = window.scrollY;
    const originalBodyOverflow = document.body.style.overflow;
    const originalBodyPosition = document.body.style.position;
    const originalBodyTop = document.body.style.top;
    const originalBodyWidth = document.body.style.width;

    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.body.style.position = originalBodyPosition;
      document.body.style.top = originalBodyTop;
      document.body.style.width = originalBodyWidth;
      window.scrollTo(0, scrollY);
    };
  }, [show]);

  if (!show || !recommendation) return null;

  const handleSwipeStart = event => {
    swipeStartY.current = event.touches[0]?.clientY ?? null;
  };

  const handleSwipeEnd = event => {
    const endY = event.changedTouches[0]?.clientY;
    if (swipeStartY.current == null || endY == null) return;

    if (endY - swipeStartY.current > 60) onClose();
    swipeStartY.current = null;
  };

  return (
    <div 
      className="sheet-overlay" 
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="sheet-title"
    >
      <div className="sheet">
        <div
          className="sheet-grab"
          onTouchStart={handleSwipeStart}
          onTouchEnd={handleSwipeEnd}
        >
          <div className="sheet-handle" aria-hidden="true" />
        </div>
        <div className="sheet-header">
          <h2 id="sheet-title" className="sheet-title">How did it go?</h2>
        </div>

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
