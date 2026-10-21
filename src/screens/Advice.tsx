import { Check, MessagesSquare, ThumbsUp } from 'lucide-react';
import { FooterNav } from '../components/Layout';
import { ScreenTitle } from '../components/ui';
import { useSession } from '../state/session';
import type { Nav } from './types';

export const Advice = ({ nav }: { nav: Nav }) => {
  const { session, dispatch } = useSession();
  const opts = [
    { id: 'appointment' as const, label: 'Ja, ich möchte ein Beratungsgespräch', sub: 'Persönlich, kostenlos und unverbindlich. Dafür brauchen wir kurz deine Kontaktdaten.', icon: MessagesSquare },
    { id: 'none' as const, label: 'Nein, danke', sub: 'Kein Problem – wir brauchen dann keine Daten von dir.', icon: ThumbsUp },
  ];
  return (
    <section className="screen">
      <ScreenTitle title="Möchtest du ein Beratungsgespräch?" lead="Du entscheidest." />
      <div className="grid two fill" role="radiogroup" aria-label="Beratungsgespräch" style={{ alignContent: 'start' }}>
        {opts.map((o) => (
          <button key={o.id} type="button" role="radio" aria-checked={session.advice === o.id} className="card choice" onClick={() => dispatch({ type: 'setAdvice', advice: o.id })}>
            <span className="tick" aria-hidden><Check size={20} /></span>
            <div className="icon-bubble"><o.icon size={28} aria-hidden /></div>
            <h3 style={{ paddingRight: 48 }}>{o.label}</h3>
            <span className="muted">{o.sub}</span>
          </button>
        ))}
      </div>
      <FooterNav onBack={nav.back} onNext={nav.next} nextDisabled={!session.advice} nextLabel={session.advice === 'none' ? 'Fertig' : 'Weiter'} />
    </section>
  );
};
