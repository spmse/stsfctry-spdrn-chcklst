# FICSIT Speedrun Tracker

A Satisfactory-inspired speedrun dashboard for the browser and OBS. Track elapsed time and compare your actual checkpoint splits against your planned targets.

## Use

Choose an any% Phase 1 or Phase 2 scenario to load its preset objectives and example target times. Switching scenarios or reloading a preset asks for confirmation because it replaces the current route and resets the timer and splits. Existing saved runs are preserved as a custom route. Start and pause the clock with **Start run / Pause run**. Use **Split** to record the current elapsed time for an objective, and **Undo** to clear that split. The difference column shows how far ahead (−) or behind (+) the target you are.

The included objectives and targets are examples. Edit them directly, delete them, or add your own using `HH:MM:SS` or `MM:SS` target times. Reset clears the clock and splits but keeps your route. The timer, route, and splits are saved in the browser's local storage; a running timer continues across reloads. Storage is local to each browser or OBS browser source and may be cleared with its browser data.

## GitHub Pages and OBS

In the repository settings, enable GitHub Pages and select **GitHub Actions** as the source. The Pages workflow builds and deploys on pushes to `main` or `master`, and can also be run manually. Once published, the normal dashboard will be available at **https://spmse.github.io/stsfctry-spdrn-chcklst/**.

Add **https://spmse.github.io/stsfctry-spdrn-chcklst/overlay.html** as an OBS Browser Source. The overlay has a transparent background; use a source width of at least 560 pixels and enough height for your objectives. To control it, right-click the source in OBS and choose **Interact**, move to the upper-right corner and open **Controls**. Close Controls before returning to your stream. The dashboard and overlay synchronize between pages in the same browser profile. OBS uses its own browser storage, so a separate browser's dashboard will not control the OBS source.

This is an unofficial fan-made tool and is not affiliated with Coffee Stain Studios or FICSIT.

## Development

Install Node.js 22 or newer, then run `npm ci` and `npm run dev`. Run `npm test` for the focused logic tests and `npm run build` to generate the static site in `dist/`. The React app uses TanStack Store for run state.