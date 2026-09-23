import { describe, expect, it } from 'vitest';
import { buildChart, feelWeek, mergedScores, parseSeconds } from './derive';
import { addDays, sessionInfo } from './dates';
import { defaults, load, rollover, STORAGE_KEY } from './state';

const T = '2026-09-23';

describe('sessionInfo', () => {
  const dates = ['2026-09-02', '2026-09-09', '2026-09-23', '2026-10-07'];
  it('compte les consultations passées et détecte le jour J', () => {
    expect(sessionInfo('2026-09-23', dates)).toEqual({ session: 3, consultDay: true });
    expect(sessionInfo('2026-09-24', dates)).toEqual({ session: 3, consultDay: false });
    expect(sessionInfo('2026-08-01', dates)).toEqual({ session: 1, consultDay: false });
  });
});

describe('rollover', () => {
  it("archive le check-in complet d'hier et remet la journée à zéro", () => {
    const y = addDays(T, -1);
    const s = defaults(y);
    s.checkin = { date: y, sommeil: 5, energie: 4, anxiete: 3, sent: true };
    s.done.ids = { l5: true };
    const n = rollover(s, T);
    expect(n.history).toEqual([{ date: y, sommeil: 5, energie: 4, anxiete: 3 }]);
    expect(n.checkin).toMatchObject({ date: T, sommeil: null, sent: false });
    expect(n.done).toEqual({ date: T, ids: {} });
  });

  it("n'archive pas un check-in incomplet", () => {
    const y = addDays(T, -1);
    const s = defaults(y);
    s.checkin = { date: y, sommeil: 5, energie: null, anxiete: null, sent: false };
    expect(rollover(s, T).history).toEqual([]);
  });

  it('load tolère un stockage vide ou corrompu', () => {
    expect(load(T, { getItem: () => null }).checkin.date).toBe(T);
    expect(load(T, { getItem: () => '{oops' }).checkin.date).toBe(T);
    const saved = JSON.stringify({ ...defaults(T), libFilter: 'Sommeil' });
    expect(load(T, { getItem: (k) => (k === STORAGE_KEY ? saved : null) }).libFilter).toBe('Sommeil');
  });
});

describe('feelWeek', () => {
  it('place les jours passés et le check-in du jour sur 7 jours', () => {
    const s = defaults(T);
    s.history = [{ date: addDays(T, -2), sommeil: 3, energie: 4, anxiete: 6 }];
    s.checkin = { date: T, sommeil: 5, energie: null, anxiete: null, sent: false };
    const [sommeil] = feelWeek(s, T);
    expect(sommeil.days.map((d) => d.value)).toEqual([null, null, null, null, 3, null, 5]);
    expect(sommeil.avg).toBe('4');
    expect(sommeil.days[6].today).toBe(true);
  });
});

describe('graphiques de scores', () => {
  it('met en évidence la dernière valeur et calcule la variation', () => {
    const c = buildChart('BOLT', 25, [14, 17, null, 20, null, null, null, null]);
    expect(c.latest).toBe('20');
    expect(c.delta).toBe(3);
    expect(c.prevSession).toBe(2);
    expect(c.bars[3]).toMatchObject({ latest: true, value: '20' });
    expect(c.bars[2].pct).toBeNull();
  });

  it('première mesure sans variation', () => {
    const c = buildChart('MBT', 60, [40, null, null, null, null, null, null, null]);
    expect(c.delta).toBeNull();
  });

  it('les scores saisis passent devant ceux du config', () => {
    const s = defaults(T);
    s.scores.bolt[2] = 21;
    const m = mergedScores(s);
    expect(m.bolt.slice(0, 3)).toEqual([14, 17, 21]);
  });
});

describe('parseSeconds', () => {
  it('accepte la virgule et arrondit au dixième', () => {
    expect(parseSeconds('12,34')).toBe(12.3);
    expect(parseSeconds('')).toBeNull();
    expect(parseSeconds('0')).toBeNull();
  });
});
