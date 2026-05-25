import { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import type { LifeStats } from '../data/storyData';
import { DEFAULT_STATS, talents as allTalents } from '../data/storyData';

export type GamePhase = 'title' | 'talent_select' | 'stat_allocate' | 'playing' | 'event' | 'ended';

export interface LifeState {
  phase: GamePhase;
  age: number;
  birthYear: number;
  currentYear: number;
  stats: LifeStats;
  tags: string[];
  triggeredEvents: string[];
  history: YearRecord[];
  currentEventId: string | null;
  talents: string[];
  allocatedStats: Partial<LifeStats>;
}

export interface YearRecord {
  age: number;
  year: number;
  description: string;
  eventId?: string;
  choiceIndex?: number;
  statsSnapshot: LifeStats;
  tagsSnapshot: string[];
  isNews?: boolean;
  isEvent?: boolean;
}

type LifeAction =
  | { type: 'START_GAME'; birthYear?: number }
  | { type: 'SELECT_TALENTS'; talents: string[] }
  | { type: 'ALLOCATE_STATS'; stats: Partial<LifeStats> }
  | { type: 'ADVANCE_YEAR'; record: YearRecord }
  | { type: 'SET_AGE'; age: number; year: number }
  | { type: 'TRIGGER_EVENT'; eventId: string }
  | { type: 'RESOLVE_EVENT'; choiceIndex: number; effects: Partial<LifeStats>; addTags: string[]; removeTags: string[]; record: YearRecord }
  | { type: 'END_GAME' }
  | { type: 'RESET' };

const initialState: LifeState = {
  phase: 'title',
  age: 0,
  birthYear: 2006,
  currentYear: 2006,
  stats: { ...DEFAULT_STATS },
  tags: [],
  triggeredEvents: [],
  history: [],
  currentEventId: null,
  talents: [],
  allocatedStats: {},
};

function clampStats(s: LifeStats): LifeStats {
  return {
    appearance: Math.max(0, Math.min(100, s.appearance)),
    selfAcceptance: Math.max(0, s.selfAcceptance),
    socialMask: Math.max(0, Math.min(100, s.socialMask)),
    money: Math.max(0, s.money),
    health: Math.max(0, Math.min(100, s.health)),
    followers: Math.max(0, s.followers),
    trauma: Math.max(0, Math.min(100, s.trauma)),
    genderSpectrum: Math.max(0, Math.min(100, s.genderSpectrum)),
  };
}

function lifeReducer(state: LifeState, action: LifeAction): LifeState {
  switch (action.type) {
    case 'START_GAME': {
      const by = action.birthYear ?? 2006;
      return {
        ...initialState,
        phase: 'talent_select',
        birthYear: by,
        currentYear: by,
        stats: { ...DEFAULT_STATS },
        tags: [],
        talents: [],
        allocatedStats: {},
      };
    }
    case 'SELECT_TALENTS': {
      return {
        ...state,
        phase: 'stat_allocate',
        talents: action.talents,
      };
    }
    case 'ALLOCATE_STATS': {
      const baseStats = { ...DEFAULT_STATS };
      const allocated = action.stats;

      // 应用天赋效果
      const selectedTalents = allTalents.filter((t) => state.talents.includes(t.id));
      const talentEffects: Partial<LifeStats> = {};
      const talentTags: string[] = [];
      for (const t of selectedTalents) {
        for (const [k, v] of Object.entries(t.effects)) {
          if (v !== undefined) {
            talentEffects[k as keyof LifeStats] = (talentEffects[k as keyof LifeStats] || 0) + v;
          }
        }
        if (t.addTags) talentTags.push(...t.addTags);
      }

      const mergedStats = clampStats({
        appearance: baseStats.appearance + (allocated.appearance ?? 0) + (talentEffects.appearance ?? 0),
        selfAcceptance: baseStats.selfAcceptance + (allocated.selfAcceptance ?? 0) + (talentEffects.selfAcceptance ?? 0),
        socialMask: baseStats.socialMask + (allocated.socialMask ?? 0) + (talentEffects.socialMask ?? 0),
        money: baseStats.money + (allocated.money ?? 0) + (talentEffects.money ?? 0),
        health: baseStats.health + (allocated.health ?? 0) + (talentEffects.health ?? 0),
        followers: baseStats.followers + (allocated.followers ?? 0) + (talentEffects.followers ?? 0),
        trauma: baseStats.trauma + (allocated.trauma ?? 0) + (talentEffects.trauma ?? 0),
        genderSpectrum: baseStats.genderSpectrum + (allocated.genderSpectrum ?? 0) + (talentEffects.genderSpectrum ?? 0),
      });

      const newTags = [...state.tags];
      for (const tag of talentTags) {
        if (!newTags.includes(tag)) newTags.push(tag);
      }

      return {
        ...state,
        phase: 'playing',
        stats: mergedStats,
        allocatedStats: allocated,
        tags: newTags,
      };
    }
    case 'ADVANCE_YEAR': {
      return {
        ...state,
        age: action.record.age,
        currentYear: action.record.year,
        history: [...state.history, action.record],
        phase: 'playing',
      };
    }
    case 'SET_AGE': {
      return { ...state, age: action.age, currentYear: action.year };
    }
    case 'TRIGGER_EVENT': {
      return {
        ...state,
        phase: 'event',
        currentEventId: action.eventId,
        triggeredEvents: state.triggeredEvents.includes(action.eventId)
          ? state.triggeredEvents
          : [...state.triggeredEvents, action.eventId],
      };
    }
    case 'RESOLVE_EVENT': {
      const newStats = clampStats({
        appearance: state.stats.appearance + (action.effects.appearance ?? 0),
        selfAcceptance: state.stats.selfAcceptance + (action.effects.selfAcceptance ?? 0),
        socialMask: state.stats.socialMask + (action.effects.socialMask ?? 0),
        money: state.stats.money + (action.effects.money ?? 0),
        health: state.stats.health + (action.effects.health ?? 0),
        followers: state.stats.followers + (action.effects.followers ?? 0),
        trauma: state.stats.trauma + (action.effects.trauma ?? 0),
        genderSpectrum: state.stats.genderSpectrum + (action.effects.genderSpectrum ?? 0),
      });
      const newTags = state.tags
        .filter((t) => !action.removeTags.includes(t))
        .concat(action.addTags.filter((t) => !state.tags.includes(t)));
      return {
        ...state,
        stats: newStats,
        tags: newTags,
        history: [...state.history, action.record],
        age: action.record.age,
        currentYear: action.record.year,
        phase: 'playing',
        currentEventId: null,
      };
    }
    case 'END_GAME': {
      return { ...state, phase: 'ended' };
    }
    case 'RESET': {
      return { ...initialState };
    }
    default:
      return state;
  }
}

const LifeContext = createContext<{
  state: LifeState;
  dispatch: React.Dispatch<LifeAction>;
} | null>(null);

export function LifeProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(lifeReducer, initialState);
  return (
    <LifeContext.Provider value={{ state, dispatch }}>
      {children}
    </LifeContext.Provider>
  );
}

export function useLife() {
  const ctx = useContext(LifeContext);
  if (!ctx) throw new Error('useLife must be used within LifeProvider');
  return ctx;
}
