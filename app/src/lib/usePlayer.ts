import { useCallback, useEffect, useRef, useState } from 'react';
import { item } from '../content';

export interface PlayerState {
  id: string;
  pos: number;
  dur: number;
  playing: boolean;
}

/**
 * Mini-lecteur audio. Joue le fichier `src` du contenu s'il existe,
 * sinon simule la lecture (1 s réelle = 1 s d'audio).
 */
export function usePlayer(onFinish: (id: string) => void) {
  const [player, setPlayer] = useState<PlayerState | null>(null);
  const current = useRef<PlayerState | null>(null);
  current.current = player;
  const audio = useRef<HTMLAudioElement | null>(null);
  const finish = useRef(onFinish);
  useEffect(() => {
    finish.current = onFinish;
  });

  const simulated = !!player && !audio.current;

  // Lecture simulée
  useEffect(() => {
    if (!simulated || !player?.playing) return;
    const t = setInterval(() => setPlayer((p) => (p && p.playing ? { ...p, pos: Math.min(p.dur, p.pos + 1) } : p)), 1000);
    return () => clearInterval(t);
  }, [simulated, player?.id, player?.playing]);

  useEffect(() => {
    if (simulated && player && player.playing && player.pos >= player.dur) {
      setPlayer({ ...player, playing: false });
      finish.current(player.id);
    }
  }, [simulated, player]);

  const stopAudio = () => {
    const a = audio.current;
    if (!a) return;
    audio.current = null;
    a.onpause = a.onplay = a.ontimeupdate = a.onended = a.onloadedmetadata = null;
    a.pause();
    a.removeAttribute('src');
  };
  useEffect(() => stopAudio, []);

  const start = (id: string) => {
    stopAudio();
    const it = item(id);
    setPlayer({ id, pos: 0, dur: it.min * 60, playing: true });
    if (!it.src) return;
    const a = new Audio(it.src);
    audio.current = a;
    const update = (patch: Partial<PlayerState>) => setPlayer((p) => (p && p.id === id ? { ...p, ...patch } : p));
    a.onloadedmetadata = () => update({ dur: a.duration });
    a.ontimeupdate = () => update({ pos: a.currentTime });
    a.onplay = () => update({ playing: true });
    a.onpause = () => update({ playing: false });
    a.onended = () => {
      update({ pos: a.duration, playing: false });
      finish.current(id);
    };
    a.play().catch(() => update({ playing: false }));
  };

  /** Lance un audio, ou met en pause / reprend celui en cours. */
  const play = useCallback((id: string) => {
    const p = current.current;
    if (!p || p.id !== id) return start(id);
    const playing = !p.playing;
    // Reprendre un audio terminé le relance depuis le début
    const pos = playing && p.pos >= p.dur ? 0 : p.pos;
    if (audio.current) {
      if (pos === 0) audio.current.currentTime = 0;
      if (playing) audio.current.play().catch(() => {});
      else audio.current.pause();
    }
    setPlayer({ ...p, playing, pos });
  }, []);

  const close = useCallback(() => {
    stopAudio();
    setPlayer(null);
  }, []);

  return { player, play, close };
}
