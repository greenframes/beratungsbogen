import type { ConsentPurposeId, ConsentRecord, Session } from '../types';
import { POLICY } from '../data/config';
import { ageOn } from './dates';

export interface ConsentPurpose {
  id: ConsentPurposeId;
  kind: 'acknowledgement' | 'consent';
  required: boolean;
  title: string;
  text: string;
  /** Vorgeschlagene Rechtsgrundlage – ausdrücklich zur rechtlichen Prüfung durch Aschke/DSB */
  proposedBasis: string;
}

export const CONSENT_PURPOSES: ConsentPurpose[] = [
  {
    id: 'privacy-notice',
    kind: 'acknowledgement',
    required: true,
    title: 'Datenschutzinformation zur Kenntnis genommen',
    text: 'Ich habe die Datenschutzinformation gelesen. Das ist noch keine Einwilligung.',
    proposedBasis: 'Informationspflicht nach Art. 13 DSGVO (keine Einwilligung).',
  },
  {
    id: 'processing',
    kind: 'consent',
    required: true,
    title: 'Einwilligung: Interessentenbogen für die Ausbildungsberatung',
    text: 'Ich willige ein, dass meine Angaben für die Beratung zu meiner gewählten Ausbildung als Interessentenbogen (PDF) erstellt und von Aschke dafür bearbeitet werden.',
    proposedBasis: 'Einwilligung nach Art. 6 Abs. 1 lit. a DSGVO – Rechtsgrundlage vor Produktivbetrieb zu prüfen (alternativ vorvertragliche Maßnahmen, lit. b).',
  },
  {
    id: 'further-contact',
    kind: 'consent',
    required: false,
    title: 'Freiwillig: Weitere Kontaktaufnahme',
    text: 'Ich bin damit einverstanden, dass Aschke mich über die angegebenen Kanäle zu meinem Beratungswunsch kontaktiert.',
    proposedBasis: 'Einwilligung nach Art. 6 Abs. 1 lit. a DSGVO, jederzeit widerrufbar – zu prüfen.',
  },
];

export const purposeById = (id: ConsentPurposeId): ConsentPurpose => {
  const p = CONSENT_PURPOSES.find((x) => x.id === id);
  if (!p) throw new Error(`Unbekannter Zweck: ${id}`);
  return p;
};

export const initialConsents = (): Record<ConsentPurposeId, ConsentRecord> => ({
  'privacy-notice': { purpose: 'privacy-notice', kind: 'acknowledgement', given: false, timestamp: null },
  processing: { purpose: 'processing', kind: 'consent', given: false, timestamp: null },
  'further-contact': { purpose: 'further-contact', kind: 'consent', given: false, timestamp: null },
});

export const isMinor = (birthISO: string, now: Date): boolean =>
  birthISO !== '' && ageOn(birthISO, now) < POLICY.minorWorkflowAge;

/** Darf die zusätzliche (optionale) Einwilligung angeboten werden? Minderjährige erst nach rechtlicher Freigabe. */
export const optionalConsentAllowed = (birthISO: string, now: Date): boolean =>
  !isMinor(birthISO, now) || POLICY.minorsMayGiveOptionalConsent;

export const requiredConsentsGiven = (s: Pick<Session, 'consents'>): boolean =>
  CONSENT_PURPOSES.filter((p) => p.required).every((p) => s.consents[p.id].given);

export const setConsent = (
  consents: Record<ConsentPurposeId, ConsentRecord>,
  id: ConsentPurposeId,
  given: boolean,
  now: Date,
): Record<ConsentPurposeId, ConsentRecord> => ({
  ...consents,
  [id]: { ...consents[id], given, timestamp: given ? now.toISOString() : null },
});

/** Aus dem Alter ergibt sich ein Hinweis für die Mitarbeitenden – keine Entscheidung der App. */
export const minorNotice = (birthISO: string, now: Date): string | null =>
  isMinor(birthISO, now)
    ? 'Minderjährig: Vor der Bearbeitung muss Aschke prüfen, ob eine Zustimmung der Sorgeberechtigten bzw. ein besonderes Verfahren erforderlich ist. Zusätzliche Einwilligungen werden nicht erhoben.'
    : null;
