import { PRENOM, SHEET_ENDPOINT, TOTAL_SESSIONS } from '../config';
import { SheetIcon } from '../components/Icons';
import type { ReminderKey } from '../lib/state';

const REMINDERS: [ReminderKey, string, string][] = [
  ['morning', 'Check-in du matin', 'Chaque jour · 7:30'],
  ['evening', 'Pratique du soir', 'Chaque jour · 21:00'],
  ['consult', 'Veille de consultation', 'La veille · 18:00']
];

interface Props {
  session: number;
  reminders: Record<ReminderKey, boolean>;
  onToggleReminder: (k: ReminderKey) => void;
}

export function Profile({ session, reminders, onToggleReminder }: Props) {
  const left = TOTAL_SESSIONS - session;
  const connected = !!SHEET_ENDPOINT;
  return (
    <div className="screen">
      <header className="profile__id">
        <div className="avatar" aria-hidden="true">
          {PRENOM.charAt(0).toUpperCase()}
        </div>
        <h1 className="profile__name">{PRENOM}</h1>
        <div className="logo">
          Performance <span>Fondamentale</span>
        </div>
      </header>

      <section className="card sessions">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontSize: 17, fontWeight: 600 }}>
            Session {session}/{TOTAL_SESSIONS}
          </span>
          <span className="small">{left <= 0 ? 'Dernière session' : `Encore ${left} session${left > 1 ? 's' : ''}`}</span>
        </div>
        <div className="sessions__dots" aria-hidden="true">
          {Array.from({ length: TOTAL_SESSIONS }, (_, i) => i + 1).map((n) => (
            <div key={n} className={`sessions__dot${n < session ? ' sessions__dot--past' : n === session ? ' sessions__dot--now' : ''}`} />
          ))}
        </div>
      </section>

      <section className="card sheet-status">
        <span className="icon-circle">
          <SheetIcon />
        </span>
        <div className="stack" style={{ flex: 1, gap: 2 }}>
          <div className="field__label" style={{ fontWeight: 400 }}>
            Tableau de suivi
          </div>
          <div style={{ fontSize: 16, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className={`live-dot${connected ? '' : ' live-dot--off'}`} aria-hidden="true" />
            {connected ? 'Google Sheet connecté' : 'Google Sheet non connecté'}
          </div>
        </div>
      </section>

      <h2 className="kicker">Rappels</h2>
      <section className="card reminders">
        {REMINDERS.map(([k, label, time]) => (
          <div key={k} className="reminder">
            <div className="stack" style={{ flex: 1, gap: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 500 }}>{label}</div>
              <div className="small">{time}</div>
            </div>
            <button className="switch" role="switch" aria-checked={!!reminders[k]} aria-label={label} onClick={() => onToggleReminder(k)}>
              <span className="switch__track">
                <span className="switch__knob" />
              </span>
            </button>
          </div>
        ))}
      </section>
    </div>
  );
}
