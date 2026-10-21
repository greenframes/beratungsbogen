import { CalendarCheck, CalendarClock, HelpCircle } from 'lucide-react';
import { useState } from 'react';
import { FooterNav } from '../components/Layout';
import { Notice, ScreenTitle, SourceNote } from '../components/ui';
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
  const minMonth = earliestHypotheticalStart(today).slice(0, 7);

  const applyMonth = (v: string) => {
    setMonth(v);
    if (!v) {
      setMonthError(null);
      return;
    }
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
      <ScreenTitle eyebrow="Start" title="Wann möchtest du starten?" lead="Wähle einen veröffentlichten Termin – oder sag uns, dass du noch offen bist." />
      <div className="stack-lg">
        <div className="stack">
          <h3>Veröffentlichte Starttermine</h3>
          {terms.length === 0 && <Notice kind="warn"><p>Aktuell sind keine verbindlichen Starttermine veröffentlicht. Wähle „Noch offen“ – wir beraten dich gern.</p></Notice>}
          <div className="grid two" role="radiogroup" aria-label="Starttermin">
            {terms.map((t) => {
              const sel = start.kind === 'confirmed' && start.date === t.date;
              return (
                <button key={t.date} type="button" role="radio" aria-checked={sel} className="card choice" onClick={() => dispatch({ type: 'setStart', start: { kind: 'confirmed', date: t.date } })}>
                  <span className="tick" aria-hidden>✓</span>
                  <CalendarCheck size={32} aria-hidden style={{ color: 'var(--c-pink-700)' }} />
                  <h3 style={{ marginTop: 8 }}>{fmtDate(t.date)}</h3>
                  <p className="muted small" style={{ margin: 0 }}>Termin laut Aschke-Website</p>
                </button>
              );
            })}
            <button type="button" role="radio" aria-checked={start.kind === 'open'} className="card choice" onClick={() => { setMonth(''); setMonthError(null); dispatch({ type: 'setStart', start: { kind: 'open' } }); }}>
              <span className="tick" aria-hidden>✓</span>
              <HelpCircle size={32} aria-hidden style={{ color: 'var(--c-pink-700)' }} />
              <h3 style={{ marginTop: 8 }}>Noch offen – ich möchte beraten werden</h3>
              <p className="muted small" style={{ margin: 0 }}>Wir klären gemeinsam, was zu dir passt.</p>
            </button>
          </div>
        </div>

        <div className="card">
          <div className="row" style={{ marginBottom: 8 }}>
            <CalendarClock size={26} aria-hidden style={{ color: 'var(--c-pink-700)' }} />
            <h3 style={{ margin: 0 }}>Eigener Wunschmonat (unverbindlich)</h3>
          </div>
          <p className="muted">Du möchtest zu einem anderen Zeitpunkt starten? Dann nenne uns deinen Wunschmonat. Das ist nur ein Wunsch und kein bestätigter Kursstart.</p>
          <div className="field" style={{ maxWidth: 360 }}>
            <label htmlFor="wish-month">Wunschmonat</label>
            <input id="wish-month" className="input" type="month" min={minMonth} value={month} onChange={(e) => applyMonth(e.target.value)} aria-invalid={!!monthError} aria-describedby={monthError ? 'wish-err' : undefined} autoComplete="off" />
            {monthError && <div className="error" id="wish-err">{monthError}</div>}
          </div>
        </div>

        {period && (
          <div className="card soft stack" aria-live="polite">
            <h3>Dein voraussichtlicher Ausbildungszeitraum</h3>
            <div className="grid three">
              <div><div className="stat-label">Beginn</div><div className="stat" style={{ fontSize: 'var(--fs-xl)' }}>{start.kind === 'hypothetical' ? fmtMonthYear(period.startISO) : fmtDate(period.startISO)}</div></div>
              <div><div className="stat-label">Voraussichtliches Ende</div><div className="stat" style={{ fontSize: 'var(--fs-xl)' }}>{fmtDate(period.computedEndISO)}</div></div>
              <div><div className="stat-label">Regeldauer (Vollzeit)</div><div className="stat" style={{ fontSize: 'var(--fs-xl)' }}>{period.months} Monate</div></div>
            </div>
            {start.kind === 'confirmed' && period.publishedEndISO && period.publishedEndISO !== period.computedEndISO && (
              <Notice kind="warn">
                <p>Aschke nennt auf der Website als Ende den <strong>{fmtDate(period.publishedEndISO)}</strong>. Rechnerisch ergibt sich aus der Regeldauer der {fmtDate(period.computedEndISO)}. Wir klären gern, woher der Unterschied kommt (z. B. Prüfungszeitraum).</p>
              </Notice>
            )}
            {start.kind === 'hypothetical' && <Notice kind="warn"><p><strong>Hypothetischer Wunsch:</strong> Für diesen Monat ist kein Kursstart bestätigt. Die Zahlen sind nur eine Orientierung.</p></Notice>}
            <Notice>
              <p>Das Ende ist <strong>voraussichtlich</strong>. Prüfungszeiträume, Unterbrechungen und individuelle Bedingungen können den tatsächlichen Verlauf beeinflussen. Ein Platz ist durch deine Auswahl <strong>nicht reserviert oder garantiert</strong>.</p>
            </Notice>
          </div>
        )}
        <SourceNote ids={[program === 'fachkraft' ? 'aschke-fachkraft' : 'aschke-assistenz', program === 'fachkraft' ? 'pflbg' : 'pflfassg']} asOf="2026-10-21" status="dynamic" />
      </div>
      <FooterNav onBack={nav.back} onNext={nav.next} nextDisabled={start.kind === 'none'} />
    </section>
  );
};
