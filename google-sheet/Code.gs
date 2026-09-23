/**
 * Performance Fondamentale — réception des données de l'app coaché.
 *
 * À coller dans le Google Sheet du coaché : Extensions → Apps Script.
 * Voir google-sheet/README.md pour la mise en place pas à pas.
 *
 * L'app envoie un POST JSON { sheet, row }. Le script :
 *  - crée l'onglet et ses en-têtes s'ils n'existent pas ;
 *  - Wellbeing : une ligne par jour (un check-in corrigé remplace celui du jour) ;
 *  - Scores & Prescriptions : une ligne par session (les scores corrigés remplacent les anciens) ;
 *  - Pratiques : une ligne par pratique faite / vidéo vue.
 */

const TABS = {
  'Wellbeing': { headers: ['date', 'prenom', 'session', 'sommeil', 'energie', 'anxiete'], key: 'date' },
  'Pratiques': { headers: ['date', 'prenom', 'session', 'pratique', 'theme', 'type', 'duree_min', 'statut'], key: null },
  'Scores & Prescriptions': { headers: ['date', 'prenom', 'session', 'bolt', 'expiration_max', 'mbt'], key: 'session' }
};

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const { sheet, row } = JSON.parse(e.postData.contents);
    const tab = TABS[sheet];
    if (!tab || !row) return reply('onglet inconnu : ' + sheet);
    const sh = getTab(sheet, tab.headers);
    const headers = ensureHeaders(sh, Object.keys(row));
    const values = headers.map((h) => (row[norm(h)] ?? row[h] ?? ''));

    let target = sh.getLastRow() + 1;
    if (tab.key) {
      const col = headers.findIndex((h) => norm(h) === tab.key);
      if (col >= 0 && sh.getLastRow() > 1) {
        const existing = sh.getRange(2, col + 1, sh.getLastRow() - 1, 1).getDisplayValues();
        const i = existing.findIndex((r) => String(r[0]) === String(row[tab.key]));
        if (i >= 0) target = i + 2;
      }
    }
    sh.getRange(target, 1, 1, values.length).setValues([values]);
    return reply('ok');
  } finally {
    lock.releaseLock();
  }
}

/** Ouvre l'URL du déploiement dans un navigateur : « ok » = le script répond. */
function doGet() {
  return reply('ok');
}

function getTab(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
    sh.getRange('A:A').setNumberFormat('@'); // dates gardées en texte AAAA-MM-JJ
    sh.setFrozenRows(1);
  }
  return sh;
}

/** Ajoute en fin de ligne d'en-tête les champs reçus qui n'y sont pas encore. */
function ensureHeaders(sh, keys) {
  let headers = sh.getRange(1, 1, 1, Math.max(1, sh.getLastColumn())).getValues()[0].map(String).filter(Boolean);
  const missing = keys.filter((k) => !headers.some((h) => norm(h) === k));
  if (missing.length) {
    sh.getRange(1, headers.length + 1, 1, missing.length).setValues([missing]).setFontWeight('bold');
    headers = headers.concat(missing);
  }
  return headers;
}

/** « Expiration max » → « expiration_max », « Anxiété » → « anxiete » */
function norm(h) {
  return String(h).trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '_');
}

function reply(text) {
  return ContentService.createTextOutput(text);
}
