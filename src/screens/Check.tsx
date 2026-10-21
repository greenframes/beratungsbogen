import { CheckCircle2, MessagesSquare } from 'lucide-react';
import { FooterNav } from '../components/Layout';
import { ScreenTitle } from '../components/ui';
import { eligibilityHint, SCHOOL_LEAVING_LABELS } from '../utils/eligibility';
import { useSession } from '../state/session';
import type { SchoolLeaving } from '../types';
import type { Nav } from './types';

const REQ = {
  fachkraft: ['Mittlerer Schulabschluss – oder Hauptschulabschluss (Klasse 9) mit abgeschlossener Pflegefachassistenz'],
  assistenz: ['Hauptschulabschluss – oder Aufnahme ohne Abschluss, wenn wir dir die Ausbildung zutrauen'],
} as const;

export const Check = ({ nav }: { nav: Nav }) => {
  const { session, dispatch } = useSession();
  const program = session.program;
  if (!program) return null;
  const leaving = session.contact.schoolLeaving;
  const hint = eligibilityHint(program, leaving);

  return (
    <section className="screen">
      <ScreenTitle title="Passt die Ausbildung zu dir?" lead="Eine erste Orientierung – wir prüfen jeden Fall persönlich." />
      <div className="two-col fill">
        <div className="card stack">
          <h3 style={{ margin: 0 }}>Das brauchst du</h3>
          <ul style={{ margin: 0, paddingLeft: '1.2em' }}>
            {REQ[program].map((r) => <li key={r}><strong>Schulabschluss:</strong> {r}</li>)}
            <li>Gesundheitliche Eignung (ärztliche Bescheinigung)</li>
            <li>Erweitertes Führungszeugnis</li>
            <li>Deutschkenntnisse B2</li>
          </ul>
        </div>
        <div className="card stack">
          <div className="field">
            <label htmlFor="check-leaving">Welchen Schulabschluss hast du oder erwartest du?</label>
            <select id="check-leaving" className="input" value={leaving} onChange={(e) => dispatch({ type: 'patchContact', patch: { schoolLeaving: e.target.value as SchoolLeaving | '' } })}>
              <option value="">Bitte wählen (freiwillig)</option>
              {(Object.keys(SCHOOL_LEAVING_LABELS) as SchoolLeaving[]).map((k) => <option key={k} value={k}>{SCHOOL_LEAVING_LABELS[k]}</option>)}
            </select>
          </div>
          <div aria-live="polite">
            <div className={`notice ${hint.level === 'wahrscheinlich' ? 'ok' : ''}`}>
              {hint.level === 'wahrscheinlich' ? <CheckCircle2 size={22} aria-hidden /> : <MessagesSquare size={22} aria-hidden />}
              <div><strong>{hint.headline}</strong><p style={{ marginTop: 4 }}>{hint.detail}</p></div>
            </div>
          </div>
        </div>
      </div>
      <FooterNav onBack={nav.back} onNext={nav.next} />
    </section>
  );
};
