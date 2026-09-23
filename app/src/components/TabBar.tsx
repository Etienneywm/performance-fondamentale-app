import { TAB_PATHS } from './Icons';

export type Tab = keyof typeof TAB_PATHS;

const TABS: [Tab, string][] = [
  ['home', 'Accueil'],
  ['journal', 'Journal'],
  ['library', 'Bibliothèque'],
  ['profile', 'Profil']
];

export function TabBar({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav className="tabbar" aria-label="Navigation principale">
      {TABS.map(([k, label]) => (
        <button key={k} className="tab" aria-current={tab === k ? 'page' : undefined} onClick={() => onChange(k)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d={TAB_PATHS[k]} />
          </svg>
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
