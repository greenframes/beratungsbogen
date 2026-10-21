# Sicherheits- und Datenschutzprüfung (technisch, Stand 21.10.2026)

Automatisiert abgesichert in `src/__tests__/privacy.test.ts`, `flow.test.tsx` und `e2e/run.mjs`.

| Prüfpunkt | Ergebnis | Nachweis |
|-----------|----------|----------|
| Keine personenbezogenen Daten in URL-Parametern | ✔ Quellcode ohne `location.search/hash`, `history.*`; E2E prüft URL nach vollständigem Durchlauf | privacy.test, e2e |
| Keine Daten in Logs | ✔ kein `console.*` im Quellcode; E2E ohne Konsolenfehler/-warnungen | privacy.test, e2e |
| Kein persistenter Browser-Speicher | ✔ kein localStorage/sessionStorage/IndexedDB/Cookie; Laufzeitprüfung nach Durchlauf: alle leer | privacy.test, flow.test, e2e |
| Keine Tracking-/Analyse-Skripte | ✔ keine Fremdskripte; E2E: 0 Anfragen an fremde Hosts | privacy.test, e2e |
| Keine Übertragung an externe APIs | ✔ einziger `fetch` lädt das lokale Logo (gleiche Herkunft); CSP `connect-src 'self'` | privacy.test |
| Keine offenen Endpunkte | ✔ kein Backend, keine Schnittstellen | – |
| Keine unkontrollierten Dateizugriffe | ✔ keine Datei-Uploads/-Inputs; PDF nur als Blob im Speicher | – |
| Keine ungesicherten Exportdateien | ⚠ PDF ist nicht verschlüsselt (technisch nicht vorgesehen) → organisatorische Regelung, Hinweis in der App | docs C5 |
| Keine unnötigen Berechtigungen | ✔ keine Kamera/Standort/Mikrofon; kein Clipboard | – |
| Keine unnötige Datenerhebung | ✔ nur geforderte Felder; Schulname freiwillig; keine Ausweise/Uploads | Contact.tsx |
| Keine manipulierbaren Berechnungen | ✔ Zeitraum aus Fakt (Monate) + geprüftem Startdatum (ISO-Validierung); Starttermin aus Konfiguration; hypothetische Wünsche als solche gekennzeichnet | dates.test |
| Keine veralteten/unbelegten Angaben als Fakten | ✔ Quellen/Datenstand je Fakt; unbestätigte Werte → „Keine verlässliche Angabe“; vergangene Termine ausgeblendet | facts.test, flow.test |
| XSS | ✔ kein `dangerouslySetInnerHTML`, `eval`; React escaped Ausgaben; CSP `script-src 'self'` | privacy.test |
| Service Worker | ✔ nur GET, gleiche Herkunft, statische Dateitypen, keine Query-Anfragen; Cache enthält nur Build-Dateien | privacy.test, e2e |
| Abhängigkeiten | ✔ `npm audit`: 0 Schwachstellen (Prod und Dev) | – |
| Geteiltes Gerät | ✔ Autofill aus, Neustart, Inaktivitäts-Reset (Warnung 5 min / Löschung 5,5 min), „Sitzung beenden“ nach PDF | flow.test |

Einschränkungen: Der Arbeitsspeicher eines Browsers kann nicht kryptografisch bereinigt werden; React-State wird beim
Reset verworfen, die Garbage Collection ist Sache des Browsers. Bildschirmfotos/Bildschirmaufnahmen des Geräts lassen sich
nicht verhindern.
