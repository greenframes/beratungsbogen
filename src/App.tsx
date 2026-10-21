import { useCallback, useEffect, useRef, useState } from 'react';
import { IdleGuard } from './components/Idle';
import { ProgressBar, RestartDialog, STEP_TITLES, TopBar } from './components/Layout';
import { useSession } from './state/session';
import { Advice } from './screens/Advice';
import { Career } from './screens/Career';
import { Check } from './screens/Check';
import { ChooseProgram } from './screens/ChooseProgram';
import { Contact } from './screens/Contact';
import { Finish } from './screens/Finish';
import { Income } from './screens/Income';
import { Offers } from './screens/Offers';
import { Pay } from './screens/Pay';
import { Privacy } from './screens/Privacy';
import { Process } from './screens/Process';
import { StartDate } from './screens/StartDate';
import { Welcome } from './screens/Welcome';
import type { Nav } from './screens/types';

const LAST = STEP_TITLES.length - 1;

export const App = () => {
  const { session, dispatch } = useSession();
  const [step, setStep] = useState(0);
  const [askRestart, setAskRestart] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  const hasData = session.program !== null || session.contact.firstName !== '' || session.contact.email !== '';

  const doRestart = useCallback(() => {
    dispatch({ type: 'reset' });
    setStep(0);
    setAskRestart(false);
  }, [dispatch]);

  const goTo = useCallback((i: number) => setStep(Math.max(0, Math.min(LAST, i))), []);
  const nav: Nav = {
    next: () => goTo(step + 1),
    back: () => goTo(step - 1),
    goTo,
    restart: doRestart,
  };

  // Beim Bildschirmwechsel nach oben scrollen und Titel fokussieren (Screenreader/Tastatur)
  useEffect(() => {
    window.scrollTo({ top: 0 });
    mainRef.current?.querySelector<HTMLElement>('[data-screen-title]')?.focus({ preventScroll: true });
  }, [step]);

  const screens = [Welcome, ChooseProgram, StartDate, Process, Pay, Income, Career, Check, Offers, Contact, Privacy, Advice, Finish];
  const Screen = screens[step] ?? Welcome;

  return (
    <div className="app">
      <TopBar onRestart={() => (hasData ? setAskRestart(true) : doRestart())} showRestart={step > 0} />
      {step > 0 && <ProgressBar step={step} onJump={goTo} />}
      <main className="main" ref={mainRef}>
        <Screen nav={nav} />
      </main>
      {askRestart && <RestartDialog hasData={hasData} onCancel={() => setAskRestart(false)} onConfirm={doRestart} />}
      <IdleGuard active={step > 0 && hasData} onTimeout={doRestart} />
    </div>
  );
};
