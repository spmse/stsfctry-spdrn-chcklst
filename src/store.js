import { Store } from '@tanstack/react-store';
import { STORAGE_KEY, readRun } from './run.js';

let raw;
try {
  raw = localStorage.getItem(STORAGE_KEY);
} catch {
  raw = null;
}
export const runStore = new Store(readRun(raw));

export function updateRun(updater) {
  runStore.setState(updater);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(runStore.state));
    return true;
  } catch {
    return false;
  }
}

window.addEventListener('storage', event => {
  if (event.key === STORAGE_KEY && event.newValue !== null) {
    runStore.setState(() => readRun(event.newValue));
  }
});
