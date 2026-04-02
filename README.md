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

This app now supports low-friction Firebase sync using anonymous auth plus a user-scoped Firestore document.

1. Create a Firebase project.
2. In Firebase Authentication, enable `Anonymous`.
3. In Firestore Database, create the database in production mode.
4. Deploy the included Firestore rules from this repo.
5. Copy `.env.example` to `.env` and set:
	- `VITE_FIREBASE_ENABLED=true`
	- `VITE_FIREBASE_API_KEY`
	- `VITE_FIREBASE_AUTH_DOMAIN`
	- `VITE_FIREBASE_PROJECT_ID`
	- `VITE_FIREBASE_STORAGE_BUCKET`
	- `VITE_FIREBASE_MESSAGING_SENDER_ID`
	- `VITE_FIREBASE_APP_ID`
6. Restart `npm run dev`.

Local state is always saved first. When Firebase is enabled, the app signs in anonymously and syncs your state to `users/{uid}/appState/current`.

## Firebase deployment

1. Build the app:
	- `npm run build`
2. Log into Firebase CLI:
	- `firebase login`
3. Link the repo to your Firebase project:
	- `firebase use --add`
4. Deploy hosting and rules:
	- `firebase deploy`

## GitHub Pages deployment

1. `npm run build`
2. Copy `dist` to static hosting or use GitHub Pages with `gh-pages`.

GitHub Pages works if you want a fully static build with localStorage only. Firebase is the better fit if you want cross-device sync without adding a custom backend.

## Project structure

- `src/App.jsx` core UI logic
- `src/constants.js` data and helper maps
- `src/logic.js` recommendation algorithms
- `src/storage.js` persistence wrapper
- `src/firebase.js` anonymous auth + Firestore sync
- `src/styles.css` app styles
- `firebase.json` Firebase Hosting configuration
- `firestore.rules` Firestore access rules
