import { useCallback, useEffect, useRef, useState } from 'react';
import { IdleGuard } from './components/Idle';
import { ProgressBar, RestartDialog, stepTitles, TopBar } from './components/Layout';
import { useSession } from './state/session';
import { Advice } from './screens/Advice';
import { Career } from './screens/Career';
import { Check } from './screens/Check';
import { ChooseProgram } from './screens/ChooseProgram';
import { Contact } from './screens/Contact';
import { Finish } from './screens/Finish';
import { Goodbye } from './screens/Goodbye';
import { Income } from './screens/Income';
import { Offers } from './screens/Offers';
import { Pay } from './screens/Pay';
import { Privacy } from './screens/Privacy';
import { Process } from './screens/Process';
import { StartDate } from './screens/StartDate';
import { Welcome } from './screens/Welcome';
import type { Nav } from './screens/types';

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

  const titles = stepTitles(session.advice);
  const goTo = useCallback((i: number) => setStep(Math.max(0, Math.min(titles.length - 1, i))), [titles.length]);
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

  const base = [Welcome, ChooseProgram, StartDate, Process, Pay, Income, Career, Check, Offers, Advice];
  const screens = session.advice === 'none' ? [...base, Goodbye] : [...base, Contact, Privacy, Finish];
  const Screen = screens[step] ?? Welcome;

  return (
    <div className="app">
      <TopBar step={step} titles={titles} onRestart={() => (hasData ? setAskRestart(true) : doRestart())} />
      {step > 0 && <ProgressBar step={step} titles={titles} onJump={goTo} />}
      <main className="main" ref={mainRef}>
        <Screen nav={nav} />
      </main>
      {askRestart && <RestartDialog hasData={hasData} onCancel={() => setAskRestart(false)} onConfirm={doRestart} />}
      <IdleGuard active={step > 0 && hasData} onTimeout={doRestart} />
    </div>
  );
};
