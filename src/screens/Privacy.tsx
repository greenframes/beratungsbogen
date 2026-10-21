import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { FooterNav } from '../components/Layout';
import { Button, ExternalLink, Modal, Notice, ScreenTitle } from '../components/ui';
import { ORG } from '../data/config';
import { useSession } from '../state/session';
import { CONSENT_PURPOSES, minorNotice, optionalConsentAllowed, requiredConsentsGiven } from '../utils/consent';
import type { ConsentPurposeId, ContactChannel } from '../types';
import type { Nav } from './types';

const Box = ({ id, checked, disabled, onChange, title, children }: { id: ConsentPurposeId; checked: boolean; disabled?: boolean; onChange: (v: boolean) => void; title: string; children: React.ReactNode }) => (
  <label className={`check ${checked ? 'on' : ''} ${disabled ? 'disabled' : ''}`} htmlFor={`c-${id}`}>
    <input id={`c-${id}`} type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
    <span><strong>{title}</strong><br /><span className="small">{children}</span></span>
  </label>
);

export const Privacy = ({ nav }: { nav: Nav }) => {
  const { session, dispatch } = useSession();
  const [details, setDetails] = useState(false);
  const now = new Date();
  const minor = minorNotice(session.contact.birthDate, now);
  const optionalOk = optionalConsentAllowed(session.contact.birthDate, now);
  const ok = requiredConsentsGiven(session);
  const [ack, proc, further] = CONSENT_PURPOSES as [typeof CONSENT_PURPOSES[0], typeof CONSENT_PURPOSES[0], typeof CONSENT_PURPOSES[0]];
  const set = (id: ConsentPurposeId) => (given: boolean) => dispatch({ type: 'setConsent', id, given, now: new Date() });
  const toggleChannel = (ch: ContactChannel) => {
    const cur = session.furtherContactChannels;
    dispatch({ type: 'setChannels', channels: cur.includes(ch) ? cur.filter((x) => x !== ch) : [...cur, ch] });
  };

  return (
    <section className="screen">
      <ScreenTitle title="Deine Daten sind bei uns sicher" lead="Kurz erklärt – du entscheidest, was du erlaubst." />
      <div className="card stack">
        <div className="row"><ShieldCheck size={26} aria-hidden style={{ color: 'var(--c-pink-700)' }} /><strong style={{ color: 'var(--c-ink)' }}>Das Wichtigste</strong></div>
        <ul style={{ margin: 0, paddingLeft: '1.2em' }}>
          <li>Verantwortlich ist die {ORG.name}.</li>
          <li>Aus deinen Angaben entsteht ein Interessentenbogen (PDF) für deine Beratung.</li>
          <li>Die App speichert nichts und sendet nichts ins Internet.</li>
          <li>Du kannst Auskunft, Löschung und Widerruf verlangen: {ORG.dataProtectionEmail}</li>
        </ul>
        <div className="row">
          <Button variant="secondary" size="sm" onClick={() => setDetails(true)}>Mehr Details</Button>
          <ExternalLink href={ORG.privacyUrl} className="btn btn-ghost btn-sm">Datenschutzerklärung</ExternalLink>
          <ExternalLink href={ORG.imprintUrl} className="btn btn-ghost btn-sm">Impressum</ExternalLink>
        </div>
      </div>
      {minor && <Notice kind="warn"><p>{minor}</p></Notice>}
      <div className="stack">
        <Box id="privacy-notice" checked={session.consents['privacy-notice'].given} onChange={set('privacy-notice')} title={`${ack.title} (Pflicht)`}>{ack.text}</Box>
        <Box id="processing" checked={session.consents.processing.given} onChange={set('processing')} title={`${proc.title} (Pflicht)`}>{proc.text}</Box>
        <Box id="further-contact" checked={session.consents['further-contact'].given} disabled={!optionalOk || !session.consents.processing.given} onChange={set('further-contact')} title={further.title}>
          {further.text}{!optionalOk && ' (Für Minderjährige derzeit nicht verfügbar.)'}
        </Box>
        {session.consents['further-contact'].given && optionalOk && (
          <div className="row" role="group" aria-label="Kontaktkanäle">
            <strong style={{ color: 'var(--c-ink)' }}>Wie dürfen wir dich erreichen?</strong>
            {(['email', 'telefon'] as ContactChannel[]).map((ch) => (
              <label key={ch} className="check" style={{ minWidth: 160 }}>
                <input type="checkbox" checked={session.furtherContactChannels.includes(ch)} onChange={() => toggleChannel(ch)} />
                <span>{ch === 'email' ? 'E-Mail' : 'Telefon / Handy'}</span>
              </label>
            ))}
          </div>
        )}
      </div>
      {details && (
        <Modal title="Datenschutz im Detail" wide onClose={() => setDetails(false)} actions={<Button onClick={() => setDetails(false)}>Schließen</Button>}>
          <div className="stack small">
            <p><strong>Welche Daten?</strong> Name, E-Mail, Handynummer, Geburtsdatum, Schulabschluss, Schulform (und freiwillig Schulname), gewählte Ausbildung, Startwunsch, Beratungswunsch und die Zeitpunkte deiner Bestätigungen.</p>
            <p><strong>Rechtsgrundlage:</strong> Die Kenntnisnahme dieser Information ist keine Einwilligung. Für den Interessentenbogen bitten wir um deine Einwilligung (Art. 6 Abs. 1 lit. a DSGVO). Die weitere Kontaktaufnahme ist ein eigener, freiwilliger Zweck, den du jederzeit widerrufen kannst.</p>
            <p><strong>Wer bekommt die Daten?</strong> Mitarbeitende der Pflegeschule, die deinen Bogen bearbeiten.</p>
            <p><strong>Wie lange?</strong> Wir löschen die Daten, wenn wir sie nicht mehr brauchen und keine gesetzlichen Fristen entgegenstehen. Frag gern nach: {ORG.dataProtectionEmail}.</p>
            <p><strong>Sicherheit:</strong> Die App speichert nichts dauerhaft im Browser. Die PDF-Datei ist nicht automatisch verschlüsselt – sie wird von uns in einem geschützten Speicherort abgelegt.</p>
            <p><strong>Unter 18?</strong> Dann prüfen wir vor der Bearbeitung, ob zusätzlich eine Zustimmung deiner Sorgeberechtigten nötig ist. Zusätzliche Einwilligungen holen wir bei Minderjährigen derzeit nicht ein.</p>
            <p><strong>Deine Rechte:</strong> Auskunft, Berichtigung, Löschung, Einschränkung, Widerspruch, Datenübertragbarkeit und Beschwerde bei der Aufsichtsbehörde.</p>
          </div>
        </Modal>
      )}
      <FooterNav onBack={nav.back} onNext={nav.next} nextDisabled={!ok} />
    </section>
  );
};
