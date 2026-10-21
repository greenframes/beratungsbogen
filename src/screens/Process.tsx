import { FooterNav } from '../components/Layout';
import { PhaseIcon } from '../components/icons';
import { ScreenTitle } from '../components/ui';
import { PHASES } from '../data/phases';
import { hours, num } from '../data/facts';
import { useSession } from '../state/session';
import { fmtDate, planPeriod } from '../utils/dates';
import type { Nav } from './types';

export const Process = ({ nav }: { nav: Nav }) => {
  const { session } = useSession();
  const program = session.program;
  if (!program) return null;
  const fk = program === 'fachkraft';
  const einsaetze = PHASES[program].filter((p) => p.kind === 'einsatz');
  const theory = num(fk ? 'fk.hours.theory' : 'fa.hours.theory');
  const practice = num(fk ? 'fk.hours.practice' : 'fa.hours.practice');
  const months = num(fk ? 'fk.duration.months' : 'fa.duration.months');
  const period = session.start.kind === 'confirmed' || session.start.kind === 'hypothetical' ? planPeriod(program, session.start.date) : null;
  const endISO = period ? period.computedEndISO : null;
  const blocks = fk ? 12 : 6;

  return (
    <section className="screen">
      <ScreenTitle title="So läuft deine Ausbildung ab" lead={`${months} Monate: Unterricht an der Pflegeschule und praktische Einsätze im Wechsel – am Ende die staatliche Prüfung.`} />
      <div className="card stack">
        <div className="tl" role="img" aria-label={`Zeitachse über ${months} Monate mit Wechsel aus Theorie und Praxis`} style={{ padding: 0 }}>
          <div className="tl-bar">
            {Array.from({ length: blocks }).map((_, i) => (
              <div key={i} className={`tl-seg ${i % 2 === 0 ? 'theory' : 'practice'}`} style={{ flex: 1 }} />
            ))}
          </div>
          <div className="tl-marks">
            <div className="tl-mark edge-l" style={{ left: 0 }}><strong>Start</strong><br />{period ? fmtDate(period.startISO) : 'Monat 0'}</div>
            {fk && <div className="tl-mark" style={{ left: '66.7%' }}><strong>Zwischenprüfung</strong><br />{period ? `ca. ${fmtDate(period.twoThirdsISO)}` : 'nach ca. 2 Jahren'}</div>}
            <div className="tl-mark edge-r" style={{ left: '100%' }}><strong>Abschluss</strong><br />{endISO ? fmtDate(endISO) : `nach ${months} Monaten`}</div>
          </div>
        </div>
        <div className="legend">
          <span><i style={{ background: 'var(--c-blue)' }} />Theorie an der Pflegeschule ({hours(theory)} Std.)</span>
          <span><i style={{ background: 'var(--c-pink-300)' }} />Praxis in der Pflege ({hours(practice)} Std.)</span>
        </div>
      </div>
      <div className="stack">
        <h3 style={{ margin: 0 }}>Hier sammelst du Praxis</h3>
        <div className="einsatz-row">
          {einsaetze.map((p) => (
            <div key={p.id} className="einsatz"><PhaseIcon name={p.icon} size={26} />{p.title}</div>
          ))}
        </div>
      </div>
      <FooterNav onBack={nav.back} onNext={nav.next} />
    </section>
  );
};
