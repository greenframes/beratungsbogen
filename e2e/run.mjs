// End-to-End-Prüfung im Browser: iPad-Hoch-/Querformat, Screenshots, Overflow-Check, PDF-Download, Offline-Verhalten.
// Aufruf: npm run build && npm run test:e2e   (Chromium-Pfad optional via CHROMIUM_PATH)
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright-core';

const OUT = process.env.E2E_OUT ?? join(process.cwd(), 'e2e', 'screenshots');
mkdirSync(OUT, { recursive: true });
const findChromium = () => {
  if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH;
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH ?? '/opt/pw-browsers';
  // Bevorzugt die Headless-Shell (alter Headless-Modus wurde aus dem vollen Chrome entfernt)
  for (const d of existsSync(base) ? readdirSync(base) : []) {
    const p = join(base, d, 'chrome-linux', 'headless_shell');
    if (d.startsWith('chromium_headless_shell') && existsSync(p)) return p;
  }
  for (const d of existsSync(base) ? readdirSync(base) : []) {
    const p = join(base, d, 'chrome-linux', 'chrome');
    if (d.startsWith('chromium-') && existsSync(p)) return p;
  }
  return undefined;
};

const PORT = 4173;
const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' });
const wait = async () => { for (let i = 0; i < 50; i++) { try { if ((await fetch(`http://localhost:${PORT}/`)).ok) return; } catch { /* warten */ } await new Promise((r) => setTimeout(r, 200)); } throw new Error('Preview-Server startet nicht'); };

const VIEWPORTS = [
  { name: 'ipad-hochkant-820x1180', width: 820, height: 1180 },
  { name: 'ipad-quer-1180x820', width: 1180, height: 820 },
  { name: 'ipad-mini-hochkant-744x1133', width: 744, height: 1133 },
  { name: 'ipad-pro-quer-1366x1024', width: 1366, height: 1024 },
  { name: 'ipad-10-quer-1080x810', width: 1080, height: 810 },
  { name: 'ipad-hochkant-768x1024', width: 768, height: 1024 },
];

const results = [];
const ok = (name, pass, detail = '') => { results.push({ name, pass, detail }); console.log(`${pass ? '✔' : '✘'} ${name}${detail ? ' – ' + detail : ''}`); };

try {
  await wait();
  const browser = await chromium.launch({ executablePath: findChromium(), args: ['--no-sandbox'] });
  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1, hasTouch: true, locale: 'de-DE', acceptDownloads: true });
    const page = await ctx.newPage();
    const errors = [];
    const external = [];
    page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) errors.push(m.text()); });
    page.on('pageerror', (e) => errors.push(String(e)));
    page.on('request', (r) => { if (!r.url().startsWith(`http://localhost:${PORT}`) && !r.url().startsWith('blob:') && !r.url().startsWith('data:')) external.push(r.url()); });
    await page.goto(`http://localhost:${PORT}/`);
    let n = 0;
    const shot = async (label) => {
      n += 1;
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      ok(`[${vp.name}] ${label}: kein horizontaler Überlauf`, overflow <= 0, `Überlauf=${overflow}px`);
      // Messetauglich: der gesamte Inhalt jeder Seite ist ohne Scrollen sichtbar
      await page.waitForTimeout(350);
      const scroll = await page.evaluate(() => { const m = document.querySelector('main'); return m ? m.scrollHeight - m.clientHeight : 0; });
      ok(`[${vp.name}] ${label}: ohne Scrollen sichtbar`, scroll <= 1, `Überstand=${scroll}px`);
      await page.screenshot({ path: join(OUT, `${vp.name}_${String(n).padStart(2, '0')}_${label}.png`), fullPage: false });
    };
    const click = (name) => page.getByRole('button', { name }).first().click();
    const radio = (name) => page.getByRole('radio', { name }).first().click();
    const next = () => page.getByRole('button', { name: /^(Weiter|Zur Zusammenfassung)/ }).last().click();

    await shot('willkommen');
    await click(/Meinen Weg entdecken/);
    await radio(/Pflegefachfrau/);
    await shot('ausbildung');
    await next();
    await page.fill('#start-date', '2027-04-01');
    await shot('start');
    await next();
    await shot('ablauf');
    await next();
    await shot('verguetung');
    await next();
    await shot('verdienst');
    await next();
    await page.getByRole('button', { name: /Praxisanleiterin/ }).click();
    await shot('karriere');
    await next();
    await page.selectOption('#check-leaving', 'mittlere-reife');
    await shot('check');
    await next();
    await shot('angebote');
    await next();
    await radio(/Ja, ich möchte ein Beratungsgespräch/);
    await shot('beratung');
    await next();
    await page.fill('#fn', 'Erika');
    await page.fill('#ln', 'Testfrau');
    await page.fill('#em', 'erika@example.org');
    await page.fill('#mo', '0171 1234567');
    await shot('kontakt1');
    await next();
    await page.fill('#bd', '2001-03-04');
    await page.selectOption('#sl', 'mittlere-reife');
    await page.selectOption('#cs', 'nicht-mehr');
    await shot('kontakt2');
    await next();
    await shot('kontakt3');
    await click(/Weiter zum Datenschutz/);
    await page.getByLabel(/Datenschutzinformation zur Kenntnis genommen/).check();
    await page.getByLabel(/Einwilligung: Interessentenbogen/).check();
    await shot('datenschutz');
    await next();
    await page.getByRole('button', { name: /PDF speichern/ }).waitFor({ timeout: 10000 });
    await shot('abschluss');
    if (vp.name.startsWith('ipad-hochkant-820')) {
      const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 10000 }), page.getByRole('button', { name: /PDF speichern/ }).click()]);
      const file = join(OUT, dl.suggestedFilename());
      await dl.saveAs(file);
      ok('PDF-Download startet mit neutralem Dateinamen', /^Interessentenbogen_\d{4}-\d{2}-\d{2}\.pdf$/.test(dl.suggestedFilename()), dl.suggestedFilename());
      await page.getByText(/Der Download wurde gestartet/).waitFor();
      const storage = await page.evaluate(async () => ({ ls: localStorage.length, ss: sessionStorage.length, idb: (await indexedDB.databases?.())?.length ?? 0, cookie: document.cookie, url: location.href }));
      ok('kein localStorage/sessionStorage/IndexedDB/Cookie nach der Sitzung', storage.ls === 0 && storage.ss === 0 && storage.idb === 0 && storage.cookie === '', JSON.stringify(storage));
      ok('URL enthält keine Parameter', !/[?#]/.test(storage.url), storage.url);
    }
    await click(/Sitzung beenden/);
    ok(`[${vp.name}] Sitzung beenden führt zur Startseite`, await page.getByRole('heading', { name: /Deine Zukunft/ }).isVisible());
    // Pfad „kein Beratungsgespräch“: keine Datenabfrage
    await click(/Meinen Weg entdecken/);
    await radio(/Pflegefachassistenz/);
    await next();
    await page.getByRole('button', { name: /Noch offen/ }).click();
    for (let i = 0; i < 7; i++) await next();
    await radio(/Nein, danke/);
    await click(/Fertig/);
    await shot('danke');
    ok(`[${vp.name}] Nein-Pfad: keine Eingabefelder`, (await page.locator('input, select, textarea').count()) === 0);
    await click(/Neu starten/);
    ok(`[${vp.name}] Neustart führt zur Startseite`, await page.getByRole('heading', { name: /Deine Zukunft/ }).isVisible());
    ok(`[${vp.name}] keine Konsolenfehler`, errors.length === 0, errors.join(' | ').slice(0, 300));
    ok(`[${vp.name}] keine Anfragen an externe Server`, external.length === 0, external.join(', '));
    await ctx.close();
  }

  // Offline-Verhalten: nach dem ersten Besuch (Service Worker aktiv) muss die App ohne Netz laden
  const ctx = await browser.newContext({ viewport: { width: 820, height: 1180 }, locale: 'de-DE' });
  const page = await ctx.newPage();
  await page.goto(`http://localhost:${PORT}/`);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await page.waitForTimeout(500);
  await ctx.setOffline(true);
  await page.reload();
  ok('Offline: App lädt aus dem Service-Worker-Cache', await page.getByRole('heading', { name: /Deine Zukunft/ }).isVisible());
  await page.getByRole('button', { name: /Meinen Weg entdecken/ }).click();
  ok('Offline: Navigation funktioniert', await page.getByRole('heading', { name: /Welche Ausbildung/ }).isVisible());
  const fontsOk = await page.evaluate(async () => { await document.fonts.ready; return [...document.fonts].some((f) => f.family.includes('Hanken') && f.status === 'loaded'); });
  ok('Offline: lokale Schrift geladen', fontsOk);
  const cacheKeys = await page.evaluate(async () => { const c = await caches.open('aschke-beratung-static-v1'); return (await c.keys()).map((r) => new URL(r.url).pathname); });
  ok('Service-Worker-Cache enthält nur statische Dateien', cacheKeys.length > 5 && cacheKeys.every((p) => /\.(js|css|woff2|png|webmanifest|html)$|\/$/.test(p)), `${cacheKeys.length} Einträge`);
  await ctx.close();
  await browser.close();
} finally {
  server.kill();
}
writeFileSync(join(OUT, 'ergebnis.json'), JSON.stringify(results, null, 2));
const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} Prüfungen bestanden.`);
process.exit(failed.length ? 1 : 0);
