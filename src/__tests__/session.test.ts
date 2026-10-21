import { initialSession, sessionReducer } from '../state/session';

const now = new Date(2026, 9, 21);

describe('Sitzungszustand', () => {
  it('speichert die Auswahl beider Ausbildungsgänge', () => {
    let s = sessionReducer(initialSession(), { type: 'setProgram', program: 'fachkraft' });
    expect(s.program).toBe('fachkraft');
    s = sessionReducer(s, { type: 'setProgram', program: 'assistenz' });
    expect(s.program).toBe('assistenz');
  });
  it('Wechsel der Ausbildung setzt den Starttermin zurück, gleiche Auswahl nicht', () => {
    let s = sessionReducer(initialSession(), { type: 'setProgram', program: 'fachkraft' });
    s = sessionReducer(s, { type: 'setStart', start: { kind: 'confirmed', date: '2027-04-01' } });
    expect(sessionReducer(s, { type: 'setProgram', program: 'fachkraft' }).start.kind).toBe('confirmed');
    expect(sessionReducer(s, { type: 'setProgram', program: 'assistenz' }).start.kind).toBe('none');
  });
  it('Zurücksetzen löscht sämtliche personenbezogenen Daten', () => {
    let s = initialSession();
    s = sessionReducer(s, { type: 'setProgram', program: 'assistenz' });
    s = sessionReducer(s, { type: 'patchContact', patch: { firstName: 'Test', email: 'a@b.de', birthDate: '2008-01-01' } });
    s = sessionReducer(s, { type: 'setConsent', id: 'processing', given: true, now });
    s = sessionReducer(s, { type: 'setAdvice', advice: 'appointment' });
    s = sessionReducer(s, { type: 'reset' });
    expect(s).toEqual(initialSession());
    expect(JSON.stringify(s)).not.toMatch(/Test|a@b\.de|2008/);
  });
});
