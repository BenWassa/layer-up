import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

const isEnabled = import.meta.env.VITE_FIREBASE_ENABLED === 'true';

export function isFirebaseEnabled() {
  return isEnabled;
}

let app;
let auth;
let db;
let authReadyPromise;

function getFirebaseConfig() {
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };
}

export function getFirebaseApp() {
  if (!isEnabled) {
    throw new Error('Firebase not enabled in environment');
  }
  if (app) return app;

  const config = getFirebaseConfig();

  if (!config.apiKey || !config.projectId || !config.appId) {
    throw new Error('Firebase config env variables are missing (VITE_FIREBASE_*).');
  }

  app = initializeApp(config);
  return app;
}

export function getFirebaseAuth() {
  if (auth) return auth;
  auth = getAuth(getFirebaseApp());
  return auth;
}

export function getFirestoreDB() {
  if (db) return db;
  db = getFirestore(getFirebaseApp());
  return db;
}

export async function ensureAnonymousSession() {
  if (!isEnabled) return null;
  if (getFirebaseAuth().currentUser) return getFirebaseAuth().currentUser;
  if (authReadyPromise) return authReadyPromise;

  authReadyPromise = new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      getFirebaseAuth(),
      async user => {
        if (user) {
          unsubscribe();
          resolve(user);
          return;
        }

        try {
          await signInAnonymously(getFirebaseAuth());
        } catch (error) {
          unsubscribe();
          reject(error);
        }
      },
      error => {
        unsubscribe();
        reject(error);
      }
    );
  }).finally(() => {
    authReadyPromise = null;
  });

  return authReadyPromise;
}

async function getUserStateRef() {
  const user = await ensureAnonymousSession();
  if (!user) return null;
  return doc(getFirestoreDB(), 'users', user.uid, 'appState', 'current');
}

export async function loadFirestoreState() {
  if (!isEnabled) return null;
  try {
    const ref = await getUserStateRef();
    if (!ref) return null;
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
    const ref = await getUserStateRef();
    if (!ref) return;
    await setDoc(ref, { ...state, updatedAt: new Date().toISOString() });
  } catch (error) {
    console.warn('Firebase save failed:', error);
  }
}
