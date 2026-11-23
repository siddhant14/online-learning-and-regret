# Online Learning and Regret

Course project by Siddhant Bhargava. Public site: https://siddhant14.github.io/online-learning-and-regret/

## Content

- index.html: overview, motivation, prerequisites, and reading order.
- online-learning.html: expert advice, exponential weights, worked example, and full regret-bound proof.
- minimax.html: finite minimax proof from regret, Yao’s principle, and an OR query lower bound.
- simulation.html: four-expert simulation, supported by app.js and engine.js.
- references.html: bibliography and source annotations.

The lesson prose is a working draft prepared with AI assistance at the student's request. The student will replace the explanatory text with their own wording before final submission, following the course requirement. The original motivation paragraph is retained.

## Editing and building

Edit the lesson manuscripts in content/online-learning.html and content/minimax.html. They contain regular HTML with inline math between `\(` and `\)`, and display math between `\[` and `\]`. The overview, references, simulation, and styles can be edited directly.

Install development dependencies using `pnpm install --frozen-lockfile`, then run `pnpm build`. The build uses KaTeX to create static native MathML in the two lesson pages. No math library, fonts, or external scripts are downloaded by visitors. Commit both the manuscripts and the generated HTML when making changes.

The checked-in HTML is ready to serve without a build. GitHub Pages publishes from the main branch and repository root; .nojekyll serves these files directly.

## Local preview and checks

Run `python3 -m http.server` from this directory for a local preview. An HTTP server is needed for the simulation's JavaScript modules.

Run `pnpm test` or `node test-engine.mjs` for the simulation engine tests.

Hedge mode tracks mixture loss, equal to conditional expected loss under the lesson's prediction protocol; it does not sample an expert. Deterministic Weighted Majority has a separate mistake bound. Each setup change resets the run, preserving a fixed learning rate within an experiment.

## Layout

site.css provides the shared reading layout. style.css styles the simulation controls and chart. Equations and tables can scroll horizontally on narrow screens without widening the page.
