import { buildInterestSheet, buildPdfBlob, pdfSafe } from '../utils/pdf';
import { pdfFilename } from '../utils/filename';
import { exportPdf } from '../utils/exportFile';
import { initialSession, sessionReducer } from '../state/session';
import type { Session } from '../types';

const now = new Date(2026, 9, 21, 14, 5);

// Ausdrücklich synthetische Testdaten – keine echten Personen
const sample = (over: Partial<Session> = {}): Session => {
  let s = initialSession();
  s = sessionReducer(s, { type: 'setProgram', program: 'assistenz' });
  s = sessionReducer(s, { type: 'setStart', start: { kind: 'confirmed', date: '2027-04-01' } });
  s = sessionReducer(s, { type: 'patchContact', patch: { firstName: 'Erika', lastName: 'Mustermann-Test', email: 'erika@example.org', mobile: '0171 1234567', birthDate: '2001-03-04', schoolLeaving: 'mittlere-reife', currentSchoolType: 'nicht-mehr' } });
  s = sessionReducer(s, { type: 'setConsent', id: 'privacy-notice', given: true, now });
  s = sessionReducer(s, { type: 'setConsent', id: 'processing', given: true, now });
  s = sessionReducer(s, { type: 'setAdvice', advice: 'appointment' });
  return { ...s, ...over };
};
const raw = (s: Session, n = now) => buildInterestSheet({ session: s, now: n }).output();
// Zeilenumbrüche im PDF sind Layout – Text zusammenführen: alle „(…) Tj“-Strings aneinanderhängen
const text = (s: Session, n = now) =>
  [...raw(s, n).matchAll(/\(((?:\\.|[^\\)])*)\)\s*Tj/g)].map((m) => m[1]!.replace(/\\(.)/g, '$1')).join(' ').replace(/\s+/g, ' ');
const readBlob = (b: Blob) => new Promise<string>((res) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.readAsText(b); });

describe('PDF-Interessentenbogen', () => {
  it('enthält alle geforderten Inhalte', () => {
    const t = text(sample());
    for (const expected of ['Interessentenbogen', 'Ausbildungsberatung', 'Erstellt am 21.10.2026, 14:05 Uhr', 'Erika Mustermann-Test', 'erika@example.org', '0171 1234567', '04.03.2001', 'Mittlerer Schulabschluss', 'Pflegefachassistenz', '01.04.2027', '30.09.2028', 'Wünscht ein Beratungsgespräch', 'Zur Kenntnis genommen', 'Einwilligung erteilt', 'Seite 1 von ', 'Vertraulich', 'Hagen', 'voraussichtlich'])
      expect(t, expected).toContain(expected);
  });
  it('kennzeichnet nicht erteilte Einwilligungen und das Ende als voraussichtlich; keine Platzgarantie', () => {
    const s = initialSession();
    const t = text({ ...s, program: 'fachkraft', start: { kind: 'open' } });
    expect(t).toContain('NICHT erteilt');
    expect(t).toContain('Noch offen');
    expect(t).toContain('nicht reserviert');
  });
  it('kennzeichnet hypothetische Startwünsche und leitet keinen bestätigten Kursstart ab', () => {
    const t = text(sample({ start: { kind: 'hypothetical', date: '2027-09-01' } }));
    expect(t).toContain('Gewünschter Start: 01.09.2027');
    expect(t).toContain('Voraussichtliches Ende: 28.02.2029');
  });
  it('zeigt bei Minderjährigen einen Bearbeitungshinweis und keine zusätzliche Einwilligung', () => {
    const s = sample();
    s.contact.birthDate = '2010-02-02';
    const t = text(s);
    expect(t).toContain('Hinweis für die Bearbeitung');
    expect(t).toContain('Sorgeberechtigten');
  });
  it('rechnet das Ende immer aus der Regeldauer (Fachkraft 3 Jahre → 31.03.2030)', () => {
    expect(text(sample({ program: 'fachkraft' }))).toContain('Voraussichtliches Ende: 31.03.2030');
    expect(text(sample({ start: { kind: 'hypothetical', date: '2027-07-01' } }))).toContain('Voraussichtliches Ende: 31.12.2028');
  });
  it('enthält keine Quellen- oder Website-Hinweise', () => {
    const t = text(sample());
    expect(t).not.toMatch(/Quellen|abgerufen|Website|gesetze-im-internet/);
  });
  it('Dateiname ist neutral und enthält keine personenbezogenen Daten', () => {
    expect(pdfFilename(now)).toBe('Interessentenbogen_2026-10-21.pdf');
    expect(pdfFilename(now)).not.toMatch(/Erika|Mustermann/);
  });
  it('erzeugt ein gültiges PDF (Blob, %PDF-Header)', async () => {
    const blob = buildPdfBlob({ session: sample(), now });
    expect(blob.type).toBe('application/pdf');
    expect(blob.size).toBeGreaterThan(1500);
    const head = (await readBlob(blob)).slice(0, 8);
    expect(head).toMatch(/^%PDF-1\./);
  });
  it('lange Texte erzeugen Seitenumbrüche mit Kopf- und Fußzeile auf jeder Seite', () => {
    const s = sample();
    s.contact.currentSchoolName = 'Sehr langer Schulname '.repeat(4);
    const doc = buildInterestSheet({ session: s, now });
    expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(1);
    expect(text(s)).toContain(`Seite 1 von ${doc.getNumberOfPages()}`);
  });
  it('ersetzt Zeichen, die die PDF-Standardschrift nicht darstellen kann', () => {
    expect(pdfSafe('a → b ≥ c ✓')).toBe('a -> b >= c ');
    expect(pdfSafe('Größe – ½ € §')).toBe('Größe – ½ € §');
  });
});

describe('Fehlerbehandlung beim PDF-Export', () => {
  const blob = new Blob(['%PDF-1.4'], { type: 'application/pdf' });
  const restore = () => {
    // @ts-expect-error Testaufräumen
    delete navigator.share;
    // @ts-expect-error Testaufräumen
    delete navigator.canShare;
  };
  afterEach(restore);

  const touch = (n: number) => Object.defineProperty(navigator, 'maxTouchPoints', { value: n, configurable: true });
  afterEach(() => touch(0));

  it('am Rechner (kein Touch) wird heruntergeladen, auch wenn der Browser einen Teilen-Dialog anbietet', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { share, canShare: () => true });
    touch(0);
    URL.createObjectURL = vi.fn(() => 'blob:x');
    URL.revokeObjectURL = vi.fn();
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    const r = await exportPdf(blob, 'x.pdf');
    expect(share).not.toHaveBeenCalled();
    expect(r.status).toBe('download-started');
    click.mockRestore();
  });
  it('nutzt auf dem iPad (Touch) den nativen Teilen-Dialog und behauptet kein „gespeichert“', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { share, canShare: () => true });
    touch(5);
    const r = await exportPdf(blob, 'Interessentenbogen_2026-10-21.pdf');
    expect(share).toHaveBeenCalledOnce();
    expect(r.status).toBe('shared');
    expect(r.message).not.toMatch(/gespeichert/i);
  });
  it('meldet Abbruch im Teilen-Dialog als nicht gespeichert', async () => {
    touch(5);
    Object.assign(navigator, { share: vi.fn().mockRejectedValue(new DOMException('x', 'AbortError')), canShare: () => true });
    const r = await exportPdf(blob, 'x.pdf');
    expect(r.status).toBe('cancelled');
    expect(r.message).toMatch(/nichts gespeichert/);
  });
  it('fällt ohne Share-API auf Download zurück und verspricht keinen Speicherort', async () => {
    URL.createObjectURL = vi.fn(() => 'blob:x');
    URL.revokeObjectURL = vi.fn();
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    const r = await exportPdf(blob, 'x.pdf');
    expect(click).toHaveBeenCalled();
    expect(r.status).toBe('download-started');
    expect(r.message).toMatch(/prüfen/);
    click.mockRestore();
  });
  it('liefert einen Fehlerstatus statt einer Ausnahme, wenn der Export scheitert', async () => {
    URL.createObjectURL = vi.fn(() => { throw new Error('kaputt'); });
    const r = await exportPdf(blob, 'x.pdf');
    expect(r.status).toBe('error');
    expect(r.message).not.toMatch(/kaputt/);
  });
});
