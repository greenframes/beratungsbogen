// Trägt nach dem Build alle statischen Dateien aus dist/ in den Service Worker ein (Offline-Betrieb ab dem ersten Besuch).
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const dist = new URL('../dist/', import.meta.url).pathname;
const files = [];
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else files.push('./' + relative(dist, p).replaceAll('\\', '/'));
  }
};
walk(dist);
// jsPDFs optionale Abhängigkeiten (html2canvas, DOMPurify, canvg) werden nie geladen – nicht vorab cachen
const list = files.filter((f) => f !== './sw.js' && !/(html2canvas|purify|index.es)-/.test(f));
const swPath = join(dist, 'sw.js');
const sw = readFileSync(swPath, 'utf8').replace(
  "c.addAll(['./', './index.html', './manifest.webmanifest'])",
  `c.addAll(${JSON.stringify(['./', ...list])})`,
);
writeFileSync(swPath, sw);
console.log(`Service Worker: ${list.length} statische Dateien vorab zwischengespeichert.`);
