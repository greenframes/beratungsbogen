import { useState } from 'react';
import { FooterNav } from '../components/Layout';
import { PhaseIcon } from '../components/icons';
import { Notice, ScreenTitle, SourceNote } from '../components/ui';
import { PHASES } from '../data/phases';
import { fact, hours, num } from '../data/facts';
import { useSession } from '../state/session';
import { fmtDate, planPeriod } from '../utils/dates';
import type { Nav } from './types';

export const Process = ({ nav }: { nav: Nav }) => {
  const { session } = useSession();
  const program = session.program;
  const [sel, setSel] = useState('school');
  if (!program) return null;
  const fk = program === 'fachkraft';
  const phases = PHASES[program];
  const active = phases.find((p) => p.id === sel) ?? phases[0]!;
  const theory = num(fk ? 'fk.hours.theory' : 'fa.hours.theory');
  const practice = num(fk ? 'fk.hours.practice' : 'fa.hours.practice');
  const months = num(fk ? 'fk.duration.months' : 'fa.duration.months');
  const total = theory + practice;
  const hasDate = session.start.kind === 'confirmed' || session.start.kind === 'hypothetical';
  const period = hasDate && (session.start.kind === 'confirmed' || session.start.kind === 'hypothetical') ? planPeriod(program, session.start.date) : null;
  const blocks = fk ? 12 : 6;
  const sources = fk ? ['aschke-fachkraft', 'pflbg', 'pflaprv'] : ['aschke-assistenz', 'pflfassg', 'pflfassaprv'];

  return (
    <section className="screen">
      <ScreenTitle
        eyebrow="Ablauf"
        title="So läuft deine Ausbildung ab"
        lead={`${fk ? 'Pflegefachfrau / Pflegefachmann' : 'Pflegefachassistenz'}: ${months} Monate, Theorie an der Pflegeschule und praktische Einsätze im Wechsel – abgeschlossen mit einer staatlichen Prüfung.`}
      />
      <div className="stack-lg">
        <div className="card stack">
          <h3>Dein Weg auf einen Blick</h3>
          <div className="tl" role="img" aria-label={`Zeitachse über ${months} Monate mit Wechsel aus Theorie und Praxis`}>
            <div className="tl-bar">
              {Array.from({ length: blocks }).map((_, i) => (
                <div key={i} className={`tl-seg ${i % 2 === 0 ? 'theory' : 'practice'}`} style={{ flex: 1, opacity: 0.9 }} />
              ))}
            </div>
            <div className="tl-marks">
              <div className="tl-mark edge-l" style={{ left: 0 }}>
                <strong>Start</strong>
                <br />
                {period ? fmtDate(period.startISO) : 'Monat 0'}
              </div>
              {fk && (
                <div className="tl-mark" style={{ left: '66.7%' }}>
                  <strong>Zwischenprüfung</strong>
                  <br />
                  {period ? `ca. ${fmtDate(period.twoThirdsISO)}` : 'Ende 2. Drittel'}
                </div>
              )}
              <div className="tl-mark edge-r" style={{ left: '100%' }}>
                <strong>Voraussichtlicher Abschluss</strong>
                <br />
                {period ? fmtDate(period.computedEndISO) : `nach ${months} Monaten`}
              </div>
            </div>
          </div>
          <div className="legend">
            <span><i style={{ background: 'var(--c-blue)' }} />Theorie an der Pflegeschule</span>
            <span><i style={{ background: 'var(--c-pink-300)' }} />Praktische Einsätze</span>
          </div>
          <Notice kind="warn">
            <p><strong>Vereinfachtes Beispiel.</strong> Die Blöcke zeigen nur, dass Theorie und Praxis sich abwechseln. Reihenfolge, Länge und Einsatzorte legt der Ausbildungsplan des Trägers der praktischen Ausbildung gemeinsam mit der Pflegeschule fest – sie sind hier nicht dargestellt.</p>
          </Notice>
        </div>

        <div className="card stack">
          <h3>Umfang der Ausbildung (Mindestumfang laut Verordnung)</h3>
          <div className="hours-bar" role="img" aria-label={`${hours(theory)} Stunden Unterricht, ${hours(practice)} Stunden praktische Ausbildung`}>
            <div style={{ flex: theory, background: 'var(--c-blue)' }}>{hours(theory)}</div>
            <div style={{ flex: practice, background: 'var(--c-pink-600)' }}>{hours(practice)}</div>
          </div>
          <div className="legend">
            <span><i style={{ background: 'var(--c-blue)' }} />Theoretischer und praktischer Unterricht</span>
            <span><i style={{ background: 'var(--c-pink-600)' }} />Praktische Ausbildung</span>
          </div>
          <p className="muted small">
            Zusammen {hours(total)} Stunden.{' '}
            {fk ? `Aschke nennt den Gesamtumfang „${hours(num('fk.hours.total'))} Stunden“ (${hours(theory)} UE Unterricht, ${hours(practice)} Std. Praxis).` : `Aschke nennt den Gesamtumfang „${hours(num('fa.hours.total'))} Stunden“ (${hours(theory)} UE Unterricht, ${hours(practice)} Std. Praxis).`}
          </p>
        </div>

        <div className="stack">
          <h3>Lernphasen entdecken</h3>
          <div className="phase-tabs" role="tablist" aria-label="Phasen">
            {phases.map((p) => (
              <button key={p.id} role="tab" type="button" className="tab" aria-selected={p.id === active.id} onClick={() => setSel(p.id)}>
                {p.title}
              </button>
            ))}
          </div>
          <div className="card" role="tabpanel" aria-live="polite">
            <div className="row" style={{ alignItems: 'flex-start', gap: 20 }}>
              <div className="icon-bubble"><PhaseIcon name={active.icon} size={32} /></div>
              <div style={{ flex: 1, minWidth: 240 }}>
                <div className="chips" style={{ marginBottom: 8 }}>
                  <span className={`chip ${active.kind === 'unterricht' ? 'blue' : ''}`}>{active.kind === 'unterricht' ? 'Theorie' : active.kind === 'einsatz' ? 'Praxis' : 'Prüfung'}</span>
                  {active.hoursFactId && <span className="chip">{hours(num(active.hoursFactId))} Std. (Rahmenvorgabe)</span>}
                </div>
                <h3>{active.title}</h3>
                <p className="muted small" style={{ marginBottom: 8 }}>Mögliche Einsatzbereiche: {active.setting}</p>
                <p><strong>Das lernst du:</strong> {active.learn}</p>
                <p style={{ marginBottom: 0 }}><strong>Warum das wichtig ist:</strong> {active.why}</p>
              </div>
            </div>
          </div>
          <Notice>
            <p>
              <strong>Gesetzlicher Rahmen, kein fester Plan:</strong> Die Stundenangaben zu den Einsatzbereichen stammen aus der {fk ? 'Pflegeberufe-Ausbildungs- und -Prüfungsverordnung (Anlage 7)' : 'Pflegefachassistenz-Ausbildungs- und -Prüfungsverordnung (Anlage 3)'}. Konkrete Einsatzorte und die Reihenfolge stehen erst im Ausbildungsplan fest. {!fk && 'Die Verordnung gilt ab 01.01.2027.'}
            </p>
          </Notice>
          {fk && (
            <p className="small muted">Zwischenprüfung: {String(fact('fk.exam.interim').value)} (§ 6 Abs. 5 PflBG). Staatliche Abschlussprüfung am Ende der Ausbildung.</p>
          )}
        </div>
        <SourceNote ids={sources} asOf="2026-10-21" />
      </div>
      <FooterNav onBack={nav.back} onNext={nav.next} />
    </section>
  );
};
