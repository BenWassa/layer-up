import { LAYERS, LAYER_ICONS, LAYER_LABELS } from '../constants';

export function OutfitLayers({ outfit, editable = false, onCycleLayer }) {
  return (
    <div className="outfit-layers">
      {Object.keys(LAYERS).map(cat => {
        const idx = outfit[cat];
        const options = LAYERS[cat];
        const maxIdx = options.length - 1;

        return (
          <div
            key={cat}
            className="outfit-layer"
            style={editable ? { cursor: 'pointer' } : undefined}
            onClick={editable ? () => onCycleLayer(cat, options.length) : undefined}
          >
            <div className="layer-icon">{LAYER_ICONS[cat]}</div>
            <div className="layer-info">
              <div className="layer-cat">{LAYER_LABELS[cat]}</div>
              <div className="layer-val">{options[idx] || options[0]}</div>
            </div>
            {editable ? (
              <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text3)' }}>Tap</div>
            ) : (
              <div className="layer-warmth">
                <div
                  className="layer-warmth-fill"
                  style={{ width: `${maxIdx > 0 ? (idx / maxIdx) * 100 : 0}%` }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
