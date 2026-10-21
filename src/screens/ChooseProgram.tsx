import { Check, GraduationCap, HeartPulse, Stethoscope } from 'lucide-react';
import { FooterNav } from '../components/Layout';
import { ScreenTitle, SourceNote } from '../components/ui';
import { START_TERMS } from '../data/config';
import { fact } from '../data/facts';
import { useSession } from '../state/session';
import type { ProgramId } from '../types';
import { fmtDate, upcomingTerms } from '../utils/dates';
import type { Nav } from './types';

const CARDS: { id: ProgramId; title: string; icon: typeof GraduationCap; bullets: string[]; sources: string[] }[] = [
  {
    id: 'fachkraft',
    title: 'Pflegefachfrau / Pflegefachmann',
    icon: Stethoscope,
    bullets: ['Generalistische Pflegeausbildung', 'Theorie und praktische Einsätze im Wechsel', 'Staatliche Abschlussprüfung', 'Schulgeldfrei'],
    sources: ['aschke-fachkraft', 'pflbg'],
  },
  {
    id: 'assistenz',
    title: 'Pflegefachassistenz',
    icon: HeartPulse,
    bullets: ['Generalistische Ausbildung – dein Einstieg in die Pflege', 'Theorie und praktische Einsätze im Wechsel', 'Staatliche Abschlussprüfung', 'Schulgeldfrei'],
    sources: ['aschke-assistenz', 'pflfassg'],
  },
];

const durationLabel = (months: number) => (months % 12 === 0 ? `${months / 12} Jahre` : `${Math.floor(months / 12)}½ Jahre`);

export const ChooseProgram = ({ nav }: { nav: Nav }) => {
  const { session, dispatch } = useSession();
  const today = new Date();
  return (
    <section className="screen" aria-labelledby="t">
      <ScreenTitle eyebrow="Ausbildung" title="Welche Ausbildung interessiert dich?" lead="Tippe auf eine Karte. Du kannst später jederzeit zurückgehen und wechseln." />
      <div className="grid two" role="radiogroup" aria-label="Ausbildung wählen">
        {CARDS.map((c) => {
          const months = Number(fact(c.id === 'fachkraft' ? 'fk.duration.months' : 'fa.duration.months').value);
          const selected = session.program === c.id;
          const next = upcomingTerms(c.id, today, START_TERMS[c.id])[0];
          const Icon = c.icon;
          return (
            <div key={c.id} className="stack">
              <button
                type="button"
                role="radio"
                aria-checked={selected}
                className="card choice"
                onClick={() => dispatch({ type: 'setProgram', program: c.id })}
              >
                <span className="tick" aria-hidden>
                  <Check size={20} />
                </span>
                <div className="icon-bubble">
                  <Icon size={32} aria-hidden />
                </div>
                <h3>{c.title}</h3>
                <div className="row" style={{ marginBottom: 12 }}>
                  <span className="chip">Dauer: {durationLabel(months)}</span>
                  <span className="chip ok">Schulgeldfrei</span>
                </div>
                <ul style={{ paddingLeft: '1.2em', margin: 0 }}>
                  {c.bullets.slice(0, 3).map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
                <p className="small muted" style={{ marginTop: 12 }}>
                  {next ? `Nächster veröffentlichter Start: ${fmtDate(next.date)}` : 'Aktuell ist kein Starttermin veröffentlicht.'}
                </p>
                <span className={`btn ${selected ? 'btn-primary' : 'btn-secondary'}`} style={{ marginTop: 8 }} aria-hidden>
                  {selected ? 'Ausgewählt' : 'Diese Ausbildung wählen'}
                </span>
              </button>
              <SourceNote ids={c.sources} asOf="2026-10-21" />
            </div>
          );
        })}
      </div>
      <p className="small muted" style={{ marginTop: 24 }}>
        Aschke bietet weitere Qualifizierungen an; hier sind zwei Ausbildungen mit unterschiedlicher Dauer und Abschluss dargestellt, die nicht miteinander vermischt werden.
      </p>
      <FooterNav onBack={nav.back} onNext={nav.next} nextDisabled={!session.program} />
    </section>
  );
};
