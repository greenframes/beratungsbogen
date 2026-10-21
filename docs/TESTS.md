# Durchgeführte Tests

Ausführung: `npm test` (82 Tests, 8 Dateien) und `npm run test:e2e` (229 Prüfungen). Testdaten sind ausdrücklich synthetisch
(z. B. „Erika Testfrau“, `example.org`) und kommen nicht in der produktiven App vor.

## Unit-/Integrationstests (Vitest)

- **dates.test.ts** – Ausbildungsdauer (18/36 Monate), Ende 30.09.2028 und 31.03.2030, Abweichung zur Aschke-Angabe,
  Monatsenden/Schaltjahr, ungültige Daten, kein bestätigter Start aus hypothetischem Wunsch, vergangene Starttermine,
  leere Terminliste, Wunschmonat nur in der Zukunft, Altersberechnung.
- **validation.test.ts** – Pflichtfelder, Namen (Umlaute, Bindestrich), E-Mail, Handynummer, Geburtsdatum-Plausibilität,
  „noch in der Schule“-Konsistenz, Starttermin-/Ausbildungskonsistenz.
- **consent.test.ts** – Kenntnisnahme ≠ Einwilligung, Pflicht/Freiwillig, Zeitstempel, Widerruf, Minderjährigen-Logik,
  keine erfundene Altersgrenze, Reducer-Kaskade beim Widerruf.
- **session.test.ts** – Auswahl beider Ausbildungen, Terminreset beim Wechsel, vollständiges Zurücksetzen.
- **facts.test.ts** – jede Quelle vorhanden (Titel, Herausgeber, URL, Abrufdatum), Stundensummen schlüssig, unbestätigte
  Fakten ohne Wert, Vergütung Assistenz ohne Beträge, Median/Brutto in Bezeichnungen, alle referenzierten Fakt-IDs
  existieren, keine hartkodierten Euro-/Stundenwerte in Bildschirmen, Weiterbildungen von Einstiegsangeboten getrennt.
- **pdf.test.ts** – PDF-Inhalte vollständig (Kontakt, Schule, Ausbildung, Zeitraum, Beratung, Einwilligungen mit
  Zeitstempel, Quellen, Kopf-/Fußzeile, Seitenzahl), Minderjährigenhinweis, hypothetischer Start, neutraler Dateiname,
  gültiger `%PDF`-Header, Sonderzeichen; Export: Teilen-Dialog, Abbruch, Download-Fallback, Fehlerstatus – ohne
  „gespeichert“-Behauptung.
- **privacy.test.ts** – statische Prüfung: kein Web-Storage/Cookie/Konsole/XHR/Beacon/URL-Parameter/Tracking/eval; einziger
  `fetch` lokal; Service Worker nur statisch; keine externen URLs in HTML/CSS; Autofill aus; Mailto ohne Personendaten.
- **flow.test.tsx** – kompletter Durchlauf in der UI: Willkommen ohne Eingabe, beide Ausbildungen, Starttermin und
  Zeitraum, Abweichung Fachkraft, vergangene Termine, Vergütung Assistenz (keine Beträge) und Fachkraft (3 Jahre, Brutto,
  Tarifhinweis), Verdienst als Median, Formularvalidierung am Feld, Minderjährigen-Datenschutz, optionale Beratung,
  PDF-Bereitschaft, Speicher/Cookie/URL leer, Zurücksetzen ohne Datenreste, Neustart-Dialog, Inaktivitäts-Reset.

## Browser-Prüfung (`e2e/run.mjs`, Chromium + iPad-Formate)

Formate: 820×1180, 768×1024, 744×1133 (hoch); 1180×820, 1080×810, 1366×1024 (quer).
Je Format alle Bildschirme (Ja- und Nein-Pfad): kein horizontaler Überlauf, **ohne Scrollen sichtbar**, keine Konsolenfehler, keine Anfragen an externe Server,
Neustart funktioniert. Zusätzlich: PDF-Download mit neutralem Dateinamen, Speicher/Cookies/IndexedDB/URL leer,
**Offline**-Betrieb (Seite lädt aus dem Cache, Navigation funktioniert, lokale Schrift geladen, Cache nur statisch).
Screenshots entstehen unter `e2e/screenshots/` (nicht versioniert).

## Nicht getestet

Echtes Safari/iPadOS (siehe README „Bekannte Grenzen“), Screenreader-Tests (VoiceOver), Lasttests auf älteren iPads.
