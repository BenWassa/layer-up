# layer-up
Weather and clothing 

## Setup (local development)

1. Install dependencies:
	- `npm install`
2. Run dev server:
	- `npm run dev`
3. Open `http://localhost:5173`

## Build

`npm run build`

## Preview

`npm run preview`

## Firebase optional sync (free tier)

1. Create Firebase project and enable Firestore in test mode.
2. Add `.env` file in project root with keys:
	- `VITE_FIREBASE_ENABLED=true`
	- `VITE_FIREBASE_API_KEY` etc (`VITE_FIREBASE_...` for authDomain, projectId, storageBucket, messagingSenderId, appId).
3. Restart `npm run dev`.

State is saved to localStorage always; Firestore is optional fallback to share logs across browsers.

## github pages deployment

1. `npm run build`
2. Copy `dist` to static hosting or use GitHub Pages with `gh-pages`.

## Project structure

- `src/App.jsx` core UI logic
- `src/constants.js` data and helper maps
- `src/logic.js` recommendation algorithms
- `src/storage.js` persistence wrapper
- `src/firebase.js` optional Firestore sync
- `src/styles.css` app styles

