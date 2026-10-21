import { createContext, useContext, useMemo, useReducer, type Dispatch, type ReactNode } from 'react';
import type { AdviceWish, ConsentPurposeId, ContactChannel, ContactData, ProgramId, Session, StartChoice } from '../types';
import { initialConsents, setConsent } from '../utils/consent';

/**
 * Sitzungszustand ausschließlich im Arbeitsspeicher (React-State).
 * Es gibt bewusst KEINE Persistenz (kein Web-Storage, keine Cookies, keine URL-Parameter).
 */
export const emptyContact = (): ContactData => ({
  firstName: '',
  lastName: '',
  email: '',
  mobile: '',
  birthDate: '',
  schoolLeaving: '',
  currentSchoolType: '',
  currentSchoolName: '',
  expectedLeavingMonth: '',
});

export const initialSession = (): Session => ({
  program: null,
  start: { kind: 'none' },
  contact: emptyContact(),
  consents: initialConsents(),
  furtherContactChannels: [],
  advice: '',
});

export type Action =
  | { type: 'setProgram'; program: ProgramId }
  | { type: 'setStart'; start: StartChoice }
  | { type: 'patchContact'; patch: Partial<ContactData> }
  | { type: 'setConsent'; id: ConsentPurposeId; given: boolean; now: Date }
  | { type: 'setChannels'; channels: ContactChannel[] }
  | { type: 'setAdvice'; advice: AdviceWish }
  | { type: 'reset' };

export const sessionReducer = (state: Session, action: Action): Session => {
  switch (action.type) {
    case 'setProgram':
      // Wechsel der Ausbildung macht einen gewählten Starttermin ungültig (Termine sind je Ausbildung)
      return state.program === action.program ? state : { ...state, program: action.program, start: { kind: 'none' } };
    case 'setStart':
      return { ...state, start: action.start };
    case 'patchContact':
      return { ...state, contact: { ...state.contact, ...action.patch } };
    case 'setConsent': {
      const consents = setConsent(state.consents, action.id, action.given, action.now);
      // Entzieht man die Hauptzustimmung, entfällt auch die optionale
      if (action.id === 'processing' && !action.given) {
        return { ...state, consents: setConsent(consents, 'further-contact', false, action.now), furtherContactChannels: [] };
      }
      if (action.id === 'further-contact' && !action.given) return { ...state, consents, furtherContactChannels: [] };
      return { ...state, consents };
    }
    case 'setChannels':
      return { ...state, furtherContactChannels: action.channels };
    case 'setAdvice':
      // „Nein“ = keine Daten mehr: bereits eingegebene Kontaktdaten und Einwilligungen werden sofort verworfen
      return action.advice === 'none'
        ? { ...state, advice: 'none', contact: emptyContact(), consents: initialConsents(), furtherContactChannels: [] }
        : { ...state, advice: action.advice };
    case 'reset':
      return initialSession();
  }
};

const SessionContext = createContext<{ session: Session; dispatch: Dispatch<Action> } | null>(null);

export const SessionProvider = ({ children, initial }: { children: ReactNode; initial?: Session }) => {
  const [session, dispatch] = useReducer(sessionReducer, initial ?? initialSession());
  const value = useMemo(() => ({ session, dispatch }), [session]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};

export const useSession = () => {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession außerhalb von SessionProvider');
  return ctx;
};
