import { INITIAL_SCORES, TOTAL_SESSIONS } from '../config';
import { METRICS, type MetricKey } from '../content';
import { addDays, fmt, weekdayInitial } from './dates';
import type { FeelKey, Persisted } from './state';

/** Scores affichés : ceux saisis dans l'app, sinon ceux du config. */
export function mergedScores(s: Persisted): Record<MetricKey, (number | null)[]> {
  const out = {} as Record<MetricKey, (number | null)[]>;
  for (const { k } of METRICS) {
    out[k] = Array.from({ length: TOTAL_SESSIONS }, (_, i) => s.scores[k]?.[i] ?? INITIAL_SCORES[k][i] ?? null);
  }
  return out;
}

export interface ChartBar {
  label: string;
  /** Hauteur en % de la zone du graphique ; null = barre vide. */
  pct: number | null;
  latest: boolean;
  filled: boolean;
  value: string;
}

export interface Chart {
  name: string;
  goal: number;
  goalPct: number;
  latest: string;
  /** Écart avec la mesure précédente ; null = première mesure. */
  delta: number | null;
  prevSession: number | null;
  bars: ChartBar[];
}

export function buildChart(name: string, goal: number, values: (number | null)[]): Chart {
  let li = -1;
  values.forEach((v, i) => {
    if (v != null) li = i;
  });
  let pi = -1;
  for (let i = li - 1; i >= 0; i--)
    if (values[i] != null) {
      pi = i;
      break;
    }
  const present = values.filter((v): v is number => v != null);
  const max = Math.max(goal * 1.2, ...present) * 1.12;
  return {
    name,
    goal,
    goalPct: (goal / max) * 100,
    latest: li >= 0 ? fmt(values[li]!) : '—',
    delta: li >= 0 && pi >= 0 ? values[li]! - values[pi]! : null,
    prevSession: pi >= 0 ? pi + 1 : null,
    bars: values.map((v, i) => ({
      label: `S${i + 1}`,
      pct: v != null ? (v / max) * 100 : null,
      latest: i === li,
      filled: v != null,
      value: i === li && v != null ? fmt(v) : ''
    }))
  };
}

export interface FeelRow {
  key: FeelKey;
  label: string;
  note: string;
  avg: string;
  days: { day: string; value: number | null; today: boolean }[];
}

const FEEL: [FeelKey, string, string][] = [
  ['sommeil', 'Sommeil', ''],
  ['energie', 'Énergie', ''],
  ['anxiete', 'Anxiété', 'plus bas = mieux']
];

/** Les 7 derniers jours (aujourd'hui inclus), alimentés par les check-ins. */
export function feelWeek(s: Persisted, today: string): FeelRow[] {
  const dates = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6));
  return FEEL.map(([key, label, note]) => {
    const days = dates.map((date) => {
      const value = date === today ? (s.checkin.date === today ? s.checkin[key] : null) : (s.history.find((h) => h.date === date)?.[key] ?? null);
      return { day: weekdayInitial(date), value, today: date === today };
    });
    const ok = days.map((d) => d.value).filter((v): v is number => !!v);
    return { key, label, note, avg: ok.length ? fmt(ok.reduce((a, b) => a + b, 0) / ok.length) : '—', days };
  });
}

/** « 12,5 » ou « 12.5 » → 12.5 ; vide / invalide → null */
export function parseSeconds(raw: string): number | null {
  const v = parseFloat(String(raw).replace(',', '.'));
  return Number.isFinite(v) && v > 0 ? Math.round(v * 10) / 10 : null;
}
