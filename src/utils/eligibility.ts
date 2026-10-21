import type { ProgramId, SchoolLeaving } from '../types';

export type Orientation = 'wahrscheinlich' | 'pruefen';

export interface EligibilityHint {
  level: Orientation;
  headline: string;
  detail: string;
}

export const SCHOOL_LEAVING_LABELS: Record<SchoolLeaving, string> = {
  'noch-in-schule': 'Ich gehe noch zur Schule',
  ohne: 'Kein Schulabschluss',
  hauptschule9: 'Hauptschulabschluss (nach Klasse 9)',
  hauptschule10: 'Hauptschulabschluss (nach Klasse 10)',
  'mittlere-reife': 'Mittlerer Schulabschluss / Fachoberschulreife',
  fachhochschulreife: 'Fachhochschulreife',
  abitur: 'Abitur',
  berufsausbildung: 'Abgeschlossene Berufsausbildung',
  anderer: 'Anderer oder ausländischer Abschluss',
};

const ASK = 'Lass uns gemeinsam prüfen, welcher Weg zu dir passt.';

/**
 * Erste Orientierung auf Basis der veröffentlichten Zugangswege (Aschke-Website). Keine Zulassungsentscheidung.
 */
export const eligibilityHint = (program: ProgramId, leaving: SchoolLeaving | ''): EligibilityHint => {
  if (!leaving) return { level: 'pruefen', headline: ASK, detail: 'Wähle deinen Abschluss, dann zeigen wir dir eine erste Orientierung.' };

  if (program === 'fachkraft') {
    switch (leaving) {
      case 'mittlere-reife':
      case 'fachhochschulreife':
      case 'abitur':
        return { level: 'wahrscheinlich', headline: 'Das passt zu den veröffentlichten Zugangswegen.', detail: 'Aschke nennt den Mittleren Schulabschluss oder einen gleichwertig anerkannten Abschluss. Die endgültige Prüfung erfolgt durch die Pflegeschule.' };
      case 'hauptschule10':
        return { level: 'pruefen', headline: ASK, detail: 'Aschke nennt „Hauptschulabschluss Klasse 10“ gemeinsam mit „Mittlerer Schulabschluss oder gleichwertig anerkannt“. Ob dein Abschluss gleichwertig ist, prüft die Pflegeschule.' };
      case 'hauptschule9':
        return { level: 'pruefen', headline: ASK, detail: 'Mit Hauptschulabschluss nach Klasse 9 nennt Aschke den Weg über eine erfolgreich abgeschlossene Pflegefachassistenz-Ausbildung.' };
      case 'berufsausbildung':
        return { level: 'pruefen', headline: ASK, detail: 'Ob eine abgeschlossene Berufsausbildung als Zugang zählt, hängt von Art und Dauer ab. Das klären wir persönlich.' };
      case 'noch-in-schule':
        return { level: 'pruefen', headline: ASK, detail: 'Entscheidend ist dein voraussichtlicher Abschluss. Wir besprechen mit dir, wann der Einstieg möglich ist.' };
      default:
        return { level: 'pruefen', headline: ASK, detail: 'Für diesen Abschluss gibt es eine individuelle Prüfung durch die Pflegeschule.' };
    }
  }

  switch (leaving) {
    case 'hauptschule9':
    case 'hauptschule10':
    case 'mittlere-reife':
    case 'fachhochschulreife':
    case 'abitur':
    case 'berufsausbildung':
      return { level: 'wahrscheinlich', headline: 'Das passt zu den veröffentlichten Zugangswegen.', detail: 'Aschke nennt den Hauptschulabschluss oder einen gleichwertig anerkannten Abschluss. Die endgültige Prüfung erfolgt durch die Pflegeschule.' };
    case 'ohne':
      return { level: 'pruefen', headline: ASK, detail: 'Auch ohne Schulabschluss kann eine Aufnahme möglich sein – wenn die Pflegeschule einschätzt, dass du die Ausbildung erfolgreich schaffen kannst.' };
    case 'noch-in-schule':
      return { level: 'pruefen', headline: ASK, detail: 'Wir besprechen mit dir, welcher Abschluss bis zum Start möglich ist.' };
    default:
      return { level: 'pruefen', headline: ASK, detail: 'Für diesen Abschluss gibt es eine individuelle Prüfung durch die Pflegeschule.' };
  }
};
