import { Mail, Phone } from 'lucide-react';
import { FooterNav } from '../components/Layout';
import { ExternalLink, Notice, ScreenTitle } from '../components/ui';
import { BOOKING, ORG } from '../data/config';
import { useSession } from '../state/session';
import type { AdviceWish } from '../types';
import type { Nav } from './types';

const OPTIONS: { id: Exclude<AdviceWish, ''>; label: string; sub: string }[] = [
  { id: 'appointment', label: 'Ich möchte einen Beratungstermin vereinbaren.', sub: 'Persönlich, kostenlos und unverbindlich.' },
  { id: 'info', label: 'Ich möchte erst einmal Informationen erhalten.', sub: 'Ohne Termin – wir halten es unkompliziert.' },
  { id: 'none', label: 'Ich möchte aktuell keinen Termin vereinbaren.', sub: 'Auch das ist völlig in Ordnung.' },
];

export const Advice = ({ nav }: { nav: Nav }) => {
  const { session, dispatch } = useSession();
  const subject = encodeURIComponent(`Beratungswunsch Ausbildung ${session.program === 'assistenz' ? 'Pflegefachassistenz' : 'Pflegefachkraft'}`);
  return (
    <section className="screen">
      <ScreenTitle eyebrow="Beratung" title="Möchtest du einen Beratungstermin?" lead="Das ist freiwillig – du kannst auch ohne Termin fortfahren." />
      <div className="stack-lg">
        <div className="grid" role="radiogroup" aria-label="Beratungswunsch">
          {OPTIONS.map((o) => (
            <button key={o.id} type="button" role="radio" aria-checked={session.advice === o.id} className="card choice" onClick={() => dispatch({ type: 'setAdvice', advice: o.id })}>
              <span className="tick" aria-hidden>✓</span>
              <h3 style={{ marginBottom: 4, paddingRight: 48 }}>{o.label}</h3>
              <span className="muted">{o.sub}</span>
            </button>
          ))}
        </div>
        {session.advice === 'appointment' && (
          <div className="card stack">
            <h3>So kommst du zu deinem Termin</h3>
            <p>Deine gewählte Ausbildung ({session.program === 'assistenz' ? 'Pflegefachassistenz' : 'Pflegefachfrau/-mann'}) ist bereits notiert. {BOOKING.bookingUrl ? '' : 'In dieser App wird kein Termin automatisch gebucht oder bestätigt – ein freigegebenes Buchungssystem ist hier noch nicht hinterlegt.'}</p>
            {BOOKING.bookingUrl && <ExternalLink href={BOOKING.bookingUrl} className="btn btn-primary">Beratungstermin online buchen</ExternalLink>}
            <div className="row">
              <a className="btn btn-secondary" href={`tel:${ORG.hagen.phone.replace(/\s/g, '')}`}><Phone size={20} aria-hidden /> {ORG.hagen.phone}</a>
              <a className="btn btn-secondary" href={`mailto:${ORG.hagen.email}?subject=${subject}`}><Mail size={20} aria-hidden /> {ORG.hagen.email}</a>
            </div>
            <Notice><p>Telefon und E-Mail funktionieren nur mit Mobilfunk bzw. Internet. Die Mitarbeitenden notieren deinen Wunsch auch im Interessentenbogen. Bürozeiten: Mo.–Fr. 08:00–16:30 Uhr (laut Website).</p></Notice>
          </div>
        )}
      </div>
      <FooterNav onBack={nav.back} onNext={nav.next} nextDisabled={!session.advice} nextLabel="Zur Zusammenfassung" />
    </section>
  );
};
