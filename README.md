# Ausbildungsberatung – Aschke Pflegeschule Hagen (iPad-Webapp)

Interaktive Webapp für Ausbildungsmessen, Schulbesuche und Beratungsgespräche der
**Aschke Seminare und Qualifizierung GmbH – Pflegeschule Hagen**. Interessierte wählen eine der beiden Ausbildungen
(Pflegefachfrau/-mann oder Pflegefachassistenz), legen einen Wunschstart fest, entdecken Ablauf, Vergütung, Verdienst und
Karrierewege, geben ihre Kontaktdaten an und erzeugen lokal einen **Interessentenbogen als PDF**.

> **Status: Entwurf zur fachlichen und datenschutzrechtlichen Freigabe.** Alle Aschke-spezifischen Inhalte stammen von der
> offiziellen Website (Abruf 21.10.2026). Nicht belegte Angaben werden als „Keine verlässliche Angabe verfügbar“ angezeigt.
> Vor dem produktiven Einsatz bitte [`docs/OFFENE-PUNKTE.md`](docs/OFFENE-PUNKTE.md) abarbeiten.

## Schnellstart

Voraussetzung: Node.js ≥ 20 (getestet mit 22).

```bash
npm install          # Abhängigkeiten installieren
npm run dev          # Entwicklungsserver (http://localhost:5173, auch im WLAN für das iPad erreichbar)
npm test             # 82 Unit-/Integrationstests (Vitest)
npm run build        # Typprüfung + Produktions-Build nach dist/ (inkl. Offline-Cache-Liste)
npm run preview      # fertigen Build lokal ansehen (http://localhost:4173)
npm run test:e2e     # Browser-Prüfung (Chromium, iPad-Formate, Offline, PDF-Download); benötigt vorherigen Build
npm run check        # Typecheck + Tests + Build in einem Schritt
```

Das Ergebnis in `dist/` ist eine rein statische Seite. Sie kann auf jedem Webserver **über HTTPS** bereitgestellt werden
(HTTPS ist für Service Worker und den iPad-Teilen-Dialog nötig). Auf dem iPad: Safari → Seite öffnen → *Teilen → Zum
Home-Bildschirm*. Danach läuft die App im Vollbild und – nach dem ersten Laden – auch ohne Internet.

## Ablauf der App

Messetauglich: **jede Seite ist ohne Scrollen sichtbar** (iPad hoch und quer), kurze Texte, keine Quellen-/Website-Hinweise.
Beträge werden nur als **„ca.“-Werte** gezeigt (Ausbildungsvergütung auf 50 € gerundet, Verdienst als gerundete Spanne).

| # | Bildschirm | Inhalt |
|---|-----------|--------|
| 1 | Willkommen | Botschaft und ein Button „Meinen Weg entdecken“; keine Dateneingabe |
| 2 | Ausbildung | Zwei Auswahlkarten |
| 3 | Start | Termin (nur Zukunft), „Noch offen“, unverbindlicher Wunschmonat; Zeitraum wird berechnet |
| 4 | Ablauf | Zeitachse, Stundenumfang, Einsatzbereiche als Icons |
| 5 | Vergütung | Fachkraft: ca.-Beträge je Ausbildungsjahr; Assistenz: Hinweis auf persönliche Beratung |
| 6 | Verdienst | Gerundete ca.-Spanne brutto pro Monat |
| 7 | Karriere | Interaktive Leiter |
| 8 | Check | Orientierung zum Schulabschluss |
| 9 | Angebote | Aschke-Kurse, Einsteiger und Weiterbildungen getrennt |
| 10 | Beratung | **Nur Ja/Nein.** Bei „Nein“ endet die App mit einer Dankesseite – es werden keine Daten abgefragt |
| 11–13 | Kontakt → Datenschutz → Abschluss | Nur bei „Ja“: Formular, Einwilligungen, PDF-Erzeugung, „Sitzung beenden“ |

## Projektstruktur

```
src/
  data/        sources.ts (Quellen) · facts.ts (zentrale Faktenbasis) · config.ts (Termine, Kontakt, Policy)
               phases.ts · careers.ts · courses.ts
  types/       gemeinsame Typen
  state/       session.tsx  – Zustand nur im Arbeitsspeicher
  utils/       dates · validation · consent · eligibility · summary · pdf · exportFile · filename
  components/  Layout, ui (Button, Notice, SourceNote …), Idle (Inaktivitäts-Reset), icons
  screens/     ein Bildschirm je Schritt
  styles/      tokens.css (Design-Tokens) · app.css
  assets/      lokale Schriften (Hanken Grotesk, Cormorant Garamond) und Aschke-Logo
  __tests__/   Tests
public/        sw.js (Service Worker, nur statische Dateien) · manifest
scripts/       precache.mjs (Offline-Dateiliste nach dem Build)
e2e/           run.mjs (Playwright-Browserprüfung)
docs/          OFFENE-PUNKTE.md · SICHERHEITSPRUEFUNG.md · TESTS.md
```

## Faktenbasis pflegen

Alle fachlichen Zahlen stehen in `src/data/facts.ts` und verweisen auf `src/data/sources.ts`. Status je Fakt:
`verified` (belegt) · `dynamic` (Datenstand beachten: Termine, Tarife, Statistik) · `unconfirmed` (kein Wert, App zeigt
„Keine verlässliche Angabe verfügbar“) · `illustrative`. Komponenten lesen Zahlen nur über `fact()`/`num()`; ein Test
verhindert hartkodierte Euro-/Stundenwerte in den Bildschirmen und prüft, dass jede Quelle existiert.

- **Neue Starttermine:** `START_TERMS` in `src/data/config.ts` (nur Termine, die Aschke veröffentlicht hat). Vergangene
  Termine blendet die App automatisch aus.
- **Weiterbildungstermine:** `src/data/courses.ts`.
- **Tarifwerte / Statistik aktualisieren:** Fakt-ID in `facts.ts` ändern, `asOf` und Quelle anpassen.
- **Buchungslink:** `BOOKING.bookingUrl` in `config.ts` – erst nach Freigabe durch Aschke eintragen.
- **Minderjährigen-Verfahren:** `POLICY` in `config.ts` (siehe unten).

## Datenschutz-Konzept (Kurzfassung)

- Verarbeitung **ausschließlich lokal im Browser**. Keine Backend-Anbindung, keine E-Mail-Übermittlung, keine Datenbank.
- Personenbezogene Daten liegen nur im React-State – **kein** `localStorage`, `sessionStorage`, IndexedDB, Cookie,
  keine URL-Parameter, keine Konsolen-Ausgabe, keine Daten im Service Worker.
- Strikte Content-Security-Policy im Build (`connect-src 'self'`, keine Fremdskripte, `form-action 'none'`).
- Schriften und Bilder sind lokal gebündelt; kein Tracking.
- PDF wird im Browser (jsPDF) erzeugt, Dateiname neutral (`Interessentenbogen_JJJJ-MM-TT.pdf`).
- Die App kann nicht prüfen, ob eine Datei gespeichert wurde, und behauptet es nie. Die Abschlussansicht weist darauf hin,
  dass die PDF **nicht verschlüsselt** ist und in einen freigegebenen Speicherort gehört.
- „Sitzung beenden“ und ein Inaktivitäts-Timer (Warnung nach 5 min, Löschung nach 5,5 min) leeren den Zustand.
- Kenntnisnahme der Datenschutzinformation, Einwilligung für den Interessentenbogen und optionale weitere Kontaktaufnahme
  sind getrennte Zwecke mit eigenem Zeitstempel. Rechtsgrundlagen sind als **Vorschlag zur rechtlichen Prüfung** markiert.
- **Minderjährige:** Das Alter wird aus dem Geburtsdatum berechnet. Für unter 18-Jährige (`POLICY.minorWorkflowAge`, reiner
  Workflow-Hinweis, keine Rechtsbehauptung) wird die optionale Zusatzeinwilligung nicht erhoben und das PDF trägt einen
  Hinweis zur Prüfung durch Aschke. Ein rechtlich geprüftes Verfahren (Zustimmung Sorgeberechtigter etc.) ist **noch
  festzulegen**.

### Empfehlung für den Messeeinsatz (nicht Teil der App)

Verwaltetes iPad (MDM) mit Gerätecode, **Geführter Zugriff/Single-App-Modus** auf die Web-App, automatische Sperre, keine
persönlichen Konten; Regel, dass jede erzeugte PDF sofort in den freigegebenen geschützten Speicher übertragen und lokal
gelöscht wird; Löschkonzept für „Dateien“/Downloads/AirDrop-Verlauf. Ob das nötig ist, entscheidet Aschke mit dem
Datenschutzbeauftragten.

## Technik

React 18 · TypeScript (strict) · Vite 6 · jsPDF · lucide-react · Vitest + Testing Library · Playwright (nur E2E-Skript).
Produktions-Abhängigkeiten: `npm audit --omit=dev` ohne Befunde (Stand 21.10.2026).

## Bekannte Grenzen

- Auf echtem **Safari/iPadOS** konnte in dieser Umgebung nicht getestet werden (Chromium-Emulation der iPad-Formate).
  Bitte vor dem Einsatz auf einem echten iPad prüfen: Teilen-Dialog, Datums-/Monatsauswahl, Tastatur, Offline-Start.
- Das Aschke-Logo und die Schriften wurden von der Aschke-Website übernommen; die Nutzungsfreigabe ist zu bestätigen.

Weiteres: [`docs/OFFENE-PUNKTE.md`](docs/OFFENE-PUNKTE.md) · [`docs/SICHERHEITSPRUEFUNG.md`](docs/SICHERHEITSPRUEFUNG.md) · [`docs/TESTS.md`](docs/TESTS.md)
