# FICSIT Speedrun Tracker

A Satisfactory-inspired speedrun dashboard for the browser and OBS. Track elapsed time and compare your actual checkpoint splits against your planned targets.

## Use

Open `index.html` in a browser, or serve this directory with any static web server. Start and pause the clock with **Start run / Pause run**. Use **Split** to record the current elapsed time for an objective, and **Undo** to clear that split. The difference column shows how far ahead (−) or behind (+) the target you are.

The included objectives and targets are examples. Edit them directly, delete them, or add your own using `HH:MM:SS` or `MM:SS` target times. Reset clears the clock and splits but keeps your route. The timer, route, and splits are saved in the browser's local storage; a running timer continues across reloads. Storage is local to each browser or OBS browser source and may be cleared with its browser data.

## GitHub Pages and OBS

In the repository settings, enable GitHub Pages and deploy from the desired branch's root directory. No build step is required. Once published, the site will be available at **https://spmse.github.io/stsfctry-spdrn-chcklst/**. Add that URL as an OBS Browser Source; a width of 1200 pixels or more is recommended. Interact with the source in OBS to control the timer and milestones. For a smaller source, the layout adapts to the available width.

This is an unofficial fan-made tool and is not affiliated with Coffee Stain Studios or FICSIT.