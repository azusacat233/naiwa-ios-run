const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const web = path.join(root, 'NaiwaRunner', 'Web');
const output = path.resolve(process.argv[2] || path.join(root, 'release', 'NaiwaRunner-v2.0.0.html'));
let html = fs.readFileSync(path.join(web, 'index.html'), 'utf8');

function inline(relative) {
  return fs.readFileSync(path.join(web, relative), 'utf8').replace(/<\/script/gi, '<\\/script');
}

const markers = [
  ['<link rel="stylesheet" href="style.css">', '<!-- INLINE_STYLE -->'],
  ['<script src="models/three.min.js"></script>', '<!-- INLINE_THREE -->'],
  ['<script src="models/models-data.js"></script>', '<!-- INLINE_MODELS -->'],
  ['<script src="core.js"></script>', '<!-- INLINE_CORE -->'],
  ['<script src="scene.js"></script>', '<!-- INLINE_SCENE -->'],
  ['<script src="app.js"></script>', '<!-- INLINE_APP -->']
];

for (const [source, marker] of markers) {
  if (!html.includes(source)) throw new Error('Missing package marker: ' + source);
  html = html.replace(source, marker);
}

const replacements = [
  ['<!-- INLINE_STYLE -->', '<style>' + fs.readFileSync(path.join(web, 'style.css'), 'utf8') + '</style>'],
  ['<!-- INLINE_THREE -->', '<script>' + inline('models/three.min.js') + '</script>'],
  ['<!-- INLINE_MODELS -->', '<script>' + inline('models/models-data.js') + '</script>'],
  ['<!-- INLINE_CORE -->', '<script>' + inline('core.js') + '</script>'],
  ['<!-- INLINE_SCENE -->', '<script>' + inline('scene.js') + '</script>'],
  ['<!-- INLINE_APP -->', '<script>' + inline('app.js') + '</script>']
];

for (const [marker, target] of replacements) {
  html = html.replace(marker, () => target);
}

if (!html.includes('window.NaiwaModels') || !html.includes('class NaiwaScene')) {
  throw new Error('Standalone HTML is missing v2 model or scene code');
}
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, html);
if (fs.statSync(output).size < 10_000_000) throw new Error('Standalone HTML is unexpectedly small');
console.log('Built standalone HTML: ' + output + ' (' + fs.statSync(output).size + ' bytes)');
