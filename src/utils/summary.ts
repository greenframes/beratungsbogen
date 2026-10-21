import type { Session } from '../types';
import { computeEnd, fmtDate, planPeriod } from './dates';

export const periodLines = (s: Session): string[] => {
  if (!s.program) return ['Keine Ausbildung gewählt'];
  const prog = s.program;
  switch (s.start.kind) {
    case 'confirmed': {
      const p = planPeriod(prog, s.start.date);
      return [`Gewünschter Start: ${fmtDate(s.start.date)}`, `Voraussichtliches Ende: ${fmtDate(p.computedEndISO)}`];
    }
    case 'hypothetical':
      return [`Gewünschter Start: ${fmtDate(s.start.date)}`, `Voraussichtliches Ende: ${fmtDate(computeEnd(prog, s.start.date))}`];
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
