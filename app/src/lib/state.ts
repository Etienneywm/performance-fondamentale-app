import type { Category, MetricKey } from '../content';
import { TOTAL_SESSIONS } from '../config';

export type FeelKey = 'sommeil' | 'energie' | 'anxiete';

export interface Checkin {
  date: string;
  sommeil: number | null;
  energie: number | null;
  anxiete: number | null;
  sent: boolean;
}

/** Check-in complet d'un jour passé. */
export interface DayFeel {
  date: string;
  sommeil: number;
  energie: number;
  anxiete: number;
}

export type ReminderKey = 'morning' | 'evening' | 'consult';

export interface Persisted {
  checkin: Checkin;
  history: DayFeel[];
  /** Pratiques cochées aujourd'hui. */
  done: { date: string; ids: Record<string, true> };
  /** Contenus déjà faits / vus (toutes dates). */
  libDone: Record<string, true>;
  /** Scores saisis dans l'app, un par session (null = rien saisi). */
  scores: Record<MetricKey, (number | null)[]>;
  inputs: Record<MetricKey, string>;
  reminders: Record<ReminderKey, boolean>;
  libFilter: Category;
}

export const STORAGE_KEY = 'pf-coache-v2';
const HISTORY_DAYS = 60;

const emptyCheckin = (date: string): Checkin => ({ date, sommeil: null, energie: null, anxiete: null, sent: false });
const emptyScores = () => Array<number | null>(TOTAL_SESSIONS).fill(null);

export function defaults(today: string): Persisted {
  return {
    checkin: emptyCheckin(today),
    history: [],
    done: { date: today, ids: {} },
    libDone: {},
    scores: { bolt: emptyScores(), exp: emptyScores(), mbt: emptyScores() },
    inputs: { bolt: '', exp: '', mbt: '' },
    reminders: { morning: true, evening: true, consult: true },
    libFilter: 'Tout'
  };
}

export function isComplete(c: Checkin): boolean {
  return !!(c.sommeil && c.energie && c.anxiete);
}

/** Passage à un nouveau jour : archive le check-in d'hier, remet à zéro le check-in et les pratiques. */
export function rollover(s: Persisted, today: string): Persisted {
  let next = s;
  if (s.checkin.date !== today) {
    const c = s.checkin;
    let history = s.history;
    if (isComplete(c)) {
      history = [...history.filter((h) => h.date !== c.date), { date: c.date, sommeil: c.sommeil!, energie: c.energie!, anxiete: c.anxiete! }]
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-HISTORY_DAYS);
    }
    next = { ...next, history, checkin: emptyCheckin(today) };
  }
  if (s.done.date !== today) next = { ...next, done: { date: today, ids: {} } };
  return next;
}

export function load(today: string, storage: Pick<Storage, 'getItem'> | undefined = globalThis.localStorage): Persisted {
  const def = defaults(today);
  let saved: Partial<Persisted> | null = null;
  try {
    saved = JSON.parse(storage?.getItem(STORAGE_KEY) ?? 'null');
  } catch {
    saved = null;
  }
  const s: Persisted = saved && typeof saved === 'object' ? { ...def, ...saved } : def;
  return rollover(s, today);
}

export function save(s: Persisted): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* stockage indisponible (navigation privée) : l'app reste utilisable */
  }
}
