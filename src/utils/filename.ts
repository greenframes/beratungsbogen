export const pdfFilename = (now: Date): string => {
  const d = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  return `Interessentenbogen_${d}.pdf`;
};
