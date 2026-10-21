export type ExportStatus = 'shared' | 'download-started' | 'cancelled' | 'error';

export interface ExportResult {
  status: ExportStatus;
  message: string;
}

/**
 * Übergibt die PDF an den nativen Teilen-Dialog (iPadOS) oder startet einen Download.
 * Die App kann NICHT feststellen, ob die Datei tatsächlich gespeichert wurde – die Meldungen
 * behaupten deshalb nie „gespeichert“, sondern nur, was technisch geschehen ist.
 */
export const exportPdf = async (blob: Blob, filename: string): Promise<ExportResult> => {
  try {
    const file = new File([blob], filename, { type: 'application/pdf' });
    const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
    // Teilen-Dialog nur auf Touch-Geräten (iPad/Handy). Am Rechner öffnet z. B. Chrome unter Windows sonst einen
    // Windows-Teilen-Dialog statt zu speichern – dort gilt der normale Download.
    const isTouchDevice = (navigator.maxTouchPoints ?? 0) > 1;
    if (isTouchDevice && typeof nav.share === 'function' && typeof nav.canShare === 'function' && nav.canShare({ files: [file] })) {
      try {
        await nav.share({ files: [file], title: 'Interessentenbogen' });
        return {
          status: 'shared',
          message: 'Der Teilen-Dialog wurde abgeschlossen. Bitte prüfe, ob die Datei am gewünschten Ort angekommen ist.',
        };
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return { status: 'cancelled', message: 'Der Teilen-Dialog wurde abgebrochen. Es wurde nichts gespeichert.' };
        }
        // andere Fehler: auf Download zurückfallen
      }
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
    return {
      status: 'download-started',
      message: 'Der Download wurde gestartet. Ob und wo die Datei liegt, hängt vom Browser ab – bitte im Dialog bzw. in „Dateien“ prüfen.',
    };
  } catch {
    return { status: 'error', message: 'Die PDF konnte nicht weitergegeben werden. Bitte versuche es erneut oder frage eine Mitarbeiterin bzw. einen Mitarbeiter.' };
  }
};
