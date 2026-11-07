import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../overlay.css';

function Overlay() {
  const frame = useRef(null);
  const [view, setView] = useState({ timer: '00:00:00.0', status: 'STANDBY', progress: '0 / 0', scenario: '', rows: [] });

  useEffect(() => {
    function update() {
      const dashboard = frame.current?.contentDocument;
      if (!dashboard?.getElementById('timer')) return;
      const rows = Array.from(dashboard.querySelectorAll('#milestone-list tr'), row => ({
        name: row.querySelector('.objective input').value,
        target: row.querySelector('.target-input').value,
        actual: row.cells[2].textContent,
        delta: row.cells[3].textContent,
        deltaClass: row.cells[3].className
      }));
      setView({
        timer: dashboard.getElementById('timer').textContent,
        status: dashboard.getElementById('clock-state').textContent.trim(),
        progress: dashboard.getElementById('progress-count').textContent,
        scenario: dashboard.getElementById('scenario').selectedOptions[0]?.textContent,
        rows
      });
    }
    const interval = setInterval(update, 100);
    return () => clearInterval(interval);
  }, []);

  return <>
    <main className="overlay">
      <header><strong>FICSIT<span>.</span></strong><small>PROJECT ASSEMBLY // SPEEDRUN</small></header>
      <div className="clock"><span>MISSION CLOCK</span><strong id="overlay-timer">{view.timer}</strong><small>{view.status}</small></div>
      <div className="heading"><span>MISSION MILESTONES<br/><small>{view.scenario}</small></span><strong>{view.progress}</strong></div>
      <div className="columns"><span>OBJECTIVE</span><span>TARGET</span><span>ACTUAL</span><span>+/−</span></div>
      <div>{view.rows.map((row, index) => <div className="milestone" key={index}><span>{row.name}</span><span>{row.target}</span><span>{row.actual}</span><span className={row.deltaClass === 'delta-ahead' ? 'ahead' : row.deltaClass === 'delta-behind' ? 'behind' : ''}>{row.delta}</span></div>)}</div>
      <footer>COMPLY. BUILD. SUCCEED. <span>▰</span></footer>
    </main>
    <details className="controls"><summary>⚙ CONTROLS</summary><iframe ref={frame} src="index.html" title="Speedrun dashboard controls" /></details>
  </>;
}

createRoot(document.getElementById('root')).render(<Overlay />);
