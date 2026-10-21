import { FooterNav } from '../components/Layout';
import { NoData, Notice, ScreenTitle, SourceNote } from '../components/ui';
import { eur, fact, isAvailable, num } from '../data/facts';
import { useSession } from '../state/session';
import type { Nav } from './types';

export const Pay = ({ nav }: { nav: Nav }) => {
  const { session } = useSession();
  const program = session.program;
  if (!program) return null;
  const fk = program === 'fachkraft';
  const ids = ['pay.fk.y1', 'pay.fk.y2', 'pay.fk.y3'];
  const max = fk ? Math.max(...ids.map(num)) : 0;

  return (
    <section className="screen">
      <ScreenTitle eyebrow="Vergütung" title="Was verdiene ich während der Ausbildung?" lead="Du bekommst während der Ausbildung eine Vergütung – gezahlt vom Träger deiner praktischen Ausbildung, nicht von der Schule." />
      <div className="stack-lg">
        <Notice><p><strong>Die tatsächliche Ausbildungsvergütung hängt von den Bedingungen deines Ausbildungs- beziehungsweise Anstellungsverhältnisses ab.</strong> Es gibt keine pauschale Garantie. Alle Beträge sind Bruttowerte.</p></Notice>

        {fk ? (
          <div className="card stack">
            <div className="chips"><span className="chip warn">Beispiel: Tarif öffentlicher Dienst (TVAöD-Pflege)</span><span className="chip">brutto pro Monat</span></div>
            <h3>Beispiel für tarifliche Vergütung in drei Ausbildungsjahren</h3>
            <div className="bars" role="img" aria-label="Balkendiagramm der monatlichen Bruttoausbildungsvergütung nach Ausbildungsjahr">
              {ids.map((id, i) => (
                <div key={id} className="bar-col">
                  <div className="bar-val">{eur(num(id))}</div>
                  <div className="bar" style={{ height: `${(num(id) / max) * 70}%` }} />
                  <div className="bar-lbl">{i + 1}. Ausbildungsjahr</div>
                </div>
              ))}
            </div>
            <p className="muted small">Gesamtdauer: {num('fk.duration.months')} Monate (3 Ausbildungsjahre). Werte gelten ab {fact('pay.fk.y1').asOf.split('-').reverse().join('.')} für Auszubildende in Pflegeberufen nach dem TVAöD-Pflege, wenn der Träger der praktischen Ausbildung tarifgebunden ist.</p>
            <Notice kind="warn">
              <p><strong>Tarifabhängig:</strong> Nicht tarifgebundene oder kirchliche Träger können andere Beträge zahlen; der Tarif kann sich ändern. Für einen Start im Jahr 2027 sind spätere Tariferhöhungen möglich, die hier noch nicht enthalten sind.</p>
            </Notice>
            <SourceNote ids={['tvaod-pflege', 'pflbg']} asOf={fact('pay.fk.y1').asOf} status="dynamic" />
          </div>
        ) : (
          <div className="card stack">
            <h3>Pflegefachassistenz – 18 Monate</h3>
            {!isAvailable('pay.fa.table') && (
              <NoData>
                Für diese neue, ab 2027 bundeseinheitliche Ausbildung liegt uns keine belegte Vergütungstabelle vor. Wir erfinden keine Beträge und keine Erhöhungen für einzelne Abschnitte.
              </NoData>
            )}
            <p>Gesetzlich gilt: Der Träger der praktischen Ausbildung muss für die gesamte Dauer eine <strong>angemessene Ausbildungsvergütung</strong> zahlen (§ 17 PflFAssG). Die Höhe hängt vom Träger und von eventuellen Tarifverträgen ab. In der Beratung klären wir mit dir, welche Informationen es für deinen Ausbildungsträger gibt.</p>
            <SourceNote ids={['pflfassg', 'aschke-assistenz']} asOf="2026-10-21" status="unconfirmed" />
          </div>
        )}

        <div className="card soft">
          <h3>Gut zu wissen</h3>
          <ul style={{ margin: 0, paddingLeft: '1.2em' }}>
            <li>Die Ausbildung an der Pflegeschule ist schulgeldfrei.</li>
            <li>Der Träger der praktischen Ausbildung zahlt die Vergütung über die gesamte Ausbildungsdauer.</li>
            <li>Brutto ist nicht netto: Was dir am Ende bleibt, hängt zum Beispiel von Steuermerkmalen ab. Wir rechnen hier bewusst keine Nettobeträge aus.</li>
          </ul>
        </div>
      </div>
      <FooterNav onBack={nav.back} onNext={nav.next} />
    </section>
  );
};
