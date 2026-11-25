import { readFile, writeFile } from 'node:fs/promises';
import katex from 'katex';

const pages = [
  { file: 'online-learning.html', title: 'Part 1: Online learning and regret', description: 'Expert advice, exponential weights, a worked example, and a full potential-function proof of the regret bound.', previous: ['index.html', 'Overview'], next: ['minimax.html', 'Part 2: Minimax and randomized lower bounds'] },
  { file: 'minimax.html', title: 'Part 2: Minimax and randomized lower bounds', description: 'A proof of finite minimax from low regret, Yao’s principle, and a randomized query lower bound for OR.', previous: ['online-learning.html', 'Part 1: Online learning and regret'], next: ['references.html', 'References'] },
];
const links = [['index.html', 'Overview'], ['online-learning.html', 'Part 1'], ['minimax.html', 'Part 2'], ['simulation.html', 'Simulation'], ['references.html', 'References']];
let formulaCount = 0;
for (const page of pages) {
  const source = await readFile(new URL('content/' + page.file, import.meta.url), 'utf8');
  const body = source.replace(/\\\[([\s\S]*?)\\\]|\\\(([\s\S]*?)\\\)/g, (_, display, inline) => {
    formulaCount++;
    const rendered = katex.renderToString(display ?? inline, { output: 'mathml', displayMode: display !== undefined, throwOnError: true, strict: 'error' });
    return display !== undefined ? '<div class="equation">' + rendered + '</div>' : rendered;
  });
  if (/\\[()[\]]/.test(body.replace(/<annotation[\s\S]*?<\/annotation>/g, ''))) {
    throw new Error('Unconverted math delimiter in ' + page.file);
  }
  const nav = links.map(([href, label]) => '<a href="' + href + '"' + (href === page.file ? ' aria-current="page"' : '') + '>' + label + '</a>').join('');
  const html = '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>' + page.title + ' — From Online Learning to Randomized Lower Bounds</title>\n<meta name="description" content="' + page.description + '">\n<link rel="icon" href="favicon.svg" type="image/svg+xml">\n<link rel="stylesheet" href="site.css">\n</head>\n<body>\n<a class="skip-link" href="#main">Skip to content</a>\n<header class="site-header"><nav aria-label="Main navigation">' + nav + '</nav></header>\n<main id="main" class="project-page lesson-page">\n<h1>' + page.title + '</h1>\n' + body + '\n<nav class="page-turn" aria-label="Lesson navigation"><a href="' + page.previous[0] + '">' + page.previous[1] + '</a><a href="' + page.next[0] + '">' + page.next[1] + '</a></nav>\n</main>\n</body>\n</html>\n';
  await writeFile(new URL(page.file, import.meta.url), html);
  console.log('Built ' + page.file);
}
console.log('Rendered ' + formulaCount + ' formulas as static MathML.');

