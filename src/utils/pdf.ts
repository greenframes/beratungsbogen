import { jsPDF } from 'jspdf';
import type { Session } from '../types';
import { ORG, POLICY } from '../data/config';
import { sourceById } from '../data/sources';
import { CONSENT_PURPOSES, isMinor, minorNotice } from './consent';
import { fmtDate, fmtDateTime, fmtMonthYear } from './dates';
import { adviceLabel, periodLines } from './summary';
import { pdfFilename } from './filename';

export { pdfFilename };
import { SCHOOL_LEAVING_LABELS } from './eligibility';
import { fact } from '../data/facts';

const PROGRAM_NAMES = {
  fachkraft: 'Pflegefachfrau / Pflegefachmann (3 Jahre)',
  assistenz: 'Pflegefachassistenz (1½ Jahre)',
} as const;

const SCHOOL_TYPE_LABELS: Record<string, string> = {
  'nicht-mehr': 'Besuche keine allgemeinbildende Schule mehr',
  hauptschule: 'Hauptschule',
  realschule: 'Realschule',
  sekundarschule: 'Sekundarschule',
  gesamtschule: 'Gesamtschule',
  gymnasium: 'Gymnasium',
  berufskolleg: 'Berufskolleg',
  foerderschule: 'Förderschule',
  andere: 'Andere Schule',
};

/** jsPDF-Standardschriften unterstützen nur WinAnsi – Sonderzeichen vorsorglich ersetzen. */
export const pdfSafe = (s: string): string =>
  s
    .replace(/[‐‑‒]/g, '-')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/→/g, '->')
    .replace(/≥/g, '>=')
    .replace(/[^\u0009\u000A\u000D -~ -ÿ–—€…]/g, '');

const PINK = [243, 156, 165] as const;
const DARK = [69, 67, 74] as const;
const MUTED = [102, 102, 102] as const;
const PAGE_W = 210;
const MARGIN = 18;
const CONTENT_W = PAGE_W - 2 * MARGIN;
const BOTTOM = 270;

export interface PdfOptions {
  /** PNG-Bytes des Aschke-Logos; ohne Logo wird nur die Wortmarke als Text gesetzt (Tests). */
  logoPng?: Uint8Array;
}

export interface PdfInput {
  session: Session;
  now: Date;
}

export const buildInterestSheet = ({ session: s, now }: PdfInput, opts: PdfOptions = {}): jsPDF => {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: false });
  doc.setProperties({ title: 'Interessentenbogen – Ausbildungsberatung', subject: 'Interessentenbogen', creator: 'Aschke Beratungs-App' });
  const t = (x: string) => pdfSafe(x);
  let y = 0;

  const header = () => {
    if (opts.logoPng) {
      doc.addImage(opts.logoPng, 'PNG', MARGIN, 10, 40, 17.45);
    } else {
      doc.setFont('helvetica', 'bold').setFontSize(18).setTextColor(...DARK).text('Aschke', MARGIN, 20);
    }
    doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(...MUTED);
    doc.text(t(`${ORG.name}`), PAGE_W - MARGIN, 14, { align: 'right' });
    doc.text(t(`${ORG.unit} · ${ORG.hagen.street}, ${ORG.hagen.city}`), PAGE_W - MARGIN, 18, { align: 'right' });
    doc.text(t(`Tel. ${ORG.hagen.phone} · ${ORG.hagen.email}`), PAGE_W - MARGIN, 22, { align: 'right' });
    doc.setDrawColor(...PINK).setLineWidth(0.8).line(MARGIN, 31, PAGE_W - MARGIN, 31);
    y = 40;
  };

  const ensure = (h: number) => {
    if (y + h > BOTTOM) {
      doc.addPage();
      header();
    }
  };

  const heading = (text: string) => {
    ensure(14);
    y += 2;
    doc.setFont('helvetica', 'bold').setFontSize(11).setTextColor(...DARK).text(t(text), MARGIN, y);
    doc.setDrawColor(220, 220, 220).setLineWidth(0.2).line(MARGIN, y + 1.8, PAGE_W - MARGIN, y + 1.8);
    y += 7;
  };

  const row = (label: string, value: string) => {
    const lines = doc.setFont('helvetica', 'normal').setFontSize(10).splitTextToSize(t(value || '–'), CONTENT_W - 52) as string[];
    ensure(lines.length * 5 + 2);
    doc.setFont('helvetica', 'bold').setFontSize(9).setTextColor(...MUTED).text(t(label), MARGIN, y);
    doc.setFont('helvetica', 'normal').setFontSize(10).setTextColor(...DARK).text(lines, MARGIN + 52, y);
    y += lines.length * 5 + 1.5;
  };

  const para = (text: string, size = 9, color: readonly [number, number, number] = MUTED) => {
    const lines = doc.setFont('helvetica', 'normal').setFontSize(size).splitTextToSize(t(text), CONTENT_W) as string[];
    ensure(lines.length * (size * 0.42) + 2);
    doc.setTextColor(...color).text(lines, MARGIN, y);
    y += lines.length * (size * 0.42) + 1.5;
  };

  header();
  doc.setFont('helvetica', 'bold').setFontSize(18).setTextColor(...DARK).text(t('Interessentenbogen – Ausbildungsberatung'), MARGIN, y);
  y += 7;
  doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(...MUTED).text(t(`Erstellt am ${fmtDateTime(now)}`), MARGIN, y);
  y += 4;

  const minor = isMinor(s.contact.birthDate, now);
  const mn = minorNotice(s.contact.birthDate, now);
  if (mn) {
    ensure(18);
    doc.setFillColor(253, 236, 239).setDrawColor(...PINK).roundedRect(MARGIN, y, CONTENT_W, 14, 2, 2, 'FD');
    doc.setFont('helvetica', 'bold').setFontSize(9).setTextColor(...DARK).text(t('Hinweis für die Bearbeitung'), MARGIN + 3, y + 5);
    doc.setFont('helvetica', 'normal').setFontSize(8.5).text(doc.splitTextToSize(t(mn), CONTENT_W - 6) as string[], MARGIN + 3, y + 9.5);
    y += 20;
  }

  heading('Kontaktdaten');
  row('Name', `${s.contact.firstName.trim()} ${s.contact.lastName.trim()}`);
  row('E-Mail', s.contact.email.trim());
  row('Handynummer', s.contact.mobile.trim());
  if (POLICY.includeBirthDateInPdf) row('Geburtsdatum', s.contact.birthDate ? fmtDate(s.contact.birthDate) : '');

  heading('Schule');
  row('Schulabschluss', s.contact.schoolLeaving ? SCHOOL_LEAVING_LABELS[s.contact.schoolLeaving] : '');
  row('Aktuell besuchte Schule', [s.contact.currentSchoolType ? SCHOOL_TYPE_LABELS[s.contact.currentSchoolType] : '', s.contact.currentSchoolName.trim()].filter(Boolean).join(' – '));
  if (s.contact.schoolLeaving === 'noch-in-schule' && s.contact.expectedLeavingMonth) {
    row('Voraussichtlicher Abschluss', fmtMonthYear(`${s.contact.expectedLeavingMonth}-01`));
  }

  heading('Gewünschte Ausbildung');
  row('Ausbildung', s.program ? PROGRAM_NAMES[s.program] : '');
  periodLines(s).forEach((l, i) => row(i === 0 ? 'Ausbildungsstart / -zeitraum' : '', l));
  para('Das Ende ist voraussichtlich. Prüfungszeiträume, Unterbrechungen und individuelle Bedingungen können den tatsächlichen Verlauf beeinflussen. Ein Platz ist durch diese Angabe nicht reserviert.');

  heading('Beratungswunsch');
  row('Beratungstermin', adviceLabel(s.advice));
  const furtherGiven = s.consents['further-contact'].given;
  row('Weitere Kontaktaufnahme', furtherGiven ? `Ja, über: ${s.furtherContactChannels.map((c) => (c === 'email' ? 'E-Mail' : 'Telefon')).join(', ') || 'keine Kanäle gewählt'}` : minor ? 'Nicht erhoben (Minderjährige – rechtliche Prüfung offen)' : 'Nicht gewünscht');

  heading('Datenschutz und Einwilligungen');
  CONSENT_PURPOSES.forEach((p) => {
    const rec = s.consents[p.id];
    const status = rec.given ? (p.kind === 'acknowledgement' ? 'Zur Kenntnis genommen' : 'Einwilligung erteilt') : p.required ? 'NICHT erteilt' : 'Nicht erteilt';
    ensure(12);
    doc.setFont('helvetica', 'bold').setFontSize(9.5).setTextColor(...DARK).text(t(p.title), MARGIN, y);
    y += 4.6;
    doc.setFont('helvetica', 'normal').setFontSize(9.5).setTextColor(...MUTED).text(t(`${status}${rec.timestamp ? ` am ${fmtDateTime(new Date(rec.timestamp))}` : ''} · ${p.kind === 'acknowledgement' ? 'Kenntnisnahme (keine Einwilligung)' : p.required ? 'Einwilligung (Pflicht für den Bogen)' : 'Einwilligung (freiwillig)'}`), MARGIN, y);
    y += 6;
  });
  para(`Datenschutzinformation: ${POLICY.privacyInfoVersion}. Verantwortlicher: ${ORG.name}, ${ORG.controller.street}, ${ORG.controller.city}. Datenschutz: ${ORG.dataProtectionEmail}. Offizielle Datenschutzerklärung: ${ORG.privacyUrl}`);

  heading('Quellen der Ausbildungsinformationen');
  const used = s.program === 'fachkraft' ? ['aschke-fachkraft', 'pflbg', 'pflaprv'] : s.program === 'assistenz' ? ['aschke-assistenz', 'pflfassg', 'pflfassaprv'] : [];
  used.forEach((id) => {
    const src = sourceById(id);
    para(`${src.title} – ${src.publisher}. ${src.url} (abgerufen ${fmtDate(src.retrieved)})`, 8);
  });
  if (s.program) {
    const dur = s.program === 'fachkraft' ? fact('fk.duration.months') : fact('fa.duration.months');
    para(`Regeldauer in Vollzeit: ${dur.value} Monate (${dur.sources.map((i) => sourceById(i).publisher).join('; ')}).`, 8);
  }

  heading('Aufbewahrung');
  para('Dieser Bogen enthält personenbezogene Daten. Bitte nach dem Speichern nur in einem von Aschke freigegebenen, geschützten Speicherort ablegen und aus dem Download-/Dateiordner des iPads löschen. Die App selbst speichert keine Daten.', 9, DARK);

  // Fußzeile auf jeder Seite
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setDrawColor(220, 220, 220).setLineWidth(0.2).line(MARGIN, 281, PAGE_W - MARGIN, 281);
    doc.setFont('helvetica', 'normal').setFontSize(7.5).setTextColor(...MUTED);
    doc.text(t('Vertraulich – enthält personenbezogene Daten · Interne Bearbeitung durch die Aschke Pflegeschule Hagen'), MARGIN, 286);
    doc.text(`Seite ${i} von ${pages}`, PAGE_W - MARGIN, 286, { align: 'right' });
  }
  return doc;
};

export const buildPdfBlob = (input: PdfInput, opts: PdfOptions = {}): Blob =>
  buildInterestSheet(input, opts).output('blob');

export const loadLogo = async (url: string): Promise<Uint8Array | undefined> => {
  try {
    const res = await fetch(url);
    if (!res.ok) return undefined;
    return new Uint8Array(await res.arrayBuffer());
  } catch {
    return undefined;
  }
};
