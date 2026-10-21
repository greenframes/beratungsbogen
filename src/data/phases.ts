import type { ProgramId } from '../types';

export interface Phase {
  id: string;
  title: string;
  icon: 'school' | 'hospital' | 'home' | 'bed' | 'baby' | 'brain' | 'target' | 'exam' | 'award' | 'compass';
  /** Fakt-ID für den Stundenumfang (falls vorhanden) */
  hoursFactId?: string;
  setting: string;
  learn: string;
  why: string;
  /** Rahmenvorgabe = gesetzlicher Rahmen, keine Aussage über Aschkes Ausbildungsplan */
  kind: 'unterricht' | 'einsatz' | 'pruefung';
}

const SCHOOL: Phase = {
  id: 'school',
  title: 'Unterricht an der Pflegeschule',
  icon: 'school',
  setting: 'Pflegeschule Hagen (Präsenz, Mo.–Fr.)',
  learn: 'Pflege, Medizin, Kommunikation, Ethik und rechtliche Grundlagen – im Klassenverband und in praxisnahen Übungsräumen.',
  why: 'Du verstehst, was du in der Praxis tust und warum – das gibt dir Sicherheit am Bett und im Team.',
  kind: 'unterricht',
};

export const PHASES: Record<ProgramId, Phase[]> = {
  fachkraft: [
    SCHOOL,
    { id: 'orient', title: 'Orientierungseinsatz', icon: 'compass', hoursFactId: 'fk.practice.orientation', setting: 'Beim Träger der praktischen Ausbildung', learn: 'Du lernst deine Einrichtung, das Team und erste Abläufe kennen.', why: 'Ein guter Start macht es leichter, Theorie und Praxis zu verbinden.', kind: 'einsatz' },
    { id: 'acute', title: 'Stationäre Akutpflege', icon: 'hospital', hoursFactId: 'fk.practice.acute', setting: 'z. B. Krankenhaus', learn: 'Pflege von Menschen mit akuten Erkrankungen, Beobachten, Dokumentieren, Zusammenarbeit mit Ärzteteam.', why: 'Hier lernst du, schnell Veränderungen zu erkennen und angemessen zu handeln.', kind: 'einsatz' },
    { id: 'long', title: 'Stationäre Langzeitpflege', icon: 'bed', hoursFactId: 'fk.practice.longterm', setting: 'z. B. Pflegeeinrichtung', learn: 'Langfristige Begleitung von Menschen mit Pflegebedarf, Alltagsgestaltung, Beziehung aufbauen.', why: 'Du erlebst, wie Pflege Lebensqualität über lange Zeit prägt.', kind: 'einsatz' },
    { id: 'amb', title: 'Ambulante Akut-/Langzeitpflege', icon: 'home', hoursFactId: 'fk.practice.ambulatory', setting: 'z. B. ambulanter Pflegedienst', learn: 'Pflege bei den Menschen zu Hause, Zusammenarbeit mit Angehörigen, eigenständiges Arbeiten.', why: 'Du lernst, Verantwortung zu übernehmen und Situationen vor Ort flexibel zu lösen.', kind: 'einsatz' },
    { id: 'paed', title: 'Pädiatrische Versorgung', icon: 'baby', hoursFactId: 'fk.practice.paediatric', setting: 'Kinder- und Jugendbereich', learn: 'Pflege von Kindern und Jugendlichen und die Einbindung ihrer Familien.', why: 'Die generalistische Ausbildung bereitet auf Menschen aller Altersstufen vor.', kind: 'einsatz' },
    { id: 'psych', title: 'Psychiatrische Versorgung', icon: 'brain', hoursFactId: 'fk.practice.psychiatric', setting: 'Psychiatrischer Bereich', learn: 'Pflege und Begleitung von Menschen mit psychischen Erkrankungen.', why: 'Du lernst, Menschen ganzheitlich wahrzunehmen.', kind: 'einsatz' },
    { id: 'deep', title: 'Vertiefungseinsatz', icon: 'target', hoursFactId: 'fk.practice.deepening', setting: 'Beim Träger, in einem Bereich mit Pflichteinsatz', learn: 'Du vertiefst einen Versorgungsbereich und arbeitest selbstständiger.', why: 'So wächst du in den Bereich hinein, der zu dir passt.', kind: 'einsatz' },
    { id: 'exam', title: 'Staatliche Abschlussprüfung', icon: 'exam', setting: 'Prüfung nach den gesetzlichen Vorgaben', learn: 'Du zeigst, dass du die Kompetenzen der Ausbildung sicher beherrschst.', why: 'Mit bestandener Prüfung erhältst du die Berufserlaubnis.', kind: 'pruefung' },
  ],
  assistenz: [
    SCHOOL,
    { id: 'acute', title: 'Allgemeine Akutpflege (stationär)', icon: 'hospital', hoursFactId: 'fa.practice.acute', setting: 'z. B. Krankenhaus', learn: 'Mitwirken an der Pflege akut erkrankter Menschen unter Anleitung.', why: 'Du lernst Abläufe und Grundlagen der Versorgung kennen.', kind: 'einsatz' },
    { id: 'long', title: 'Allgemeine Langzeitpflege (stationär)', icon: 'bed', hoursFactId: 'fa.practice.longterm', setting: 'z. B. Pflegeeinrichtung', learn: 'Alltagsnahe Pflege und Begleitung von Menschen mit Pflegebedarf.', why: 'Du übst Beziehung, Alltagshilfe und Pflegemaßnahmen.', kind: 'einsatz' },
    { id: 'amb', title: 'Ambulante Akut- und Langzeitpflege', icon: 'home', hoursFactId: 'fa.practice.ambulatory', setting: 'z. B. ambulanter Pflegedienst', learn: 'Pflegemaßnahmen im häuslichen Umfeld.', why: 'Du lernst, im Umfeld der Menschen zu arbeiten.', kind: 'einsatz' },
    { id: 'ext', title: 'Verlängerter Einsatz beim Träger', icon: 'target', hoursFactId: 'fa.practice.extension', setting: 'Beim Träger der praktischen Ausbildung', learn: 'Einer der Pflichteinsätze wird beim Träger verlängert (Reihenfolge laut Ausbildungsplan).', why: 'Mehr Zeit in einem Bereich schafft Routine und Sicherheit.', kind: 'einsatz' },
    { id: 'free', title: 'Stunden zur freien Verfügung', icon: 'compass', hoursFactId: 'fa.practice.free', setting: 'z. B. Hospiz, Reha, Pädiatrie, Psychiatrie', learn: 'Einblicke in weitere Arbeitsfelder der Pflege.', why: 'So findest du heraus, welche Bereiche dich besonders interessieren.', kind: 'einsatz' },
    { id: 'exam', title: 'Staatliche Abschlussprüfung', icon: 'exam', setting: 'Prüfung nach den gesetzlichen Vorgaben', learn: 'Du zeigst, dass du die Kompetenzen der Ausbildung sicher beherrschst.', why: 'Mit bestandener Prüfung erhältst du die Berufserlaubnis.', kind: 'pruefung' },
  ],
};
