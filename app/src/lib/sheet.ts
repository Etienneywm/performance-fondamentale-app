import { SHEET_ENDPOINT } from '../config';

export type SheetName = 'Wellbeing' | 'Pratiques' | 'Scores & Prescriptions';

/**
 * Envoie une ligne au Google Sheet via l'Apps Script : POST JSON { sheet, row }.
 * `text/plain` + `no-cors` évite le pré-vol CORS, qu'Apps Script ne gère pas.
 */
export function sendToSheet(sheet: SheetName, row: Record<string, unknown>): void {
  if (!SHEET_ENDPOINT) {
    console.info('[Sheet simulé]', sheet, row);
    return;
  }
  fetch(SHEET_ENDPOINT, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ sheet, row })
  }).catch((e) => console.warn('[Sheet] envoi impossible', e));
}
