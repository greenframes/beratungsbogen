import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../App';
import { IdleGuard } from '../components/Idle';
import { SessionProvider } from '../state/session';
import { POLICY } from '../data/config';

const renderApp = () => render(<SessionProvider><App /></SessionProvider>);
const setStart = (iso: string) => fireEvent.change(screen.getByLabelText('Startdatum'), { target: { value: iso } });
const next = (u: ReturnType<typeof userEvent.setup>, name = /^Weiter/) => u.click(screen.getByRole('button', { name }));

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(2026, 9, 21, 10, 0));
  window.scrollTo = vi.fn() as never;
  Element.prototype.scrollIntoView = vi.fn();
});
afterEach(() => vi.useRealTimers());

describe('Geführter Ablauf', () => {
  it('Willkommen: keine Eingabefelder und nur ein Einstieg', () => {
    renderApp();
    expect(screen.getByRole('heading', { name: /Deine Zukunft in der Pflege beginnt hier/ })).toBeInTheDocument();
    expect(screen.queryAllByRole('textbox')).toHaveLength(0);
    expect(screen.getByRole('button', { name: /Meinen Weg entdecken/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Begleitung/ })).not.toBeInTheDocument();
  });

  it('beide Ausbildungsgänge sind wählbar, bleiben gespeichert und werden nicht vermischt', async () => {
    const u = userEvent.setup();
    renderApp();
    await u.click(screen.getByRole('button', { name: /Meinen Weg entdecken/ }));
    expect(screen.getByRole('button', { name: /^Weiter/ })).toBeDisabled();
    await u.click(screen.getByRole('radio', { name: /Pflegefachfrau/ }));
    expect(screen.getByRole('radio', { name: /Pflegefachfrau/ })).toBeChecked();
    expect(screen.getByText(/Dauer: 3 Jahre/)).toBeInTheDocument();
    expect(screen.getByText(/Dauer: 1½ Jahre/)).toBeInTheDocument();
    await u.click(screen.getByRole('radio', { name: /Pflegefachassistenz/ }));
    expect(screen.getByRole('radio', { name: /Pflegefachassistenz/ })).toBeChecked();
    expect(screen.getByRole('radio', { name: /Pflegefachfrau/ })).not.toBeChecked();
    await next(u);
    // Bildschirm Start: Termin laut Website, Wechsel zurück behält die Wahl
    await u.click(screen.getByRole('button', { name: /^Zurück/ }));
    expect(screen.getByRole('radio', { name: /Pflegefachassistenz/ })).toBeChecked();
  });

  it('Starttermin: berechnet Zeitraum und bietet „Noch offen“ an', async () => {
    const u = userEvent.setup();
    renderApp();
    await u.click(screen.getByRole('button', { name: /Meinen Weg entdecken/ }));
    await u.click(screen.getByRole('radio', { name: /Pflegefachassistenz/ }));
    await next(u);
    expect(screen.getByRole('button', { name: /^Weiter/ })).toBeDisabled();
    setStart('2027-04-01');
    expect(screen.getByText('30.09.2028')).toBeInTheDocument();
    expect(screen.getByText('18 Monate')).toBeInTheDocument();
    await u.click(screen.getByRole('button', { name: /Noch offen/ }));
    expect(screen.queryByText('30.09.2028')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Weiter/ })).toBeEnabled();
  });

  it('Pflegefachkraft: rechnet mit 3 Jahren – Ende 31.03.2030', async () => {
    const u = userEvent.setup();
    renderApp();
    await u.click(screen.getByRole('button', { name: /Meinen Weg entdecken/ }));
    await u.click(screen.getByRole('radio', { name: /Pflegefachfrau/ }));
    await next(u);
    setStart('2027-04-01');
    expect(screen.getByText('31.03.2030')).toBeInTheDocument();
    expect(screen.queryByText('30.09.2030')).not.toBeInTheDocument();
    expect(screen.queryByText(/Website/)).not.toBeInTheDocument();
  });

  it('Startdatum: einfaches Eingabefeld; Vergangenheit wird abgelehnt, das Ende wird aus der Regeldauer berechnet', async () => {
    const u = userEvent.setup();
    renderApp();
    await u.click(screen.getByRole('button', { name: /Meinen Weg entdecken/ }));
    await u.click(screen.getByRole('radio', { name: /Pflegefachassistenz/ }));
    await next(u);
    const input = screen.getByLabelText('Startdatum');
    expect(input).toHaveAttribute('type', 'date');
    expect(input).toHaveAttribute('min', '2026-10-22');
    setStart('2026-01-01');
    expect(screen.getByText(/in der Zukunft/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Weiter/ })).toBeDisabled();
    setStart('2027-09-01'); // Ende immer rechnerisch aus der Regeldauer (18 Monate)
    expect(screen.getByText('28.02.2029')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Weiter/ })).toBeEnabled();
    setStart('2027-04-01');
    expect(screen.getByText('30.09.2028')).toBeInTheDocument();
  });

  it('Vergütung der Pflegefachassistenz: keine erfundenen Beträge', async () => {
    const u = userEvent.setup();
    renderApp();
    await u.click(screen.getByRole('button', { name: /Meinen Weg entdecken/ }));
    await u.click(screen.getByRole('radio', { name: /Pflegefachassistenz/ }));
    await next(u);
    await u.click(screen.getByRole('button', { name: /Noch offen/ }));
    await next(u); // Ablauf
    expect(screen.getByText(/Hier sammelst du Praxis/)).toBeInTheDocument();
    await next(u); // Vergütung
    expect(screen.getByText(/hängt von deinem Ausbildungsträger ab/)).toBeInTheDocument();
    // Durchschnitt NRW als gerundete Spanne; keine Staffelung nach Abschnitten
    expect(screen.getByText(/ca\. 1\.300\s?€ – ca\. 1\.450\s?€|ca\. 1\.300\s?€\s?–\s?1\.450\s?€/)).toBeInTheDocument();
    expect(screen.queryByText(/Ausbildungsjahr/)).not.toBeInTheDocument();
    expect(screen.getByText(/Die tatsächliche Ausbildungsvergütung hängt von den Bedingungen/)).toBeInTheDocument();
  });

  it('Vergütung der Pflegefachkraft: drei Jahre als Bruttowerte mit Tarifhinweis', async () => {
    const u = userEvent.setup();
    renderApp();
    await u.click(screen.getByRole('button', { name: /Meinen Weg entdecken/ }));
    await u.click(screen.getByRole('radio', { name: /Pflegefachfrau/ }));
    await next(u);
    await u.click(screen.getByRole('button', { name: /Noch offen/ }));
    await next(u);
    await next(u);
    expect(screen.getAllByText(/Ausbildungsjahr/).length).toBeGreaterThanOrEqual(3);
    // nur gerundete „ca.“-Beträge, keine festen Summen
    expect(screen.getByText(/ca\. 1\.500\s?€/)).toBeInTheDocument();
    expect(screen.getByText(/ca\. 1\.550\s?€/)).toBeInTheDocument();
    expect(screen.getByText(/ca\. 1\.650\s?€/)).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/1\.490|1\.552|1\.653/);
    await next(u); // Verdienst
    expect(screen.getByText(/ca\. 4\.100\s?€ – ca\. 4\.400\s?€|ca\. 4\.100\s?€\s?–\s?4\.400\s?€/)).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/Median|4\.153|4\.329/);
  });

  it('vollständiger Durchlauf bis PDF und anschließendes Zurücksetzen ohne Datenreste', async () => {
    const u = userEvent.setup();
    renderApp();
    await u.click(screen.getByRole('button', { name: /Meinen Weg entdecken/ }));
    await u.click(screen.getByRole('radio', { name: /Pflegefachassistenz/ }));
    await next(u);
    setStart('2027-04-01');
    for (let i = 0; i < 7; i++) await next(u); // Ablauf, Vergütung, Verdienst, Karriere, Check, Angebote, Beratung
    // Beratung: erst die Entscheidung, danach (nur bei „Ja“) die Datenabfrage
    expect(screen.getByRole('button', { name: /^Weiter/ })).toBeDisabled();
    expect(screen.queryAllByRole('textbox')).toHaveLength(0);
    await u.click(screen.getByRole('radio', { name: /Ja, ich möchte ein Beratungsgespräch/ }));
    await next(u);

    // Formular: Validierung direkt am Feld
    await next(u);
    expect(screen.getByText(/Bitte gib deinen Vornamen ein/)).toBeInTheDocument();
    await u.type(screen.getByLabelText('Vorname'), 'Erika');
    await u.type(screen.getByLabelText('Nachname'), 'Testfrau');
    await u.type(screen.getByLabelText('E-Mail-Adresse'), 'falsch');
    await u.type(screen.getByLabelText('Handynummer'), '0171 1234567');
    await next(u);
    expect(screen.getByText(/Bitte prüfe die E-Mail-Adresse/)).toBeInTheDocument();
    await u.clear(screen.getByLabelText('E-Mail-Adresse'));
    await u.type(screen.getByLabelText('E-Mail-Adresse'), 'erika@example.org');
    await next(u);
    await u.type(screen.getByLabelText('Geburtsdatum'), '2010-05-04');
    await u.selectOptions(screen.getByLabelText('Schulabschluss'), 'hauptschule9');
    await u.selectOptions(screen.getByLabelText(/Aktuell besuchte Schule/), 'berufskolleg');
    await next(u);
    expect(screen.getByText('Bitte prüfe deine Auswahl')).toBeInTheDocument();
    await next(u, /Weiter zum Datenschutz/);

    // Datenschutz: Pflicht-Kenntnisnahme und -Einwilligung, Minderjährigenhinweis, optionale Einwilligung gesperrt
    expect(screen.getByRole('button', { name: /^Weiter/ })).toBeDisabled();
    expect(screen.getAllByText(/Minderjährig/).length).toBeGreaterThan(0);
    expect(screen.getByLabelText(/Freiwillig: Weitere Kontaktaufnahme/)).toBeDisabled();
    await u.click(screen.getByLabelText(/Datenschutzinformation zur Kenntnis genommen/));
    expect(screen.getByRole('button', { name: /^Weiter/ })).toBeDisabled(); // Kenntnisnahme ≠ Einwilligung
    await u.click(screen.getByLabelText(/Einwilligung: Interessentenbogen/));
    expect(screen.getByRole('button', { name: /^Weiter/ })).toBeEnabled();
    await next(u);

    // Abschluss
    expect(screen.getByText('Erika Testfrau')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole('button', { name: /PDF speichern/ })).toBeInTheDocument(), { timeout: 5000 });
    expect(screen.getByText(/Interessentenbogen_2026-10-21\.pdf/)).toBeInTheDocument();
    expect(window.localStorage.length + window.sessionStorage.length).toBe(0);
    expect(document.cookie).toBe('');
    expect(window.location.search + window.location.hash).toBe('');

    // Zurücksetzen
    await u.click(screen.getByRole('button', { name: /Sitzung beenden/ }));
    expect(screen.getByRole('heading', { name: /Deine Zukunft in der Pflege/ })).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/Erika|Testfrau|erika@example/);
    await u.click(screen.getByRole('button', { name: /Meinen Weg entdecken/ }));
    expect(screen.getByRole('radio', { name: /Pflegefachassistenz/ })).not.toBeChecked();
  }, 30000);

  it('„Nein“ beim Beratungsgespräch: keine Datenabfrage, Dankesseite ohne gespeicherte Daten', async () => {
    const u = userEvent.setup();
    renderApp();
    await u.click(screen.getByRole('button', { name: /Meinen Weg entdecken/ }));
    await u.click(screen.getByRole('radio', { name: /Pflegefachfrau/ }));
    await next(u);
    await u.click(screen.getByRole('button', { name: /Noch offen/ }));
    for (let i = 0; i < 7; i++) await next(u); // Ablauf … Angebote, dann Beratung
    await u.click(screen.getByRole('radio', { name: /Nein, danke/ }));
    expect(screen.getByRole('button', { name: /Fertig/ })).toBeEnabled();
    await u.click(screen.getByRole('button', { name: /Fertig/ }));
    expect(screen.getByRole('heading', { name: /Danke für dein Interesse/ })).toBeInTheDocument();
    expect(screen.getByText(/keine Daten von dir gespeichert/)).toBeInTheDocument();
    expect(screen.queryAllByRole('textbox')).toHaveLength(0);
    expect(screen.queryByLabelText('Vorname')).not.toBeInTheDocument();
    await u.click(screen.getByRole('button', { name: /Neu starten/ }));
    expect(screen.getByRole('heading', { name: /Deine Zukunft/ })).toBeInTheDocument();
  });

  it('Neustart-Button fragt nach und löscht die Eingaben', async () => {
    const u = userEvent.setup();
    renderApp();
    await u.click(screen.getByRole('button', { name: /Meinen Weg entdecken/ }));
    await u.click(screen.getByRole('radio', { name: /Pflegefachfrau/ }));
    await u.click(screen.getByRole('button', { name: /Neustart/ }));
    const dlg = screen.getByRole('dialog');
    await u.click(within(dlg).getByRole('button', { name: /Eingaben löschen/ }));
    expect(screen.getByRole('heading', { name: /Deine Zukunft/ })).toBeInTheDocument();
  });
});

describe('Inaktivität (Messe-Kiosk)', () => {
  it('warnt und löscht die Sitzung nach Ablauf der Inaktivitätszeit', () => {
    vi.useFakeTimers();
    const onTimeout = vi.fn();
    render(<IdleGuard active onTimeout={onTimeout} />);
    act(() => { vi.advanceTimersByTime(POLICY.idleWarnMs + 10); });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(POLICY.idleResetMs - POLICY.idleWarnMs); });
    expect(onTimeout).toHaveBeenCalledOnce();
  });
  it('„Ja, weiter“ verlängert die Sitzung', () => {
    vi.useFakeTimers();
    const onTimeout = vi.fn();
    render(<IdleGuard active onTimeout={onTimeout} />);
    act(() => { vi.advanceTimersByTime(POLICY.idleWarnMs + 10); });
    act(() => { screen.getByRole('button', { name: 'Ja, weiter' }).click(); });
    act(() => { vi.advanceTimersByTime(POLICY.idleWarnMs - 1000); });
    expect(onTimeout).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(POLICY.idleResetMs); });
    expect(onTimeout).toHaveBeenCalledOnce(); // ohne weitere Aktivität läuft die verlängerte Sitzung erneut ab
  });
  it('ist ohne Daten inaktiv', () => {
    vi.useFakeTimers();
    const onTimeout = vi.fn();
    render(<IdleGuard active={false} onTimeout={onTimeout} />);
    act(() => { vi.advanceTimersByTime(POLICY.idleResetMs * 2); });
    expect(onTimeout).not.toHaveBeenCalled();
  });
});
