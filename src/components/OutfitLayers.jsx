import {
  LAYERS,
  LAYER_ICONS,
  LAYER_LABELS,
  OUTFIT_CATEGORIES,
  normalizeOutfit,
} from '../constants';

export function OutfitLayers({ outfit, editable = false, onCycleLayer }) {
  const normalizedOutfit = normalizeOutfit(outfit);

  return (
    <div className="outfit-layers">
      {OUTFIT_CATEGORIES.map((cat) => {
        const idx = normalizedOutfit[cat];
        const options = LAYERS[cat];
        const maxIdx = options.length - 1;

        return (
          <div
            key={cat}
            className="outfit-layer"
            style={
              editable
                ? { cursor: 'pointer', touchAction: 'manipulation' }
                : undefined
            }
            onClick={
              editable ? () => onCycleLayer(cat, options.length) : undefined
            }
            role={editable ? 'button' : 'group'}
          >
            <div className="layer-icon">{LAYER_ICONS[cat]}</div>
            <div className="layer-info">
              <div className="layer-cat">{LAYER_LABELS[cat]}</div>
              <div className="layer-val">{options[idx] || options[0]}</div>
            </div>
            <div className="layer-warmth-wrap">
              <div className="layer-warmth">
                <div
                  className="layer-warmth-fill"
                  style={{ width: `${maxIdx > 0 ? (idx / maxIdx) * 100 : 0}%` }}
                />
              </div>
              {editable && <div className="layer-cycle-hint">↻</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
