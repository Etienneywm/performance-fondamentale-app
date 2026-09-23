import { CATEGORIES, LIB, THEMES, type Category, type LibItem } from '../content';
import { PlayIcon, WaveIcon } from '../components/Icons';

interface Props {
  filter: Category;
  libDone: Record<string, true>;
  onFilter: (c: Category) => void;
  onOpen: (it: LibItem) => void;
}

export function Library({ filter, libDone, onFilter, onOpen }: Props) {
  const items = LIB.filter((it) => filter === 'Tout' || it.theme === filter);
  return (
    <div className="lib">
      <header className="lib__head">
        <h1 className="h1">Bibliothèque</h1>
        <p className="lede">Tes vidéos et audios, à ton rythme.</p>
      </header>
      <div className="filters" role="toolbar" aria-label="Filtrer par thème">
        {CATEGORIES.map((c) => (
          <button key={c} className="filter" aria-pressed={filter === c} onClick={() => onFilter(c)}>
            {c}
          </button>
        ))}
      </div>
      <div className="lib__grid">
        {items.map((it) => {
          const t = THEMES[it.theme];
          const kind = it.type === 'video' ? 'Vidéo' : 'Audio';
          return (
            <button key={it.id} className="card card--link lib-card" onClick={() => onOpen(it)}>
              <div className="thumb thumb--4x3" style={{ background: t.bg, color: t.fg }}>
                <span className="play-ring" style={{ width: 48, height: 48 }}>
                  {it.type === 'video' ? <PlayIcon size={18} /> : <WaveIcon />}
                </span>
                {libDone[it.id] && <span className="done-pill">fait ✓</span>}
              </div>
              <div className="lib-card__body">
                <div className="lib-card__theme">{it.theme}</div>
                <div className="lib-card__title">{it.title}</div>
                <div className="small">
                  {kind} · {it.min} min
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
