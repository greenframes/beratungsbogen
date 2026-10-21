import { emptyContact } from '../state/session';
import { validateAll, validateBirthDate, validateContactStep, validateEmail, validateMobile, validateName, validateStartChoice } from '../utils/validation';

const today = new Date(2026, 9, 21);
const ok = { ...emptyContact(), firstName: 'Test', lastName: 'Person', email: 'test@example.org', mobile: '0171 1234567', birthDate: '2008-05-01', schoolLeaving: 'noch-in-schule' as const, currentSchoolType: 'realschule' as const, expectedLeavingMonth: '2027-06' };

describe('Formularvalidierung', () => {
  it('prüft Pflichtfelder mit verständlichen Meldungen', () => {
    const e = validateContactStep(1, emptyContact(), today);
    expect(Object.keys(e).sort()).toEqual(['email', 'firstName', 'lastName', 'mobile']);
    expect(e.firstName).toMatch(/Vornamen/);
    const e2 = validateContactStep(2, emptyContact(), today);
    expect(e2.birthDate).toBeDefined();
    expect(e2.schoolLeaving).toBeDefined();
    expect(e2.currentSchoolType).toBeDefined();
  });
  it('akzeptiert Namen mit Umlauten, Bindestrich und Apostroph', () => {
    ['Jürgen', 'Anna-Lena', "O'Brien", 'Müller Lüdenscheidt', 'Çelik'].forEach((n) => expect(validateName(n, 'Namen')).toBeUndefined());
    ['', '  ', '1234', '<script>', 'a'.repeat(61)].forEach((n) => expect(validateName(n, 'Namen')).toBeDefined());
  });
  it('validiert E-Mail-Format', () => {
    ['a@b.de', 'vor.nach+tag@sub.example.org'].forEach((m) => expect(validateEmail(m)).toBeUndefined());
    ['', 'abc', 'a@b', 'a b@c.de', '@c.de'].forEach((m) => expect(validateEmail(m)).toBeDefined());
  });
  it('validiert Handynummern', () => {
    ['0171 1234567', '+49 171 1234567', '0049 171 1234567', '0171/1234567'].forEach((m) => expect(validateMobile(m)).toBeUndefined());
    ['', 'abc', '1234567', '0171', '0171 abc 123', '+', '0'.repeat(30)].forEach((m) => expect(validateMobile(m)).toBeDefined());
  });
  it('prüft die Plausibilität des Geburtsdatums', () => {
    expect(validateBirthDate('2008-05-01', today)).toBeUndefined();
    expect(validateBirthDate('2030-01-01', today)).toMatch(/Zukunft/);
    expect(validateBirthDate('2024-01-01', today)).toMatch(/plausibel/);
    expect(validateBirthDate('1900-01-01', today)).toMatch(/plausibel/);
    expect(validateBirthDate('2008-02-30', today)).toMatch(/gültig/);
    expect(validateBirthDate('', today)).toBeDefined();
  });
  it('„noch in der Schule“ erfordert voraussichtlichen Abschluss und Schulform', () => {
    const e = validateContactStep(2, { ...ok, expectedLeavingMonth: '' }, today);
    expect(e.expectedLeavingMonth).toBeDefined();
    expect(validateContactStep(2, { ...ok, currentSchoolType: 'nicht-mehr' }, today).currentSchoolType).toBeDefined();
    expect(validateContactStep(2, { ...ok, expectedLeavingMonth: '2025-01' }, today).expectedLeavingMonth).toMatch(/Vergangenheit/);
    expect(validateContactStep(2, ok, today)).toEqual({});
  });
  it('prüft Konsistenz der Ausbildungswahl und Gültigkeit des Starttermins', () => {
    expect(validateStartChoice(null, { kind: 'open' }, today)).toBeDefined();
    expect(validateStartChoice('fachkraft', { kind: 'none' }, today)).toBeDefined();
    expect(validateStartChoice('fachkraft', { kind: 'open' }, today)).toBeUndefined();
    expect(validateStartChoice('fachkraft', { kind: 'confirmed', date: '2027-04-01' }, today)).toBeUndefined();
    expect(validateStartChoice('fachkraft', { kind: 'confirmed', date: '2027-05-01' }, today)).toMatch(/nicht/);
    expect(validateStartChoice('fachkraft', { kind: 'confirmed', date: '2027-04-01' }, new Date(2027, 3, 2))).toMatch(/nicht/);
    expect(validateStartChoice('assistenz', { kind: 'hypothetical', date: '2026-10-01' }, today)).toBeDefined();
    expect(validateStartChoice('assistenz', { kind: 'hypothetical', date: '2027-09-01' }, today)).toBeUndefined();
    expect(validateAll('fachkraft', { kind: 'open' }, ok, today)).toEqual({});
    expect(Object.keys(validateAll(null, { kind: 'none' }, emptyContact(), today))).toEqual(expect.arrayContaining(['program', 'start', 'email']));
  });
});
