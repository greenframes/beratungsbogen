import type { ProgramId } from '../types';

export interface CareerStep {
  id: string;
  title: string;
  summary: string;
  /** Welche Qualifikation wird benötigt? */
  qualification: string;
  /** Ist Berufserfahrung erforderlich? */
  experience: { required: 'nein' | 'ja' | 'unbekannt'; detail: string };
  /** Weitere Zugangsvoraussetzungen */
  access: string;
  /** Direkt möglich oder zusätzliche Schritte? */
  path: 'direkt' | 'zusaetzliche-schritte' | 'unbekannt';
  pathDetail: string;
  sourceIds: string[];
  /** Quelle ist nur eine Nennung als Perspektive, Details sind nicht belegt */
  detailsVerified: boolean;
}

const NO_DATA = 'Wird im Beratungsgespräch geklärt';

export const CAREER: Record<ProgramId, CareerStep[]> = {
  fachkraft: [
    {
      id: 'fk-einstieg',
      title: 'Einstieg als Pflegefachfrau / Pflegefachmann',
      summary: 'Nach der staatlichen Abschlussprüfung arbeitest du in allen Versorgungsbereichen – Krankenhaus, Reha, ambulant, stationär, teilstationär oder Wohngruppe.',
      qualification: 'Erfolgreich abgeschlossene Ausbildung mit staatlicher Prüfung und Berufserlaubnis',
      experience: { required: 'nein', detail: 'Keine Berufserfahrung nötig.' },
      access: 'Erlaubnis zum Führen der Berufsbezeichnung (§ 1 PflBG)',
      path: 'direkt',
      pathDetail: 'Direkt nach bestandener Prüfung.',
      sourceIds: ['aschke-fachkraft', 'pflbg'],
      detailsVerified: true,
    },
    {
      id: 'fk-spezial',
      title: 'Berufserfahrung & fachliche Spezialisierung',
      summary: 'Mit Erfahrung kannst du dich fachlich vertiefen, zum Beispiel mit der Weiterbildung Palliative Care.',
      qualification: 'Abgeschlossene Pflegeausbildung',
      experience: { required: 'ja', detail: 'Berufliche Erfahrung aus der Pflege (Palliative Care bei Aschke).' },
      access: 'Je Weiterbildung unterschiedlich – Beispiel Palliative Care (160 UE, DGP): examinierte Pflegekraft.',
      path: 'zusaetzliche-schritte',
      pathDetail: 'Zusätzliche Weiterbildung mit eigener Anmeldung.',
      sourceIds: ['aschke-palliative', 'aschke-weiterbildung'],
      detailsVerified: true,
    },
    {
      id: 'fk-praxisanleitung',
      title: 'Praxisanleiterin / Praxisanleiter',
      summary: 'Du begleitest Auszubildende in der Praxis und wirst zur Schlüsselperson in der Pflegeausbildung.',
      qualification: 'Abgeschlossene Pflegeausbildung mit Berufserlaubnis',
      experience: { required: 'ja', detail: 'Mindestens 1 Jahr Berufserfahrung.' },
      access: 'Weiterbildung 300 UE nach § 4 PflAPrV (Aschke: 6 Module, inkl. 40 Std. Hospitation).',
      path: 'zusaetzliche-schritte',
      pathDetail: 'Zusätzliche Weiterbildung nötig; Zulassung durch den Anbieter.',
      sourceIds: ['aschke-praxisanleitung'],
      detailsVerified: true,
    },
    {
      id: 'fk-management',
      title: 'Weiterbildung im Pflegemanagement',
      summary: 'Leitungs- und Organisationsaufgaben in Einrichtungen der Pflege.',
      qualification: NO_DATA,
      experience: { required: 'unbekannt', detail: NO_DATA },
      access: `${NO_DATA} – unterscheidet sich je Anbieter.`,
      path: 'zusaetzliche-schritte',
      pathDetail: 'Zusätzliche Weiterbildung; Details in der Beratung klären.',
      sourceIds: ['aschke-fachkraft'],
      detailsVerified: false,
    },
    {
      id: 'fk-paed',
      title: 'Pädagogische Tätigkeit in der Pflegeausbildung',
      summary: 'Als pädagogische Fachkraft gestaltest du Ausbildung mit.',
      qualification: NO_DATA,
      experience: { required: 'unbekannt', detail: NO_DATA },
      access: `${NO_DATA} – unterscheidet sich je Anbieter.`,
      path: 'zusaetzliche-schritte',
      pathDetail: 'Zusätzliche Qualifikation nötig; Details in der Beratung klären.',
      sourceIds: ['aschke-fachkraft'],
      detailsVerified: false,
    },
    {
      id: 'fk-studium',
      title: 'Studium Pflegemanagement oder Pflegepädagogik',
      summary: 'Ein Studium in passenden Fachrichtungen kann den Weg in Leitung oder Lehre öffnen.',
      qualification: NO_DATA,
      experience: { required: 'unbekannt', detail: NO_DATA },
      access: `${NO_DATA} – Zugang und Anrechnung regelt die jeweilige Hochschule.`,
      path: 'zusaetzliche-schritte',
      pathDetail: 'Zusätzliches Studium mit eigener Bewerbung.',
      sourceIds: ['aschke-fachkraft'],
      detailsVerified: false,
    },
  ],
  assistenz: [
    {
      id: 'fa-einstieg',
      title: 'Berufseinstieg als Pflegefachassistenz',
      summary: 'Nach der staatlichen Abschlussprüfung steigst du direkt ins Berufsleben ein.',
      qualification: 'Erfolgreich abgeschlossene Ausbildung mit staatlicher Prüfung',
      experience: { required: 'nein', detail: 'Keine Berufserfahrung nötig.' },
      access: 'Erlaubnis zum Führen der Berufsbezeichnung (§ 1 PflFAssG)',
      path: 'direkt',
      pathDetail: 'Direkt nach bestandener Prüfung.',
      sourceIds: ['aschke-assistenz', 'pflfassg'],
      detailsVerified: true,
    },
    {
      id: 'fa-bereiche',
      title: 'Tätigkeit in passenden Versorgungsbereichen',
      summary: 'Krankenhäuser, Fach- und Rehakliniken, ambulante Pflegedienste, stationäre und teilstationäre Einrichtungen sowie Wohngruppen.',
      qualification: 'Pflegefachassistenz-Abschluss',
      experience: { required: 'nein', detail: 'Keine Berufserfahrung nötig.' },
      access: 'Stellen werden von den Arbeitgebern vergeben; es gibt keinen Anspruch auf eine bestimmte Stelle.',
      path: 'direkt',
      pathDetail: 'Bewerbung bei Arbeitgebern.',
      sourceIds: ['aschke-assistenz'],
      detailsVerified: true,
    },
    {
      id: 'fa-fachkraft',
      title: 'Weg zur Pflegefachfrau / zum Pflegefachmann',
      summary: 'Aschke nennt die Ausbildung zur Pflegefachperson und einen verkürzten Weg als mögliche Perspektive.',
      qualification: 'Pflegefachassistenz-Abschluss plus die Zugangsvoraussetzungen der Fachkraft-Ausbildung',
      experience: { required: 'nein', detail: 'Keine Berufserfahrung genannt.' },
      access: 'Anrechnung gleichwertiger Ausbildung nur auf Antrag; die zuständige Behörde entscheidet über Umfang (§ 12 PflBG). Zusage oder feste Verkürzung gibt es nicht.',
      path: 'zusaetzliche-schritte',
      pathDetail: 'Neue Ausbildung mit eigener Bewerbung; mögliche Verkürzung wird im Einzelfall geprüft.',
      sourceIds: ['aschke-assistenz', 'aschke-fachkraft', 'pflbg'],
      detailsVerified: true,
    },
    {
      id: 'fa-weiter',
      title: 'Fort- und Weiterbildungen',
      summary: 'Fortbildungen vertiefen dein Wissen und halten dich fachlich aktuell.',
      qualification: NO_DATA,
      experience: { required: 'unbekannt', detail: NO_DATA },
      access: `${NO_DATA} – die im Aschke-Programm veröffentlichten Fachweiterbildungen richten sich an Pflegefachkräfte.`,
      path: 'unbekannt',
      pathDetail: 'In der Beratung klären, welche Angebote zu dir passen.',
      sourceIds: ['aschke-assistenz', 'aschke-weiterbildung'],
      detailsVerified: false,
    },
  ],
};
