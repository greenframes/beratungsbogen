import { useState } from 'react';
import { Check, HelpCircle, TrendingUp } from 'lucide-react';
import { FooterNav } from '../components/Layout';
import { ScreenTitle } from '../components/ui';
import { CAREER } from '../data/careers';
import { useSession } from '../state/session';
import type { Nav } from './types';

export const Career = ({ nav }: { nav: Nav }) => {
  const { session } = useSession();
  const program = session.program;
  const [sel, setSel] = useState(0);
  if (!program) return null;
  const steps = CAREER[program];
  const s = steps[sel] ?? steps[0]!;
  return (
    <section className="screen">
      <ScreenTitle title="Deine Karriereleiter" lead="Die Ausbildung ist dein Einstieg. Tippe auf eine Stufe." />
      <div className="ladder-wrap fill">
        <div className="ladder" role="group" aria-label="Karrierestufen">
          {steps.map((st, i) => (
            <button key={st.id} type="button" className="rung" aria-pressed={i === sel} onClick={() => setSel(i)}>
              <span className="num">{i + 1}</span>
              <span><strong style={{ color: 'var(--c-ink)' }}>{st.title}</strong></span>
            </button>
          ))}
        </div>
        <div className="card stack" aria-live="polite">
          <div className="row"><div className="icon-bubble" style={{ marginBottom: 0 }}><TrendingUp size={26} aria-hidden /></div><h3 style={{ margin: 0 }}>{s.title}</h3></div>
          <p style={{ margin: 0 }}>{s.summary}</p>
          <dl className="facts-dl small">
            <dt>Du brauchst</dt><dd>{s.qualification}</dd>
            <dt>Erfahrung</dt>
            <dd>
              <span className={`chip ${s.experience.required === 'nein' ? 'ok' : s.experience.required === 'ja' ? 'warn' : ''}`}>
                {s.experience.required === 'nein' ? <Check size={14} aria-hidden /> : s.experience.required === 'unbekannt' ? <HelpCircle size={14} aria-hidden /> : null}
                {s.experience.required === 'nein' ? 'Nicht nötig' : s.experience.required === 'ja' ? 'Nötig' : 'Im Gespräch klären'}
              </span>
            </dd>
            <dt>Weg</dt><dd>{s.path === 'direkt' ? 'Direkt möglich' : s.path === 'zusaetzliche-schritte' ? 'Mit zusätzlichen Schritten' : 'Im Gespräch klären'}</dd>
          </dl>
        </div>
      </div>
      <FooterNav onBack={nav.back} onNext={nav.next} />
    </section>
  );
};
