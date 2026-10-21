import { ExternalLink as ExtIcon, ShieldCheck } from 'lucide-react';
import { FooterNav } from '../components/Layout';
import { Button, Disclosure, ExternalLink, Notice, ScreenTitle } from '../components/ui';
import { ORG, POLICY } from '../data/config';
import { useSession } from '../state/session';
import { CONSENT_PURPOSES, minorNotice, optionalConsentAllowed, requiredConsentsGiven } from '../utils/consent';
import type { ConsentPurposeId, ContactChannel } from '../types';
import type { Nav } from './types';

const Box = ({ id, checked, disabled, onChange, title, children }: { id: ConsentPurposeId; checked: boolean; disabled?: boolean; onChange: (v: boolean) => void; title: string; children: React.ReactNode }) => (
  <label className={`check ${checked ? 'on' : ''} ${disabled ? 'disabled' : ''}`} htmlFor={`c-${id}`}>
    <input id={`c-${id}`} type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
    <span><strong>{title}</strong><br />{children}</span>
  </label>
);

export const Privacy = ({ nav }: { nav: Nav }) => {
  const { session, dispatch } = useSession();
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
      <ScreenTitle eyebrow="Datenschutz" title="Deine Daten – so gehen wir damit um" lead="Kurz und verständlich. Du entscheidest, was du erlaubst." />
      <div className="stack-lg">
        <div className="card stack">
          <div className="row"><ShieldCheck size={28} aria-hidden style={{ color: 'var(--c-pink-700)' }} /><h3 style={{ margin: 0 }}>Das Wichtigste in Kürze</h3></div>
          <ul style={{ margin: 0, paddingLeft: '1.2em' }}>
            <li><strong>Wer:</strong> {ORG.name} ist verantwortlich ({ORG.controller.street}, {ORG.controller.city}).</li>
            <li><strong>Wofür:</strong> Wir erstellen aus deinen Angaben einen Interessentenbogen (PDF), damit die Pflegeschule dich zu deiner gewählten Ausbildung beraten kann.</li>
            <li><strong>Wo:</strong> Die App verarbeitet deine Angaben nur auf diesem Gerät. Sie sendet nichts automatisch ins Internet.</li>
            <li><strong>Deine Rechte:</strong> Auskunft, Berichtigung, Löschung, Einschränkung, Widerspruch, Datenübertragbarkeit und Beschwerde bei der Aufsichtsbehörde.</li>
            <li><strong>Fragen:</strong> {ORG.dataProtectionEmail} oder Tel. {ORG.hagen.phone}.</li>
          </ul>
          <Disclosure title="Mehr Details für Interessierte und Eltern">
            <div className="stack small">
              <p><strong>Welche Daten?</strong> Name, E-Mail, Handynummer, Geburtsdatum, Schulabschluss, Schulform (und freiwillig Schulname), gewählte Ausbildung, Startwunsch, Beratungswunsch und die Zeitpunkte deiner Bestätigungen.</p>
              <p><strong>Rechtsgrundlage (Vorschlag, wird vor dem Einsatz rechtlich geprüft):</strong> Die Kenntnisnahme dieser Information ist keine Einwilligung. Für den Interessentenbogen bitten wir um deine Einwilligung (Art. 6 Abs. 1 lit. a DSGVO). Die optionale weitere Kontaktaufnahme ist ein eigener, freiwilliger Zweck, den du jederzeit widerrufen kannst.</p>
              <p><strong>Empfänger:</strong> Mitarbeitende der Pflegeschule, die den Bogen bearbeiten. Die Datenschutzerklärung von Aschke nennt außerdem Kostenträger, die Bezirksregierung Arnsberg und Träger der praktischen Ausbildung – aber nur im Rahmen vertraglicher oder gesetzlicher Pflichten bei einer tatsächlichen Ausbildung.</p>
              <p><strong>Speicherdauer:</strong> Laut Datenschutzerklärung von Aschke werden Daten gelöscht, wenn die Speicherung nicht mehr erforderlich ist und keine gesetzlichen Aufbewahrungs- oder Verjährungsfristen entgegenstehen. Die konkrete Frist für Interessentenbögen legt Aschke fest – frag gern danach ({ORG.dataProtectionEmail}).</p>
              <p><strong>Sicherheit:</strong> Die App speichert nichts dauerhaft im Browser. Die PDF-Datei liegt danach dort, wo du/die Mitarbeitenden sie speichern. Sie ist nicht automatisch verschlüsselt.</p>
              <p><strong>Minderjährige:</strong> Wenn du unter 18 bist, prüft Aschke vor der Bearbeitung, ob zusätzlich eine Zustimmung deiner Sorgeberechtigten bzw. ein besonderes Verfahren nötig ist. Zusätzliche Einwilligungen (z. B. weitere Kontaktaufnahme) holen wir bei Minderjährigen derzeit nicht ein.</p>
            </div>
          </Disclosure>
          <div className="row">
            <ExternalLink href={ORG.privacyUrl} className="btn btn-secondary btn-sm">Datenschutzerklärung von Aschke <ExtIcon size={16} aria-hidden /></ExternalLink>
            <ExternalLink href={ORG.imprintUrl} className="btn btn-secondary btn-sm">Impressum <ExtIcon size={16} aria-hidden /></ExternalLink>
            <span className="small muted">Benötigt Internet</span>
          </div>
          {session.assisted && <Notice kind="warn"><p><strong>Hinweis für Aschke (nur sichtbar mit Begleitung):</strong> Die Website-Datenschutzerklärung beschreibt Kontaktformular und Online-Anmeldung. Die Verarbeitung durch diese iPad-App und den PDF-Export wird dort nicht ausdrücklich erwähnt. Texte und Rechtsgrundlagen müssen datenschutzrechtlich geprüft und freigegeben werden ({POLICY.privacyInfoVersion}).</p></Notice>}
        </div>

        {minor && <Notice kind="warn"><p>{minor}</p></Notice>}
        {session.assisted && <Notice><p><strong>Für Mitarbeitende:</strong> Bitte erkläre die Punkte oben in eigenen Worten und lass die Person selbst entscheiden. Bei Minderjährigen vor der Weitergabe des Bogens das interne Verfahren zur Zustimmung der Sorgeberechtigten anwenden.</p></Notice>}

        <div className="stack">
          <Box id="privacy-notice" checked={session.consents['privacy-notice'].given} onChange={set('privacy-notice')} title={`${ack.title} (Pflicht)`}>{ack.text}</Box>
          <Box id="processing" checked={session.consents.processing.given} onChange={set('processing')} title={`${proc.title} (Pflicht für den Bogen)`}>{proc.text}</Box>
          <Box id="further-contact" checked={session.consents['further-contact'].given} disabled={!optionalOk || !session.consents.processing.given} onChange={set('further-contact')} title={further.title}>
            {further.text}
            {!optionalOk && <><br /><em>Für Minderjährige derzeit nicht verfügbar (rechtliche Prüfung offen).</em></>}
          </Box>
          {session.consents['further-contact'].given && optionalOk && (
            <div className="card soft" role="group" aria-label="Kontaktkanäle">
              <p style={{ marginBottom: 8 }}><strong>Über welche Wege dürfen wir dich kontaktieren?</strong></p>
              <div className="row">
                {(['email', 'telefon'] as ContactChannel[]).map((ch) => (
                  <label key={ch} className="check" style={{ minWidth: 200 }}>
                    <input type="checkbox" checked={session.furtherContactChannels.includes(ch)} onChange={() => toggleChannel(ch)} />
                    <span>{ch === 'email' ? 'E-Mail' : 'Telefon / Handy'}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
        {!ok && (
          <Notice><p>Ohne Kenntnisnahme und Einwilligung für den Interessentenbogen erstellen wir keinen Bogen. Du kannst die Beratung auch ohne Angaben beenden – deine Eingaben werden dann gelöscht.</p>
            <p style={{ marginTop: 12 }}><Button variant="secondary" size="sm" onClick={nav.restart}>Ohne Datenweitergabe beenden</Button></p></Notice>
        )}
      </div>
      <FooterNav onBack={nav.back} onNext={nav.next} nextDisabled={!ok} />
    </section>
  );
};
