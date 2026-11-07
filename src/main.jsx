import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { useSelector } from '@tanstack/react-store';
import { elapsed, formatTime, parseTime, preset, scenarios } from './run.js';
import { runStore, updateRun } from './store.js';
import '../style.css';

function Dashboard() {
  const run = useSelector(runStore);
  const [now, setNow] = useState(Date.now);
  const [feedback, setFeedback] = useState('');
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(interval);
  }, []);

  function update(updater) {
    setFeedback(updateRun(updater) ? '' : 'Local storage is unavailable; your run will not be saved.');
  }

  function selectPreset(id) {
    if (!Object.hasOwn(scenarios, id)) return;
    if (!window.confirm('Load this preset? This resets the timer and replaces your current objectives and splits.')) return;
    update(() => preset(id));
  }

  function editMilestone(index, changes) {
    update(current => ({
      ...current,
      milestones: current.milestones.map((item, i) => i === index ? { ...item, ...changes } : item)
    }));
  }

  const complete = run.milestones.filter(item => item.actual !== null).length;
  const [whole, fraction] = formatTime(elapsed(run, now), true).split('.');

  return <main className="console">
    <header className="topbar">
      <div className="brand"><span className="brand-mark" aria-hidden="true">F</span><span>FICSIT<span className="brand-dot">.</span><small>INCORPORATED</small></span></div>
      <div className="topbar-right"><span className="status-light"></span> PIONEER OPERATIONS <span className="topbar-divider">/</span> MASSAGE-2(A-B)B &nbsp; <a href="overlay.html" target="_top">OPEN STREAM OVERLAY ↗</a></div>
    </header>
    <section className="intro">
      <div><p className="eyebrow"><span>01</span> &nbsp; / &nbsp; PROJECT ASSEMBLY</p><h1>THE FACTORY<br/><em>MUST GROW.</em></h1><p className="intro-copy">Speedrun operations dashboard <span>//</span> Every second counts, pioneer.</p></div>
      <div className="intro-stamp" aria-hidden="true"><span>FICSIT</span><strong>PLANETARY<br/>OPERATIONS</strong><small>EST. 02 // APPROVED</small></div>
    </section>
    <section className="scenario-panel" aria-labelledby="scenario-heading">
      <div><p className="eyebrow"><span>00</span> &nbsp; / &nbsp; SELECT YOUR MISSION</p><h2 id="scenario-heading">Speedrun scenario<span className="heading-dot">.</span></h2><p className="section-copy">Choose a preset route to load its objectives and example target times.</p></div>
      <div className="scenario-controls">
        <label htmlFor="scenario">SCENARIO</label>
        <select id="scenario" value={run.scenario} onChange={event => selectPreset(event.target.value)}>
          {run.scenario === 'custom' && <option value="custom">Custom / existing route</option>}
          {Object.entries(scenarios).map(([id, scenario]) => <option key={id} value={id}>{scenario.name}</option>)}
        </select>
        {run.scenario !== 'custom' && <button className="button button-secondary" type="button" onClick={() => selectPreset(run.scenario)}>RELOAD PRESET</button>}
      </div>
    </section>
    <section className="timer-panel" aria-labelledby="timer-heading">
      <div className="panel-heading"><div><span className="section-number">01 / MISSION CLOCK</span><h2 id="timer-heading">Elapsed time</h2></div><span className={`clock-state${run.startedAt !== null ? ' running' : ''}`} id="clock-state"><span className="status-light"></span> {run.startedAt !== null ? 'IN PROGRESS' : 'STANDBY'}</span></div>
      <div className="timer-content">
        <div><div className="timer" id="timer" role="timer" aria-label="Elapsed time">{whole}<span>.{fraction}</span></div><div className="timer-labels" aria-hidden="true"><span>HOURS</span><span>MINUTES</span><span>SECONDS</span></div></div>
        <div className="timer-actions">
          <button className="button button-primary" type="button" onClick={() => update(current => current.startedAt === null ? { ...current, startedAt: Date.now() } : { ...current, elapsed: elapsed(current), startedAt: null })}><span aria-hidden="true">{run.startedAt === null ? '▶' : 'Ⅱ'}</span> {run.startedAt === null ? 'START RUN' : 'PAUSE RUN'}</button>
          <button className="button button-secondary" type="button" onClick={() => { if (window.confirm('Reset the timer and clear all recorded splits? Your objectives and targets will stay.')) update(current => ({ ...current, elapsed: 0, startedAt: null, milestones: current.milestones.map(item => ({ ...item, actual: null })) })); }}>↺ &nbsp; RESET</button>
        </div>
      </div><div className="hazard-stripe" aria-hidden="true"></div>
    </section>
    <section className="milestones" aria-labelledby="milestones-heading">
      <div className="section-heading"><div><p className="eyebrow"><span>02</span> &nbsp; / &nbsp; THE ROAD TO EFFICIENCY</p><h2 id="milestones-heading">Mission milestones<span className="heading-dot">.</span></h2></div><div className="progress-label"><strong id="progress-count">{complete} / {run.milestones.length}</strong><span>OBJECTIVES COMPLETE</span></div></div>
      <div className="progress-track" aria-hidden="true"><div style={{ width: `${run.milestones.length ? complete / run.milestones.length * 100 : 0}%` }}></div></div>
      <p className="section-copy">Record each checkpoint as you reach it. Preset targets are examples — make them your own.</p>
      <div className="table-wrap"><table><thead><tr><th scope="col">OBJECTIVE</th><th scope="col">TARGET</th><th scope="col">ACTUAL</th><th scope="col">+/−</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
        <tbody id="milestone-list">{run.milestones.map((item, index) => {
          const difference = item.actual === null ? null : Math.floor(item.actual / 1000) - item.target;
          return <tr key={index} className={item.actual === null ? '' : 'complete'}>
            <td><div className="objective"><span className="objective-number">{String(index + 1).padStart(2, '0')}</span><input key={item.name} className="row-input" defaultValue={item.name} maxLength={80} aria-label={`Objective ${index + 1} name`} onBlur={event => {
              const value = event.target.value.trim();
              if (!value) { event.target.value = item.name; setFeedback('Objective names cannot be empty.'); }
              else if (value !== item.name) editMilestone(index, { name: value });
            }}/></div></td>
            <td><input key={item.target} className="row-input target-input" defaultValue={formatTime(item.target * 1000)} aria-label={`Target time for ${item.name}`} onBlur={event => {
              const value = parseTime(event.target.value);
              if (value === null) { event.target.value = formatTime(item.target * 1000); setFeedback('Enter a valid target time in HH:MM:SS or MM:SS format.'); }
              else if (value !== item.target) editMilestone(index, { target: value });
              else event.target.value = formatTime(item.target * 1000);
            }}/></td>
            <td className="actual">{item.actual === null ? '—' : formatTime(item.actual)}</td>
            <td className={difference === null ? '' : difference > 0 ? 'delta-behind' : 'delta-ahead'}>{difference === null ? '—' : `${difference > 0 ? '+' : difference < 0 ? '−' : ''}${formatTime(Math.abs(difference) * 1000)}`}</td>
            <td><div className="row-actions"><button type="button" className="row-button" aria-label={`${item.actual === null ? 'Record' : 'Undo'} split for ${item.name}`} onClick={() => editMilestone(index, { actual: item.actual === null ? elapsed(runStore.state) : null })}>{item.actual === null ? 'SPLIT' : 'UNDO'}</button><button type="button" className="row-button delete-button" aria-label={`Delete ${item.name}`} onClick={() => update(current => ({ ...current, milestones: current.milestones.filter((_, i) => i !== index) }))}>×</button></div></td>
          </tr>;
        })}</tbody></table></div>
      <form className="add-form" onSubmit={event => {
        event.preventDefault();
        const seconds = parseTime(target);
        if (!name.trim() || seconds === null) { setFeedback('Enter an objective and a valid target time in HH:MM:SS or MM:SS format.'); return; }
        update(current => ({ ...current, milestones: [...current.milestones, { name: name.trim(), target: seconds, actual: null }] }));
        setName(''); setTarget('');
      }}>
        <div><label htmlFor="new-name">NEW OBJECTIVE</label><input id="new-name" value={name} onChange={event => setName(event.target.value)} placeholder="e.g. Complete Phase 1" maxLength={80} required /></div>
        <div><label htmlFor="new-target">TARGET TIME</label><input id="new-target" value={target} onChange={event => setTarget(event.target.value)} placeholder="HH:MM:SS" required /></div>
        <button className="button button-add" type="submit"><span aria-hidden="true">＋</span> ADD OBJECTIVE</button>
      </form>
      <p className="form-help">Time format: HH:MM:SS or MM:SS. Edit an objective or target directly in the table.</p><p className="feedback" role="status" aria-live="polite">{feedback}</p>
    </section>
    <footer><span><strong>FICSIT</strong> &nbsp; / &nbsp; PIONEER ASSISTANCE SYSTEM</span><span>COMPLY. BUILD. SUCCEED. <b>▰</b></span></footer>
  </main>;
}

createRoot(document.getElementById('root')).render(<Dashboard />);
