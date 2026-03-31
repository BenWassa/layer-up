import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

const isEnabled = import.meta.env.VITE_FIREBASE_ENABLED === 'true';

export function isFirebaseEnabled() {
  return isEnabled;
}

let db;

export function getFirestoreDB() {
  if (!isEnabled) {
    throw new Error('Firebase not enabled in environment');
  }
  if (db) return db;

  const config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };

  if (!config.apiKey || !config.projectId || !config.appId) {
    throw new Error('Firebase config env variables are missing (VITE_FIREBASE_*).');
  }

  const app = initializeApp(config);
  db = getFirestore(app);
  return db;
}

const STORAGE_DOC = 'layerup-sync-state';

export async function loadFirestoreState() {
  if (!isEnabled) return null;
  try {
    const firestore = getFirestoreDB();
    const ref = doc(firestore, 'public', STORAGE_DOC);
    const snapshot = await getDoc(ref);
    if (snapshot.exists()) {
      return snapshot.data();
    }
    return null;
  } catch (error) {
    console.warn('Firebase load failed:', error);
    return null;
  }
}

export async function saveFirestoreState(state) {
  if (!isEnabled) return;
  try {
    const firestore = getFirestoreDB();
    const ref = doc(firestore, 'public', STORAGE_DOC);
    await setDoc(ref, { ...state, updatedAt: new Date().toISOString() });
  } catch (error) {
    console.warn('Firebase save failed:', error);
  }
}
