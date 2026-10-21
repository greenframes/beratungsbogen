import type { ContactData, ProgramId, StartChoice } from '../types';
import { POLICY } from '../data/config';
import { ageOn, isValidISODate, parseISODate, upcomingTerms, isFutureHypotheticalStart } from './dates';

export type FieldErrors = Partial<Record<keyof ContactData | 'program' | 'start', string>>;

const NAME_RE = /^[\p{L}][\p{L}\p{M}'’.\- ]*$/u;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const validateName = (v: string, label: string): string | undefined => {
  const t = v.trim();
  if (!t) return `Bitte gib deinen ${label} ein.`;
  if (t.length > 60) return `Der ${label} ist zu lang.`;
  if (!NAME_RE.test(t)) return `Im ${label} sind nur Buchstaben, Leerzeichen, Bindestrich und Apostroph erlaubt.`;
  return undefined;
};

export const validateEmail = (v: string): string | undefined => {
  const t = v.trim();
  if (!t) return 'Bitte gib deine E-Mail-Adresse ein.';
  if (t.length > 254 || !EMAIL_RE.test(t)) return 'Bitte prüfe die E-Mail-Adresse (Beispiel: name@beispiel.de).';
  return undefined;
};

/** Handynummer: beginnt mit 0, 00 oder +, danach 7–14 Ziffern; Leerzeichen, Bindestrich, Klammern, Schrägstrich erlaubt. */
export const validateMobile = (v: string): string | undefined => {
  const t = v.trim();
  if (!t) return 'Bitte gib deine Handynummer ein.';
  if (!/^[+\d][\d\s()\-/]*$/.test(t)) return 'Die Handynummer darf nur Ziffern, Leerzeichen, + - / ( ) enthalten.';
  if (!/^(\+|0)/.test(t)) return 'Bitte beginne die Nummer mit 0 oder +49 (Beispiel: 0171 1234567).';
  const digits = t.replace(/\D/g, '');
  if (digits.length < 8 || digits.length > 16) return 'Die Handynummer hat eine ungewöhnliche Länge. Bitte prüfe sie.';
  return undefined;
};

export const validateBirthDate = (iso: string, today: Date): string | undefined => {
  if (!iso) return 'Bitte gib dein Geburtsdatum ein.';
  if (!isValidISODate(iso)) return 'Bitte gib ein gültiges Geburtsdatum ein.';
  if (parseISODate(iso).getTime() > today.getTime()) return 'Das Geburtsdatum liegt in der Zukunft.';
  const age = ageOn(iso, today);
  if (age < POLICY.plausibleAgeMin || age > POLICY.plausibleAgeMax) return 'Bitte prüfe das Geburtsdatum – es wirkt nicht plausibel.';
  return undefined;
};

export const validateExpectedLeaving = (ym: string, today: Date): string | undefined => {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(ym)) return 'Bitte gib Monat und Jahr des voraussichtlichen Abschlusses an.';
  const [y, m] = ym.split('-').map(Number) as [number, number];
  const thisMonth = today.getFullYear() * 12 + today.getMonth();
  const given = y * 12 + (m - 1);
  if (given < thisMonth) return 'Der voraussichtliche Abschluss liegt in der Vergangenheit.';
  if (given > thisMonth + 12 * 8) return 'Der voraussichtliche Abschluss liegt sehr weit in der Zukunft. Bitte prüfe die Angabe.';
  return undefined;
};

export const validateStartChoice = (program: ProgramId | null, start: StartChoice, today: Date): string | undefined => {
  if (!program) return 'Bitte wähle zuerst eine Ausbildung.';
  switch (start.kind) {
    case 'none':
      return 'Bitte wähle einen Starttermin oder „Noch offen“.';
    case 'open':
      return undefined;
    case 'confirmed':
      return upcomingTerms(program, today).some((t) => t.date === start.date)
        ? undefined
        : 'Dieser Starttermin ist nicht (mehr) verfügbar. Bitte wähle erneut.';
    case 'hypothetical':
      return isFutureHypotheticalStart(start.date, today) ? undefined : 'Der Wunschmonat muss in der Zukunft liegen.';
  }
};

export const validateContactStep = (step: 1 | 2, c: ContactData, today: Date): FieldErrors => {
  const e: FieldErrors = {};
  if (step === 1) {
    const f = validateName(c.firstName, 'Vornamen');
    const l = validateName(c.lastName, 'Nachnamen');
    const m = validateEmail(c.email);
    const p = validateMobile(c.mobile);
    if (f) e.firstName = f;
    if (l) e.lastName = l;
    if (m) e.email = m;
    if (p) e.mobile = p;
  } else {
    const b = validateBirthDate(c.birthDate, today);
    if (b) e.birthDate = b;
    if (!c.schoolLeaving) e.schoolLeaving = 'Bitte wähle deinen Schulabschluss.';
    if (!c.currentSchoolType) e.currentSchoolType = 'Bitte wähle, welche Schule du aktuell besuchst.';
    if (c.schoolLeaving === 'noch-in-schule') {
      if (c.currentSchoolType === 'nicht-mehr') e.currentSchoolType = 'Du hast „noch in der Schule“ gewählt – bitte wähle deine Schulform.';
      const x = validateExpectedLeaving(c.expectedLeavingMonth, today);
      if (x) e.expectedLeavingMonth = x;
    }
    if (c.currentSchoolName.length > 100) e.currentSchoolName = 'Der Schulname ist zu lang (max. 100 Zeichen).';
  }
  return e;
};

export const validateAll = (
  program: ProgramId | null,
  start: StartChoice,
  c: ContactData,
  today: Date,
): FieldErrors => {
  const e: FieldErrors = { ...validateContactStep(1, c, today), ...validateContactStep(2, c, today) };
  if (!program) e.program = 'Bitte wähle eine Ausbildung.';
  const s = validateStartChoice(program, start, today);
  if (s) e.start = s;
  return e;
};
