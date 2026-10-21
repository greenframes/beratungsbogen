import { FooterNav } from '../components/Layout';
import { ScreenTitle } from '../components/ui';
import { approxEur, num } from '../data/facts';
import { useSession } from '../state/session';
import type { Nav } from './types';

export const Pay = ({ nav }: { nav: Nav }) => {
  const { session } = useSession();
  const program = session.program;
  if (!program) return null;
  const fk = program === 'fachkraft';
  const ids = ['pay.fk.y1', 'pay.fk.y2', 'pay.fk.y3'];
  const max = fk ? Math.max(...ids.map(num)) : 0;

  return (
    <section className="screen">
      <ScreenTitle title="Was verdiene ich während der Ausbildung?" lead="Die tatsächliche Ausbildungsvergütung hängt von den Bedingungen deines Ausbildungs- beziehungsweise Anstellungsverhältnisses ab." />
      {fk ? (
        <div className="card stack">
          <div className="chips"><span className="chip">ca. Beträge, brutto pro Monat</span></div>
          <div className="bars" role="img" aria-label="Balkendiagramm der ungefähren monatlichen Ausbildungsvergütung nach Ausbildungsjahr">
            {ids.map((id, i) => (
              <div key={id} className="bar-col">
                <div className="bar-val">{approxEur(num(id))}</div>
                <div className="bar" style={{ height: `${(num(id) / max) * 70}%` }} />
                <div className="bar-lbl">{i + 1}. Ausbildungsjahr</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card stack">
          <h3 style={{ marginBottom: 0 }}>Pflegefachassistenz – 18 Monate</h3>
          <p style={{ margin: 0 }}>Die Höhe deiner Vergütung hängt von deinem Ausbildungsträger ab. Wir sagen dir im Gespräch, womit du rechnen kannst.</p>
        </div>
      )}
      <FooterNav onBack={nav.back} onNext={nav.next} />
    </section>
  );
};
