/**
 * Copy web assets to www/ for Capacitor build.
 * Run: node scripts/copy-to-www.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const WWW = path.join(ROOT, 'www');

const FILES = [
  'index.html', 'manifest.json', 'sw.js', 'privacy.html',
  'icon-192.png', 'icon-512.png',
  'shiftCalculator.js', 'demo.js', 'test-regression.js'
];
const DIRS = ['src'];

function copyFile(src, dest) {
  const dir = path.dirname(dest);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.copyFileSync(src, dest);
}

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const e of entries) {
    const s = path.join(src, e.name);
    const d = path.join(dest, e.name);
    if (e.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

if (fs.existsSync(WWW)) fs.rmSync(WWW, { recursive: true });
fs.mkdirSync(WWW, { recursive: true });

for (const f of FILES) {
  const src = path.join(ROOT, f);
  if (fs.existsSync(src)) copyFile(src, path.join(WWW, f));
}
for (const d of DIRS) {
  const src = path.join(ROOT, d);
  if (fs.existsSync(src) && fs.statSync(src).isDirectory()) copyDir(src, path.join(WWW, d));
}

console.log('Copied to www/');
