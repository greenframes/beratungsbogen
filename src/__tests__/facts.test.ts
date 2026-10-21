import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { FACTS, fact, isAvailable, num } from '../data/facts';
import { SOURCES, sourceById } from '../data/sources';
import { CAREER } from '../data/careers';
import { COURSES } from '../data/courses';
import { PHASES } from '../data/phases';

const walk = (dir: string, out: string[] = []): string[] => {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (n === '__tests__') continue;
    statSync(p).isDirectory() ? walk(p, out) : /\.(ts|tsx)$/.test(n) && out.push(p);
  }
  return out;
};
const SRC = join(__dirname, '..');

describe('Faktenbasis', () => {
  it('jeder belegte Fakt verweist auf existierende Quellen mit Titel, Herausgeber, URL und Abrufdatum', () => {
    for (const f of FACTS) {
      if (f.status === 'verified') expect(f.sources.length, f.id).toBeGreaterThan(0);
      f.sources.forEach((id) => expect(() => sourceById(id), `${f.id} → ${id}`).not.toThrow());
      expect(f.asOf, f.id).toBeTruthy();
    }
    for (const s of SOURCES) {
      expect(s.title && s.publisher).toBeTruthy();
      expect(s.url).toMatch(/^https:\/\//);
      expect(s.retrieved).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
  it('Fakt-IDs sind eindeutig; unbestätigte Fakten haben keinen Wert und liefern keine Zahl', () => {
    expect(new Set(FACTS.map((f) => f.id)).size).toBe(FACTS.length);
    for (const f of FACTS.filter((x) => x.status === 'unconfirmed')) {
      expect(f.value, f.id).toBeNull();
      expect(isAvailable(f.id)).toBe(false);
      expect(() => num(f.id)).toThrow();
    }
  });
  it('Stundenangaben sind in sich schlüssig (Summe der Einsätze = Gesamtumfang)', () => {
    const sum = (ids: string[]) => ids.reduce((a, i) => a + num(i), 0);
    expect(sum(['fk.practice.orientation', 'fk.practice.acute', 'fk.practice.longterm', 'fk.practice.ambulatory', 'fk.practice.paediatric', 'fk.practice.psychiatric', 'fk.practice.deepening', 'fk.practice.other'])).toBe(num('fk.hours.practice'));
    expect(num('fk.hours.theory') + num('fk.hours.practice')).toBe(num('fk.hours.total'));
    expect(sum(['fa.practice.acute', 'fa.practice.longterm', 'fa.practice.ambulatory', 'fa.practice.extension', 'fa.practice.free'])).toBe(num('fa.hours.practice'));
    expect(num('fa.hours.theory') + num('fa.hours.practice')).toBe(num('fa.hours.total'));
  });
  it('Ausbildungsvergütung: drei Jahre aufsteigend; Pflegefachassistenz nur als Spanne ohne erfundene Abschnittserhöhungen', () => {
    expect(num('pay.fk.y1')).toBeLessThan(num('pay.fk.y2'));
    expect(num('pay.fk.y2')).toBeLessThan(num('pay.fk.y3'));
    expect(num('pay.fa.lo')).toBeLessThan(num('pay.fa.hi'));
    expect(fact('pay.fa.lo').sources).toContain('aschke-angabe');
    expect(FACTS.filter((f) => f.id.startsWith('pay.fa.'))).toHaveLength(2);
  });
  it('Gehaltsangaben benennen Median, Stichtag und Quelle', () => {
    for (const id of ['inc.fk.kranken', 'inc.fk.alten', 'inc.fa.kranken', 'inc.fa.alten']) {
      expect(fact(id).label).toMatch(/Median/);
      expect(fact(id).label).toMatch(/brutto/);
      expect(fact(id).sources).toContain('iab-entgelte-2024');
    }
  });
  it('alle in Komponenten referenzierten Fakt-IDs existieren', () => {
    const ids = new Set<string>();
    for (const f of walk(SRC)) {
      const txt = readFileSync(f, 'utf8');
      for (const m of txt.matchAll(/\b(?:fact|num|isAvailable)\('([a-z]+\.[a-zA-Z.0-9]+)'\)/g)) ids.add(m[1]!);
      for (const m of txt.matchAll(/(?:hoursFactId|durationFactId):\s*'([^']+)'/g)) ids.add(m[1]!);
    }
    for (const p of Object.values(PHASES).flat()) if (p.hoursFactId) ids.add(p.hoursFactId);
    for (const c of COURSES) if (c.durationFactId) ids.add(c.durationFactId);
    expect(ids.size).toBeGreaterThan(10);
    ids.forEach((id) => expect(() => fact(id), id).not.toThrow());
  });
  it('Karrierestufen und Kurse verweisen auf existierende Quellen; unbelegte Details sind gekennzeichnet', () => {
    for (const step of Object.values(CAREER).flat()) {
      step.sourceIds.forEach((s) => expect(() => sourceById(s)).not.toThrow());
      if (!step.detailsVerified) expect(step.access + step.qualification).toMatch(/Beratungsgespräch/);
    }
    COURSES.forEach((c) => expect(() => sourceById(c.sourceId)).not.toThrow());
    // Weiterbildungen sind klar von Berufseinsteiger-Angeboten getrennt
    COURSES.filter((c) => c.group === 'weiterbildung').forEach((c) => expect(c.audience).toMatch(/nicht für Berufseinsteiger/));
  });
  it('Zahlen mit Euro- oder Stundenbezug stehen nicht hartkodiert in Bildschirmen (nur über die Faktenbasis)', () => {
    for (const f of walk(join(SRC, 'screens'))) {
      const txt = readFileSync(f, 'utf8').replace(/\/\/.*$/gm, '');
      expect(txt, f).not.toMatch(/\b\d{1,3}(?:\.\d{3})+(?:,\d+)?\s?(?:€|Euro|Stunden|UE)\b/);
      expect(txt, f).not.toMatch(/\b\d{3,},\d{2}\s?(?:€|Euro)/);
    }
  });
});
