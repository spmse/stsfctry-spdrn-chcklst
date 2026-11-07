# FICSIT Speedrun Tracker

A Satisfactory-inspired speedrun dashboard for the browser and OBS. Track elapsed time and compare your actual checkpoint splits against your planned targets.

## Use

Choose an any% Phase 1 or Phase 2 scenario to load its preset objectives and example target times. Switching scenarios or reloading a preset asks for confirmation because it replaces the current route and resets the timer and splits. Existing saved runs are preserved as a custom route. Start and pause the clock with **Start run / Pause run**. Use **Split** to record the current elapsed time for an objective, and **Undo** to clear that split. The difference column shows how far ahead (−) or behind (+) the target you are.

The included objectives and targets are examples. Edit them directly, delete them, or add your own using `HH:MM:SS` or `MM:SS` target times. Reset clears the clock and splits but keeps your route. The timer, route, and splits are saved in the browser's local storage; a running timer continues across reloads. Storage is local to each browser or OBS browser source and may be cleared with its browser data.

### Stage materials

Select a milestone under **Stage materials**. Add a standard project-part recipe or a manual supply item, and adjust quantities or remove entries as your route changes. The dashboard calculates the immediate ingredients for the selected stage and the overlay displays its produce and supply lists. Recipe batches are rounded up and duplicate recipe goals are combined before calculation. The lists are plans, not inventory tracking: supply quantities include intermediate parts that you can gather, handcraft, or produce elsewhere. They are not recursively expanded to raw resources and do not account for alternate recipes, existing inventory, or machines.

The Phase 1 and Phase 2 completion stages have example delivery requirements; other stages start empty and can be configured manually. Phase 2 lists its own delivery, not the cumulative total of both phases. Existing saved runs remain unchanged and can be configured manually; reloading a preset replaces the current run.

The official wiki could not be verified or accessed for this implementation, so this is **not live wiki data**. The bundled standard recipe ratios are limited to Smart Plating, Versatile Framework, and Automated Wiring, using the [Satisfactory 1.0 production dataset](https://github.com/Sunset1014/Satisfactory-Production-Planner/blob/70185973519e5590dde85189ea37bb16c2363d6b/js/game-data.js); phase delivery quantities come from [this Satisfactory save-data reference](https://github.com/GreyHak/sat_sav_parse/blob/5823b214bfe126b89260e40c40c150c5f525bd43/sav_data/data.py). Verify these third-party values against your game version; manually adjust your plan if necessary.

## GitHub Pages and OBS

In the repository settings, enable GitHub Pages and select **GitHub Actions** as the source. The Pages workflow builds and deploys on pushes to `main` or `master`, and can also be run manually. Once published, the normal dashboard will be available at **https://spmse.github.io/stsfctry-spdrn-chcklst/**.

Add **https://spmse.github.io/stsfctry-spdrn-chcklst/overlay.html** as an OBS Browser Source. The overlay has a transparent background; use a source width of at least 560 pixels and enough height for your objectives. To control it, right-click the source in OBS and choose **Interact**, move to the upper-right corner and open **Controls**. Close Controls before returning to your stream. The dashboard and overlay synchronize between pages in the same browser profile. OBS uses its own browser storage, so a separate browser's dashboard will not control the OBS source.

This is a fan-made, unofficial tool and is not affiliated with or endorsed by Coffee Stain Studios. All trademarks and third-party material remain the property of their respective owners; no ownership is claimed, and data accuracy is not guaranteed.

## Development

Install Node.js 22 or newer, then run `npm ci` and `npm run dev`. Run `npm test` for the focused logic tests and `npm run build` to generate the static site in `dist/`. The React app uses TanStack Store for run state.