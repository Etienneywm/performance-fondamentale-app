import { useEffect, useRef, useState } from 'react';
import type { LibItem } from '../content';
import { CloseIcon, PlayIcon } from './Icons';

interface Props {
  video: LibItem;
  seen: boolean;
  onClose: () => void;
  onDone: () => void;
}

/** Lecteur vidéo plein écran. Sans `src`, affiche un emplacement réservé. */
export function VideoPlayer({ video, seen, onClose, onDone }: Props) {
  const [pct, setPct] = useState(0);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="video" role="dialog" aria-modal="true" aria-label={video.title}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button ref={closeRef} className="icon-btn video__close" onClick={onClose} aria-label="Fermer la vidéo">
          <CloseIcon />
        </button>
      </div>
      <div className="video__main">
        <div className="video__screen">
          {video.src ? (
            <video
              src={video.src}
              controls
              playsInline
              autoPlay
              onTimeUpdate={(e) => {
                const v = e.currentTarget;
                if (v.duration) setPct((v.currentTime / v.duration) * 100);
              }}
            />
          ) : (
            <>
              <span className="play-ring" style={{ width: 72, height: 72 }}>
                <PlayIcon size={26} />
              </span>
              <span className="small" style={{ color: 'var(--pf-text-on-ink)' }}>
                Lecteur vidéo · {video.min} min
              </span>
            </>
          )}
        </div>
        <div className="video__progress">
          <div style={{ width: `${pct}%` }} />
        </div>
        <div className="stack" style={{ gap: 6 }}>
          <div className="video__theme">{video.theme}</div>
          <h2 className="video__title">{video.title}</h2>
        </div>
      </div>
      <button className="btn btn--lg" onClick={seen ? onClose : onDone}>
        {seen ? 'Fermer' : 'Marquer comme vue'}
      </button>
    </div>
  );
}
