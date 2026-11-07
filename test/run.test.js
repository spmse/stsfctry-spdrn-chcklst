import test from 'node:test';
import assert from 'node:assert/strict';
import { elapsed, formatTime, parseTime, preset, readRun, scenarios } from '../src/run.js';

test('presets provide independent, complete example routes', () => {
  for (const [id, scenario] of Object.entries(scenarios)) {
    const run = preset(id);
    assert.equal(run.scenario, id);
    assert.equal(run.elapsed, 0);
    assert.equal(run.startedAt, null);
    assert.ok(run.milestones.length > 0);
    assert.ok(run.milestones.every(item => item.actual === null && Number.isInteger(item.target)));
    assert.match(run.milestones.at(-1).name, /Phase [12]/);
    run.milestones[0].name = 'Modified';
    assert.notEqual(preset(id).milestones[0].name, 'Modified');
    assert.ok(scenario.name);
  }
});

test('legacy saved runs retain progress and become custom routes', () => {
  const saved = { elapsed: 2000, startedAt: 1000, milestones: [{ name: 'Old route', target: 60, actual: 500 }] };
  assert.deepEqual(readRun(JSON.stringify(saved)), { ...saved, scenario: 'custom' });
  assert.equal(elapsed(saved, 4000), 5000);
  assert.equal(readRun('{invalid').scenario, 'phase1');
  assert.equal(readRun(JSON.stringify({ ...saved, milestones: [{ name: '', target: 0, actual: null }] })).scenario, 'phase1');
});

test('time parsing and formatting handles long minutes and invalid inputs', () => {
  assert.equal(parseTime('90:00'), 5400);
  assert.equal(parseTime('01:30:00'), 5400);
  assert.equal(parseTime('01:60:00'), null);
  assert.equal(parseTime('1:90'), null);
  assert.equal(parseTime('-1:00'), null);
  assert.equal(formatTime(5400123, true), '01:30:00.1');
});
