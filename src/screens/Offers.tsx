import { ExternalLink as ExtIcon } from 'lucide-react';
import { FooterNav } from '../components/Layout';
import { ExternalLink, Notice, ScreenTitle, SourceNote } from '../components/ui';
import { COURSES, type Course } from '../data/courses';
import { START_TERMS } from '../data/config';
import { fact, hours } from '../data/facts';
import { useSession } from '../state/session';
import { fmtDate, parseISODate, upcomingTerms } from '../utils/dates';
import type { Nav } from './types';

const courseDates = (c: Course, today: Date): string[] => {
  if (c.group === 'einstieg') {
    const id = c.id === 'fachkraft' ? 'fachkraft' : 'assistenz';
    return upcomingTerms(id, today, START_TERMS[id]).map((t) => `Start ${fmtDate(t.date)}`);
  }
  const t0 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return (c.dates ?? [])
    .filter((d) => parseISODate(d.to).getTime() >= t0.getTime())
    .slice(0, 3)
    .map((d) => (d.from === d.to ? fmtDate(d.from) : `${fmtDate(d.from)} – ${fmtDate(d.to)}`));
};

const durationOf = (c: Course): string | null => {
  if (!c.durationFactId) return null;
  const f = fact(c.durationFactId);
  if (f.value === null) return null;
  if (f.unit === 'Monate') return Number(f.value) % 12 === 0 ? `${Number(f.value) / 12} Jahre` : `${Math.floor(Number(f.value) / 12)}½ Jahre`;
  return `${hours(Number(f.value))} ${f.unit ?? ''}`.trim();
};

const CourseCard = ({ c, today, mine }: { c: Course; today: Date; mine: boolean }) => {
  const dates = courseDates(c, today);
  const dur = durationOf(c);
  return (
    <article className="card stack" style={mine ? { borderColor: 'var(--c-pink-600)', borderWidth: 2 } : undefined}>
      <div className="chips">
        {mine && <span className="chip">Deine Wahl</span>}
        <span className={`chip ${c.group === 'einstieg' ? 'ok' : 'blue'}`}>{c.group === 'einstieg' ? 'Berufseinstieg' : 'Weiterbildung'}</span>
        {dur && <span className="chip">Dauer: {dur}</span>}
      </div>
      <h3 style={{ marginBottom: 0 }}>{c.title}</h3>
      <p style={{ marginBottom: 0 }}>{c.summary}</p>
      <p className="small" style={{ marginBottom: 0 }}><strong>Zielgruppe:</strong> {c.audience}</p>
      <div className="small"><strong>Zugang:</strong><ul style={{ margin: '4px 0 0', paddingLeft: '1.2em' }}>{c.requirements.map((r) => <li key={r}>{r}</li>)}</ul></div>
      <div className="small">
        <strong>Aktuelle Termine laut Website:</strong>{' '}
        {dates.length ? dates.join(' · ') : c.datesNote ?? 'Aktuell kein Termin veröffentlicht.'}
      </div>
      <div className="row">
        <ExternalLink href={c.url} className="btn btn-secondary btn-sm">Zur offiziellen Kursseite <ExtIcon size={16} aria-hidden /></ExternalLink>
        <span className="small muted">Benötigt Internet</span>
      </div>
      <SourceNote ids={[c.sourceId]} asOf="2026-10-21" status="dynamic" />
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
      <ScreenTitle eyebrow="Angebote" title="Was bietet Aschke dir?" lead="Nur Angebote, die auf der offiziellen Aschke-Website veröffentlicht sind. Termine ändern sich – verbindlich ist immer die Kursseite." />
      <div className="stack-lg">
        <div className="stack">
          <h3>Für den Berufseinstieg</h3>
          <div className="grid two">{einstieg.map((c) => <CourseCard key={c.id} c={c} today={today} mine={c.id === session.program} />)}</div>
        </div>
        <div className="stack">
          <h3>Weiterbildungen für später</h3>
          <Notice><p>Diese Weiterbildungen sind <strong>erst nach einer abgeschlossenen Pflegeausbildung</strong> (und teils mit Berufserfahrung) zugänglich. Sie zeigen dir, wie es nach der Ausbildung weitergehen kann.{session.program === 'assistenz' ? ' Sie richten sich an Pflegefachkräfte und nicht direkt an Pflegefachassistenzen.' : ''}</p></Notice>
          <div className="grid two">{wb.map((c) => <CourseCard key={c.id} c={c} today={today} mine={false} />)}</div>
        </div>
        <SourceNote ids={['aschke-weiterbildung']} asOf="2026-10-21" status="dynamic" label="Übersicht" />
      </div>
      <FooterNav onBack={nav.back} onNext={nav.next} nextLabel="Weiter zu meinen Daten" />
    </section>
  );
};
