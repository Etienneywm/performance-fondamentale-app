import { CONSULTATIONS, TOTAL_SESSIONS } from '../config';

const pad = (n: number) => String(n).padStart(2, '0');

/** Date locale au format AAAA-MM-JJ. */
export function dayKey(d = new Date()): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function addDays(key: string, n: number): string {
  const [y, m, d] = key.split('-').map(Number);
  return dayKey(new Date(y, m - 1, d + n));
}

export function fromKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** « Mercredi 23 septembre » */
export function dateLabel(key: string): string {
  const s = fromKey(key).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Initiale du jour : L, M, M, J, V, S, D */
export function weekdayInitial(key: string): string {
  return fromKey(key).toLocaleDateString('fr-FR', { weekday: 'narrow' }).toUpperCase();
}

/** Session en cours (1…TOTAL) et jour de consultation, d'après les dates du config. */
export function sessionInfo(today: string, consultations = CONSULTATIONS) {
  const passed = consultations.filter((c) => c <= today).length;
  const session = Math.min(TOTAL_SESSIONS, Math.max(1, passed));
  return { session, consultDay: consultations.includes(today) };
}

export function mmss(s: number): string {
  return `${Math.floor(s / 60)}:${pad(Math.floor(s % 60))}`;
}

/** 12.5 → « 12,5 » */
export function fmt(v: number): string {
  return String(Math.round(v * 10) / 10).replace('.', ',');
}
