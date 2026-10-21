import { CONSENT_PURPOSES, initialConsents, isMinor, minorNotice, optionalConsentAllowed, requiredConsentsGiven, setConsent } from '../utils/consent';
import { initialSession, sessionReducer } from '../state/session';
import { POLICY } from '../data/config';

const now = new Date(2026, 9, 21, 12, 0);

describe('Alters- und Einwilligungslogik', () => {
  it('trennt Kenntnisnahme von Einwilligung und Pflicht von Freiwilligkeit', () => {
    const [ack, proc, further] = CONSENT_PURPOSES;
    expect(ack!.kind).toBe('acknowledgement');
    expect(proc!.kind).toBe('consent');
    expect(further!.required).toBe(false);
    expect(CONSENT_PURPOSES.every((p) => p.proposedBasis.length > 10)).toBe(true);
  });
  it('Kenntnisnahme allein genügt nicht', () => {
    let c = setConsent(initialConsents(), 'privacy-notice', true, now);
    expect(requiredConsentsGiven({ consents: c })).toBe(false);
    c = setConsent(c, 'processing', true, now);
    expect(requiredConsentsGiven({ consents: c })).toBe(true);
    expect(c.processing.timestamp).toBe(now.toISOString());
  });
  it('Widerruf löscht den Zeitstempel', () => {
    const c = setConsent(setConsent(initialConsents(), 'processing', true, now), 'processing', false, now);
    expect(c.processing.given).toBe(false);
    expect(c.processing.timestamp).toBeNull();
  });
  it('erkennt Minderjährige und sperrt optionale Zusatzeinwilligung bis zur rechtlichen Freigabe', () => {
    expect(isMinor('2010-01-01', now)).toBe(true);
    expect(isMinor('2008-10-21', now)).toBe(false);
    expect(isMinor('', now)).toBe(false);
    expect(POLICY.minorsMayGiveOptionalConsent).toBe(false);
    expect(optionalConsentAllowed('2010-01-01', now)).toBe(false);
    expect(optionalConsentAllowed('2000-01-01', now)).toBe(true);
    expect(minorNotice('2010-01-01', now)).toMatch(/Sorgeberechtigten/);
    expect(minorNotice('2000-01-01', now)).toBeNull();
  });
  it('erfindet keine allgemeine gesetzliche Altersgrenze', () => {
    // Der Wert ist als reiner Workflow-Hinweis dokumentiert, nicht als Rechtsbehauptung
    expect(POLICY.minorWorkflowAge).toBe(18);
    const texts = CONSENT_PURPOSES.map((p) => p.text + p.proposedBasis).join(' ');
    expect(texts).not.toMatch(/ab 16|ab 14|volljährig/i);
  });
  it('Reducer: Entzug der Hauptzustimmung entzieht auch die optionale Einwilligung und die Kanäle', () => {
    let s = initialSession();
    s = sessionReducer(s, { type: 'setConsent', id: 'processing', given: true, now });
    s = sessionReducer(s, { type: 'setConsent', id: 'further-contact', given: true, now });
    s = sessionReducer(s, { type: 'setChannels', channels: ['email'] });
    s = sessionReducer(s, { type: 'setConsent', id: 'processing', given: false, now });
    expect(s.consents['further-contact'].given).toBe(false);
    expect(s.furtherContactChannels).toEqual([]);
  });
});
