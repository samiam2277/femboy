import { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import type { GameSave, GameChapter, RoomStage, PhoneApp, VisibleStats, HiddenStats } from '../types/game';
import { DEFAULT_VISIBLE_STATS, DEFAULT_HIDDEN_STATS } from '../types/game';

interface GameState extends GameSave {
  currentApp: PhoneApp;
}

type GameAction =
  | { type: 'SET_APP'; app: PhoneApp }
  | { type: 'UPDATE_VISIBLE_STATS'; stats: Partial<VisibleStats> }
  | { type: 'UPDATE_HIDDEN_STATS'; stats: Partial<HiddenStats> }
  | { type: 'ADVANCE_CHAPTER'; chapter: GameChapter }
  | { type: 'SET_ROOM_STAGE'; stage: RoomStage }
  | { type: 'ADD_FLAG'; flag: string }
  | { type: 'LOAD_SAVE'; save: GameSave }
  | { type: 'RESET' };

const initialState: GameState = {
  id: 'new-game',
  chapter: 'prologue',
  roomStage: 'empty',
  visibleStats: { ...DEFAULT_VISIBLE_STATS },
  hiddenStats: { ...DEFAULT_HIDDEN_STATS },
  baseStats: {
    skeletonIndex: 50 + Math.random() * 50,
    voiceCondition: 30 + Math.random() * 70,
    bodyHairGene: 20 + Math.random() * 60,
    skinBase: 40 + Math.random() * 60,
  },
  career: null,
  platforms: {
    bilibili: { followers: 0, activity: 0, femaleRatio: 0.3, authenticity: 50, riskValue: 0, contentFatigue: 0 },
    xiaohongshu: { followers: 0, activity: 0, femaleRatio: 0.7, authenticity: 50, riskValue: 0, contentFatigue: 0 },
    weibo: { followers: 0, activity: 0, femaleRatio: 0.4, authenticity: 50, riskValue: 0, contentFatigue: 0 },
    twitter: { followers: 0, activity: 0, femaleRatio: 0.2, authenticity: 50, riskValue: 0, contentFatigue: 0 },
    douyin: { followers: 0, activity: 0, femaleRatio: 0.5, authenticity: 50, riskValue: 0, contentFatigue: 0 },
  },
  flags: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
  currentApp: 'home',
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_APP':
      return { ...state, currentApp: action.app };
    case 'UPDATE_VISIBLE_STATS':
      return {
        ...state,
        visibleStats: { ...state.visibleStats, ...action.stats },
        updatedAt: Date.now(),
      };
    case 'UPDATE_HIDDEN_STATS':
      return {
        ...state,
        hiddenStats: { ...state.hiddenStats, ...action.stats },
        updatedAt: Date.now(),
      };
    case 'ADVANCE_CHAPTER':
      return { ...state, chapter: action.chapter, updatedAt: Date.now() };
    case 'SET_ROOM_STAGE':
      return { ...state, roomStage: action.stage, updatedAt: Date.now() };
    case 'ADD_FLAG':
      return {
        ...state,
        flags: state.flags.includes(action.flag) ? state.flags : [...state.flags, action.flag],
        updatedAt: Date.now(),
      };
    case 'LOAD_SAVE':
      return { ...action.save, currentApp: state.currentApp };
    case 'RESET':
      return { ...initialState, id: `new-game-${Date.now()}` };
    default:
      return state;
  }
}

const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
} | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
