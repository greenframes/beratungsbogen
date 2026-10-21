import { CheckCircle2, MessagesSquare } from 'lucide-react';
import { FooterNav } from '../components/Layout';
import { ScreenTitle, SourceNote } from '../components/ui';
import { eligibilityHint, SCHOOL_LEAVING_LABELS } from '../utils/eligibility';
import { useSession } from '../state/session';
import type { SchoolLeaving } from '../types';
import type { Nav } from './types';

const REQ = {
  fachkraft: {
    school: ['Mittlerer Schulabschluss oder gleichwertig anerkannt (bei Aschke als „Hauptschulabschluss Klasse 10“ bezeichnet)', 'ODER Hauptschulabschluss Klasse 9 plus erfolgreich abgeschlossene Pflegefachassistenz-Ausbildung'],
    source: 'aschke-fachkraft',
  },
  assistenz: {
    school: ['Hauptschulabschluss ab Klasse 9 oder ein als gleichwertig anerkannter Abschluss', 'ODER Aufnahme ohne Schulabschluss, wenn die Pflegeschule einschätzt, dass du die Ausbildung erfolgreich schaffen kannst'],
    source: 'aschke-assistenz',
  },
} as const;

export const Check = ({ nav }: { nav: Nav }) => {
  const { session, dispatch } = useSession();
  const program = session.program;
  if (!program) return null;
  const leaving = session.contact.schoolLeaving;
  const hint = eligibilityHint(program, leaving);
  const req = REQ[program];

  return (
    <section className="screen">
      <ScreenTitle eyebrow="Check" title="Passt die Ausbildung zu dir? Der kurze Check" lead="Eine erste Orientierung – keine Zulassungsentscheidung. Die Pflegeschule prüft jeden Einzelfall." />
      <div className="grid two">
        <div className="card stack">
          <h3>Das wird verlangt</h3>
          <div><strong>1 · Schulabschluss</strong>
            <ul style={{ margin: '8px 0 0', paddingLeft: '1.2em' }}>{req.school.map((s) => <li key={s}>{s}</li>)}</ul>
          </div>
          <div><strong>2 · Zusätzlich erforderlich</strong>
            <ul style={{ margin: '8px 0 0', paddingLeft: '1.2em' }}>
              <li>Gesundheitliche Eignung (ärztliche Bescheinigung)</li>
              <li>Erweitertes Führungszeugnis (Vorlage bei Ausbildungsbeginn)</li>
              <li>Deutschkenntnisse B2</li>
            </ul>
          </div>
          <SourceNote ids={[req.source]} asOf="2026-10-21" />
        </div>
        <div className="card stack">
          <h3>Dein Abschluss</h3>
          <div className="field">
            <label htmlFor="check-leaving">Welchen Schulabschluss hast du oder erwartest du?</label>
            <select id="check-leaving" className="input" value={leaving} onChange={(e) => dispatch({ type: 'patchContact', patch: { schoolLeaving: e.target.value as SchoolLeaving | '' } })}>
              <option value="">Bitte wählen (freiwillig)</option>
              {(Object.keys(SCHOOL_LEAVING_LABELS) as SchoolLeaving[]).map((k) => <option key={k} value={k}>{SCHOOL_LEAVING_LABELS[k]}</option>)}
            </select>
            <span className="hint">Freiwillig. Die Auswahl wird später im Kontaktformular vorbelegt.</span>
          </div>
          <div aria-live="polite">
            <div className={`notice ${hint.level === 'wahrscheinlich' ? 'ok' : ''}`}>
              {hint.level === 'wahrscheinlich' ? <CheckCircle2 size={22} aria-hidden /> : <MessagesSquare size={22} aria-hidden />}
              <div><strong>{hint.headline}</strong><p style={{ marginTop: 4 }}>{hint.detail}</p></div>
            </div>
          </div>
          <p className="small muted">Weitere Voraussetzungen (Gesundheit, Führungszeugnis, Deutsch) prüft die Pflegeschule. Bei Unklarheiten: „Lass uns gemeinsam prüfen, welcher Weg zu dir passt.“</p>
        </div>
      </div>
      <FooterNav onBack={nav.back} onNext={nav.next} />
    </section>
  );
};
