import type { ProgramId, StartTerm } from '../types';

/**
 * Konfiguration, die von Aschke gepflegt/freigegeben werden muss.
 * Alle Werte stammen aus den im Kommentar genannten Quellen (Abruf 21.10.2026).
 */
export const ORG = {
  name: 'Aschke Seminare und Qualifizierung GmbH',
  unit: 'Pflegeschule Hagen',
  // Quelle: Impressum (Sitz Witten), Standortangaben Hagen
  controller: { street: 'Ruhrstraße 22', city: '58452 Witten', phone: '02302 98 361 23', email: 'info@aschke-seminare.de' },
  hagen: { street: 'Plessenstraße 20', city: '58089 Hagen', phone: '02331 34 197 00', email: 'hagen@aschke-seminare.de' },
  // Quelle: Datenschutzerklärung, Abschnitt 9 „Betroffenenrechte“
  dataProtectionEmail: 'datenschutz@aschke-seminare.de',
  website: 'https://www.aschke-seminare.de/',
  privacyUrl: 'https://aschke-seminare.de/datenschutz/',
  imprintUrl: 'https://aschke-seminare.de/impressum/',
} as const;

/** Offizielle Kursseiten (Quelle: aschke-seminare.de, abgerufen 21.10.2026) */
export const COURSE_URLS = {
  fachkraft: 'https://aschke-seminare.de/ausbildung-zur-pflegefachkraft/',
  assistenz: 'https://aschke-seminare.de/pflegefachassistenz-ausbildung-hagen/',
  praxisanleitung: 'https://aschke-seminare.de/weiterbildung-zur-praxisanleitung/',
  refresher: 'https://aschke-seminare.de/praxisanleitung-refresher-jaehrliche-auffrischung/',
  palliative: 'https://aschke-seminare.de/palliative-care-weiterbildung/',
} as const;

/**
 * Bestätigte Starttermine der Pflegeschule. Nur Termine, die auf der offiziellen Website stehen.
 * `publishedEnd` ist das dort veröffentlichte Ende.
 */
export const START_TERMS: Record<ProgramId, StartTerm[]> = {
  fachkraft: [{ date: '2027-04-01', publishedEnd: '2030-09-30', sourceId: 'aschke-fachkraft' }],
  assistenz: [{ date: '2027-04-01', publishedEnd: '2028-09-30', sourceId: 'aschke-assistenz' }],
};

/**
 * Beratungstermin: Es ist KEIN von Aschke freigegebener Buchungslink hinterlegt.
 * Die Website nutzt Calendly (siehe README „Offene Punkte“); ein Link darf hier erst nach Freigabe
 * durch Aschke eingetragen werden. Solange `bookingUrl` null ist, zeigt die App nur die offiziellen
 * Kontaktmöglichkeiten (Telefon/E-Mail) und erfindet keine Terminverfügbarkeit.
 */
export const BOOKING: { bookingUrl: string | null } = { bookingUrl: null };

/** Datenschutz-/Minderjährigen-Konfiguration (rechtlich zu prüfen, siehe README) */
export const POLICY = {
  /** Ab diesem Alter entfällt der Minderjährigen-Hinweis. Reiner Workflow-Hinweis, KEINE rechtliche Altersgrenze. */
  minorWorkflowAge: 18,
  /** Plausibilitätsgrenzen für das Geburtsdatum (Eingabefehler abfangen, keine Zulassungsregel) */
  plausibleAgeMin: 10,
  plausibleAgeMax: 90,
  /** Zusätzliche Einwilligungen (weitere Kontaktaufnahme) für Minderjährige erst nach rechtlicher Freigabe */
  minorsMayGiveOptionalConsent: false,
  /** Geburtsdatum im PDF ausgeben (Zweck: Prüfung, ob ein Minderjährigen-Verfahren nötig ist) */
  includeBirthDateInPdf: true,
  /** Inaktivität bis Sicherheitsabfrage / Löschung (Messe-Kiosk, wechselnde Nutzer) */
  idleWarnMs: 5 * 60 * 1000,
  idleResetMs: 5 * 60 * 1000 + 30 * 1000,
  /** Datenschutzinformation Version, wird im PDF vermerkt */
  privacyInfoVersion: 'App-Entwurf 1 (rechtlich nicht freigegeben)',
} as const;
