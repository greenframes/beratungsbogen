import type { ReactNode } from 'react';
import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';
import logo from '../assets/brand/logo-aschke-pflegeschule.png';
import { Button, Modal } from './ui';

/** Gemeinsame Schritte bis zur Entscheidung „Beratungsgespräch ja/nein“. */
export const BASE_TITLES = ['Willkommen', 'Ausbildung', 'Start', 'Ablauf', 'Vergütung', 'Verdienst', 'Karriere', 'Check', 'Angebote', 'Beratung'] as const;

/** Nur wer ein Beratungsgespräch möchte, durchläuft Kontakt, Datenschutz und Abschluss. Bei „Nein“ werden keine Daten mehr abgefragt. */
export const stepTitles = (advice: 'appointment' | 'none' | ''): string[] =>
  advice === 'none' ? [...BASE_TITLES, 'Danke'] : [...BASE_TITLES, 'Kontakt', 'Datenschutz', 'Abschluss'];

export const Logo = ({ height = 48 }: { height?: number }) => (
  <img src={logo} alt="Aschke – mehr als nur eine Schule" style={{ height }} />
);

export const TopBar = ({ step, titles, onRestart }: { step: number; titles: string[]; onRestart: () => void }) => (
  <div className="topbar">
    <Logo height={44} />
    <span style={{ flex: 1 }} />
    {step > 0 && (
      <>
        <div className="step-label" aria-live="polite">
          Schritt {step + 1} von {titles.length}
          <strong>{titles[step]}</strong>
        </div>
        <Button variant="secondary" size="sm" onClick={onRestart}>
          <RotateCcw size={18} aria-hidden /> Neustart
        </Button>
      </>
    )}
  </div>
);

export const ProgressBar = ({ step, titles, onJump }: { step: number; titles: string[]; onJump: (i: number) => void }) => (
  <nav className="progress" aria-label="Fortschritt">
    <ol>
      {titles.map((t, i) => (
        <li key={t} className={i < step ? 'done' : i === step ? 'current' : ''}>
          <button type="button" aria-label={`Schritt ${i + 1}: ${t}`} aria-current={i === step ? 'step' : undefined} disabled={i >= step} onClick={() => onJump(i)} />
        </li>
      ))}
    </ol>
  </nav>
);

export const FooterNav = ({ onBack, onNext, nextLabel = 'Weiter', nextDisabled = false, backLabel = 'Zurück', hideBack = false, extra }: { onBack?: () => void; onNext?: () => void; nextLabel?: string; nextDisabled?: boolean; backLabel?: string; hideBack?: boolean; extra?: ReactNode }) => (
  <div className="footer-nav">
    <div className="inner">
      {hideBack || !onBack ? <span /> : (
        <Button variant="secondary" size="lg" onClick={onBack}>
          <ArrowLeft size={22} aria-hidden /> {backLabel}
        </Button>
      )}
      <div className="row">
        {extra}
        {onNext && (
          <Button size="lg" onClick={onNext} disabled={nextDisabled} aria-disabled={nextDisabled}>
            {nextLabel} <ArrowRight size={22} aria-hidden />
          </Button>
        )}
      </div>
    </div>
  </div>
);

export const RestartDialog = ({ onConfirm, onCancel, hasData }: { onConfirm: () => void; onCancel: () => void; hasData: boolean }) => (
  <Modal
    title="Neu starten?"
    onClose={onCancel}
    actions={
      <>
        <Button variant="secondary" onClick={onCancel}>Abbrechen</Button>
        <Button variant="danger" onClick={onConfirm}>Eingaben löschen &amp; neu starten</Button>
      </>
    }
  >
    <p>{hasData ? 'Alle Eingaben auf diesem Gerät werden aus dem Arbeitsspeicher gelöscht. Eine bereits gespeicherte PDF-Datei bleibt davon unberührt.' : 'Die Beratung beginnt wieder von vorn.'}</p>
  </Modal>
);
