import { useCallback, useEffect, useRef, useState } from 'react';
import { PRENOM, SHEET_URL } from './config';
import { item, PRACTICES, type LibItem, type MetricKey } from './content';
import { MiniPlayer } from './components/MiniPlayer';
import { TabBar, type Tab } from './components/TabBar';
import { VideoPlayer } from './components/VideoPlayer';
import { dayKey, sessionInfo } from './lib/dates';
import { mergedScores, parseSeconds } from './lib/derive';
import { sendToSheet } from './lib/sheet';
import { isComplete, load, rollover, save, type FeelKey, type Persisted, type ReminderKey } from './lib/state';
import { usePlayer } from './lib/usePlayer';
import { Home } from './screens/Home';
import { Journal } from './screens/Journal';
import { Library } from './screens/Library';
import { Profile } from './screens/Profile';

export default function App() {
  const [today, setToday] = useState(dayKey);
  const [s, setS] = useState<Persisted>(() => load(today));
  const [tab, setTabState] = useState<Tab>('home');
  const [video, setVideo] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number>(undefined);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { session, consultDay } = sessionInfo(today);
  const base = { date: today, prenom: PRENOM, session };

  useEffect(() => save(s), [s]);

  // Nouveau jour (app restée ouverte ou rouverte depuis l'arrière-plan)
  useEffect(() => {
    const check = () => {
      const d = dayKey();
      if (d !== today) {
        setToday(d);
        setS((cur) => rollover(cur, d));
      }
    };
    const t = window.setInterval(check, 60_000);
    document.addEventListener('visibilitychange', check);
    return () => {
      clearInterval(t);
      document.removeEventListener('visibilitychange', check);
    };
  }, [today]);

  const notify = useCallback((msg: string) => {
    clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = window.setTimeout(() => setToast(null), 2400);
  }, []);
  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const setTab = (t: Tab) => {
    setTabState(t);
    scrollRef.current?.scrollTo({ top: 0 });
  };

  const pick = (key: FeelKey, n: number) => {
    const c = { ...s.checkin, [key]: n };
    const was = c.sent;
    const complete = isComplete(c);
    if (complete) c.sent = true;
    setS({ ...s, checkin: c });
    if (complete) {
      sendToSheet('Wellbeing', { ...base, sommeil: c.sommeil, energie: c.energie, anxiete: c.anxiete });
      notify(was ? 'Check-in mis à jour ✓' : 'Check-in envoyé ✓');
    }
  };

  const markPractice = (cur: Persisted, id: string, on: boolean): Persisted => {
    const ids = { ...cur.done.ids };
    if (on) ids[id] = true;
    else delete ids[id];
    return { ...cur, done: { ...cur.done, ids }, libDone: on ? { ...cur.libDone, [id]: true } : cur.libDone };
  };

  const sendPractice = (id: string) => {
    const it = item(id);
    sendToSheet('Pratiques', { ...base, pratique: it.title, theme: it.theme, type: it.type, duree_min: it.min, statut: 'fait' });
    notify('Pratique enregistrée ✓');
  };

  const togglePractice = (id: string) => {
    const on = !s.done.ids[id];
    setS(markPractice(s, id, on));
    if (on) sendPractice(id);
  };

  const finishAudio = (id: string) => {
    if (PRACTICES.includes(id) && !s.done.ids[id]) {
      setS((cur) => markPractice(cur, id, true));
      sendPractice(id);
    } else {
      setS((cur) => ({ ...cur, libDone: { ...cur.libDone, [id]: true } }));
      notify('Audio terminé ✓');
    }
  };

  const { player, play, close } = usePlayer(finishAudio);

  const openItem = (it: LibItem) => (it.type === 'video' ? setVideo(it.id) : play(it.id));

  const closeVideo = useCallback(() => setVideo(null), []);
  const videoDone = () => {
    if (!video) return;
    const it = item(video);
    setVideo(null);
    if (s.libDone[video]) return;
    setS({ ...s, libDone: { ...s.libDone, [video]: true } });
    sendToSheet('Pratiques', { ...base, pratique: it.title, theme: it.theme, type: 'video', duree_min: it.min, statut: 'vu' });
    notify('Vidéo marquée comme vue ✓');
  };

  const setInput = (k: MetricKey, v: string) => setS((cur) => ({ ...cur, inputs: { ...cur.inputs, [k]: v } }));

  const saveScores = () => {
    const idx = session - 1;
    const vals = { bolt: parseSeconds(s.inputs.bolt), exp: parseSeconds(s.inputs.exp), mbt: parseSeconds(s.inputs.mbt) };
    if (vals.bolt == null && vals.exp == null && vals.mbt == null) {
      notify('Renseigne au moins un score');
      return;
    }
    const scores = { ...s.scores };
    (Object.keys(vals) as MetricKey[]).forEach((k) => {
      if (vals[k] == null) return;
      const a = [...scores[k]];
      a[idx] = vals[k];
      scores[k] = a;
    });
    const next = { ...s, scores, inputs: { bolt: '', exp: '', mbt: '' } };
    setS(next);
    const m = mergedScores(next);
    sendToSheet('Scores & Prescriptions', { ...base, bolt: m.bolt[idx], expiration_max: m.exp[idx], mbt: m.mbt[idx] });
    notify('Scores enregistrés ✓');
  };

  const toggleReminder = (k: ReminderKey) => {
    const on = !s.reminders[k];
    setS({ ...s, reminders: { ...s.reminders, [k]: on } });
    notify(on ? 'Rappel activé ✓' : 'Rappel désactivé');
  };

  const openSheet = () => window.open(SHEET_URL, '_blank', 'noopener');

  const v = video ? item(video) : null;

  return (
    <div className="app">
      <main ref={scrollRef} className="scroll" style={{ paddingBottom: `calc(var(--tabbar-h) + ${player ? 80 : 0}px + 28px)` }}>
        {tab === 'home' && (
          <Home
            s={s}
            today={today}
            session={session}
            consultDay={consultDay}
            playingId={player?.playing ? player.id : null}
            onPick={pick}
            onTogglePractice={togglePractice}
            onPlay={play}
            onOpenVideo={setVideo}
            onGoScores={() => setTab('journal')}
            onOpenSheet={openSheet}
          />
        )}
        {tab === 'journal' && (
          <Journal s={s} today={today} session={session} consultDay={consultDay} onInput={setInput} onSave={saveScores} onOpenSheet={openSheet} />
        )}
        {tab === 'library' && <Library filter={s.libFilter} libDone={s.libDone} onFilter={(c) => setS({ ...s, libFilter: c })} onOpen={openItem} />}
        {tab === 'profile' && <Profile session={session} reminders={s.reminders} onToggleReminder={toggleReminder} />}
      </main>

      {player && <MiniPlayer player={player} onToggle={() => play(player.id)} onClose={close} />}

      <TabBar tab={tab} onChange={setTab} />

      {v && <VideoPlayer video={v} seen={!!s.libDone[v.id]} onClose={closeVideo} onDone={videoDone} />}

      <div aria-live="polite" role="status">
        {toast && <div className="toast">{toast}</div>}
      </div>
    </div>
  );
}
