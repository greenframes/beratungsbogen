import { useState, type ChangeEvent, type ReactNode } from 'react';
import { AlertCircle, Pencil } from 'lucide-react';
import { FooterNav } from '../components/Layout';
import { Button, Notice, ScreenTitle } from '../components/ui';
import { useSession } from '../state/session';
import type { ContactData, CurrentSchoolType, SchoolLeaving } from '../types';
import { fmtDate, fmtMonthYear } from '../utils/dates';
import { SCHOOL_LEAVING_LABELS } from '../utils/eligibility';
import { validateAll, validateContactStep, type FieldErrors } from '../utils/validation';
import { periodLines } from '../utils/summary';
import type { Nav } from './types';

const SCHOOL_TYPES: Record<CurrentSchoolType, string> = {
  'nicht-mehr': 'Ich besuche keine allgemeinbildende Schule mehr',
  hauptschule: 'Hauptschule',
  realschule: 'Realschule',
  sekundarschule: 'Sekundarschule',
  gesamtschule: 'Gesamtschule',
  gymnasium: 'Gymnasium',
  berufskolleg: 'Berufskolleg',
  foerderschule: 'Förderschule',
  andere: 'Andere Schule',
};

const Field = ({ id, label, hint, error, children }: { id: string; label: string; hint?: string; error?: string; children: ReactNode }) => (
  <div className="field">
    <label htmlFor={id}>{label}</label>
    {children}
    {hint && !error && <span className="hint" id={`${id}-hint`}>{hint}</span>}
    {error && <div className="error" id={`${id}-err`} role="alert"><AlertCircle size={18} aria-hidden style={{ flex: 'none', marginTop: 2 }} />{error}</div>}
  </div>
);

const FIELD_IDS: Record<keyof ContactData, string> = { firstName: 'fn', lastName: 'ln', email: 'em', mobile: 'mo', birthDate: 'bd', schoolLeaving: 'sl', currentSchoolType: 'cs', currentSchoolName: 'sn', expectedLeavingMonth: 'el' };

const PROGRAM_LABEL = { fachkraft: 'Pflegefachfrau / Pflegefachmann (3 Jahre)', assistenz: 'Pflegefachassistenz (1½ Jahre)' } as const;

export const Contact = ({ nav }: { nav: Nav }) => {
  const { session, dispatch } = useSession();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof ContactData, boolean>>>({});
  const c = session.contact;
  const now = new Date();

  const set = (k: keyof ContactData) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const patch = { [k]: e.target.value } as Partial<ContactData>;
    dispatch({ type: 'patchContact', patch });
    if (touched[k] && step !== 3) {
      const next = validateContactStep(step, { ...c, ...patch }, now);
      setErrors((prev) => ({ ...prev, [k]: next[k] }));
    }
  };
  const blur = (k: keyof ContactData) => () => {
    setTouched((t) => ({ ...t, [k]: true }));
    if (step !== 3) setErrors((prev) => ({ ...prev, [k]: validateContactStep(step, c, now)[k] }));
  };
  const props = (k: keyof ContactData, id: string) => ({
    id,
    value: c[k],
    onChange: set(k),
    onBlur: blur(k),
    'aria-invalid': !!errors[k],
    'aria-describedby': errors[k] ? `${id}-err` : `${id}-hint`,
  });

  // Bildschirmtastatur: fokussiertes Feld in die Bildschirmmitte scrollen, damit Buttons/Felder nicht verdeckt werden
  const onFocusCapture = (e: React.FocusEvent) => {
    const t = e.target as HTMLElement;
    if (['INPUT', 'SELECT'].includes(t.tagName)) setTimeout(() => t.scrollIntoView({ block: 'center', behavior: 'smooth' }), 350);
  };

  const goNext = () => {
    if (step === 3) {
      const all = validateAll(session.program, session.start, c, now);
      setErrors(all);
      if (Object.keys(all).length === 0) nav.next();
      return;
    }
    const e = validateContactStep(step, c, now);
    setErrors(e);
    setTouched(Object.fromEntries(Object.keys(c).map((k) => [k, true])) as Partial<Record<keyof ContactData, boolean>>);
    if (Object.keys(e).length === 0) setStep((s) => (s === 1 ? 2 : 3));
    else {
      const first = (Object.keys(e) as (keyof ContactData)[])[0];
      if (first) document.getElementById(FIELD_IDS[first])?.focus();
    }
  };

  const goBack = () => {
    setErrors({});
    if (step === 1) nav.back();
    else setStep((s) => (s === 3 ? 2 : 1));
  };

  return (
    <section className="screen" onFocusCapture={onFocusCapture}>
      <ScreenTitle title="Deine Kontaktdaten" lead="Damit wir dich beraten können – mehr fragen wir nicht." />
      <div className="steps-mini" style={{ margin: 0 }} aria-label={`Formularschritt ${step} von 3`}>
        {[1, 2, 3].map((n) => <span key={n} className={`dot ${n === step ? 'on' : ''}`}>{n}</span>)}
        <span>{step === 1 ? 'Kontakt' : step === 2 ? 'Schule' : 'Auswahl prüfen'}</span>
      </div>
      <div className="card">
        {step === 1 && (
          <div className="form-grid" role="group" aria-label="Kontakt">
            <Field id="fn" label="Vorname" error={errors.firstName}><input className="input" autoComplete="off" autoCapitalize="words" enterKeyHint="next" {...props('firstName', 'fn')} /></Field>
            <Field id="ln" label="Nachname" error={errors.lastName}><input className="input" autoComplete="off" autoCapitalize="words" enterKeyHint="next" {...props('lastName', 'ln')} /></Field>
            <Field id="em" label="E-Mail-Adresse" hint="Beispiel: name@beispiel.de" error={errors.email}><input className="input" placeholder="name@beispiel.de" type="email" inputMode="email" autoComplete="off" autoCapitalize="none" autoCorrect="off" spellCheck={false} {...props('email', 'em')} /></Field>
            <Field id="mo" label="Handynummer" hint="Beispiel: 0171 1234567" error={errors.mobile}><input className="input" placeholder="0171 1234567" type="tel" inputMode="tel" autoComplete="off" {...props('mobile', 'mo')} /></Field>
          </div>
        )}
        {step === 2 && (
          <div className="form-grid" role="group" aria-label="Schule">
            <Field id="bd" label="Geburtsdatum" error={errors.birthDate}>
              <input className="input" type="date" max={new Date().toISOString().slice(0, 10)} autoComplete="off" {...props('birthDate', 'bd')} />
            </Field>
            <Field id="sl" label="Schulabschluss" error={errors.schoolLeaving}>
              <select className="input" {...props('schoolLeaving', 'sl')}>
                <option value="">Bitte wählen</option>
                {(Object.keys(SCHOOL_LEAVING_LABELS) as SchoolLeaving[]).map((k) => <option key={k} value={k}>{SCHOOL_LEAVING_LABELS[k]}</option>)}
              </select>
            </Field>
            <Field id="cs" label="Aktuell besuchte Schule (Schulform)" error={errors.currentSchoolType}>
              <select className="input" {...props('currentSchoolType', 'cs')}>
                <option value="">Bitte wählen</option>
                {(Object.keys(SCHOOL_TYPES) as CurrentSchoolType[]).map((k) => <option key={k} value={k}>{SCHOOL_TYPES[k]}</option>)}
              </select>
            </Field>
            {c.schoolLeaving === 'noch-in-schule' && (
              <Field id="el" label="Voraussichtlicher Abschluss (Monat/Jahr)" error={errors.expectedLeavingMonth}>
                <input className="input" type="month" min={now.toISOString().slice(0, 7)} autoComplete="off" {...props('expectedLeavingMonth', 'el')} />
              </Field>
            )}
            <div className="full">
              <Field id="sn" label="Name der Schule (freiwillig)" error={errors.currentSchoolName}>
                <input className="input" autoComplete="off" maxLength={100} {...props('currentSchoolName', 'sn')} />
              </Field>
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="stack">
            <h3>Bitte prüfe deine Auswahl</h3>
            <dl className="facts-dl">
              <dt>Ausbildung</dt>
              <dd>{session.program ? PROGRAM_LABEL[session.program] : '–'} <Button variant="ghost" size="sm" onClick={() => nav.goTo(1)}><Pencil size={16} aria-hidden /> ändern</Button></dd>
              <dt>Start</dt>
              <dd>{session.program ? periodLines(session)[0] : '–'} <Button variant="ghost" size="sm" onClick={() => nav.goTo(2)}><Pencil size={16} aria-hidden /> ändern</Button></dd>
              <dt>Schule</dt>
              <dd>{c.schoolLeaving ? SCHOOL_LEAVING_LABELS[c.schoolLeaving] : '–'}{c.schoolLeaving === 'noch-in-schule' && c.expectedLeavingMonth ? ` (Abschluss ${fmtMonthYear(`${c.expectedLeavingMonth}-01`)})` : ''}</dd>
              <dt>Geburtsdatum</dt><dd>{c.birthDate ? fmtDate(c.birthDate) : '–'}</dd>
            </dl>
            {(errors.program || errors.start) && <Notice kind="danger"><p>{errors.program ?? errors.start}</p></Notice>}
            {Object.keys(errors).filter((k) => k !== 'program' && k !== 'start').length > 0 && <Notice kind="danger"><p>Bitte gehe zurück und korrigiere die markierten Angaben.</p></Notice>}
            
          </div>
        )}
      </div>
      <FooterNav onBack={goBack} onNext={goNext} nextLabel={step === 3 ? 'Weiter zum Datenschutz' : 'Weiter'} />
    </section>
  );
};
