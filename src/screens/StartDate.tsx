import { CalendarCheck, HelpCircle } from 'lucide-react';
import { useState } from 'react';
import { FooterNav } from '../components/Layout';
import { ScreenTitle } from '../components/ui';
import { START_TERMS } from '../data/config';
import { useSession } from '../state/session';
import { earliestHypotheticalStart, fmtDate, fmtMonthYear, isFutureHypotheticalStart, planPeriod, upcomingTerms } from '../utils/dates';
import type { Nav } from './types';

export const StartDate = ({ nav }: { nav: Nav }) => {
  const { session, dispatch } = useSession();
  const program = session.program;
  const today = new Date();
  const [month, setMonth] = useState(session.start.kind === 'hypothetical' ? session.start.date.slice(0, 7) : '');
  const [monthError, setMonthError] = useState<string | null>(null);
  if (!program) return null;

  const terms = upcomingTerms(program, today, START_TERMS[program]);
  const start = session.start;
  const period = start.kind === 'confirmed' || start.kind === 'hypothetical' ? planPeriod(program, start.date) : null;
  const endISO = period ? period.publishedEndISO ?? period.computedEndISO : '';
  const minMonth = earliestHypotheticalStart(today).slice(0, 7);

  const applyMonth = (v: string) => {
    setMonth(v);
    if (!v) { setMonthError(null); return; }
    const iso = `${v}-01`;
    if (!isFutureHypotheticalStart(iso, today)) {
      setMonthError('Bitte wähle einen Monat in der Zukunft.');
      dispatch({ type: 'setStart', start: { kind: 'none' } });
      return;
    }
    setMonthError(null);
    dispatch({ type: 'setStart', start: { kind: 'hypothetical', date: iso } });
  };

  return (
    <section className="screen">
      <ScreenTitle title="Wann möchtest du starten?" lead="Wähle deinen Termin oder sag uns, dass du noch offen bist." />
      <div className="grid two" role="radiogroup" aria-label="Starttermin">
        {terms.map((t) => {
          const sel = start.kind === 'confirmed' && start.date === t.date;
          return (
            <button key={t.date} type="button" role="radio" aria-checked={sel} className="card choice" onClick={() => { setMonth(''); setMonthError(null); dispatch({ type: 'setStart', start: { kind: 'confirmed', date: t.date } }); }}>
              <span className="tick" aria-hidden>✓</span>
              <CalendarCheck size={28} aria-hidden style={{ color: 'var(--c-pink-700)' }} />
              <h3 style={{ marginTop: 6, marginBottom: 0 }}>{fmtDate(t.date)}</h3>
              <span className="muted small">Nächster Ausbildungsstart</span>
            </button>
          );
        })}
        <button type="button" role="radio" aria-checked={start.kind === 'open'} className="card choice" onClick={() => { setMonth(''); setMonthError(null); dispatch({ type: 'setStart', start: { kind: 'open' } }); }}>
          <span className="tick" aria-hidden>✓</span>
          <HelpCircle size={28} aria-hidden style={{ color: 'var(--c-pink-700)' }} />
          <h3 style={{ marginTop: 6, marginBottom: 0 }}>Noch offen – ich möchte beraten werden</h3>
          <span className="muted small">Wir finden gemeinsam den passenden Start.</span>
        </button>
      </div>
      {terms.length === 0 && <p className="muted small" style={{ margin: 0 }}>Aktuell ist noch kein Starttermin veröffentlicht – wähle „Noch offen“ oder nenne uns deinen Wunschmonat.</p>}
      <div className="card row" style={{ justifyContent: 'space-between' }}>
        <div>
          <strong style={{ color: 'var(--c-ink)' }}>Anderer Wunschmonat?</strong>
          <div className="small muted">Unverbindlicher Wunsch – kein bestätigter Kursstart.</div>
        </div>
        <div className="field" style={{ minWidth: 220 }}>
          <label htmlFor="wish-month" className="sr-only">Wunschmonat</label>
          <input id="wish-month" aria-label="Wunschmonat" className="input" type="month" min={minMonth} value={month} onChange={(e) => applyMonth(e.target.value)} aria-invalid={!!monthError} aria-describedby={monthError ? 'wish-err' : undefined} autoComplete="off" />
          {monthError && <div className="error" id="wish-err">{monthError}</div>}
        </div>
      </div>
      {period && (
        <div className="card soft" aria-live="polite">
          <div className="grid three">
            <div><div className="stat-label">Beginn</div><div className="stat" style={{ fontSize: 'var(--fs-xl)' }}>{start.kind === 'hypothetical' ? fmtMonthYear(period.startISO) : fmtDate(period.startISO)}</div></div>
            <div><div className="stat-label">Voraussichtliches Ende</div><div className="stat" style={{ fontSize: 'var(--fs-xl)' }}>{fmtDate(endISO)}</div></div>
            <div><div className="stat-label">Dauer</div><div className="stat" style={{ fontSize: 'var(--fs-xl)' }}>{period.months} Monate</div></div>
          </div>
        </div>
      )}
      <FooterNav onBack={nav.back} onNext={nav.next} nextDisabled={start.kind === 'none'} />
    </section>
  );
};
