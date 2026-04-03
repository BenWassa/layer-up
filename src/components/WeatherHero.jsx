import { LAYERS, OUTFIT_CATEGORIES, normalizeOutfit, weatherDesc, getTempColor, toF } from '../constants';

// Returns two rgba color stops for the atmospheric page gradient.
// Applied at low opacity so they tint rather than replace the existing bg.
export function getWeatherColors(code, feelsLike) {
  if (code >= 95)
    return { a: 'rgba(75, 55, 120, 0.32)', b: 'rgba(50, 40, 88, 0.2)' };
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86))
    return { a: 'rgba(165, 208, 242, 0.38)', b: 'rgba(200, 225, 248, 0.18)' };
  if (code >= 51 && code <= 82)
    return { a: 'rgba(58, 98, 148, 0.3)', b: 'rgba(80, 118, 162, 0.16)' };
  if (code >= 40 && code <= 49)
    return { a: 'rgba(148, 162, 172, 0.28)', b: 'rgba(168, 180, 188, 0.14)' };
  if (code >= 1 && code <= 3) {
    return feelsLike > 12
      ? { a: 'rgba(95, 158, 212, 0.22)', b: 'rgba(228, 162, 75, 0.18)' }
      : { a: 'rgba(108, 152, 202, 0.25)', b: 'rgba(158, 192, 222, 0.14)' };
  }
  if (feelsLike > 18)
    return { a: 'rgba(48, 148, 222, 0.24)', b: 'rgba(238, 162, 48, 0.22)' };
  if (feelsLike > 8)
    return { a: 'rgba(42, 132, 208, 0.26)', b: 'rgba(102, 172, 232, 0.14)' };
  return { a: 'rgba(28, 78, 172, 0.28)', b: 'rgba(68, 118, 198, 0.16)' };
}

// Left-column weather content — no card wrapper.
export function WeatherInfo({ weather, unit }) {
  const tempColor = getTempColor(weather.feelsLike);
  const displayedTemp = unit === 'F' ? toF(weather.temp) : weather.temp;
  const displayedFeelsLike = unit === 'F' ? toF(weather.feelsLike) : weather.feelsLike;

  const badges = [];
  if (weather.windSpeed > 40) badges.push({ key: 'wind', label: 'Strong wind', icon: '💨' });
  else if (weather.windSpeed > 20) badges.push({ key: 'wind', label: 'Windy', icon: '💨' });
  if (weather.humidity > 75) badges.push({ key: 'humid', label: 'Humid', icon: '💧' });
  if (weather.precipitation > 0) badges.push({ key: 'precip', label: 'Rain', icon: '🌧️' });

  return (
    <div className="home-weather">
      <div className="home-location">
        <span className="home-location-dot" aria-hidden="true">◦</span>
        {weather.location}
      </div>

      <div className="home-temps">
        <span className="home-temp" style={{ color: tempColor }}>
          {displayedTemp}°{unit}
        </span>
        <span className="home-feels" style={{ color: tempColor }}>
          feels {displayedFeelsLike}°
        </span>
      </div>

      <div className="home-condition">
        {weatherDesc(weather.weatherCode)}
      </div>

      {badges.length > 0 && (
        <div className="home-badges">
          {badges.map((b) => (
            <span key={b.key} className="home-badge">
              <span aria-hidden="true">{b.icon}</span>
              {b.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

const PLAN_ICONS = { base: '👕', mid: '🧣', outer: '🧥', bottom: '👖', accessories: '🧤', footwear: '👟' };
const PLAN_LABELS = { base: 'Base', mid: 'Mid', outer: 'Outer', bottom: 'Bottom', accessories: 'Acc', footwear: 'Feet' };

function GeminiMannequin() {
  return (
    <svg
      className="home-plan-figure-svg"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 320 600"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="skin-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2a3845" />
          <stop offset="100%" stopColor="#141c24" />
        </linearGradient>
        <linearGradient id="base-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3c4e5e" />
          <stop offset="100%" stopColor="#1e2a35" />
        </linearGradient>
        <linearGradient id="mid-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2d4052" />
          <stop offset="100%" stopColor="#15212b" />
        </linearGradient>
        <linearGradient id="outer-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1a2d40" />
          <stop offset="100%" stopColor="#0a121a" />
        </linearGradient>
        <linearGradient id="bottom-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e2833" />
          <stop offset="100%" stopColor="#0d131a" />
        </linearGradient>
        <linearGradient id="shoe-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1c2630" />
          <stop offset="100%" stopColor="#090e14" />
        </linearGradient>
        <linearGradient id="warm-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e39a60" />
          <stop offset="100%" stopColor="#bd5e4d" />
        </linearGradient>
        <filter id="shadow-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#000000" floodOpacity="0.25" />
        </filter>
        <filter id="shadow-heavy" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="12" stdDeviation="12" floodColor="#000000" floodOpacity="0.4" />
        </filter>
      </defs>

      <g id="mannequin-base">
        <ellipse cx="160" cy="50" rx="20" ry="26" fill="url(#skin-grad)" />
        <rect x="148" y="72" width="24" height="20" fill="url(#skin-grad)" />
        <path d="M 125 90 C 140 85, 180 85, 195 90 C 210 105, 215 135, 210 195 C 205 255, 195 290, 195 290 C 180 295, 140 295, 125 290 C 125 290, 115 255, 110 195 C 105 135, 110 105, 125 90 Z" fill="url(#skin-grad)" />
        <path d="M 115 100 C 80 105, 65 155, 65 215 C 65 275, 70 305, 70 305 C 65 315, 85 320, 88 305 C 88 305, 85 275, 85 215 C 85 165, 95 125, 118 120 Z" fill="url(#skin-grad)" />
        <path d="M 205 100 C 240 105, 255 155, 255 215 C 255 275, 250 305, 250 305 C 255 315, 235 320, 232 305 C 232 305, 235 275, 235 215 C 235 165, 225 125, 202 120 Z" fill="url(#skin-grad)" />
        <path d="M 125 285 L 120 505 C 118 520, 142 520, 145 505 L 155 290 Z" fill="url(#skin-grad)" />
        <path d="M 195 285 L 200 505 C 202 520, 178 520, 175 505 L 165 290 Z" fill="url(#skin-grad)" />
        <path d="M 155 290 C 160 300, 160 300, 165 290 Z" fill="url(#skin-grad)" />
      </g>

      <g id="layer-base" data-name="t-shirt" filter="url(#shadow-soft)">
        <path d="M 142 90 C 150 100, 170 100, 178 90 C 190 93, 205 105, 212 195 C 208 255, 200 280, 200 280 C 180 287, 140 287, 120 280 C 120 280, 112 255, 108 195 C 115 105, 130 93, 142 90 Z" fill="url(#base-grad)" />
        <path d="M 125 90 C 110 95, 95 115, 92 135 L 105 140 C 110 125, 115 110, 125 105 Z" fill="url(#base-grad)" />
        <path d="M 195 90 C 210 95, 225 115, 228 135 L 215 140 C 210 125, 205 110, 195 105 Z" fill="url(#base-grad)" />
      </g>

      <g id="layer-bottom" data-name="trousers" filter="url(#shadow-soft)">
        <path d="M 118 276 C 140 284, 180 284, 202 276 L 208 500 C 208 510, 180 510, 175 500 L 163 315 C 160 305, 160 305, 157 315 L 145 500 C 140 510, 112 510, 112 500 Z" fill="url(#bottom-grad)" />
        <path d="M 118 276 C 140 284, 180 284, 202 276 L 203 288 C 180 296, 140 296, 117 288 Z" fill="#121a22" />
        <line x1="160" y1="282" x2="160" y2="305" stroke="#0a0f14" strokeWidth="2" strokeLinecap="round" />
      </g>

      <g id="layer-mid" data-name="fleece" filter="url(#shadow-soft)">
        <path d="M 145 88 L 175 88 C 185 88, 208 111, 215 195 C 210 255, 203 283, 203 283 C 180 290, 140 290, 117 283 C 117 283, 110 255, 105 195 C 112 111, 135 88, 145 88 Z" fill="url(#mid-grad)" />
        <path d="M 118 101 C 98 101, 80 136, 75 176 C 70 226, 63 301, 63 301 L 88 304 C 88 304, 92 226, 97 176 C 102 146, 107 126, 118 121 Z" fill="url(#mid-grad)" />
        <path d="M 202 101 C 222 101, 240 136, 245 176 C 250 226, 257 301, 257 301 L 232 304 C 232 304, 228 226, 223 176 C 218 146, 213 126, 202 121 Z" fill="url(#mid-grad)" />
        <path d="M 142 91 L 140 78 C 150 74, 170 74, 180 78 L 178 91 Z" fill="url(#mid-grad)" />
        <line x1="160" y1="76" x2="160" y2="136" stroke="#8dc7ff" strokeWidth="2" opacity="0.6" strokeLinecap="round" />
      </g>

      <g id="layer-outer" data-name="technical-shell" filter="url(#shadow-heavy)">
        <path d="M 140 94 L 132 71 C 142 66, 150 74, 152 86 Z" fill="#152433" />
        <path d="M 180 94 L 188 71 C 178 66, 170 74, 168 86 Z" fill="#152433" />
        <path d="M 115 98 C 90 98, 70 136, 65 176 C 60 226, 55 306, 55 306 C 50 316, 85 321, 90 306 C 90 306, 95 226, 100 176 C 105 146, 110 126, 115 121 Z" fill="url(#outer-grad)" />
        <path d="M 205 98 C 230 98, 250 136, 255 176 C 260 226, 265 306, 265 306 C 270 316, 235 321, 230 306 C 230 306, 225 226, 220 176 C 215 146, 210 126, 205 121 Z" fill="url(#outer-grad)" />
        <path d="M 138 91 C 115 101, 100 126, 98 196 C 95 256, 105 341, 105 341 L 152 346 L 152 141 C 148 121, 142 101, 138 91 Z" fill="url(#outer-grad)" />
        <path d="M 182 91 C 205 101, 220 126, 222 196 C 225 256, 215 341, 215 341 L 168 346 L 168 141 C 172 121, 178 101, 182 91 Z" fill="url(#outer-grad)" />
        <path d="M 152 141 L 152 346" stroke="#8dc7ff" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.9" />
        <path d="M 168 141 L 168 346" stroke="#8dc7ff" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.9" />
        <path d="M 108 156 L 145 151" stroke="#253f59" strokeWidth="2" strokeLinecap="round" />
        <path d="M 212 156 L 175 151" stroke="#253f59" strokeWidth="2" strokeLinecap="round" />
      </g>

      <g id="layer-footwear" data-name="trainers" filter="url(#shadow-soft)">
        <path d="M 116 500 L 146 500 L 148 530 A 12 12 0 0 1 136 542 L 112 542 A 12 12 0 0 1 100 530 L 108 510 Z" fill="url(#shoe-grad)" />
        <path d="M 100 530 A 12 12 0 0 0 112 542 L 136 542 A 12 12 0 0 0 148 530 L 146 535 A 12 12 0 0 1 134 547 L 110 547 A 12 12 0 0 1 98 535 Z" fill="#8dc7ff" opacity="0.8" />
        <path d="M 204 500 L 174 500 L 172 530 A 12 12 0 0 0 184 542 L 208 542 A 12 12 0 0 0 220 530 L 212 510 Z" fill="url(#shoe-grad)" />
        <path d="M 220 530 A 12 12 0 0 1 208 542 L 184 542 A 12 12 0 0 1 172 530 L 174 535 A 12 12 0 0 0 186 547 L 210 547 A 12 12 0 0 0 222 535 Z" fill="#8dc7ff" opacity="0.8" />
      </g>

      <g id="layer-accessories" data-name="toque-and-gloves">
        <path d="M 65 305 C 60 315, 80 325, 85 305 L 82 295 L 68 295 Z" fill="#15222E" />
        <path d="M 68 295 L 82 295" stroke="#8dc7ff" strokeWidth="1.5" opacity="0.5" />
        <path d="M 255 305 C 260 315, 240 325, 235 305 L 238 295 L 252 295 Z" fill="#15222E" />
        <path d="M 252 295 L 238 295" stroke="#8dc7ff" strokeWidth="1.5" opacity="0.5" />
        <g filter="url(#shadow-soft)">
          <path d="M 136 51 C 136 16, 184 16, 184 51 Z" fill="url(#warm-grad)" />
          <rect x="133" y="48" width="54" height="14" rx="4" fill="#c46a41" />
          <line x1="145" y1="48" x2="145" y2="62" stroke="#e39a60" strokeWidth="1" opacity="0.4" />
          <line x1="160" y1="48" x2="160" y2="62" stroke="#e39a60" strokeWidth="1" opacity="0.4" />
          <line x1="175" y1="48" x2="175" y2="62" stroke="#e39a60" strokeWidth="1" opacity="0.4" />
        </g>
      </g>
    </svg>
  );
}

// Right-column layer plan — compact frosted card.
export function LayerPlan({ recommendation, logs, getPhaseLabel, onOpenLog }) {
  const normalized = normalizeOutfit(recommendation.outfit);
  const rows = OUTFIT_CATEGORIES
    .map((cat) => ({ cat, val: LAYERS[cat][normalized[cat]] }))
    .filter(({ val }) => val !== 'None');

  return (
    <div className="home-plan">
      <div className="home-plan-label">
        {getPhaseLabel(recommendation.phase, logs.length)}
      </div>

      <div className="home-plan-body">
        <div className="home-plan-figure" aria-hidden="true">
          <GeminiMannequin />
        </div>

        <ul className="home-plan-layers">
          {rows.map(({ cat, val }) => (
            <li key={cat} className="home-plan-row">
              <span className="home-plan-icon" aria-hidden="true">{PLAN_ICONS[cat]}</span>
              <span className="home-plan-cat">{PLAN_LABELS[cat]}</span>
              <span className="home-plan-val">{val}</span>
            </li>
          ))}
        </ul>
      </div>

      <button className="home-log-btn" onClick={onOpenLog}>
        Log how it went
      </button>
    </div>
  );
}
