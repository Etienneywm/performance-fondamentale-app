/* ============================================================
   Réglages du coaché — à adapter pour chaque accompagnement.
   ============================================================ */

/** URL de déploiement de ton Apps Script (Web app). Vide = envoi simulé (console). */
export const SHEET_ENDPOINT = 'https://script.google.com/macros/s/AKfycbw62mTnZyV3tPSvpxNAP2KmCltDzAs0JwcsrhmeFzgpxJ4TH3HoLW13r8icypW6TYZP/exec';

/** Lien vers le Google Sheet du coaché (journal de sommeil). */
export const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1bc7DQU0SyiFgIcTSlvMGkyOqFiE9rJESGU0sIfYkjt0/edit';

export const PRENOM = 'Camille';

export const OBJECTIF = 'Restaurer le sommeil + respiration fonctionnelle';

/** Nombre total de sessions de l'accompagnement. */
export const TOTAL_SESSIONS = 8;

/**
 * Dates des consultations (AAAA-MM-JJ), dans l'ordre : S1, S2, S3…
 * - Le numéro de session affiché = nombre de consultations déjà passées (aujourd'hui inclus).
 * - Le jour d'une consultation, le bandeau « Jour de consultation » s'affiche
 *   et la saisie des scores s'ouvre dans le Journal.
 */
export const CONSULTATIONS: string[] = [
  '2026-09-02',
  '2026-09-09',
  '2026-09-23',
  '2026-10-07',
  '2026-10-21',
  '2026-11-04',
  '2026-11-18',
  '2026-12-02'
];

/** Objectifs (en secondes) affichés en pointillés sur les graphiques. Valeurs d'exemple. */
export const GOALS = { bolt: 25, exp: 45, mbt: 60 };

/**
 * Scores déjà mesurés en consultation (un par session, null = pas encore mesuré).
 * Ceux saisis dans l'app s'ajoutent par-dessus. Valeurs d'exemple : remplace-les.
 */
export const INITIAL_SCORES = {
  bolt: [14, 17],
  exp: [28, 33],
  mbt: [38, 44]
};
