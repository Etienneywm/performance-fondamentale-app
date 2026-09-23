import { METRICS, type MetricKey } from '../content';
import { buildChart, feelWeek, mergedScores } from '../lib/derive';
import { fmt } from '../lib/dates';
import type { Persisted } from '../lib/state';

interface Props {
  s: Persisted;
  today: string;
  session: number;
  consultDay: boolean;
  onInput: (k: MetricKey, v: string) => void;
  onSave: () => void;
  onOpenSheet: () => void;
}

export function Journal({ s, today, session, consultDay, onInput, onSave, onOpenSheet }: Props) {
  const idx = session - 1;
  const scores = mergedScores(s);
  const saved = METRICS.some(({ k }) => scores[k][idx] != null);

  return (
    <div className="screen">
      <header className="stack" style={{ gap: 4 }}>
        <h1 className="h1">Journal</h1>
        <p className="lede">Ton suivi, session après session.</p>
      </header>

      <section className={`card scores${consultDay ? ' scores--active' : ''}`} aria-labelledby="sc-title">
        <div className="card-head">
          <h2 id="sc-title" className="h3">
            Tes scores · session {session}
          </h2>
          {saved && <div className="chip chip--on">Enregistré ✓</div>}
        </div>
        {consultDay ? (
          <form
            className="stack"
            style={{ gap: 18 }}
            onSubmit={(e) => {
              e.preventDefault();
              onSave();
            }}
          >
            <p className="field__help" style={{ fontSize: 15 }}>
              Installe-toi au calme, assis·e. Chronomètre en secondes.
            </p>
            {METRICS.map((m) => {
              const arr = scores[m.k];
              let prev = '';
              for (let i = idx - 1; i >= 0; i--)
                if (arr[i] != null) {
                  prev = `S${i + 1} : ${fmt(arr[i]!)} s`;
                  break;
                }
              if (arr[idx] != null) prev = `Enregistré : ${fmt(arr[idx]!)} s`;
              return (
                <div key={m.k} className="field">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <label htmlFor={`in-${m.k}`} className="field__label">
                      {m.name}
                    </label>
                    <span id={`prev-${m.k}`} className="small">
                      {prev}
                    </span>
                  </div>
                  <div className="field__input-wrap">
                    <input
                      id={`in-${m.k}`}
                      className="field__input"
                      type="text"
                      inputMode="decimal"
                      autoComplete="off"
                      placeholder="0"
                      value={s.inputs[m.k]}
                      onChange={(e) => onInput(m.k, e.target.value.replace(/[^0-9.,]/g, ''))}
                      aria-describedby={`prev-${m.k} help-${m.k}`}
                    />
                    <span className="field__unit" aria-hidden="true">
                      s
                    </span>
                  </div>
                  <p id={`help-${m.k}`} className="field__help">
                    {m.help}
                  </p>
                </div>
              );
            })}
            <button type="submit" className="btn btn--lg">
              Enregistrer mes scores
            </button>
          </form>
        ) : (
          <p className="field__help" style={{ fontSize: 15, lineHeight: 1.6 }}>
            Tu mesureras tes scores le jour de ta prochaine consultation. D'ici là, continue tes pratiques.
          </p>
        )}
      </section>

      <h2 className="kicker">Ta progression</h2>
      {METRICS.map((m) => {
        const c = buildChart(m.name, m.goal, scores[m.k]);
        const down = c.delta != null && c.delta < 0;
        return (
          <section key={m.k} className="card chart" aria-label={`Progression ${m.name}`}>
            <div className="chart__head">
              <h3 className="chart__name">{c.name}</h3>
              <div className="chart__goal">
                <span className="dash" aria-hidden="true" />
                Objectif {c.goal} s
              </div>
            </div>
            <div className="chart__stat">
              <div className="chart__latest">
                {c.latest}
                <small>s</small>
              </div>
              <div className={`delta${down ? ' delta--down' : ''}`}>
                {c.delta == null ? 'Première mesure' : `${c.delta >= 0 ? '+' : '−'}${fmt(Math.abs(c.delta))} s vs S${c.prevSession}`}
              </div>
            </div>
            <div className="chart__plot" role="img" aria-label={c.bars.map((b, i) => `${b.label} : ${scores[m.k][i] != null ? fmt(scores[m.k][i]!) + ' s' : 'pas de mesure'}`).join(', ')}>
              <div className="chart__goal-line" style={{ bottom: `${c.goalPct}%` }} />
              {c.bars.map((b) => (
                <div key={b.label} className="chart__col">
                  <div
                    className={`chart__bar${b.filled ? ' chart__bar--filled' : ''}${b.latest ? ' chart__bar--latest' : ''}`}
                    style={{ height: b.pct != null ? `${b.pct}%` : '4px' }}
                  />
                  {b.value && (
                    <div className="chart__val" style={{ bottom: `calc(${b.pct}% + 4px)` }}>
                      {b.value}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="chart__labels" aria-hidden="true">
              {c.bars.map((b) => (
                <span key={b.label} className={b.latest ? 'is-latest' : undefined}>
                  {b.label}
                </span>
              ))}
            </div>
          </section>
        );
      })}

      <h2 className="kicker">Ton ressenti · 7 derniers jours</h2>
      <section className="card feel" aria-label="Ton ressenti sur 7 jours">
        {feelWeek(s, today).map((f) => (
          <div key={f.key} className="feel__row">
            <div className="feel__meta">
              <div className="feel__label">{f.label}</div>
              <div className="small">
                moy. <span className="feel__avg">{f.avg}</span>/7
              </div>
              {f.note && <div className="small">{f.note}</div>}
            </div>
            <div className="feel__bars" role="img" aria-label={f.days.map((d) => (d.value ? `${d.value}/7` : 'aucune donnée')).join(', ')}>
              {f.days.map((d, i) => (
                <div key={i} className={`feel__day${d.today ? ' is-today' : ''}`}>
                  <div className="feel__track">
                    <div
                      className={`feel__bar${d.value ? (d.today ? ' feel__bar--today' : ' feel__bar--filled') : ''}`}
                      style={{ height: d.value ? `${(d.value / 7) * 100}%` : '4px' }}
                    />
                  </div>
                  <span aria-hidden="true">{d.day}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="sleep">
        <h2 className="h3">Journal de sommeil</h2>
        <p>Tes nuits se notent dans ton tableau de suivi.</p>
        <button className="btn btn--ink" onClick={onOpenSheet}>
          Ouvrir dans Google Sheet ↗
        </button>
      </section>
    </div>
  );
}
