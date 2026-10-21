import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, FileDown, Loader2, LockKeyhole, Trash2 } from 'lucide-react';
import logo from '../assets/brand/logo-aschke-pflegeschule.png';
import { FooterNav } from '../components/Layout';
import { Button, Notice, ScreenTitle } from '../components/ui';
import { useSession } from '../state/session';
import { fmtDateTime, fmtDate } from '../utils/dates';
import { exportPdf, type ExportResult } from '../utils/exportFile';
import { adviceLabel, periodLines } from '../utils/summary';
import { pdfFilename } from '../utils/filename';
import { SCHOOL_LEAVING_LABELS } from '../utils/eligibility';
import { minorNotice } from '../utils/consent';
import type { Nav } from './types';

type Build = { state: 'building' } | { state: 'ready'; blob: Blob; at: Date } | { state: 'error' };

export const Finish = ({ nav }: { nav: Nav }) => {
  const { session } = useSession();
  const [build, setBuild] = useState<Build>({ state: 'building' });
  const [result, setResult] = useState<ExportResult | null>(null);
  const [busy, setBusy] = useState(false);
  const logoRef = useRef<Uint8Array | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // jsPDF wird erst hier nachgeladen (nicht im Start-Bundle)
        const { buildPdfBlob, loadLogo } = await import('../utils/pdf');
        logoRef.current ??= await loadLogo(logo);
        const at = new Date();
        const blob = buildPdfBlob({ session, now: at }, { logoPng: logoRef.current });
        if (!cancelled) setBuild({ state: 'ready', blob, at });
      } catch {
        if (!cancelled) setBuild({ state: 'error' });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [session]);

  const save = async () => {
    if (build.state !== 'ready') return;
    setBusy(true);
    setResult(await exportPdf(build.blob, pdfFilename(build.at)));
    setBusy(false);
  };

  const c = session.contact;
  const mn = minorNotice(c.birthDate, new Date());
  const exported = result?.status === 'shared' || result?.status === 'download-started';

  return (
    <section className="screen">
      <ScreenTitle eyebrow="Abschluss" title="Geschafft – deine Zusammenfassung" lead="Prüfe deine Angaben. Dann erstellen wir den Interessentenbogen als PDF." />
      <div className="stack-lg">
        <div className="card">
          <dl className="facts-dl">
            <dt>Name</dt><dd>{c.firstName} {c.lastName}</dd>
            <dt>E-Mail</dt><dd>{c.email}</dd>
            <dt>Handy</dt><dd>{c.mobile}</dd>
            <dt>Geburtsdatum</dt><dd>{c.birthDate ? fmtDate(c.birthDate) : '–'}</dd>
            <dt>Schulabschluss</dt><dd>{c.schoolLeaving ? SCHOOL_LEAVING_LABELS[c.schoolLeaving] : '–'}</dd>
            <dt>Ausbildung</dt><dd>{session.program === 'fachkraft' ? 'Pflegefachfrau / Pflegefachmann' : 'Pflegefachassistenz'}</dd>
            <dt>Start / Zeitraum</dt><dd>{periodLines(session).map((l) => <div key={l}>{l}</div>)}</dd>
            <dt>Beratung</dt><dd>{adviceLabel(session.advice)}</dd>
          </dl>
        </div>
        {mn && <Notice kind="warn"><p>{mn}</p></Notice>}

        <div className="card stack" aria-live="polite">
          <h3>Interessentenbogen (PDF)</h3>
          {build.state === 'building' && <div className="row"><Loader2 className="spin" size={22} aria-hidden /> PDF wird lokal auf diesem Gerät erstellt …</div>}
          {build.state === 'error' && <Notice kind="danger"><p>Die PDF konnte nicht erstellt werden. Bitte gehe zurück und prüfe die Angaben, oder wende dich an eine Mitarbeiterin bzw. einen Mitarbeiter.</p></Notice>}
          {build.state === 'ready' && (
            <>
              <p className="muted">Bereit: {pdfFilename(build.at)} · erstellt {fmtDateTime(build.at)}. Die Datei entsteht nur auf diesem Gerät – es wird nichts hochgeladen.</p>
              <div className="row">
                <Button size="lg" onClick={save} disabled={busy}><FileDown size={24} aria-hidden /> {busy ? 'Bitte warten …' : 'PDF speichern / teilen'}</Button>
              </div>
            </>
          )}
          {result && (
            <Notice kind={result.status === 'error' ? 'danger' : result.status === 'cancelled' ? 'warn' : 'ok'}><p>{result.message}</p></Notice>
          )}
        </div>

        <div className="card soft stack">
          <div className="row"><LockKeyhole size={26} aria-hidden style={{ color: 'var(--c-pink-700)' }} /><h3 style={{ margin: 0 }}>Für die Mitarbeitenden</h3></div>
          <ul style={{ margin: 0, paddingLeft: '1.2em' }}>
            <li>Wo die PDF landet, hängt vom iPad und seiner Konfiguration ab (z. B. „Dateien“, AirDrop, Mail). <strong>Die App kann nicht prüfen, ob gespeichert wurde.</strong></li>
            <li>Die Datei ist <strong>nicht automatisch verschlüsselt</strong> und nicht vor anderen Personen geschützt, die das iPad nutzen.</li>
            <li>Bitte sofort in den von Aschke freigegebenen, geschützten Speicherort ablegen und die lokale Kopie auf dem iPad löschen.</li>
          </ul>
        </div>

        <div className="card stack" style={{ borderColor: 'var(--c-pink-600)' }}>
          <h3>{exported ? <><CheckCircle2 size={24} aria-hidden style={{ verticalAlign: -4, color: 'var(--c-ok)' }} /> Fertig? Dann Sitzung beenden</> : 'Sitzung beenden'}</h3>
          <p>Beim Beenden werden alle Eingaben aus dem Arbeitsspeicher gelöscht, damit die nächste Person keine Daten sieht. {exported ? '' : 'Du hast die PDF noch nicht weitergegeben – beende die Sitzung erst danach.'}</p>
          <Button variant={exported ? 'primary' : 'danger'} size="lg" onClick={nav.restart}><Trash2 size={22} aria-hidden /> Sitzung beenden &amp; Daten löschen</Button>
        </div>
      </div>
      <FooterNav onBack={nav.back} backLabel="Angaben ändern" />
    </section>
  );
};
