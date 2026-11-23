# Online Learning & Regret

Online learning, multiplicative weights, minimax, and randomized query lower bounds. Course project by Siddhant Bhargava.

## Current scope

A simple two-part project outline with motivation, prerequisite background, and references. Part 1 develops expert advice and the exponential-weights regret guarantee. Part 2 uses that guarantee to prove finite minimax, derives Yao's fixed-query-budget error identity, and applies it to the randomized query complexity of OR.

The public page describes the planned teaching sections. The final explanations and proofs are to be written by the student. A separate four-expert simulation supports Part 1.

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
