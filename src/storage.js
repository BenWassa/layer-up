import { isFirebaseEnabled, loadFirestoreState, saveFirestoreState } from './firebase';

const LOCAL_KEY = 'layerup_logs_v2';
const LOCAL_UNIT_KEY = 'layerup_unit';

function safeParse(raw, fallback) {
  if (!raw) return fallback;
  try { return JSON.parse(raw); } catch { return fallback; }
}

export function loadLocalStorage() {
  if (typeof window === 'undefined') return { logs: [], unit: 'C' };
  const logs = safeParse(localStorage.getItem(LOCAL_KEY), []);
  const unit = localStorage.getItem(LOCAL_UNIT_KEY) || 'C';
  return { logs, unit };
}

export function saveLocalStorage({ logs, unit }) {
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
}

export async function loadAppState() {
  const local = loadLocalStorage();
  if (isFirebaseEnabled()) {
    const remote = await loadFirestoreState();
    if (remote?.logs && Array.isArray(remote.logs)) {
      return {
        logs: remote.logs,
        unit: remote.unit || local.unit,
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
