'use strict';

const STORAGE_KEY = 'ficsit-speedrun-v1';
const defaults = [
  { name: 'Land on MASSAGE-2(A-B)b', target: 300 },
  { name: 'Complete HUB upgrades', target: 1800 },
  { name: 'Build the Space Elevator', target: 3600 },
  { name: 'Complete Project Assembly: Phase 1', target: 7200 }
];

const timer = document.getElementById('timer');
const toggle = document.getElementById('toggle-timer');
const stateLabel = document.getElementById('clock-state');
const list = document.getElementById('milestone-list');
const feedback = document.getElementById('feedback');
let state = { elapsed: 0, startedAt: null, milestones: defaults.map(item => ({ ...item, actual: null })) };

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && Number.isFinite(saved.elapsed) && saved.elapsed >= 0 &&
        (saved.startedAt === null || (Number.isFinite(saved.startedAt) && saved.startedAt >= 0)) &&
        Array.isArray(saved.milestones) && saved.milestones.every(item =>
          item && typeof item.name === 'string' && item.name.trim() && item.name.length <= 80 &&
          Number.isSafeInteger(item.target) && item.target >= 0 &&
          (item.actual === null || (Number.isFinite(item.actual) && item.actual >= 0)))) {
      state = saved;
    }
  } catch {
    // Storage may be unavailable in private browsing or an embedded browser.
  }
}
load();

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    feedback.textContent = 'Local storage is unavailable; your run will not be saved.';
  }
}

function elapsed() {
  return state.elapsed + (state.startedAt === null ? 0 : Math.max(0, Date.now() - state.startedAt));
}

function formatTime(milliseconds, tenths = false) {
  const seconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor(seconds / 60) % 60;
  const remainder = seconds % 60;
  const time = [hours, minutes, remainder].map(part => String(part).padStart(2, '0')).join(':');
  return tenths ? `${time}.${Math.floor(milliseconds / 100) % 10}` : time;
}

function parseTime(value) {
  const parts = value.trim().split(':');
  if ((parts.length !== 2 && parts.length !== 3) || parts.some(part => !/^\d+$/.test(part))) return null;
  const numbers = parts.map(Number);
  if (numbers.at(-1) >= 60 || (parts.length === 3 && numbers[1] >= 60)) return null;
  const seconds = parts.length === 3 ? numbers[0] * 3600 + numbers[1] * 60 + numbers[2] : numbers[0] * 60 + numbers[1];
  return Number.isSafeInteger(seconds) && seconds <= Number.MAX_SAFE_INTEGER / 1000 ? seconds : null;
}

function renderClock() {
  const [whole, fraction] = formatTime(elapsed(), true).split('.');
  timer.firstChild.textContent = whole;
  timer.lastElementChild.textContent = `.${fraction}`;
  const running = state.startedAt !== null;
  toggle.innerHTML = running ? '<span aria-hidden="true">Ⅱ</span> PAUSE RUN' : '<span aria-hidden="true">▶</span> START RUN';
  stateLabel.classList.toggle('running', running);
  stateLabel.innerHTML = `<span class="status-light"></span> ${running ? 'IN PROGRESS' : 'STANDBY'}`;
}

function makeButton(text, label, className, action) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.textContent = text;
  button.setAttribute('aria-label', label);
  button.addEventListener('click', action);
  return button;
}

function renderMilestones() {
  list.replaceChildren();
  state.milestones.forEach((item, index) => {
    const row = document.createElement('tr');
    row.classList.toggle('complete', item.actual !== null);
    const objective = document.createElement('td');
    const wrapper = document.createElement('div');
    wrapper.className = 'objective';
    const number = document.createElement('span');
    number.className = 'objective-number';
    number.textContent = String(index + 1).padStart(2, '0');
    const name = document.createElement('input');
    name.className = 'row-input';
    name.value = item.name;
    name.maxLength = 80;
    name.setAttribute('aria-label', `Objective ${index + 1} name`);
    name.addEventListener('change', () => {
      if (!name.value.trim()) {
        name.value = item.name;
        feedback.textContent = 'Objective names cannot be empty.';
        return;
      }
      item.name = name.value.trim();
      feedback.textContent = '';
      save();
      renderMilestones();
    });
    wrapper.append(number, name);
    objective.append(wrapper);

    const targetCell = document.createElement('td');
    const target = document.createElement('input');
    target.className = 'row-input target-input';
    target.value = formatTime(item.target * 1000);
    target.setAttribute('aria-label', `Target time for ${item.name}`);
    target.addEventListener('change', () => {
      const value = parseTime(target.value);
      if (value === null) {
        target.value = formatTime(item.target * 1000);
        feedback.textContent = 'Enter a valid target time in HH:MM:SS or MM:SS format.';
        return;
      }
      item.target = value;
      feedback.textContent = '';
      save();
      renderMilestones();
    });
    targetCell.append(target);

    const actual = document.createElement('td');
    actual.className = 'actual';
    actual.textContent = item.actual === null ? '—' : formatTime(item.actual);
    const delta = document.createElement('td');
    if (item.actual === null) {
      delta.textContent = '—';
    } else {
      const difference = Math.floor(item.actual / 1000) - item.target;
      delta.textContent = `${difference > 0 ? '+' : difference < 0 ? '−' : ''}${formatTime(Math.abs(difference) * 1000)}`;
      delta.className = difference > 0 ? 'delta-behind' : 'delta-ahead';
    }

    const actions = document.createElement('td');
    const buttons = document.createElement('div');
    buttons.className = 'row-actions';
    buttons.append(makeButton(item.actual === null ? 'SPLIT' : 'UNDO', `${item.actual === null ? 'Record' : 'Undo'} split for ${item.name}`, 'row-button', () => {
      item.actual = item.actual === null ? elapsed() : null;
      save();
      renderMilestones();
    }));
    buttons.append(makeButton('×', `Delete ${item.name}`, 'row-button delete-button', () => {
      state.milestones.splice(index, 1);
      save();
      renderMilestones();
    }));
    actions.append(buttons);
    row.append(objective, targetCell, actual, delta, actions);
    list.append(row);
  });
  const complete = state.milestones.filter(item => item.actual !== null).length;
  document.getElementById('progress-count').textContent = `${complete} / ${state.milestones.length}`;
  document.getElementById('progress-bar').style.width = `${state.milestones.length ? complete / state.milestones.length * 100 : 0}%`;
}

toggle.addEventListener('click', () => {
  if (state.startedAt === null) {
    state.startedAt = Date.now();
  } else {
    state.elapsed = elapsed();
    state.startedAt = null;
  }
  save();
  renderClock();
});

document.getElementById('reset-timer').addEventListener('click', () => {
  if (!confirm('Reset the timer and clear all recorded splits? Your objectives and targets will stay.')) return;
  state.elapsed = 0;
  state.startedAt = null;
  state.milestones.forEach(item => { item.actual = null; });
  save();
  renderClock();
  renderMilestones();
});

document.getElementById('add-form').addEventListener('submit', event => {
  event.preventDefault();
  const name = document.getElementById('new-name');
  const target = document.getElementById('new-target');
  const seconds = parseTime(target.value);
  if (!name.value.trim() || seconds === null) {
    feedback.textContent = 'Enter an objective and a valid target time in HH:MM:SS or MM:SS format.';
    return;
  }
  state.milestones.push({ name: name.value.trim(), target: seconds, actual: null });
  name.value = '';
  target.value = '';
  feedback.textContent = '';
  save();
  renderMilestones();
});

renderClock();
renderMilestones();
setInterval(renderClock, 100);
window.addEventListener('storage', event => {
  if (event.key === STORAGE_KEY) {
    load();
    renderClock();
    renderMilestones();
  }
});
