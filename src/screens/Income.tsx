import { FooterNav } from '../components/Layout';
import { NoData, Notice, ScreenTitle, SourceNote } from '../components/ui';
import { eur, fact, isAvailable, num } from '../data/facts';
import { useSession } from '../state/session';
import type { Nav } from './types';

const RangeBar = ({ lo, hi, scaleMax }: { lo: number; hi: number; scaleMax: number }) => (
  <div className="range" role="img" aria-label={`Spanne von ${eur(lo)} bis ${eur(hi)}`}>
    <div className="fill" style={{ left: `${(lo / scaleMax) * 100}%`, width: `${((hi - lo) / scaleMax) * 100}%`, minWidth: 14 }} />
  </div>
);

export const Income = ({ nav }: { nav: Nav }) => {
  const { session } = useSession();
  const program = session.program;
  if (!program) return null;
  const fk = program === 'fachkraft';
  const a = num(fk ? 'inc.fk.alten' : 'inc.fa.alten');
  const k = num(fk ? 'inc.fk.kranken' : 'inc.fa.kranken');
  const lo = Math.min(a, k);
  const hi = Math.max(a, k);
  const scaleMax = 5000;
  const rows = fk
    ? [{ label: 'Fachkräfte in der Altenpflege', id: 'inc.fk.alten' }, { label: 'Fachkräfte in der Krankenpflege', id: 'inc.fk.kranken' }]
    : [{ label: 'Helfer*innenberufe in der Altenpflege', id: 'inc.fa.alten' }, { label: 'Helfer*innenberufe in der Krankenpflege', id: 'inc.fa.kranken' }];

  return (
    <section className="screen">
      <ScreenTitle eyebrow="Verdienst" title="Was verdiene ich nach der Ausbildung?" lead="Eine Orientierung auf Basis amtlicher Statistik – kein Gehaltsversprechen." />
      <div className="stack-lg">
        <div className="card stack">
          <div className="chips"><span className="chip blue">Statistik, kein Tarif</span><span className="chip">Median, brutto pro Monat</span></div>
          <h3>{fk ? 'Pflegefachkräfte' : 'Pflege-Hilfsberufe (statistisch)'} – mittleres Entgelt in Deutschland</h3>
          <p className="stat">
            {eur(lo)} – {eur(hi)}
          </p>
          <RangeBar lo={lo} hi={hi} scaleMax={scaleMax} />
          <div className="row small muted" style={{ justifyContent: 'space-between' }}><span>0 €</span><span>{eur(scaleMax)}</span></div>
          <table className="simple">
            <thead><tr><th>Berufsgruppe</th><th>Median brutto / Monat</th></tr></thead>
            <tbody>{rows.map((r) => <tr key={r.id}><td>{r.label}</td><td><strong>{eur(num(r.id))}</strong></td></tr>)}</tbody>
          </table>
          <p className="small muted">
            <strong>Was bedeutet „Median“?</strong> Die Hälfte der erfassten Vollzeitbeschäftigten verdient weniger, die andere Hälfte mehr. Es ist kein Durchschnitt. Stichtag 31.12.2024, sozialversicherungspflichtig Vollzeitbeschäftigte ohne Auszubildende, Deutschland insgesamt (nicht nur NRW), alle Berufserfahrungsstufen – nicht nur Berufseinsteiger.
          </p>
          {!fk && (
            <Notice kind="warn"><p>Die Statistik erfasst „Helfer*innenberufe“ in der Kranken- und Altenpflege. Die ab 2027 bundeseinheitliche Pflegefachassistenz ist darin nicht gesondert ausgewiesen; die Werte sind deshalb nur eine grobe Orientierung.</p></Notice>
          )}
          <SourceNote ids={['iab-entgelte-2024']} asOf={fact('inc.fk.alten').asOf} status="dynamic" />
        </div>

        <div className="card stack">
          <h3>Tarifliche Einstiegsvergütung</h3>
          {!isAvailable('inc.tariff.entry') && <NoData>Eine belegte Tariftabelle für den Einstieg nach der Ausbildung ist in der Faktenbasis noch nicht hinterlegt. Die Beratung nennt dir gern Anhaltspunkte für einzelne Arbeitgeber.</NoData>}
        </div>

        <Notice>
          <p><strong>Was dein Einkommen beeinflusst:</strong> Berufserfahrung, Arbeitszeit (Voll- oder Teilzeit), Arbeitgeber, Tarifbindung, Zulagen (z. B. Schichtdienst) und Qualifikation. Ein Nettobetrag hängt zusätzlich von Steuermerkmalen und persönlichen Umständen ab – deshalb zeigen wir keine Nettogehälter.</p>
        </Notice>
      </div>
      <FooterNav onBack={nav.back} onNext={nav.next} />
    </section>
  );
};
