import { Phone, RotateCcw, Smile } from 'lucide-react';
import { Button } from '../components/ui';
import { ORG } from '../data/config';
import type { Nav } from './types';

export const Goodbye = ({ nav }: { nav: Nav }) => (
  <section className="screen" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
    <div className="icon-bubble" style={{ width: 88, height: 88 }}><Smile size={44} aria-hidden /></div>
    <h2 tabIndex={-1} data-screen-title>Danke für dein Interesse!</h2>
    <p className="lead" style={{ margin: '0 auto' }}>Wir haben keine Daten von dir gespeichert. Wenn du es dir anders überlegst: Du erreichst uns unter {ORG.hagen.phone}.</p>
    <div className="row" style={{ justifyContent: 'center', marginTop: 12 }}>
      <a className="btn btn-secondary btn-lg" href={`tel:${ORG.hagen.phone.replace(/\s/g, '')}`}><Phone size={22} aria-hidden /> Anrufen</a>
      <Button size="lg" onClick={nav.restart}><RotateCcw size={22} aria-hidden /> Neu starten</Button>
    </div>
  </section>
);
