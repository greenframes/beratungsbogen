import { CalendarDays } from 'lucide-react';
import { FooterNav } from '../components/Layout';
import { Button, ScreenTitle } from '../components/ui';
import { START_TERMS } from '../data/config';
import { useSession } from '../state/session';
import { earliestHypotheticalStart, fmtDate, isFutureHypotheticalStart, planPeriod } from '../utils/dates';
import { useState } from 'react';
import type { Nav } from './types';

export const StartDate = ({ nav }: { nav: Nav }) => {
  const { session, dispatch } = useSession();
  const program = session.program;
  const today = new Date();
  const [value, setValue] = useState(session.start.kind === 'confirmed' || session.start.kind === 'hypothetical' ? session.start.date : '');
  const [error, setError] = useState<string | null>(null);
  if (!program) return null;

  const start = session.start;
  const period = start.kind === 'confirmed' || start.kind === 'hypothetical' ? planPeriod(program, start.date) : null;
  const endISO = period ? period.computedEndISO : '';

  const onChange = (v: string) => {
    setValue(v);
    if (!v) { setError(null); dispatch({ type: 'setStart', start: { kind: 'none' } }); return; }
    if (!isFutureHypotheticalStart(v, today)) {
      setError('Bitte gib ein Startdatum in der Zukunft ein.');
      dispatch({ type: 'setStart', start: { kind: 'none' } });
      return;
    }
    setError(null);
    // Entspricht das Datum einem bekannten Kursstart, nutzen wir dessen veröffentlichtes Ende
    const known = START_TERMS[program].some((t) => t.date === v);
    dispatch({ type: 'setStart', start: { kind: known ? 'confirmed' : 'hypothetical', date: v } });
  };

  return (
    <section className="screen">
      <ScreenTitle title="Wann möchtest du starten?" lead="Gib dein Wunsch-Startdatum ein." />
      <div className="card stack" style={{ padding: 'var(--sp-5)' }}>
        <div className="row" style={{ gap: 20 }}>
          <div className="icon-bubble" style={{ marginBottom: 0 }}><CalendarDays size={28} aria-hidden /></div>
          <div className="field" style={{ minWidth: 260 }}>
            <label htmlFor="start-date">Startdatum</label>
            <input id="start-date" className="input" type="date" min={earliestHypotheticalStart(today)} value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={!!error} aria-describedby={error ? 'start-err' : undefined} autoComplete="off" />
            {error && <div className="error" id="start-err">{error}</div>}
          </div>
          <span className="muted">oder</span>
          <Button variant={start.kind === 'open' ? 'primary' : 'secondary'} size="lg" aria-pressed={start.kind === 'open'} onClick={() => { setValue(''); setError(null); dispatch({ type: 'setStart', start: { kind: 'open' } }); }}>
            Noch offen
          </Button>
        </div>
      </div>
      {period && (
        <div className="card soft" aria-live="polite">
          <div className="grid" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
            <div><div className="stat-label">Beginn</div><div className="stat" style={{ fontSize: 'var(--fs-xl)' }}>{fmtDate(period.startISO)}</div></div>
            <div><div className="stat-label">Voraussichtliches Ende</div><div className="stat" style={{ fontSize: 'var(--fs-xl)' }}>{fmtDate(endISO)}</div></div>
            <div><div className="stat-label">Dauer</div><div className="stat" style={{ fontSize: 'var(--fs-xl)' }}>{period.months} Monate</div></div>
          </div>
        </div>
      )}
      <FooterNav onBack={nav.back} onNext={nav.next} nextDisabled={start.kind === 'none'} />
    </section>
  );
};
