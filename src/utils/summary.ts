import type { Session } from '../types';
import { computeEnd, fmtDate, fmtMonthYear, planPeriod } from './dates';

export const periodLines = (s: Session): string[] => {
  if (!s.program) return ['Keine Ausbildung gewählt'];
  const prog = s.program;
  switch (s.start.kind) {
    case 'confirmed': {
      const p = planPeriod(prog, s.start.date);
      const lines = [
        `Gewünschter Start: ${fmtDate(s.start.date)} (Termin laut Aschke-Website, Stand 21.10.2026; keine Platzgarantie)`,
        `Voraussichtliches Ende (rechnerisch aus ${p.months} Monaten Regeldauer): ${fmtDate(p.computedEndISO)}`,
      ];
      if (p.publishedEndISO && p.publishedEndISO !== p.computedEndISO) {
        lines.push(`Von Aschke veröffentlichtes Ende: ${fmtDate(p.publishedEndISO)} (Abweichung bitte in der Beratung klären)`);
      } else if (p.publishedEndISO) {
        lines.push(`Von Aschke veröffentlichtes Ende: ${fmtDate(p.publishedEndISO)}`);
      }
      return lines;
    }
    case 'hypothetical':
      return [
        `Unverbindlicher Wunschmonat: ${fmtMonthYear(s.start.date)} (hypothetisch – KEIN bestätigter Kursstart)`,
        `Rechnerisches Ende bei diesem Wunsch: ${fmtDate(computeEnd(prog, s.start.date))} (nur Orientierung)`,
      ];
    case 'open':
      return ['Noch offen – Beratung zum Starttermin gewünscht'];
    default:
      return ['Kein Starttermin gewählt'];
  }
};

export const adviceLabel = (a: Session['advice']): string =>
  a === 'appointment'
    ? 'Wünscht einen Beratungstermin'
    : a === 'info'
      ? 'Wünscht zunächst weitere Informationen'
      : a === 'none'
        ? 'Wünscht aktuell keinen Termin'
        : 'Keine Angabe';
