import { useCallback, useEffect, useRef, useState } from 'react';
import { POLICY } from '../data/config';
import { Button, Modal } from './ui';

/**
 * Messe-Kiosk: Nach längerer Inaktivität wird gewarnt und danach die Sitzung gelöscht,
 * damit Eingaben nicht für die nächste Person sichtbar bleiben.
 */
export const IdleGuard = ({ active, onTimeout }: { active: boolean; onTimeout: () => void }) => {
  const [warn, setWarn] = useState(false);
  const warnRef = useRef(false);
  const timers = useRef<{ w?: number; r?: number }>({});
  const onTimeoutRef = useRef(onTimeout);
  onTimeoutRef.current = onTimeout;

  const clear = () => {
    window.clearTimeout(timers.current.w);
    window.clearTimeout(timers.current.r);
  };

  const arm = useCallback(() => {
    clear();
    timers.current.w = window.setTimeout(() => {
      warnRef.current = true;
      setWarn(true);
    }, POLICY.idleWarnMs);
    timers.current.r = window.setTimeout(() => {
      warnRef.current = false;
      setWarn(false);
      onTimeoutRef.current();
    }, POLICY.idleResetMs);
  }, []);

  useEffect(() => {
    if (!active) {
      clear();
      warnRef.current = false;
      setWarn(false);
      return;
    }
    arm();
    // Solange die Warnung offen ist, zählt nur die ausdrückliche Bestätigung im Dialog
    const onActivity = () => {
      if (!warnRef.current) arm();
    };
    const events = ['pointerdown', 'keydown', 'touchstart', 'scroll'] as const;
    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));
    return () => {
      events.forEach((e) => window.removeEventListener(e, onActivity));
      clear();
    };
  }, [active, arm]);

  if (!warn) return null;
  return (
    <Modal
      title="Bist du noch da?"
      actions={
        <>
          <Button variant="danger" onClick={() => { clear(); warnRef.current = false; setWarn(false); onTimeoutRef.current(); }}>Jetzt beenden &amp; löschen</Button>
          <Button onClick={() => { warnRef.current = false; setWarn(false); arm(); }}>Ja, weiter</Button>
        </>
      }
    >
      <p>Aus Datenschutzgründen werden deine Eingaben in wenigen Sekunden gelöscht, wenn nichts passiert.</p>
    </Modal>
  );
};
