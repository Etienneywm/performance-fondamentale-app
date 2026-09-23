import { GOALS } from './config';

export type Theme = 'Sommeil' | 'Respiration' | 'Intéroception' | 'Émotions';

export interface LibItem {
  id: string;
  type: 'video' | 'audio';
  theme: Theme;
  title: string;
  min: number;
  /** URL du fichier audio/vidéo. Sans URL, la lecture est simulée. */
  src?: string;
}

export const LIB: LibItem[] = [
  { id: 'l1', type: 'video', theme: 'Respiration', title: 'Pourquoi respirer par le nez', min: 8 },
  { id: 'l5', type: 'audio', theme: 'Respiration', title: 'Cohérence cardiaque', min: 5 },
  { id: 'l9', type: 'audio', theme: 'Respiration', title: 'Respiration réduite', min: 5 },
  { id: 'l2', type: 'audio', theme: 'Sommeil', title: 'Détente avant le coucher', min: 10 },
  { id: 'l6', type: 'video', theme: 'Sommeil', title: 'Ton rythme circadien', min: 9 },
  { id: 'l3', type: 'audio', theme: 'Intéroception', title: 'Scan corporel guidé', min: 7 },
  { id: 'l8', type: 'video', theme: 'Intéroception', title: 'Écouter les signaux du corps', min: 7 },
  { id: 'l4', type: 'video', theme: 'Émotions', title: 'Comprendre ton stress', min: 6 },
  { id: 'l7', type: 'audio', theme: 'Émotions', title: 'Accueillir une émotion', min: 6 }
];

/** Pratiques du jour (audios) affichées sur l'Accueil. */
export const PRACTICES = ['l5', 'l9', 'l2'];

/** Vidéo « À regarder » de l'Accueil. */
export const WATCH = 'l1';

export const THEMES: Record<Theme, { bg: string; fg: string }> = {
  Sommeil: { bg: 'var(--pf-ink)', fg: 'var(--pf-violet-soft)' },
  Respiration: { bg: 'var(--pf-violet-pale)', fg: 'var(--pf-violet)' },
  Intéroception: { bg: 'var(--pf-cream-3)', fg: 'var(--pf-ink)' },
  Émotions: { bg: 'var(--pf-violet-soft)', fg: 'var(--pf-ink)' }
};

export const CATEGORIES = ['Tout', 'Sommeil', 'Respiration', 'Intéroception', 'Émotions'] as const;
export type Category = (typeof CATEGORIES)[number];

export type MetricKey = 'bolt' | 'exp' | 'mbt';

export const METRICS: { k: MetricKey; name: string; goal: number; help: string }[] = [
  { k: 'bolt', name: 'BOLT', goal: GOALS.bolt, help: 'Après une expiration normale, pince ton nez. Arrête le chrono à la première envie de respirer.' },
  { k: 'exp', name: 'Expiration max', goal: GOALS.exp, help: 'Inspire normalement, puis expire le plus lentement et le plus longtemps possible.' },
  { k: 'mbt', name: 'MBT', goal: GOALS.mbt, help: 'Après une expiration normale, nez pincé, marche tranquillement le plus longtemps possible.' }
];

export function item(id: string): LibItem {
  const it = LIB.find((x) => x.id === id);
  if (!it) throw new Error(`Contenu inconnu : ${id}`);
  return it;
}
