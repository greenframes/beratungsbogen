import { Check, HeartPulse, Stethoscope } from 'lucide-react';
import { FooterNav } from '../components/Layout';
import { ScreenTitle } from '../components/ui';
import { START_TERMS } from '../data/config';
import { fact } from '../data/facts';
import { useSession } from '../state/session';
import type { ProgramId } from '../types';
import { fmtDate, upcomingTerms } from '../utils/dates';
import type { Nav } from './types';

const CARDS: { id: ProgramId; title: string; icon: typeof Stethoscope; bullets: string[] }[] = [
  { id: 'fachkraft', title: 'Pflegefachfrau / Pflegefachmann', icon: Stethoscope, bullets: ['Generalistische Pflegeausbildung', 'Theorie und Praxis im Wechsel', 'Staatliche Abschlussprüfung'] },
  { id: 'assistenz', title: 'Pflegefachassistenz', icon: HeartPulse, bullets: ['Dein schneller Einstieg in die Pflege', 'Theorie und Praxis im Wechsel', 'Staatliche Abschlussprüfung'] },
];

const durationLabel = (months: number) => (months % 12 === 0 ? `${months / 12} Jahre` : `${Math.floor(months / 12)}½ Jahre`);

export const ChooseProgram = ({ nav }: { nav: Nav }) => {
  const { session, dispatch } = useSession();
  const today = new Date();
  return (
    <section className="screen">
      <ScreenTitle title="Welche Ausbildung interessiert dich?" lead="Tippe auf eine Karte." />
      <div className="grid two fill" role="radiogroup" aria-label="Ausbildung wählen" style={{ alignContent: 'start' }}>
        {CARDS.map((c) => {
          const months = Number(fact(c.id === 'fachkraft' ? 'fk.duration.months' : 'fa.duration.months').value);
          const selected = session.program === c.id;
          const next = upcomingTerms(c.id, today, START_TERMS[c.id])[0];
          const Icon = c.icon;
          return (
            <button key={c.id} type="button" role="radio" aria-checked={selected} className="card choice" onClick={() => dispatch({ type: 'setProgram', program: c.id })}>
              <span className="tick" aria-hidden><Check size={20} /></span>
              <div className="icon-bubble"><Icon size={28} aria-hidden /></div>
              <h3>{c.title}</h3>
              <div className="row" style={{ marginBottom: 10 }}>
                <span className="chip">Dauer: {durationLabel(months)}</span>
                <span className="chip ok">Schulgeldfrei</span>
              </div>
              <ul style={{ paddingLeft: '1.2em', margin: 0 }}>{c.bullets.map((b) => <li key={b}>{b}</li>)}</ul>
              <p className="small muted" style={{ margin: '10px 0 0' }}>{next ? `Nächster Start: ${fmtDate(next.date)}` : 'Starttermin auf Anfrage'}</p>
            </button>
          );
        })}
      </div>
      <FooterNav onBack={nav.back} onNext={nav.next} nextDisabled={!session.program} />
    </section>
  );
};
