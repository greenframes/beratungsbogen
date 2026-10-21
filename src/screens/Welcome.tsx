import { ArrowRight, UserRound } from 'lucide-react';
import logo from '../assets/brand/logo-aschke-pflegeschule.png';
import { Button, Notice } from '../components/ui';
import { useSession } from '../state/session';
import type { Nav } from './types';

export const Welcome = ({ nav }: { nav: Nav }) => {
  const { dispatch } = useSession();
  return (
    <section className="screen hero" aria-labelledby="welcome-title">
      <div className="stack-lg">
        <div className="eyebrow">Pflegeschule Hagen · Aschke</div>
        <h1 id="welcome-title" tabIndex={-1} data-screen-title>
          Deine Zukunft in der Pflege beginnt hier.
        </h1>
        <p className="lead">Entdecke deine Ausbildung, deine Möglichkeiten und deinen persönlichen Karriereweg mit Aschke.</p>
        <div className="row">
          <Button size="lg" onClick={nav.next}>
            Meinen Weg entdecken <ArrowRight size={24} aria-hidden />
          </Button>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => {
              dispatch({ type: 'setAssisted', assisted: true });
              nav.next();
            }}
          >
            <UserRound size={22} aria-hidden /> Mit Begleitung durch eine Mitarbeiterin / einen Mitarbeiter
          </Button>
        </div>
        <Notice>
          <p>Du musst auf diesem Bildschirm nichts eingeben. Deine Angaben bleiben nur auf diesem Gerät und werden nicht automatisch gesendet.</p>
        </Notice>
      </div>
      <div className="hero-art" aria-hidden>
        <img src={logo} alt="" />
      </div>
    </section>
  );
};
