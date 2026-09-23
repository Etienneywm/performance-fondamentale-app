import { item } from '../content';
import { mmss } from '../lib/dates';
import type { PlayerState } from '../lib/usePlayer';
import { CloseIcon, PauseIcon, PlayIcon } from './Icons';

interface Props {
  player: PlayerState;
  onToggle: () => void;
  onClose: () => void;
}

export function MiniPlayer({ player, onToggle, onClose }: Props) {
  const it = item(player.id);
  const pct = player.dur ? (player.pos / player.dur) * 100 : 0;
  return (
    <div className="player" role="region" aria-label="Lecteur audio">
      <div className="player__row">
        <div className="player__text">
          <div className="player__title">{it.title}</div>
          <div className="player__time">
            {mmss(player.pos)} / {mmss(player.dur)} · {it.theme}
          </div>
        </div>
        <button className="icon-btn player__toggle" onClick={onToggle} aria-label={player.playing ? 'Pause' : 'Lecture'}>
          {player.playing ? <PauseIcon /> : <PlayIcon />}
        </button>
        <button className="icon-btn player__close" onClick={onClose} aria-label="Fermer le lecteur">
          <CloseIcon />
        </button>
      </div>
      <div className="player__progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)} aria-label="Progression">
        <div style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
