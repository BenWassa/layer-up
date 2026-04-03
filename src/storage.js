import { isFirebaseEnabled, loadFirestoreState, saveFirestoreState } from './firebase';

const LOCAL_KEY = 'layerup_logs_v2';
const LOCAL_UNIT_KEY = 'layerup_unit';
const LOCAL_THEME_KEY = 'layerup_theme';

function safeParse(raw, fallback) {
  if (!raw) return fallback;
  try { return JSON.parse(raw); } catch { return fallback; }
}

export function loadLocalStorage() {
  if (typeof window === 'undefined') return { logs: [], unit: 'C', theme: 'light' };
  const logs = safeParse(localStorage.getItem(LOCAL_KEY), []);
  const unit = localStorage.getItem(LOCAL_UNIT_KEY) || 'C';
  const theme = localStorage.getItem(LOCAL_THEME_KEY) || 'light';
  return { logs, unit, theme };
}

export function saveLocalStorage({ logs, unit, theme }) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(logs || []));
  } catch (e) {
    console.warn('Unable to save logs locally', e);
  }
  try {
    localStorage.setItem(LOCAL_UNIT_KEY, unit || 'C');
  } catch (e) {
    console.warn('Unable to save unit locally', e);
  }
  try {
    localStorage.setItem(LOCAL_THEME_KEY, theme || 'light');
  } catch (e) {
    console.warn('Unable to save theme locally', e);
  }
}

export async function loadAppState() {
  const local = loadLocalStorage();
  if (isFirebaseEnabled()) {
    const remote = await loadFirestoreState();
    if (remote?.logs && Array.isArray(remote.logs)) {
      return {
        logs: remote.logs,
        unit: remote.unit || local.unit,
        theme: remote.theme || local.theme,
      };
    }
  }

  return local;
}

export async function saveAppState(state) {
  saveLocalStorage(state);
  if (isFirebaseEnabled()) {
    await saveFirestoreState(state).catch(() => {});
  }
}
