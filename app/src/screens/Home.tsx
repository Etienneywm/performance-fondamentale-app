import { OBJECTIF, PRENOM } from '../config';
import { item, PRACTICES, THEMES, WATCH } from '../content';
import { CheckIcon, PauseIcon, PlayIcon, TargetIcon } from '../components/Icons';
import { dateLabel } from '../lib/dates';
import type { FeelKey, Persisted } from '../lib/state';

const SCALES: { key: FeelKey; label: string; lo: string; hi: string }[] = [
  { key: 'sommeil', label: 'Sommeil', lo: 'très mauvais', hi: 'excellent' },
  { key: 'energie', label: 'Énergie', lo: 'à plat', hi: 'pleine forme' },
  { key: 'anxiete', label: 'Anxiété', lo: 'serein·e', hi: 'très anxieux·se' }
];

interface Props {
  s: Persisted;
  today: string;
  session: number;
  consultDay: boolean;
  playingId: string | null;
  onPick: (key: FeelKey, n: number) => void;
  onTogglePractice: (id: string) => void;
  onPlay: (id: string) => void;
  onOpenVideo: (id: string) => void;
  onGoScores: () => void;
  onOpenSheet: () => void;
}

export function Home({ s, today, session, consultDay, playingId, onPick, onTogglePractice, onPlay, onOpenVideo, onGoScores, onOpenSheet }: Props) {
  const filled = SCALES.filter(({ key }) => s.checkin[key]).length;
  const sent = s.checkin.sent && filled === 3;
  const doneCount = PRACTICES.filter((id) => s.done.ids[id]).length;
  const watch = item(WATCH);
  const wt = THEMES[watch.theme];

  return (
    <div className="home">
      <header className="home__head">
        <p className="home__date">
          {dateLabel(today)} · Session {session}
        </p>
        <h1 className="home__hello">Bonjour {PRENOM}</h1>
        <div className="goal">
          <TargetIcon />
          <span>{OBJECTIF}</span>
        </div>
        {consultDay && (
          <section className="consult">
            <h2 className="kicker" style={{ padding: 0 }}>
              Jour de consultation
            </h2>
            <p className="consult__title">C'est le moment de mesurer tes scores.</p>
            <button className="btn" onClick={onGoScores}>
              Remplir mes scores
            </button>
          </section>
        )}
      </header>

      <div className="home__body">
        {/* Check-in */}
        <section className="card checkin" aria-labelledby="ci-title">
          <div className="card-head">
            <div>
              <h2 id="ci-title" className="h3">
                Check-in du matin
              </h2>
              <p className="card-head__sub">Comment tu te sens ce matin ?</p>
            </div>
            <div className={`chip${sent ? ' chip--on' : ''}`} aria-live="polite">
              {sent ? 'Envoyé ✓' : `${filled}/3`}
            </div>
          </div>
          {SCALES.map(({ key, label, lo, hi }) => {
            const v = s.checkin[key];
            return (
              <div key={key} className="scale" role="group" aria-labelledby={`sc-${key}`}>
                <div className="scale__head">
                  <span id={`sc-${key}`} className="scale__label">{label}</span>
                  <span className="small">{v ? `${v}/7` : '—'}</span>
                </div>
                <div className="scale__dots">
                  {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                    <button key={n} className="dot-btn" aria-label={`${label} ${n} sur 7`} aria-pressed={v === n} onClick={() => onPick(key, n)}>
                      <span className={`dot${v === n ? ' dot--on' : ''}`}>{n}</span>
                    </button>
                  ))}
                </div>
                <div className="scale__ends" aria-hidden="true">
                  <span>{lo}</span>
                  <span>{hi}</span>
                </div>
              </div>
            );
          })}
          <button className="btn--ghost" onClick={onOpenSheet}>
            Compléter mon journal de sommeil <span aria-hidden="true">↗</span>
          </button>
        </section>

        {/* Pratiques */}
        <section className="card practices" aria-labelledby="pr-title">
          <div className="practices__head">
            <h2 id="pr-title" className="h3">
              Tes pratiques du jour
            </h2>
            <div className="small" style={{ fontWeight: 500 }}>
              {doneCount}/{PRACTICES.length}
            </div>
          </div>
          <div className="progress">
            <div className="progress__bar" style={{ width: `${(doneCount / PRACTICES.length) * 100}%` }} />
          </div>
          <div className="stack">
            {PRACTICES.map((id) => {
              const it = item(id);
              const done = !!s.done.ids[id];
              const playing = playingId === id;
              return (
                <div key={id} className={`practice${done ? ' practice--done' : ''}`}>
                  <button className="check-btn" role="checkbox" aria-checked={done} aria-label={`Marquer ${it.title} comme fait`} onClick={() => onTogglePractice(id)}>
                    <span className={`check${done ? ' check--on' : ''}`}>{done && <CheckIcon />}</span>
                  </button>
                  <div className="practice__text">
                    <div className="practice__title">{it.title}</div>
                    <div className="small">
                      Audio · {it.min} min · {it.theme}
                    </div>
                  </div>
                  <button className="icon-btn icon-btn--soft" aria-label={`${playing ? 'Mettre en pause' : 'Écouter'} ${it.title}`} onClick={() => onPlay(id)}>
                    {playing ? <PauseIcon /> : <PlayIcon />}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* À regarder */}
        <section className="stack" style={{ gap: 12 }} aria-labelledby="wa-title">
          <h2 id="wa-title" className="kicker" style={{ padding: '0 4px' }}>
            À regarder
          </h2>
          <button className="card card--link watch" onClick={() => onOpenVideo(watch.id)}>
            <div className="thumb thumb--16x9" style={{ background: wt.bg, color: wt.fg }}>
              <span className="play-ring" style={{ width: 64, height: 64 }}>
                <PlayIcon size={22} />
              </span>
              <span className="duration-pill">{watch.min} min</span>
            </div>
            <div className="watch__body">
              <div className="theme-label">{watch.theme}</div>
              <div className="h3">{watch.title}</div>
              <div className="small">
                Vidéo · {watch.min} min{s.libDone[watch.id] ? ' · vue ✓' : ''}
              </div>
            </div>
          </button>
        </section>
      </div>
    </div>
  );
}
