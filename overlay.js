'use strict';

const frame = document.querySelector('.controls iframe');
const overlayTimer = document.getElementById('overlay-timer');
const overlayState = document.getElementById('overlay-state');
const overlayProgress = document.getElementById('overlay-progress');
const overlayMilestones = document.getElementById('overlay-milestones');
let lastRows = '';

function updateOverlay() {
  const dashboard = frame.contentDocument;
  if (!dashboard || !dashboard.getElementById('timer')) return;
  overlayTimer.textContent = dashboard.getElementById('timer').textContent;
  overlayState.textContent = dashboard.getElementById('clock-state').textContent.trim();
  overlayProgress.textContent = dashboard.getElementById('progress-count').textContent;
  const rows = Array.from(dashboard.querySelectorAll('#milestone-list tr'), row => ({
    name: row.querySelector('.objective input').value,
    target: row.querySelector('.target-input').value,
    actual: row.cells[2].textContent,
    delta: row.cells[3].textContent,
    deltaClass: row.cells[3].className
  }));
  const serialized = JSON.stringify(rows);
  if (serialized === lastRows) return;
  lastRows = serialized;
  overlayMilestones.replaceChildren();
  rows.forEach(row => {
    const element = document.createElement('div');
    element.className = 'milestone';
    [row.name, row.target, row.actual, row.delta].forEach((value, index) => {
      const cell = document.createElement('span');
      cell.textContent = value;
      if (index === 3) cell.className = row.deltaClass === 'delta-ahead' ? 'ahead' : row.deltaClass === 'delta-behind' ? 'behind' : '';
      element.append(cell);
    });
    overlayMilestones.append(element);
  });
}

frame.addEventListener('load', updateOverlay);
setInterval(updateOverlay, 100);
