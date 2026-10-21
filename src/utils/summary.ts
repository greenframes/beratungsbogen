import type { Session } from '../types';
import { computeEnd, fmtDate, fmtMonthYear, planPeriod } from './dates';

export const periodLines = (s: Session): string[] => {
  if (!s.program) return ['Keine Ausbildung gewählt'];
  const prog = s.program;
  switch (s.start.kind) {
    case 'confirmed': {
      const p = planPeriod(prog, s.start.date);
      return [`Start: ${fmtDate(s.start.date)}`, `Voraussichtliches Ende: ${fmtDate(p.publishedEndISO ?? p.computedEndISO)}`];
    }
    case 'hypothetical':
      return [`Wunschmonat: ${fmtMonthYear(s.start.date)} (unverbindlich, kein bestätigter Kursstart)`, `Voraussichtliches Ende: ${fmtDate(computeEnd(prog, s.start.date))}`];
    case 'open':
      return ['Noch offen – Beratung zum Starttermin gewünscht'];
    default:
      return ['Kein Starttermin gewählt'];
  }
};

export const adviceLabel = (a: Session['advice']): string =>
  a === 'appointment'
    ? 'Wünscht ein Beratungsgespräch'
    : a === 'none'
      ? 'Wünscht kein Beratungsgespräch'
      : 'Keine Angabe';
