import { addMonths, ageOn, computeEnd, earliestHypotheticalStart, isFutureHypotheticalStart, parseISODate, planPeriod, upcomingTerms } from '../utils/dates';
import { START_TERMS } from '../data/config';

describe('Ausbildungsdauer und Zeitraum', () => {
  it('berechnet das Ende der Pflegefachassistenz (18 Monate) – deckt sich mit der Aschke-Website', () => {
    expect(computeEnd('assistenz', '2027-04-01')).toBe('2028-09-30');
    expect(planPeriod('assistenz', '2027-04-01').publishedEndISO).toBe('2028-09-30');
  });
  it('berechnet das Ende der Pflegefachkraft (36 Monate) und weist die Abweichung zur veröffentlichten Angabe aus', () => {
    const p = planPeriod('fachkraft', '2027-04-01');
    expect(p.computedEndISO).toBe('2030-03-31');
    expect(p.publishedEndISO).toBe('2030-09-30');
    expect(p.computedEndISO).not.toBe(p.publishedEndISO);
    expect(p.months).toBe(36);
  });
  it('berechnet die Zwischenprüfung am Ende des 2. Drittels', () => {
    expect(planPeriod('fachkraft', '2027-04-01').twoThirdsISO).toBe('2029-03-31');
  });
  it('addMonths behandelt Monatsenden und Schaltjahre', () => {
    expect(addMonths(parseISODate('2027-01-31'), 1).getDate()).toBe(28);
    expect(addMonths(parseISODate('2028-01-31'), 1).getDate()).toBe(29);
  });
  it('leitet aus einem hypothetischen Start keinen bestätigten Termin ab', () => {
    const p = planPeriod('assistenz', '2027-07-01');
    expect(p.publishedEndISO).toBeNull();
    expect(computeEnd('assistenz', '2027-07-01')).toBe('2028-12-31');
  });
  it('lehnt ungültige Daten ab', () => {
    expect(() => parseISODate('2027-02-30')).toThrow();
    expect(() => parseISODate('abc')).toThrow();
  });
});

describe('Starttermine', () => {
  it('zeigt künftige Termine', () => {
    expect(upcomingTerms('fachkraft', new Date(2026, 9, 21)).map((t) => t.date)).toEqual(['2027-04-01']);
  });
  it('blendet vergangene Termine aus – auch am Starttag selbst', () => {
    expect(upcomingTerms('fachkraft', new Date(2027, 3, 1))).toEqual([]);
    expect(upcomingTerms('assistenz', new Date(2028, 0, 1))).toEqual([]);
  });
  it('liefert eine leere Liste, wenn keine Termine bekannt sind (UI bietet dann „Noch offen“)', () => {
    expect(upcomingTerms('assistenz', new Date(2026, 9, 21), [])).toEqual([]);
  });
  it('alle konfigurierten Termine haben Quelle und gültiges Datum', () => {
    for (const terms of Object.values(START_TERMS)) for (const t of terms) { expect(t.sourceId).toMatch(/^aschke-/); expect(() => parseISODate(t.date)).not.toThrow(); }
  });
  it('freies Startdatum muss in der Zukunft (und höchstens 5 Jahre voraus) liegen', () => {
    const today = new Date(2026, 9, 21);
    expect(earliestHypotheticalStart(today)).toBe('2026-10-22');
    expect(isFutureHypotheticalStart('2026-10-21', today)).toBe(false);
    expect(isFutureHypotheticalStart('2026-10-22', today)).toBe(true);
    expect(isFutureHypotheticalStart('2040-01-01', today)).toBe(false);
    expect(isFutureHypotheticalStart('kaputt', today)).toBe(false);
  });
});

describe('Alter', () => {
  it('zählt vollendete Jahre', () => {
    expect(ageOn('2008-10-22', new Date(2026, 9, 21))).toBe(17);
    expect(ageOn('2008-10-21', new Date(2026, 9, 21))).toBe(18);
  });
});
