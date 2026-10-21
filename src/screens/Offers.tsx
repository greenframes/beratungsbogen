import { ArrowDown } from 'lucide-react';
import { FooterNav } from '../components/Layout';
import { ScreenTitle } from '../components/ui';
import { COURSES, type Course } from '../data/courses';
import { fact, hours } from '../data/facts';
import { useSession } from '../state/session';
import type { Nav } from './types';

const durationOf = (c: Course): string | null => {
  if (!c.durationFactId) return null;
  const f = fact(c.durationFactId);
  if (f.value === null) return null;
  if (f.unit === 'Monate') return Number(f.value) % 12 === 0 ? `${Number(f.value) / 12} Jahre` : `${Math.floor(Number(f.value) / 12)}½ Jahre`;
  return `${hours(Number(f.value))} ${f.unit ?? ''}`.trim();
};

const TARGET: Record<string, string> = { fachkraft: 'Berufseinsteiger', assistenz: 'Berufseinsteiger', praxisanleitung: 'Pflegefachkräfte', refresher: 'Praxisanleitende', palliative: 'Pflegefachkräfte' };

const Offer = ({ c, mine }: { c: Course; mine: boolean }) => {
  const dur = durationOf(c);
  return (
    <article className="card offer" style={mine ? { borderColor: 'var(--c-pink-600)', borderWidth: 2 } : undefined}>
      <div className="chips">
        {mine && <span className="chip">Deine Wahl</span>}
        {dur && <span className="chip blue">{dur}</span>}
      </div>
      <h4>{c.title}</h4>
      <p className="sum">{c.summary}</p>
      <p style={{ WebkitLineClamp: 1 }}><strong>Für:</strong> {TARGET[c.id] ?? 'Pflegefachkräfte'}</p>
    </article>
  );
};

export const Offers = ({ nav }: { nav: Nav }) => {
  const { session } = useSession();
  const einstieg = COURSES.filter((c) => c.group === 'einstieg').sort((a) => (a.id === session.program ? -1 : 1));
  const wb = COURSES.filter((c) => c.group === 'weiterbildung');
  return (
    <section className="screen">
      <ScreenTitle title="So begleitet dich Aschke" lead="Von der Ausbildung bis zur Weiterbildung – wir sind auf deinem Karriereweg dabei." />
      <div className="stack">
        <h3 style={{ margin: 0 }}>1 · Dein Einstieg bei uns</h3>
        <div className="offers-grid">{einstieg.map((c) => <Offer key={c.id} c={c} mine={c.id === session.program} />)}</div>
      </div>
      <div className="row" style={{ justifyContent: 'center', color: 'var(--c-pink-700)' }} aria-hidden><ArrowDown size={28} /></div>
      <div className="stack">
        <h3 style={{ margin: 0 }}>2 · Danach: Weiterbildungen bei uns <span className="small muted" style={{ fontWeight: 500 }}>– nach abgeschlossener Pflegeausbildung</span></h3>
        <div className="offers-grid">{wb.map((c) => <Offer key={c.id} c={c} mine={false} />)}</div>
      </div>
      <FooterNav onBack={nav.back} onNext={nav.next} />
    </section>
  );
};
