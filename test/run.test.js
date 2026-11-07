import test from 'node:test';
import assert from 'node:assert/strict';
import { elapsed, formatTime, parseTime, preset, readRun, scenarios } from '../src/run.js';
import { calculateMaterials, validGoal } from '../src/materials.js';

test('presets provide independent, complete example routes', () => {
  for (const [id, scenario] of Object.entries(scenarios).filter(([id]) => id !== 'custom')) {
    const run = preset(id);
    assert.equal(run.scenario, id);
    assert.equal(run.elapsed, 0);
    assert.equal(run.startedAt, null);
    assert.ok(run.milestones.length > 0);
    assert.ok(run.milestones.every(item => item.actual === null && Number.isInteger(item.target)));
    assert.match(run.milestones.at(-1).name, /Phase [1-4]/);
    run.milestones[0].name = 'Modified';
    assert.notEqual(preset(id).milestones[0].name, 'Modified');
    assert.ok(scenario.name);
  }
});

test('free-form route starts empty and can be configured', () => {
  const run = preset('custom');
  assert.equal(run.scenario, 'custom');
  assert.deepEqual(run.milestones, []);
  assert.equal(run.materialStage, 0);
  assert.match(scenarios.custom.name, /Free form/);
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

test('phase presets have independent delivery requirements', () => {
  const first = preset('phase1');
  const second = preset('phase2');
  const third = preset('phase3');
  const fourth = preset('phase4');
  assert.deepEqual(first.milestones.at(-1).materials, [{ item: 'Smart Plating', quantity: 50, mode: 'recipe' }]);
  assert.deepEqual(second.milestones.at(-1).materials.map(goal => goal.quantity), [1000, 1000, 100]);
  assert.deepEqual(third.milestones.at(-1).materials.map(goal => goal.item), ['Modular Engine', 'Adaptive Control Unit', 'Automated Wiring']);
  assert.deepEqual(fourth.milestones.at(-1).materials.map(goal => goal.item), ['Assembly Director System', 'Magnetic Field Generator', 'Thermal Propulsion Rocket', 'Nuclear Pasta']);
  first.milestones.at(-1).materials[0].quantity = 1;
  assert.equal(preset('phase1').milestones.at(-1).materials[0].quantity, 50);
  assert.deepEqual(readRun(JSON.stringify(second)), second);
  third.milestones.at(-1).materials[0].quantity = 1;
  assert.equal(preset('phase3').milestones.at(-1).materials[0].quantity, 500);
  assert.equal(readRun(JSON.stringify(fourth)).scenario, 'phase4');
});

test('material calculations aggregate goals before rounding batches', () => {
  const goals = [
    { item: 'Versatile Framework', quantity: 1, mode: 'recipe' },
    { item: 'Versatile Framework', quantity: 2, mode: 'recipe' },
    { item: 'Smart Plating', quantity: 3, mode: 'recipe' },
    { item: 'Rotor', quantity: 4, mode: 'manual' }
  ];
  assert.deepEqual(calculateMaterials(goals), {
    produce: [{ item: 'Versatile Framework', quantity: 3, mode: 'recipe' }, { item: 'Smart Plating', quantity: 3, mode: 'recipe' }],
    supply: [{ item: 'Modular Frame', quantity: 2 }, { item: 'Steel Beam', quantity: 24 }, { item: 'Reinforced Iron Plate', quantity: 3 }, { item: 'Rotor', quantity: 7 }]
  });
  assert.deepEqual(calculateMaterials(), { produce: [], supply: [] });
  assert.equal(validGoal({ item: 'Rotor', quantity: 0, mode: 'manual' }), false);
  assert.equal(validGoal({ item: 'Unknown', quantity: 1, mode: 'recipe' }), false);
});
