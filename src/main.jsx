import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { useSelector } from '@tanstack/react-store';
import { elapsed, formatTime, parseTime, preset, scenarios } from './run.js';
import { calculateMaterials, MAX_QUANTITY, recipes } from './materials.js';
import { runStore, updateRun } from './store.js';
import '../style.css';

function Dashboard() {
  const run = useSelector(runStore);
  const [now, setNow] = useState(Date.now);
  const [feedback, setFeedback] = useState('');
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [materialType, setMaterialType] = useState('Smart Plating');
  const [materialName, setMaterialName] = useState('');
  const [materialQuantity, setMaterialQuantity] = useState('1');

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
  const stageIndex = Number.isInteger(run.materialStage) && run.materialStage >= 0 && run.materialStage < run.milestones.length ? run.materialStage : 0;
  const stage = run.milestones[stageIndex];
  const materials = calculateMaterials(stage?.materials);

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
            <td><div className="row-actions"><button type="button" className="row-button" aria-label={`${item.actual === null ? 'Record' : 'Undo'} split for ${item.name}`} onClick={() => editMilestone(index, { actual: item.actual === null ? elapsed(runStore.state) : null })}>{item.actual === null ? 'SPLIT' : 'UNDO'}</button><button type="button" className="row-button delete-button" aria-label={`Delete ${item.name}`} onClick={() => update(current => ({ ...current, materialStage: index < stageIndex ? stageIndex - 1 : index === stageIndex ? 0 : stageIndex, milestones: current.milestones.filter((_, i) => i !== index) }))}>×</button></div></td>
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
    <section className="materials-panel" aria-labelledby="materials-heading">
      <p className="eyebrow"><span>03</span> &nbsp; / &nbsp; MATERIAL PLANNING</p>
      <h2 id="materials-heading">Stage materials<span className="heading-dot">.</span></h2>
      {stage ? <>
        <label htmlFor="material-stage">SELECT STAGE</label>
        <select id="material-stage" value={stageIndex} onChange={event => update(current => ({ ...current, materialStage: Number(event.target.value) }))}>
          {run.milestones.map((item, index) => <option value={index} key={index}>{item.name}</option>)}
        </select>
        <div id="material-summary">
          <h3 id="material-stage-name">{stage.name}</h3>
          <div className="material-columns">
            <div><h4>PRODUCE</h4><ul id="material-produce">{materials.produce.map(item => <li key={item.item}><span>{item.item}</span><strong>{' × '}{item.quantity}</strong></li>)}</ul>{!materials.produce.length && <p>None configured.</p>}</div>
            <div><h4>SUPPLY / HANDCRAFT</h4><ul id="material-supply">{materials.supply.map(item => <li key={item.item}><span>{item.item}</span><strong>{' × '}{item.quantity}</strong></li>)}</ul>{!materials.supply.length && <p>None configured.</p>}</div>
          </div>
        </div>
        <p className="form-help">Inputs are immediate ingredients, not raw-resource totals. Standard recipes only; no alternate recipes or inventory deductions.</p>
        <h3>Configure this stage</h3>
        {(stage.materials || []).map((goal, index) => <div className="material-goal" key={index}>
          <span>{goal.item} <small>{goal.mode === 'recipe' ? '(standard recipe)' : '(manual supply)'}</small></span>
          <label className="sr-only" htmlFor={`goal-${index}`}>Quantity for {goal.item}</label>
          <input id={`goal-${index}`} type="number" min="1" max={MAX_QUANTITY} step="1" defaultValue={goal.quantity} key={goal.quantity} onBlur={event => {
            const quantity = Number(event.target.value);
            if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) { event.target.value = goal.quantity; setFeedback(`Enter a whole quantity from 1 to ${MAX_QUANTITY}.`); return; }
            if (quantity !== goal.quantity) editMilestone(stageIndex, { materials: stage.materials.map((entry, i) => i === index ? { ...entry, quantity } : entry) });
          }} />
          <button type="button" className="row-button delete-button" aria-label={`Remove ${goal.item} from ${stage.name}`} onClick={() => editMilestone(stageIndex, { materials: stage.materials.filter((_, i) => i !== index) })}>×</button>
        </div>)}
        <form className="material-form" onSubmit={event => {
          event.preventDefault();
          const quantity = Number(materialQuantity);
          const item = materialType === 'manual' ? materialName.trim() : materialType;
          if (!item || !Number.isSafeInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) { setFeedback(`Enter an item and a whole quantity from 1 to ${MAX_QUANTITY}.`); return; }
          editMilestone(stageIndex, { materials: [...(stage.materials || []), { item, quantity, mode: materialType === 'manual' ? 'manual' : 'recipe' }] });
          setMaterialName(''); setMaterialQuantity('1');
        }}>
          <div><label htmlFor="material-type">ITEM / RECIPE</label><select id="material-type" value={materialType} onChange={event => setMaterialType(event.target.value)}>{Object.keys(recipes).map(item => <option key={item}>{item}</option>)}<option value="manual">Manual supply</option></select></div>
          {materialType === 'manual' && <div><label htmlFor="material-name">ITEM NAME</label><input id="material-name" value={materialName} maxLength={80} required onChange={event => setMaterialName(event.target.value)} /></div>}
          <div><label htmlFor="material-quantity">QUANTITY</label><input id="material-quantity" type="number" min="1" max={MAX_QUANTITY} step="1" required value={materialQuantity} onChange={event => setMaterialQuantity(event.target.value)} /></div>
          <button className="button button-add" type="submit">＋ ADD MATERIAL</button>
        </form>
      </> : <p className="section-copy">Add an objective to configure its materials.</p>}
      <p className="form-help">Recipe data is a small, bundled reference, not live wiki data. <a href="https://github.com/Sunset1014/Satisfactory-Production-Planner/blob/70185973519e5590dde85189ea37bb16c2363d6b/js/game-data.js">Recipe source</a>.</p>
      <p className="feedback" role="status" aria-live="polite">{feedback}</p>
    </section>
    <footer><span><strong>FICSIT</strong> &nbsp; / &nbsp; PIONEER ASSISTANCE SYSTEM</span><span>COMPLY. BUILD. SUCCEED. <b>▰</b> &nbsp; / &nbsp; <a href="https://spmsec.dev">authors website</a></span><p className="disclaimer">This is a fan-made, unofficial tool and is not affiliated with or endorsed by Coffee Stain Studios. All trademarks and third-party material remain the property of their respective owners; no ownership is claimed, and data accuracy is not guaranteed.</p></footer>
  </main>;
}

createRoot(document.getElementById('root')).render(<Dashboard />);
