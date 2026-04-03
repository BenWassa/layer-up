import { useEffect, useRef } from 'react';
import { COMFORT_RATINGS, BODY_ZONES } from '../constants';
import { OutfitLayers } from './OutfitLayers';
import { OptionSelector } from './OptionSelector';

const CLOSE_THRESHOLD_PX = 120;
const CLOSE_VELOCITY_PX_MS = 0.5;
const OVERLAY_MAX_OPACITY = 0.45;

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
  logColdZones,
  onColdZoneToggle,
  logHotZones,
  onHotZoneToggle,
  logNotes,
  onNotesChange,
  onClose,
  onSubmit,
}) {
  const overlayRef = useRef(null);
  const sheetRef = useRef(null);
  const returnFocusRef = useRef(null);
  const dragStartY = useRef(null);
  const lastY = useRef(null);
  const lastTime = useRef(null);

  useEffect(() => {
    if (!show) return undefined;

    returnFocusRef.current = document.activeElement;
    sheetRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      returnFocusRef.current?.focus();
    };
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

  const snapClose = () => {
    const sheet = sheetRef.current;
    const overlay = overlayRef.current;
    if (sheet) {
      sheet.style.transition = 'transform 0.28s cubic-bezier(0.32, 0, 0.67, 0)';
      sheet.style.transform = 'translateY(110%)';
    }
    if (overlay) {
      overlay.style.transition = 'background-color 0.28s ease';
      overlay.style.backgroundColor = 'rgba(0,0,0,0)';
    }
    setTimeout(onClose, 280);
  };

  const snapOpen = () => {
    const sheet = sheetRef.current;
    const overlay = overlayRef.current;
    if (sheet) {
      sheet.style.transition =
        'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)';
      sheet.style.transform = 'translateY(0)';
    }
    if (overlay) {
      overlay.style.transition = 'background-color 0.4s ease';
      overlay.style.backgroundColor = `rgba(0,0,0,${OVERLAY_MAX_OPACITY})`;
    }
  };

  const handleDragStart = (event) => {
    const y = event.touches[0]?.clientY;
    dragStartY.current = y;
    lastY.current = y;
    lastTime.current = Date.now();
    if (sheetRef.current) sheetRef.current.style.transition = 'none';
    if (overlayRef.current) overlayRef.current.style.transition = 'none';
  };

  const handleDragMove = (event) => {
    if (dragStartY.current == null) return;
    const y = event.touches[0]?.clientY;
    const deltaY = Math.max(0, y - dragStartY.current);
    lastY.current = y;
    lastTime.current = Date.now();

    if (sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${deltaY}px)`;
    }
    if (overlayRef.current) {
      const opacity = Math.max(0, OVERLAY_MAX_OPACITY * (1 - deltaY / 200));
      overlayRef.current.style.backgroundColor = `rgba(0,0,0,${opacity})`;
    }
  };

  const handleDragEnd = (event) => {
    if (dragStartY.current == null) return;
    const endY = event.changedTouches[0]?.clientY;
    const deltaY = Math.max(0, endY - dragStartY.current);
    const elapsed = Date.now() - lastTime.current;
    const velocity = elapsed > 0 ? (endY - lastY.current) / elapsed : 0;
    dragStartY.current = null;

    if (deltaY > CLOSE_THRESHOLD_PX || velocity > CLOSE_VELOCITY_PX_MS) {
      snapClose();
    } else {
      snapOpen();
    }
  };

  return (
    <div
      ref={overlayRef}
      className="sheet-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) snapClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="sheet-title"
    >
      <div ref={sheetRef} className="sheet" tabIndex={-1}>
        <div
          className="sheet-grab"
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
        >
          <div className="sheet-handle" aria-hidden="true" />
        </div>
        <div className="sheet-header">
          <h2 id="sheet-title" className="sheet-title">
            How did it go?
          </h2>
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

        <div
          className="selector-section"
          style={{ padding: 0, marginBottom: 24 }}
        >
          <div className="selector-label">What You Wore (tap to adjust)</div>
          {logOutfit ? (
            <OutfitLayers
              outfit={logOutfit}
              editable
              onCycleLayer={onCycleLayer}
            />
          ) : null}
        </div>

        <div className="selector-label" style={{ marginBottom: 12 }}>
          Comfort Rating
        </div>
        <div className="comfort-row">
          {COMFORT_RATINGS.map((cr) => (
            <button
              key={cr.key}
              type="button"
              className={`comfort-btn ${logComfort === cr.key ? 'active' : ''}`}
              style={{
                color: logComfort === cr.key ? cr.color : undefined,
                borderColor: logComfort === cr.key ? cr.color : undefined,
                backgroundColor:
                  logComfort === cr.key ? `${cr.color}15` : undefined,
              }}
              onClick={() => onComfortChange(cr.key)}
              aria-pressed={logComfort === cr.key}
            >
              <span className="comfort-icon" aria-hidden="true">
                {cr.icon}
              </span>
              <span className="comfort-label">{cr.label}</span>
            </button>
          ))}
        </div>

        <div className="zone-section">
          <div className="zone-group">
            <div className="zone-group-label">❄️ Too cold anywhere?</div>
            <div className="zone-row">
              {BODY_ZONES.map((z) => (
                <button
                  key={z.key}
                  type="button"
                  className={`zone-btn ${logColdZones.includes(z.key) ? 'active cold' : ''}`}
                  onClick={() => onColdZoneToggle(z.key)}
                  aria-pressed={logColdZones.includes(z.key)}
                >
                  <span aria-hidden="true">{z.emoji}</span>
                  <span>{z.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="zone-group">
            <div className="zone-group-label">🔥 Too warm anywhere?</div>
            <div className="zone-row">
              {BODY_ZONES.map((z) => (
                <button
                  key={z.key}
                  type="button"
                  className={`zone-btn ${logHotZones.includes(z.key) ? 'active hot' : ''}`}
                  onClick={() => onHotZoneToggle(z.key)}
                  aria-pressed={logHotZones.includes(z.key)}
                >
                  <span aria-hidden="true">{z.emoji}</span>
                  <span>{z.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <textarea
          className="notes-input"
          placeholder="Notes (optional) — illness, unusual setting…"
          rows={3}
          value={logNotes}
          onChange={(e) => onNotesChange(e.target.value)}
          style={{ resize: 'none' }}
        />

        <button
          type="button"
          className="sheet-submit log-btn"
          disabled={!logComfort}
          onClick={onSubmit}
          style={{
            width: '100%',
            margin: '20px 0 0 0',
            opacity: !logComfort ? 0.5 : 1,
          }}
        >
          Save Log
        </button>
      </div>
    </div>
  );
}
