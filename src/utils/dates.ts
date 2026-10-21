import type { ProgramId, StartTerm } from '../types';
import { START_TERMS } from '../data/config';
import { num } from '../data/facts';

/** ISO-Datum (yyyy-mm-dd) → Date in lokaler Zeit (ohne Zeitzonen-Verschiebung). */
export const parseISODate = (iso: string): Date => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) throw new Error(`Ungültiges Datum: ${iso}`);
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  if (d.getFullYear() !== Number(m[1]) || d.getMonth() !== Number(m[2]) - 1 || d.getDate() !== Number(m[3])) {
    throw new Error(`Ungültiges Datum: ${iso}`);
  }
  return d;
};

export const toISODate = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const isValidISODate = (iso: string): boolean => {
  try {
    parseISODate(iso);
    return true;
  } catch {
    return false;
  }
};

/** Addiert Kalendermonate; der Tag bleibt erhalten, sonst Monatsende (31.01. + 1 Monat → 28./29.02.). */
export const addMonths = (d: Date, months: number): Date => {
  const target = new Date(d.getFullYear(), d.getMonth() + months, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(d.getDate(), lastDay));
  return target;
};

export const addDays = (d: Date, days: number): Date => {
  const r = new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);
  return r;
};

export const DURATION_MONTHS: Record<ProgramId, () => number> = {
  fachkraft: () => num('fk.duration.months'),
  assistenz: () => num('fa.duration.months'),
};

/** Rechnerisches Ende: Start + Dauer − 1 Tag (z. B. 01.04.2027 + 18 Monate → 30.09.2028). */
export const computeEnd = (program: ProgramId, startISO: string): string => {
  const start = parseISODate(startISO);
  return toISODate(addDays(addMonths(start, DURATION_MONTHS[program]()), -1));
};

export interface PlannedPeriod {
  startISO: string;
  /** rechnerisches Ende aus der gesetzlichen Regeldauer */
  computedEndISO: string;
  /** von Aschke veröffentlichtes Ende (nur bei bestätigtem Starttermin) */
  publishedEndISO: string | null;
  months: number;
  /** Ende der beiden ersten Ausbildungsdrittel (Zwischenprüfung Fachkraft, § 6 Abs. 5 PflBG) */
  twoThirdsISO: string;
}

export const planPeriod = (program: ProgramId, startISO: string, terms: StartTerm[] = START_TERMS[program]): PlannedPeriod => {
  const months = DURATION_MONTHS[program]();
  const start = parseISODate(startISO);
  const term = terms.find((t) => t.date === startISO);
  return {
    startISO,
    computedEndISO: computeEnd(program, startISO),
    publishedEndISO: term?.publishedEnd ?? null,
    months,
    twoThirdsISO: toISODate(addDays(addMonths(start, Math.round((months * 2) / 3)), -1)),
  };
};

/** Zukünftige, bestätigte Starttermine (heute zählt als noch möglich nicht – Start muss nach heute liegen). */
export const upcomingTerms = (program: ProgramId, today: Date, terms: StartTerm[] = START_TERMS[program]): StartTerm[] => {
  const t0 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return terms
    .filter((t) => parseISODate(t.date).getTime() > t0.getTime())
    .sort((a, b) => a.date.localeCompare(b.date));
};

/** Frühestes wählbares Startdatum: morgen (ein Start muss in der Zukunft liegen). */
export const earliestHypotheticalStart = (today: Date): string =>
  toISODate(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1));

export const isFutureHypotheticalStart = (iso: string, today: Date): boolean =>
  isValidISODate(iso) && iso >= earliestHypotheticalStart(today) && iso <= toISODate(new Date(today.getFullYear() + 5, today.getMonth(), today.getDate()));

export const fmtDate = (iso: string): string =>
  parseISODate(iso).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });

export const fmtMonthYear = (iso: string): string =>
  parseISODate(iso).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });

export const fmtDateTime = (d: Date): string =>
  `${d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}, ${d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr`;

/** Alter in vollendeten Jahren am Stichtag. */
export const ageOn = (birthISO: string, on: Date): number => {
  const b = parseISODate(birthISO);
  let age = on.getFullYear() - b.getFullYear();
  const hadBirthday =
    on.getMonth() > b.getMonth() || (on.getMonth() === b.getMonth() && on.getDate() >= b.getDate());
  if (!hadBirthday) age -= 1;
  return age;
};
