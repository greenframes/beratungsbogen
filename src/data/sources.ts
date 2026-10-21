import type { Source } from '../types';

const RETRIEVED = '2026-10-21';

/**
 * Zentrale Quellenliste. Jede Zahl und jede rechtliche Aussage in `facts.ts`
 * verweist auf mindestens eine dieser Quellen (per `id`).
 */
export const SOURCES: Source[] = [
  {
    id: 'aschke-fachkraft',
    title: '3-jährige Ausbildung zur Pflegefachkraft in Hagen',
    publisher: 'Aschke Seminare und Qualifizierung GmbH',
    url: 'https://aschke-seminare.de/ausbildung-zur-pflegefachkraft/',
    retrieved: RETRIEVED,
  },
  {
    id: 'aschke-assistenz',
    title: '1½-jährige Ausbildung zur Pflegefachassistenz in Hagen',
    publisher: 'Aschke Seminare und Qualifizierung GmbH',
    url: 'https://aschke-seminare.de/pflegefachassistenz-ausbildung-hagen/',
    retrieved: RETRIEVED,
  },
  {
    id: 'aschke-datenschutz',
    title: 'Datenschutz',
    publisher: 'Aschke Seminare und Qualifizierung GmbH',
    url: 'https://aschke-seminare.de/datenschutz/',
    retrieved: RETRIEVED,
  },
  {
    id: 'aschke-impressum',
    title: 'Impressum',
    publisher: 'Aschke Seminare und Qualifizierung GmbH',
    url: 'https://aschke-seminare.de/impressum/',
    retrieved: RETRIEVED,
  },
  {
    id: 'aschke-weiterbildung',
    title: 'Fachweiterbildungen für Pflegekräfte',
    publisher: 'Aschke Seminare und Qualifizierung GmbH',
    url: 'https://aschke-seminare.de/fachliche-weiterbildung/',
    retrieved: RETRIEVED,
  },
  {
    id: 'aschke-praxisanleitung',
    title: 'Weiterbildung Praxisanleitung',
    publisher: 'Aschke Seminare und Qualifizierung GmbH',
    url: 'https://aschke-seminare.de/weiterbildung-zur-praxisanleitung/',
    retrieved: RETRIEVED,
  },
  {
    id: 'aschke-refresher',
    title: 'Praxisanleitung Refresher – jährliche Auffrischung',
    publisher: 'Aschke Seminare und Qualifizierung GmbH',
    url: 'https://aschke-seminare.de/praxisanleitung-refresher-jaehrliche-auffrischung/',
    retrieved: RETRIEVED,
  },
  {
    id: 'aschke-palliative',
    title: 'Palliative Care – zertifiziert nach DGP',
    publisher: 'Aschke Seminare und Qualifizierung GmbH',
    url: 'https://aschke-seminare.de/palliative-care-weiterbildung/',
    retrieved: RETRIEVED,
  },
  {
    id: 'aschke-pflegeschule',
    title: 'Unsere Pflegeschule',
    publisher: 'Aschke Seminare und Qualifizierung GmbH',
    url: 'https://aschke-seminare.de/unsere-pflegeschule/',
    retrieved: RETRIEVED,
  },
  {
    id: 'pflbg',
    title: 'Gesetz über die Pflegeberufe (Pflegeberufegesetz – PflBG), §§ 6, 7, 11, 12, 19',
    publisher: 'Bundesministerium der Justiz / Gesetze im Internet',
    url: 'https://www.gesetze-im-internet.de/pflbg/',
    retrieved: RETRIEVED,
  },
  {
    id: 'pflaprv',
    title: 'Pflegeberufe-Ausbildungs- und -Prüfungsverordnung (PflAPrV), § 1 und Anlage 7',
    publisher: 'Bundesministerium der Justiz / Gesetze im Internet',
    url: 'https://www.gesetze-im-internet.de/pflaprv/',
    retrieved: RETRIEVED,
  },
  {
    id: 'pflfassg',
    title: 'Gesetz über den Pflegefachassistenzberuf (Pflegefachassistenzgesetz – PflFAssG), §§ 5, 6, 10, 11, 17',
    publisher: 'Bundesministerium der Justiz / Gesetze im Internet (Gesetz gilt überwiegend ab 01.01.2027)',
    url: 'https://www.gesetze-im-internet.de/pflfassg/',
    retrieved: RETRIEVED,
    note:
      'Auf gesetze-im-internet.de sind die noch nicht geltenden Paragrafen nicht einzeln abrufbar. ' +
      'Der Wortlaut wurde über die Konsolidierung auf buzer.de (https://www.buzer.de/5_PflFAssG.htm) gelesen – Sekundärquelle, vor Produktivbetrieb gegen das Bundesgesetzblatt prüfen.',
  },
  {
    id: 'pflfassaprv',
    title: 'Pflegefachassistenz-Ausbildungs- und -Prüfungsverordnung (PflFAssAPrV), § 2, § 4 und Anlage 3 (BGBl. 2026 I Nr. 166)',
    publisher: 'Bundesrepublik Deutschland (Bundesgesetzblatt) – Geltung ab 01.01.2027',
    url: 'https://www.buzer.de/2_PflFAssAPrV.htm',
    retrieved: RETRIEVED,
    note: 'Sekundärquelle (buzer.de, konsolidierter Text). Vor Produktivbetrieb gegen das Bundesgesetzblatt prüfen.',
  },
  {
    id: 'tvaod-pflege',
    title: 'Tarifvertrag für Auszubildende des öffentlichen Dienstes – Besonderer Teil Pflege (TVAöD-Pflege), § 8, Stand Änderungstarifvertrag Nr. 18 vom 06.04.2025 (nicht amtliche Lesefassung)',
    publisher: 'Landeshauptstadt Dresden, Personalamt (Lesefassung)',
    url: 'https://www.dresden.de/media/pdf/personalamt/TVAoeD-Pflege.pdf',
    retrieved: RETRIEVED,
    note:
      'Nicht amtliche Lesefassung eines öffentlichen Arbeitgebers. Die Zuordnung der Tabelle „§ 1 Abs. 1 Buchst. b“ zur Pflegefachfrau/zum Pflegefachmann ' +
      'beruht auf Sekundärangaben und ist vor Produktivbetrieb gegen den TVAöD Allgemeiner Teil zu prüfen.',
  },
  {
    id: 'iab-entgelte-2024',
    title: 'Entgelte von Pflegekräften 2024 (Aktuelle Daten und Indikatoren, 20.08.2025)',
    publisher: 'Institut für Arbeitsmarkt- und Berufsforschung (IAB) der Bundesagentur für Arbeit',
    url: 'https://doku.iab.de/arbeitsmarktdaten/Entgelte_von_Pflegekraeften_2024.pdf',
    retrieved: RETRIEVED,
    note:
      'Medianentgelte sozialversicherungspflichtig Vollzeitbeschäftigter (ohne Auszubildende), Stichtag 31.12.2024, Deutschland, brutto pro Monat. ' +
      'Gilt für alle Beschäftigten der Berufsgruppe, nicht nur für Berufseinsteiger.',
  },
];

export const sourceById = (id: string): Source => {
  const s = SOURCES.find((x) => x.id === id);
  if (!s) throw new Error(`Unbekannte Quelle: ${id}`);
  return s;
};
