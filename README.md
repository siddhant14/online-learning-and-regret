# Online Learning & Regret

Online learning, Weighted Majority, and regret minimization. Course project by Siddhant Bhargava.

## Current scope

A project outline, motivation, and references on the homepage, with a separate interactive four-expert simulation. The outline describes the planned teaching sections.

## GitHub Pages

Publish from the `main` branch and `/ (root)` folder in Settings → Pages. The `.nojekyll` file serves these static files directly. No build or installation is required.

## Local preview

Run `python3 -m http.server` from this folder, then open the local URL. An HTTP server is needed for JavaScript modules.

## Tests

Run `node test-engine.mjs` or `npm test`. There are no dependencies to install.

## Files

- `index.html`: motivation, project outline, and references.
- `simulation.html`: interactive simulation.
- `site.css`: simple page layout and typography.
- `style.css`: responsive layout and presentation.
- `engine.js`: exponential weights, expected-loss and deterministic prediction rules.
- `app.js`: controls, plots, weight displays, and CSV export.

Hedge mode tracks expected loss, not a sampled trajectory. Deterministic Weighted Majority has a separate mistake bound. All weight updates use the full feedback after the outcome. Each configuration change resets the run.
