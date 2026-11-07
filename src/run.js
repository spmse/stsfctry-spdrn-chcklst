export const STORAGE_KEY = 'ficsit-speedrun-v1';

export const scenarios = {
  phase1: {
    name: 'Any% — Phase 1 complete',
    splits: [
      ['Complete HUB upgrades', 1800],
      ['Build the Space Elevator', 3600],
      ['Automate Smart Plating', 5400],
      ['Complete Project Assembly: Phase 1', 7200]
    ]
  },
  phase2: {
    name: 'Any% — Phase 2 complete',
    splits: [
      ['Complete HUB upgrades', 1800],
      ['Build the Space Elevator', 3600],
      ['Complete Project Assembly: Phase 1', 7200],
      ['Unlock coal power', 9000],
      ['Unlock steel production', 10800],
      ['Complete Project Assembly: Phase 2', 18000]
    ]
  }
};

export function preset(id) {
  return {
    scenario: id,
    elapsed: 0,
    startedAt: null,
    milestones: scenarios[id].splits.map(([name, target]) => ({ name, target, actual: null }))
  };
}

export function validRun(saved) {
  return saved && Number.isFinite(saved.elapsed) && saved.elapsed >= 0 &&
    (saved.startedAt === null || (Number.isFinite(saved.startedAt) && saved.startedAt >= 0)) &&
    Array.isArray(saved.milestones) && saved.milestones.every(item =>
      item && typeof item.name === 'string' && item.name.trim() && item.name.length <= 80 &&
      Number.isSafeInteger(item.target) && item.target >= 0 && item.target <= Number.MAX_SAFE_INTEGER / 1000 &&
      (item.actual === null || (Number.isFinite(item.actual) && item.actual >= 0)));
}

export function readRun(raw) {
  try {
    const saved = JSON.parse(raw);
    if (validRun(saved)) return { ...saved, scenario: Object.hasOwn(scenarios, saved.scenario) ? saved.scenario : 'custom' };
  } catch {
    // Ignore invalid or unavailable saved data.
  }
  return preset('phase1');
}

export function elapsed(run, now = Date.now()) {
  return run.elapsed + (run.startedAt === null ? 0 : Math.max(0, now - run.startedAt));
}

export function formatTime(milliseconds, tenths = false) {
  const seconds = Math.floor(milliseconds / 1000);
  const time = [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60]
    .map(part => String(part).padStart(2, '0')).join(':');
  return tenths ? `${time}.${Math.floor(milliseconds / 100) % 10}` : time;
}

export function parseTime(value) {
  const parts = value.trim().split(':');
  if ((parts.length !== 2 && parts.length !== 3) || parts.some(part => !/^\d+$/.test(part))) return null;
  const numbers = parts.map(Number);
  if (numbers.at(-1) >= 60 || (parts.length === 3 && numbers[1] >= 60)) return null;
  const seconds = parts.length === 3 ? numbers[0] * 3600 + numbers[1] * 60 + numbers[2] : numbers[0] * 60 + numbers[1];
  return Number.isSafeInteger(seconds) && seconds <= Number.MAX_SAFE_INTEGER / 1000 ? seconds : null;
}
