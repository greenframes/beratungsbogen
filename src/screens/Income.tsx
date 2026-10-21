import { FooterNav } from '../components/Layout';
import { ScreenTitle } from '../components/ui';
import { approxRange, num } from '../data/facts';
import { useSession } from '../state/session';
import type { Nav } from './types';

export const Income = ({ nav }: { nav: Nav }) => {
  const { session } = useSession();
  const program = session.program;
  if (!program) return null;
  const fk = program === 'fachkraft';
  const r = approxRange(num(fk ? 'inc.fk.alten' : 'inc.fa.alten'), num(fk ? 'inc.fk.kranken' : 'inc.fa.kranken'));
  const scaleMax = 5000;

  return (
    <section className="screen">
      <ScreenTitle title="Was verdiene ich nach der Ausbildung?" lead={`${fk ? 'Pflegefachkräfte' : 'Pflegehilfskräfte'} verdienen ungefähr so viel – je nach Arbeitgeber, Erfahrung und Tarif.`} />
      <div className="card stack" style={{ padding: 'var(--sp-5)' }}>
        <div className="chips"><span className="chip">brutto pro Monat, Vollzeit</span></div>
        <div className="big-range">{r.label}</div>
        <div className="range" role="img" aria-label={`Ungefähre Spanne ${r.label}`}>
          <div className="fill" style={{ left: `${(r.lo / scaleMax) * 100}%`, width: `${((r.hi - r.lo) / scaleMax) * 100}%`, minWidth: 14 }} />
        </div>
        <div className="row small muted" style={{ justifyContent: 'space-between' }}><span>0 €</span><span>5.000 €</span></div>
      </div>
      <FooterNav onBack={nav.back} onNext={nav.next} />
    </section>
  );
};
