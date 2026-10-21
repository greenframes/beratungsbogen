import { ArrowRight } from 'lucide-react';
import logo from '../assets/brand/logo-aschke-pflegeschule.png';
import { Button } from '../components/ui';
import type { Nav } from './types';

export const Welcome = ({ nav }: { nav: Nav }) => {
  return (
    <section className="screen hero" aria-labelledby="welcome-title" style={{ justifyContent: 'center' }}>
      <div className="stack-lg">
        <div className="eyebrow">Pflegeschule Hagen</div>
        <h1 id="welcome-title" tabIndex={-1} data-screen-title>
          Deine Zukunft in der Pflege beginnt hier.
        </h1>
        <p className="lead" style={{ fontSize: 'var(--fs-lg)' }}>Entdecke deine Ausbildung, deine Möglichkeiten und deinen persönlichen Karriereweg mit Aschke.</p>
        <div className="row">
          <Button size="lg" onClick={nav.next}>
            Meinen Weg entdecken <ArrowRight size={24} aria-hidden />
          </Button>
        </div>
      </div>
      <div className="hero-art" aria-hidden>
        <img src={logo} alt="" />
      </div>
    </section>
  );
};
