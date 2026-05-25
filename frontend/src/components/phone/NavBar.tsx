import { useGame } from '../../stores/GameContext';
import type { PhoneApp } from '../../types/game';

interface NavItem {
  app: PhoneApp;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    app: 'home',
    label: '桌面',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    app: 'stats',
    label: '属性',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 20V10M12 20V4M6 20v-6" />
      </svg>
    ),
  },
  {
    app: 'chat',
    label: '聊天',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    app: 'social',
    label: '社交',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    app: 'shop',
    label: '商店',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
    ),
  },
];

export default function NavBar() {
  const { state, dispatch } = useGame();

  return (
    <div className="flex items-center justify-around px-2 py-2 bg-black/40 backdrop-blur-xl border-t border-white/5">
      {navItems.map((item) => {
        const active = state.currentApp === item.app;
        return (
          <button
            key={item.app}
            onClick={() => dispatch({ type: 'SET_APP', app: item.app })}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all duration-200 ${
              active ? 'text-white' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <div className={active ? 'drop-shadow-[0_0_6px_rgba(255,255,255,0.5)]' : ''}>
              {item.icon}
            </div>
            <span className="text-[10px]">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
