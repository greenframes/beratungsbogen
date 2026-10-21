import type { Fact } from '../types';

/**
 * Zentrale Faktenbasis. Alle fachlichen Zahlen, die in der App erscheinen, werden
 * über `fact(id)` aus dieser Datei gelesen – es gibt keine Zahlen in Komponenten.
 *
 * status:
 *  - verified     amtliche oder von Aschke veröffentlichte Angabe, mit Quelle belegt
 *  - dynamic      belegt, ändert sich aber regelmäßig (Termine, Tarife, Statistik) → Datenstand beachten
 *  - unconfirmed  nicht bestätigt / nicht verfügbar → App zeigt „Keine verlässliche Angabe verfügbar“
 *  - illustrative nur zur Veranschaulichung, keine Tatsachenbehauptung
 */
const A = '2026-10-21';

export const FACTS: Fact[] = [
  // ───────────── Pflegefachkraft ─────────────
  { id: 'fk.duration.months', label: 'Ausbildungsdauer Pflegefachfrau/-mann (Vollzeit)', value: 36, unit: 'Monate', status: 'verified', sources: ['pflbg', 'aschke-fachkraft'], asOf: A, note: '§ 6 Abs. 1 PflBG: drei Jahre in Vollzeit; Aschke: „3 Jahre“.' },
  { id: 'fk.hours.total', label: 'Gesamtumfang laut Aschke', value: 4600, unit: 'Stunden', status: 'verified', sources: ['aschke-fachkraft'], asOf: A },
  { id: 'fk.hours.theory', label: 'Theoretischer und praktischer Unterricht (Mindestumfang)', value: 2100, unit: 'Stunden', status: 'verified', sources: ['pflaprv', 'aschke-fachkraft'], asOf: A, note: '§ 1 Abs. 2 Nr. 1 PflAPrV: mindestens 2.100 Stunden. Aschke nennt „2.100 UE“.' },
  { id: 'fk.hours.practice', label: 'Praktische Ausbildung (Mindestumfang)', value: 2500, unit: 'Stunden', status: 'verified', sources: ['pflaprv', 'aschke-fachkraft'], asOf: A, note: '§ 1 Abs. 2 Nr. 2 PflAPrV: mindestens 2.500 Stunden.' },
  { id: 'fk.practice.orientation', label: 'Orientierungseinsatz beim Träger der praktischen Ausbildung', value: 400, unit: 'Stunden', status: 'verified', sources: ['pflaprv'], asOf: A, note: 'Anlage 7 PflAPrV (gesetzlicher Rahmen, keine Aschke-Vorgabe).' },
  { id: 'fk.practice.acute', label: 'Pflichteinsatz stationäre Akutpflege', value: 400, unit: 'Stunden', status: 'verified', sources: ['pflaprv'], asOf: A },
  { id: 'fk.practice.longterm', label: 'Pflichteinsatz stationäre Langzeitpflege', value: 400, unit: 'Stunden', status: 'verified', sources: ['pflaprv'], asOf: A },
  { id: 'fk.practice.ambulatory', label: 'Pflichteinsatz ambulante Akut-/Langzeitpflege', value: 400, unit: 'Stunden', status: 'verified', sources: ['pflaprv'], asOf: A },
  { id: 'fk.practice.paediatric', label: 'Pflichteinsatz pädiatrische Versorgung', value: 120, unit: 'Stunden', status: 'verified', sources: ['pflaprv'], asOf: A, note: 'Die Fußnote der Anlage 7 enthält eine Übergangsregel bis 31.12.2024, die für spätere Starts nicht mehr relevant ist.' },
  { id: 'fk.practice.psychiatric', label: 'Pflichteinsatz psychiatrische Versorgung', value: 120, unit: 'Stunden', status: 'verified', sources: ['pflaprv'], asOf: A },
  { id: 'fk.practice.deepening', label: 'Vertiefungseinsatz', value: 500, unit: 'Stunden', status: 'verified', sources: ['pflaprv'], asOf: A },
  { id: 'fk.practice.other', label: 'Weitere Einsätze / Stunden zur freien Verteilung', value: 160, unit: 'Stunden', status: 'verified', sources: ['pflaprv'], asOf: A, note: '80 + 80 Stunden laut Anlage 7 PflAPrV.' },
  { id: 'fk.exam.interim', label: 'Zwischenprüfung zum Ende des zweiten Ausbildungsdrittels', value: 'Ende des 2. Drittels', status: 'verified', sources: ['pflbg'], asOf: A, note: '§ 6 Abs. 5 PflBG.' },
  { id: 'fk.fee.none', label: 'Schulgeld', value: 'Schulgeldfrei', status: 'verified', sources: ['aschke-fachkraft', 'pflbg'], asOf: A, note: '§ 24 Abs. 3 PflBG: Vereinbarungen über Schulgeld sind nichtig für die Auszubildenden.' },
  { id: 'fk.schedule', label: 'Unterrichtszeiten Pflegeschule', value: 'Mo.–Fr., 08:30–14:45 Uhr, Präsenz', status: 'verified', sources: ['aschke-fachkraft'], asOf: A },
  { id: 'fk.language', label: 'Sprachniveau (Aschke-Voraussetzung)', value: 'B2', status: 'verified', sources: ['aschke-fachkraft'], asOf: A },

  // ───────────── Pflegefachassistenz ─────────────
  { id: 'fa.duration.months', label: 'Ausbildungsdauer Pflegefachassistenz (Vollzeit)', value: 18, unit: 'Monate', status: 'verified', sources: ['pflfassg', 'aschke-assistenz'], asOf: A, note: '§ 5 Abs. 1 PflFAssG: 18 Monate in Vollzeit; Aschke: „1½ Jahre“. Gesetz gilt überwiegend ab 01.01.2027.' },
  { id: 'fa.hours.total', label: 'Gesamtumfang laut Aschke', value: 2330, unit: 'Stunden', status: 'verified', sources: ['aschke-assistenz', 'pflfassaprv'], asOf: A },
  { id: 'fa.hours.theory', label: 'Theoretischer und praktischer Unterricht (Mindestumfang)', value: 1050, unit: 'Stunden', status: 'verified', sources: ['pflfassaprv', 'aschke-assistenz'], asOf: A, note: '§ 2 Abs. 1 Nr. 1 PflFAssAPrV; Aschke: „1.050 UE“.' },
  { id: 'fa.hours.practice', label: 'Praktische Ausbildung (Mindestumfang)', value: 1280, unit: 'Stunden', status: 'verified', sources: ['pflfassaprv', 'aschke-assistenz'], asOf: A },
  { id: 'fa.practice.acute', label: 'Pflichteinsatz allgemeine Akutpflege (stationär)', value: 240, unit: 'Stunden', status: 'verified', sources: ['pflfassaprv'], asOf: A, note: 'Anlage 3 PflFAssAPrV; bis 31.12.2032 kann einer der Einsätze Akutpflege/ambulant um bis zu 120 Std. reduziert werden.' },
  { id: 'fa.practice.longterm', label: 'Pflichteinsatz allgemeine Langzeitpflege (stationär)', value: 240, unit: 'Stunden', status: 'verified', sources: ['pflfassaprv'], asOf: A },
  { id: 'fa.practice.ambulatory', label: 'Pflichteinsatz ambulante Akut- und Langzeitpflege', value: 240, unit: 'Stunden', status: 'verified', sources: ['pflfassaprv'], asOf: A },
  { id: 'fa.practice.extension', label: 'Verlängerung eines Einsatzes beim Träger der praktischen Ausbildung', value: 440, unit: 'Stunden', status: 'verified', sources: ['pflfassaprv'], asOf: A },
  { id: 'fa.practice.free', label: 'Stunden zur freien Verfügung (z. B. Hospiz, Reha, Pädiatrie, Psychiatrie)', value: 120, unit: 'Stunden', status: 'verified', sources: ['pflfassaprv'], asOf: A },
  { id: 'fa.fee.none', label: 'Schulgeld', value: 'Schulgeldfrei', status: 'verified', sources: ['aschke-assistenz'], asOf: A },
  { id: 'fa.language', label: 'Sprachniveau (Aschke-Voraussetzung)', value: 'B2', status: 'verified', sources: ['aschke-assistenz'], asOf: A },
  { id: 'fa.shortening.max', label: 'Mögliche Anrechnung/Verkürzung gleichwertiger Ausbildung (Obergrenze, auf Antrag)', value: '1/3', status: 'verified', sources: ['pflfassg'], asOf: A, note: '§ 11 Abs. 1 PflFAssG: auf Antrag bis zu ein Drittel der Ausbildungsdauer; Entscheidung der zuständigen Behörde.' },

  // ───────────── Vergütung während der Ausbildung ─────────────
  { id: 'pay.fk.y1', label: 'Ausbildungsvergütung 1. Ausbildungsjahr (TVAöD-Pflege, brutto/Monat, ab 01.05.2026)', value: 1490.69, unit: '€', status: 'dynamic', sources: ['tvaod-pflege'], asOf: '2026-05-01', note: 'Tarifliche Beispielwerte (öffentlicher Dienst). Gilt nur, wenn der Träger der praktischen Ausbildung tarifgebunden ist.' },
  { id: 'pay.fk.y2', label: 'Ausbildungsvergütung 2. Ausbildungsjahr (TVAöD-Pflege, brutto/Monat, ab 01.05.2026)', value: 1552.07, unit: '€', status: 'dynamic', sources: ['tvaod-pflege'], asOf: '2026-05-01' },
  { id: 'pay.fk.y3', label: 'Ausbildungsvergütung 3. Ausbildungsjahr (TVAöD-Pflege, brutto/Monat, ab 01.05.2026)', value: 1653.38, unit: '€', status: 'dynamic', sources: ['tvaod-pflege'], asOf: '2026-05-01' },
  { id: 'pay.fa.table', label: 'Ausbildungsvergütung Pflegefachassistenz (Beträge je Ausbildungsabschnitt)', value: null, status: 'unconfirmed', sources: ['pflfassg'], asOf: A, note: 'Gesetzlich ist nur eine „angemessene Ausbildungsvergütung“ vorgeschrieben (§ 17 PflFAssG). Eine belegte Tarifzuordnung für diese neue Ausbildung liegt nicht vor.' },

  // ───────────── Verdienst nach der Ausbildung (Statistik, Median) ─────────────
  { id: 'inc.fk.kranken', label: 'Medianentgelt Fachkräfte Krankenpflege (Vollzeit, brutto/Monat, DE, 31.12.2024)', value: 4329, unit: '€', status: 'dynamic', sources: ['iab-entgelte-2024'], asOf: '2024-12-31' },
  { id: 'inc.fk.alten', label: 'Medianentgelt Fachkräfte Altenpflege (Vollzeit, brutto/Monat, DE, 31.12.2024)', value: 4153, unit: '€', status: 'dynamic', sources: ['iab-entgelte-2024'], asOf: '2024-12-31' },
  { id: 'inc.fa.kranken', label: 'Medianentgelt Helfer*innenberufe Krankenpflege (Vollzeit, brutto/Monat, DE, 31.12.2024)', value: 3363, unit: '€', status: 'dynamic', sources: ['iab-entgelte-2024'], asOf: '2024-12-31', note: 'Statistische Berufsgruppe „Helfer“; nicht identisch mit der neuen bundeseinheitlichen Pflegefachassistenz.' },
  { id: 'inc.fa.alten', label: 'Medianentgelt Helfer*innenberufe Altenpflege (Vollzeit, brutto/Monat, DE, 31.12.2024)', value: 3098, unit: '€', status: 'dynamic', sources: ['iab-entgelte-2024'], asOf: '2024-12-31', note: 'Statistische Berufsgruppe „Helfer“; nicht identisch mit der neuen bundeseinheitlichen Pflegefachassistenz.' },
  { id: 'inc.tariff.entry', label: 'Tarifliche Einstiegsvergütung nach Abschluss (z. B. TVöD-P)', value: null, status: 'unconfirmed', sources: [], asOf: A, note: 'Tariftabelle noch nicht erhoben.' },

  // ───────────── Aschke Weiterbildungen ─────────────
  { id: 'wb.pa.ue', label: 'Praxisanleitung – Umfang', value: 300, unit: 'UE', status: 'verified', sources: ['aschke-praxisanleitung'], asOf: A },
  { id: 'wb.pa.experience', label: 'Praxisanleitung – Mindest-Berufserfahrung', value: 1, unit: 'Jahr', status: 'verified', sources: ['aschke-praxisanleitung'], asOf: A },
  { id: 'wb.ref.ue', label: 'Praxisanleitung Refresher – Umfang', value: 24, unit: 'UE', status: 'verified', sources: ['aschke-refresher'], asOf: A },
  { id: 'wb.pc.ue', label: 'Palliative Care – Umfang', value: 160, unit: 'UE', status: 'verified', sources: ['aschke-palliative'], asOf: A },
  { id: 'wb.pc.dates', label: 'Palliative Care – aktuelle Termine', value: null, status: 'dynamic', sources: ['aschke-palliative'], asOf: A, note: 'Aschke: „Aktuell leider keine Termine verfügbar“.' },
];

const BY_ID = new Map(FACTS.map((f) => [f.id, f]));

export const fact = (id: string): Fact => {
  const f = BY_ID.get(id);
  if (!f) throw new Error(`Unbekannte Fakt-ID: ${id}`);
  return f;
};

/** Numerischer Wert; wirft, wenn der Fakt unbestätigt ist (Schutz vor stillen Platzhaltern). */
export const num = (id: string): number => {
  const f = fact(id);
  if (typeof f.value !== 'number') throw new Error(`Fakt ${id} hat keinen belastbaren Zahlenwert`);
  return f.value;
};

export const isAvailable = (id: string): boolean => {
  const f = fact(id);
  return f.value !== null && f.status !== 'unconfirmed';
};

export const eur = (n: number): string =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: Number.isInteger(n) ? 0 : 2 }).format(n);

export const hours = (n: number): string => new Intl.NumberFormat('de-DE').format(n);
