export type ProgramId = 'fachkraft' | 'assistenz';

export type FactStatus = 'verified' | 'dynamic' | 'unconfirmed' | 'illustrative';

export interface Source {
  id: string;
  title: string;
  publisher: string;
  url: string;
  /** Abrufdatum (ISO) */
  retrieved: string;
  /** Hinweis zur Verlässlichkeit, z. B. Sekundärquelle */
  note?: string;
}

export interface Fact {
  id: string;
  label: string;
  value: string | number | null;
  unit?: string;
  status: FactStatus;
  sources: string[];
  /** Datenstand / Gültigkeit (ISO oder Freitext) */
  asOf: string;
  note?: string;
}

export interface StartTerm {
  /** ISO-Datum des bestätigten Starts */
  date: string;
  /** Von Aschke veröffentlichtes Ende (falls vorhanden) */
  publishedEnd?: string;
  sourceId: string;
}

export type StartChoice =
  | { kind: 'none' }
  | { kind: 'confirmed'; date: string }
  | { kind: 'hypothetical'; date: string }
  | { kind: 'open' };

export type SchoolLeaving =
  | 'ohne'
  | 'hauptschule9'
  | 'hauptschule10'
  | 'mittlere-reife'
  | 'fachhochschulreife'
  | 'abitur'
  | 'berufsausbildung'
  | 'anderer'
  | 'noch-in-schule';

export type CurrentSchoolType =
  | 'nicht-mehr'
  | 'hauptschule'
  | 'realschule'
  | 'sekundarschule'
  | 'gesamtschule'
  | 'gymnasium'
  | 'berufskolleg'
  | 'foerderschule'
  | 'andere';

export type ContactChannel = 'email' | 'telefon';

export interface ContactData {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  /** ISO yyyy-mm-dd */
  birthDate: string;
  schoolLeaving: SchoolLeaving | '';
  currentSchoolType: CurrentSchoolType | '';
  /** Optional, freiwillig */
  currentSchoolName: string;
  /** yyyy-mm, nur bei „noch in der Schule“ */
  expectedLeavingMonth: string;
}

export type ConsentPurposeId = 'privacy-notice' | 'processing' | 'further-contact';

export interface ConsentRecord {
  purpose: ConsentPurposeId;
  /** Kenntnisnahme ist keine Einwilligung */
  kind: 'acknowledgement' | 'consent';
  given: boolean;
  /** ISO-Zeitstempel; null wenn nicht erteilt */
  timestamp: string | null;
}

export type AdviceWish = 'appointment' | 'none' | '';

export interface Session {
  program: ProgramId | null;
  start: StartChoice;
  contact: ContactData;
  consents: Record<ConsentPurposeId, ConsentRecord>;
  furtherContactChannels: ContactChannel[];
  advice: AdviceWish;
}
