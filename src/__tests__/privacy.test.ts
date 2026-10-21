import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const walk = (dir: string, out: string[] = []): string[] => {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (n === '__tests__') continue;
    statSync(p).isDirectory() ? walk(p, out) : /\.(ts|tsx|html|js)$/.test(n) && out.push(p);
  }
  return out;
};
const ROOT = join(__dirname, '..', '..');
const stripComments = (t: string) => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
const txt_of = (f: string) => readFileSync(f, 'utf8');
const SRC = walk(join(ROOT, 'src')).map((f) => [f, stripComments(readFileSync(f, 'utf8'))] as const);

describe('Verhinderung unerwünschter Datenpersistenz und -übertragung (statische Prüfung)', () => {
  const forbidden: [string, RegExp][] = [
    ['localStorage', /\blocalStorage\b/],
    ['sessionStorage', /\bsessionStorage\b/],
    ['IndexedDB', /\bindexedDB\b/i],
    ['Cookies', /document\.cookie/],
    ['Konsolenausgabe', /console\.(log|info|warn|error|debug|trace)/],
    ['XMLHttpRequest', /XMLHttpRequest/],
    ['sendBeacon', /sendBeacon/],
    ['WebSocket', /new WebSocket/],
    ['URL-Parameter lesen/schreiben', /location\.(search|hash)|history\.(pushState|replaceState)|URLSearchParams/],
    ['Fremd-Tracking', /google-analytics|googletagmanager|gtag\(|fbq\(|hotjar|matomo|sentry/i],
    ['eval', /\beval\(|new Function\(/],
    ['dangerouslySetInnerHTML', /dangerouslySetInnerHTML/],
  ];
  it.each(forbidden)('Quellcode enthält kein %s', (_name, re) => {
    for (const [file, txt] of SRC) expect(txt, file).not.toMatch(re);
  });
  it('einziger fetch-Aufruf lädt das lokale Logo (gleiche Herkunft), nichts wird gesendet', () => {
    const hits = SRC.filter(([, t]) => /\bfetch\(/.test(t)).map(([f]) => f);
    expect(hits.map((f) => f.replace(ROOT, ''))).toEqual(['/src/utils/pdf.ts']);
    const pdf = SRC.find(([f]) => f.endsWith('utils/pdf.ts'))![1];
    expect(pdf).toMatch(/fetch\(url\)/);
    expect(pdf).not.toMatch(/method:\s*['"]POST/i);
  });
  it('Service Worker cached nur statische GET-Ressourcen gleicher Herkunft und keine Anfragen mit Parametern', () => {
    const sw = stripComments(readFileSync(join(ROOT, 'public', 'sw.js'), 'utf8'));
    expect(sw).toMatch(/req\.method !== 'GET'/);
    expect(sw).toMatch(/url\.origin !== self\.location\.origin/);
    expect(sw).toMatch(/if \(url\.search\) return/);
    expect(sw).not.toMatch(/POST|FormData|formData|\bbody\b/);
  });
  it('index.html lädt keine Fremdskripte, Schriften oder Bilder', () => {
    const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
    expect(html).not.toMatch(/(?:src|href)="https?:\/\//);
  });
  it('Schriften und Bilder werden lokal gebündelt (keine externen URLs in CSS)', () => {
    for (const f of ['tokens.css', 'app.css']) expect(readFileSync(join(ROOT, 'src', 'styles', f), 'utf8')).not.toMatch(/url\(\s*['"]?https?:/);
  });
  it('Formularfelder schalten Browser-Autofill aus (geteiltes Gerät)', () => {
    const contact = readFileSync(join(ROOT, 'src', 'screens', 'Contact.tsx'), 'utf8');
    expect(contact.match(/autoComplete="off"/g)?.length).toBeGreaterThanOrEqual(6);
    expect(contact).not.toMatch(/autoComplete="(?!off)/);
  });
  it('mailto:/tel:-Links enthalten keine personenbezogenen Daten', () => {
    for (const [file, txt] of SRC.filter(([f]) => f.includes('/screens/') && /mailto:|tel:/.test(txt_of(f)))) expect(txt, file).not.toMatch(/session\.contact/);
  });
});
