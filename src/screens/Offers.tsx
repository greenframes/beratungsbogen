import { ExternalLink as ExtIcon } from 'lucide-react';
import { FooterNav } from '../components/Layout';
import { ExternalLink, ScreenTitle } from '../components/ui';
import { COURSES, type Course } from '../data/courses';
import { START_TERMS } from '../data/config';
import { fact, hours } from '../data/facts';
import { useSession } from '../state/session';
import { fmtDate, parseISODate, upcomingTerms } from '../utils/dates';
import type { Nav } from './types';

const nextDate = (c: Course, today: Date): string | null => {
  if (c.group === 'einstieg') {
    const id = c.id === 'fachkraft' ? 'fachkraft' : 'assistenz';
    const t = upcomingTerms(id, today, START_TERMS[id])[0];
    return t ? `Start ${fmtDate(t.date)}` : null;
  }
  const t0 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const d = (c.dates ?? []).find((x) => parseISODate(x.to).getTime() >= t0.getTime());
  return d ? `Nächster Termin ${fmtDate(d.from)}` : null;
};

const durationOf = (c: Course): string | null => {
  if (!c.durationFactId) return null;
  const f = fact(c.durationFactId);
  if (f.value === null) return null;
  if (f.unit === 'Monate') return Number(f.value) % 12 === 0 ? `${Number(f.value) / 12} Jahre` : `${Math.floor(Number(f.value) / 12)}½ Jahre`;
  return `${hours(Number(f.value))} ${f.unit ?? ''}`.trim();
};

const TARGET: Record<string, string> = { fachkraft: 'Berufseinsteiger', assistenz: 'Berufseinsteiger', praxisanleitung: 'Pflegefachkräfte', refresher: 'Praxisanleitende', palliative: 'Pflegefachkräfte' };

const Offer = ({ c, today, mine }: { c: Course; today: Date; mine: boolean }) => {
  const dur = durationOf(c);
  const date = nextDate(c, today);
  return (
    <article className="card offer" style={mine ? { borderColor: 'var(--c-pink-600)', borderWidth: 2 } : undefined}>
      <div className="chips">
        {mine && <span className="chip">Deine Wahl</span>}
        {dur && <span className="chip blue">{dur}</span>}
        <span className="chip warn">{date ?? 'Termin auf Anfrage'}</span>
      </div>
      <h4>{c.title}</h4>
      <p className="sum">{c.summary}</p>
      <p style={{ WebkitLineClamp: 1 }}><strong>Zielgruppe:</strong> {TARGET[c.id] ?? 'Pflegefachkräfte'}</p>
      <ExternalLink href={c.url} className="btn btn-secondary btn-sm" >Mehr erfahren <ExtIcon size={16} aria-hidden /></ExternalLink>
    </article>
  );
};

export const Offers = ({ nav }: { nav: Nav }) => {
  const { session } = useSession();
  const today = new Date();
  const einstieg = COURSES.filter((c) => c.group === 'einstieg').sort((a) => (a.id === session.program ? -1 : 1));
  const wb = COURSES.filter((c) => c.group === 'weiterbildung');
  return (
    <section className="screen">
      <ScreenTitle title="Was bietet Aschke dir?" />
      <div className="stack">
        <h3 style={{ margin: 0 }}>Für den Berufseinstieg</h3>
        <div className="offers-grid">{einstieg.map((c) => <Offer key={c.id} c={c} today={today} mine={c.id === session.program} />)}</div>
      </div>
      <div className="stack">
        <h3 style={{ margin: 0 }}>Weiterbildungen für später <span className="small muted" style={{ fontWeight: 500 }}>– erst nach abgeschlossener Pflegeausbildung</span></h3>
        <div className="offers-grid">{wb.map((c) => <Offer key={c.id} c={c} today={today} mine={false} />)}</div>
      </div>
      <FooterNav onBack={nav.back} onNext={nav.next} nextLabel="Weiter" />
    </section>
  );
};
