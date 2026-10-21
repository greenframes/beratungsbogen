import type { ProgramId } from '../types';
import { COURSE_URLS } from './config';

export interface Course {
  id: string;
  group: 'einstieg' | 'weiterbildung';
  title: string;
  summary: string;
  audience: string;
  requirements: string[];
  /** Fakt-ID für den Umfang (verifiziert), falls vorhanden */
  durationFactId?: string;
  /** Veröffentlichte Starttermine als ISO-Bereiche (nur Weiterbildungen; Ausbildungsstarts stehen in config.START_TERMS) */
  dates?: { from: string; to: string }[];
  datesNote?: string;
  url: string;
  sourceId: string;
  forPrograms: ProgramId[];
}

/** Quelle der Termine: jeweilige Kursseite, abgerufen 21.10.2026. Termine sind dynamisch und müssen gepflegt werden. */
export const COURSES: Course[] = [
  {
    id: 'fachkraft',
    group: 'einstieg',
    title: 'Ausbildung zur Pflegefachkraft (Pflegefachfrau/-mann)',
    summary: 'Generalistische, 3-jährige Ausbildung für alle Altersstufen und Versorgungsbereiche – mit staatlicher Abschlussprüfung.',
    audience: 'Für Berufseinsteigerinnen und Berufseinsteiger',
    requirements: ['Mittlerer Schulabschluss – oder Hauptschulabschluss (Kl. 9) plus erfolgreich abgeschlossene Pflegefachassistenz', 'Ärztliche Bescheinigung zur gesundheitlichen Eignung', 'Erweitertes Führungszeugnis', 'Deutsch B2'],
    durationFactId: 'fk.duration.months',
    url: COURSE_URLS.fachkraft,
    sourceId: 'aschke-fachkraft',
    forPrograms: ['fachkraft', 'assistenz'],
  },
  {
    id: 'assistenz',
    group: 'einstieg',
    title: 'Ausbildung zur Pflegefachassistenz',
    summary: 'Generalistische Ausbildung (1½ Jahre) – Einstieg in die Pflege, Theorie und Praxis im Wechsel, staatliche Abschlussprüfung.',
    audience: 'Für Berufseinsteigerinnen und Berufseinsteiger',
    requirements: ['Hauptschulabschluss oder gleichwertig – oder Aufnahme ohne Abschluss bei positiver Einschätzung der Pflegeschule', 'Ärztliche Bescheinigung zur gesundheitlichen Eignung', 'Erweitertes Führungszeugnis', 'Deutsch B2'],
    durationFactId: 'fa.duration.months',
    url: COURSE_URLS.assistenz,
    sourceId: 'aschke-assistenz',
    forPrograms: ['fachkraft', 'assistenz'],
  },
  {
    id: 'praxisanleitung',
    group: 'weiterbildung',
    title: 'Weiterbildung Praxisanleitung',
    summary: 'Qualifizierung, um Auszubildende in der Praxis kompetent anzuleiten (6 Module, inkl. 40 Std. Hospitation).',
    audience: 'Nur nach abgeschlossener Pflegeausbildung (Pflegefachkräfte gemäß § 4 PflAPrV) – nicht für Berufseinsteiger',
    requirements: ['Abgeschlossene Pflegeausbildung mit Berufserlaubnis', 'Mindestens 1 Jahr Berufserfahrung'],
    durationFactId: 'wb.pa.ue',
    dates: [
      { from: '2026-11-09', to: '2026-11-30' },
      { from: '2026-12-07', to: '2026-12-11' },
      { from: '2027-01-11', to: '2027-01-15' },
      { from: '2027-02-22', to: '2027-02-26' },
      { from: '2027-03-01', to: '2027-03-05' },
      { from: '2027-04-12', to: '2027-04-16' },
    ],
    url: COURSE_URLS.praxisanleitung,
    sourceId: 'aschke-praxisanleitung',
    forPrograms: ['fachkraft', 'assistenz'],
  },
  {
    id: 'refresher',
    group: 'weiterbildung',
    title: 'Praxisanleitung – Refresher',
    summary: 'Jährliche berufspädagogische Fortbildung für Praxisanleitende.',
    audience: 'Nur für bereits weitergebildete Praxisanleitende – nicht für Berufseinsteiger',
    requirements: ['Abgeschlossene 300-stündige Weiterbildung zur Praxisanleitung (Nachweis bei Anmeldung)'],
    durationFactId: 'wb.ref.ue',
    dates: [
      { from: '2026-11-19', to: '2026-11-20' },
      { from: '2027-03-11', to: '2027-03-12' },
      { from: '2027-05-27', to: '2027-05-28' },
    ],
    url: COURSE_URLS.refresher,
    sourceId: 'aschke-refresher',
    forPrograms: ['fachkraft', 'assistenz'],
  },
  {
    id: 'palliative',
    group: 'weiterbildung',
    title: 'Palliative Care – zertifiziert nach DGP',
    summary: 'Praxisnahe Weiterbildung zur Begleitung schwerstkranker und sterbender Menschen (4 Blockwochen).',
    audience: 'Nur für examinierte Pflegekräfte – nicht für Berufseinsteiger',
    requirements: ['Abgeschlossene Pflegeausbildung', 'Berufliche Erfahrung aus der Pflege'],
    durationFactId: 'wb.pc.ue',
    dates: [],
    datesNote: 'Aktuell keine Termine veröffentlicht – Aschke bittet um Kontaktaufnahme.',
    url: COURSE_URLS.palliative,
    sourceId: 'aschke-palliative',
    forPrograms: ['fachkraft', 'assistenz'],
  },
];
