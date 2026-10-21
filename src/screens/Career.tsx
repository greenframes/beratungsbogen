import { useEffect, useRef, useState } from 'react';
import { Check, HelpCircle, TrendingUp } from 'lucide-react';
import { FooterNav } from '../components/Layout';
import { Notice, ScreenTitle, SourceNote } from '../components/ui';
import { CAREER } from '../data/careers';
import { useSession } from '../state/session';
import type { Nav } from './types';

export const Career = ({ nav }: { nav: Nav }) => {
  const { session } = useSession();
  const program = session.program;
  const [sel, setSel] = useState(0);
  const detailRef = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  // Auf schmalen Bildschirmen (Hochformat) liegt die Detailkarte unter der Leiter – nach der Auswahl in den Blick scrollen
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (window.matchMedia?.('(max-width: 900px)').matches) detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [sel]);
  if (!program) return null;
  const steps = CAREER[program];
  const s = steps[sel] ?? steps[0]!;
  return (
    <section className="screen">
      <ScreenTitle eyebrow="Karriere" title="Deine Karriereleiter" lead="Die Ausbildung ist der Einstieg. Tippe auf eine Stufe und sieh, was dafür gilt." />
      <div className="ladder-wrap">
        <div className="ladder" role="group" aria-label="Karrierestufen">
          {steps.map((st, i) => (
            <button key={st.id} type="button" className="rung" aria-pressed={i === sel} onClick={() => setSel(i)}>
              <span className="num">{i + 1}</span>
              <span>
                <strong style={{ color: 'var(--c-ink)' }}>{st.title}</strong>
                <br />
                <span className="small muted">{st.path === 'direkt' ? 'Direkt möglich' : st.path === 'zusaetzliche-schritte' ? 'Mit zusätzlichen Schritten' : 'Weg in der Beratung klären'}</span>
              </span>
            </button>
          ))}
        </div>
        <div ref={detailRef} className="card stack" aria-live="polite" style={{ position: 'sticky', top: 16 }}>
          <div className="icon-bubble"><TrendingUp size={32} aria-hidden /></div>
          <h3>{s.title}</h3>
          <p>{s.summary}</p>
          <dl className="facts-dl">
            <dt>Qualifikation</dt><dd>{s.qualification}</dd>
            <dt>Berufserfahrung</dt>
            <dd>
              <span className={`chip ${s.experience.required === 'nein' ? 'ok' : s.experience.required === 'ja' ? 'warn' : ''}`} style={{ marginRight: 8 }}>
                {s.experience.required === 'nein' ? <Check size={14} aria-hidden /> : s.experience.required === 'unbekannt' ? <HelpCircle size={14} aria-hidden /> : null}
                {s.experience.required === 'nein' ? 'Nicht erforderlich' : s.experience.required === 'ja' ? 'Erforderlich' : 'Unklar'}
              </span>
              {s.experience.detail}
            </dd>
            <dt>Weitere Voraussetzungen</dt><dd>{s.access}</dd>
            <dt>Weg</dt><dd>{s.pathDetail}</dd>
          </dl>
          {!s.detailsVerified && <Notice kind="warn"><p>Diese Stufe nennt Aschke als Perspektive. Belegte Zugangsdetails liegen uns nicht vor.</p></Notice>}
          <SourceNote ids={s.sourceIds} asOf="2026-10-21" status={s.detailsVerified ? 'verified' : 'unconfirmed'} />
        </div>
      </div>
      <Notice><p style={{ marginTop: 0 }}>Die Leiter zeigt Möglichkeiten, keine Zusagen: Es gibt keine automatische Zulassung, Verkürzung, Beförderung oder Gehaltssteigerung.</p></Notice>
      <FooterNav onBack={nav.back} onNext={nav.next} />
    </section>
  );
};
