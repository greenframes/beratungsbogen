# Offene Punkte und Freigaben (Stand 21.10.2026)

## A. Fachlich – bei Aschke zu klären

| # | Thema | Stand / Problem | Wo in der App/Code |
|---|-------|-----------------|--------------------|
| A1 | **Ende der Pflegefachkraft-Ausbildung** | Website: „3 Jahre“, aber Zeitraum 01.04.2027 bis 30.09.2030 (= 3½ Jahre). § 6 PflBG: 3 Jahre Vollzeit. Die App zeigt nur das von Aschke veröffentlichte Ende (30.09.2030); rechnerisch wären es 31.03.2030. | `START_TERMS`, Bildschirm 3, PDF |
| A2 | **Weitere Starttermine** | Veröffentlicht ist nur 01.04.2027 (beide Ausbildungen). Weitere Termine nicht bekannt – nichts erfunden. | `src/data/config.ts` |
| A3 | **Ausbildungsvergütung Fachkraft** | Nur tarifliches Beispiel (TVAöD-Pflege, ab 01.05.2026: 1.490,69 / 1.552,07 / 1.653,38 € brutto). Quelle ist eine nicht amtliche Lesefassung (Stadt Dresden). Zuordnung „§ 1 Abs. 1 Buchst. b = Pflegefachfrau/-mann“ nur über Sekundärangaben belegt → gegen den amtlichen TVAöD prüfen. Tarifstand für Start 2027 offen. Praxisträger und deren Tarifbindung sind nicht bekannt. | `pay.fk.*` |
| A4 | **Ausbildungsvergütung Pflegefachassistenz** | Keine belegte Tabelle. Gesetzlich nur „angemessene Vergütung“ (§ 17 PflFAssG). Die App zeigt „Keine verlässliche Angabe verfügbar“. | `pay.fa.table` |
| A5 | **Gehalt nach der Ausbildung** | Die App zeigt nur gerundete „ca.“-Spannen (Grundlage: IAB/BA-Mediane (Deutschland, 31.12.2024, alle Berufserfahrungsstufen; Quelle wird in der App nicht mehr genannt). Fehlen: Entgeltatlas-Werte für Berufseinsteiger/NRW, tarifliche Einstiegsvergütung (z. B. TVöD-P). Für die Assistenz nur die statistische Gruppe „Helfer“. | `inc.*` |
| A6 | **Konkrete Praxiseinsätze / Praxispartner** | Kein bestätigter Ausbildungsplan, keine belegten Kooperationspartner. Die App zeigt nur den gesetzlichen Rahmen und ein vereinfachtes Beispiel. Aschke-Seite „Praxispartner finden“ nicht eingebunden. | Bildschirm 4 |
| A7 | **Karriere-Details** | Pflegemanagement, pädagogische Tätigkeit, Studium: Aschke nennt sie nur als Perspektive. Zugang/Erfahrung sind „Keine verlässliche Angabe“. | `careers.ts` |
| A8 | **Zugangswege Pflegefachkraft** | Website nennt „Hauptschulabschluss Klasse 10“ neben „Mittlerer Schulabschluss oder gleichwertig“; § 11 PflBG nennt mittleren Schulabschluss bzw. weitere Wege. Weg „Hauptschule Kl. 9 + 1-jährige Assistenz“ – bei der neuen 18-monatigen Assistenz zu präzisieren. | Bildschirm 8 |
| A9 | **Weiterbildungstermine** | Dynamisch (Praxisanleitung, Refresher). Palliative Care: aktuell keine Termine. | `courses.ts` |
| A10 | **Weitere Aschke-Angebote** | Betreuungskraft, Externenprüfung, Kenntnisprüfung, Sprach-/Integrationskurse u. a. wurden nicht aufgenommen (andere Zielgruppen, nicht geprüft). | `courses.ts` |
| A11 | **Logo, Schriften, Bildmaterial** | Logo und Schriften stammen von der Website; Freigabe zur Nutzung bestätigen. Fotos wurden bewusst nicht verwendet. | `src/assets/` |
| A12 | **Gesetzestext Pflegefachassistenz** | PflFAssG/PflFAssAPrV gelten überwiegend ab 01.01.2027; auf gesetze-im-internet.de sind die Paragrafen noch nicht einzeln abrufbar. Wortlaut stammt von buzer.de (Sekundärquelle) → gegen BGBl. prüfen. | `pflfassg`, `pflfassaprv` |

## B. Technisch

| # | Thema |
|---|-------|
| B1 | **Test auf echtem iPad/Safari** steht aus (Teilen-Dialog mit Datei, `type=month/date`, Bildschirmtastatur, Offline-Start, Home-Bildschirm-Modus). In dieser Umgebung nur Chromium mit iPad-Formaten. |
| B2 | **Hosting:** statische Auslieferung über HTTPS; Zugriffsschutz/Domain festlegen. CSP derzeit per `<meta>` – besser zusätzlich als HTTP-Header (`frame-ancestors` geht nur per Header). |
| B3 | **Buchungssystem:** Kein freigegebener Link hinterlegt (`BOOKING.bookingUrl = null`). Die Aschke-Website nutzt Calendly (Links unter `calendly.com/…`); welcher Link für Ausbildungsberatung gilt und ob der externe Dienst eingebunden werden darf, muss Aschke/DSB entscheiden. |
| B4 | **Backend/E-Mail-Versand:** bewusst nicht umgesetzt. Falls gewünscht: eigenes Sicherheits- und Datenschutzkonzept (Transportverschlüsselung, Zugriffskonzept, Löschung, AV-Vertrag). |
| B5 | Optional: App-Icons für den Home-Bildschirm (Apple-Touch-Icon), Kiosk-Konfiguration per MDM. |

## C. Rechtlich / organisatorisch

| # | Thema |
|---|-------|
| C1 | **Datenschutzinformation und Einwilligungstexte** (`src/utils/consent.ts`, Bildschirm 11) rechtlich prüfen und freigeben. Die Website-Datenschutzerklärung beschreibt Kontaktformular und Online-Anmeldung; die iPad-App und der PDF-Export sind dort **nicht** ausdrücklich abgedeckt. |
| C2 | **Rechtsgrundlage je Zweck** festlegen (vorgeschlagen: Einwilligung Art. 6 Abs. 1 lit. a; alternativ vorvertragliche Maßnahmen lit. b). Löschfrist für Interessentenbögen festlegen; Verzeichnis der Verarbeitungstätigkeiten ergänzen; Erforderlichkeit einer DSFA prüfen. |
| C3 | **Minderjährige:** Verfahren festlegen (Einwilligungsfähigkeit, Zustimmung Sorgeberechtigter, Beratung im Beisein). Bis dahin: keine Zusatzeinwilligungen, PDF-Hinweis. `POLICY.minorWorkflowAge = 18` ist nur ein Workflow-Wert. |
| C4 | **Geburtsdatum:** Erforderlichkeit bestätigen (Zweck: Prüfung, ob Minderjährigen-Verfahren nötig) oder Abfrage streichen (`POLICY.includeBirthDateInPdf`). |
| C5 | **Umgang mit der PDF:** geschützter Speicherort, Zugriffsrechte, Löschung der lokalen Kopie, verwaltetes iPad (MDM), Geführter Zugriff, Gerätecode – organisatorische Regelung erforderlich. |
| C6 | Datenschutzerklärung der Website um die Verarbeitung durch die App ergänzen. |
