import React from 'react';
import { useGame } from '../../stores/GameContext';
import type { PhoneApp } from '../../types/game';
import StatusBar from './StatusBar';
import HomeScreen from './HomeScreen';
import StatsScreen from '../stats/StatsScreen';

const appComponents: Record<PhoneApp, React.FC> = {
  home: HomeScreen,
  social: () => <div className="flex items-center justify-center h-full text-gray-400">社交平台（待实现）</div>,
  gallery: () => <div className="flex items-center justify-center h-full text-gray-400">相册（待实现）</div>,
  memo: () => <div className="flex items-center justify-center h-full text-gray-400">备忘录（待实现）</div>,
  chat: () => <div className="flex items-center justify-center h-full text-gray-400">聊天（待实现）</div>,
  stats: StatsScreen,
  shop: () => <div className="flex items-center justify-center h-full text-gray-400">商店（待实现）</div>,
  career: () => <div className="flex items-center justify-center h-full text-gray-400">职业（待实现）</div>,
};

export default function PhoneShell() {
  const { state } = useGame();
  const CurrentApp = appComponents[state.currentApp];

  return (
    <div className="relative flex flex-col" style={{ width: 375, height: 812 }}>
      {/* 手机外框 */}
      <div className="absolute inset-0 rounded-[48px] bg-phone-frame shadow-2xl shadow-black/60 pointer-events-none" style={{ zIndex: 10 }} />

      {/* 屏幕区域 */}
      <div className="flex-1 m-[10px] rounded-[40px] overflow-hidden bg-phone-screen relative flex flex-col">
        {/* 灵动岛/刘海 */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-8 bg-phone-notch rounded-full" style={{ zIndex: 20 }} />

        {/* 状态栏 */}
        <StatusBar />

        {/* App 内容区 */}
        <div className="flex-1 overflow-hidden relative">
          <CurrentApp />
        </div>

        {/* 底部 home 指示条 */}
        <div className="h-1 w-32 bg-white/30 rounded-full mx-auto mb-2" />
      </div>

      {/* 侧边按钮装饰 */}
      <div className="absolute -right-[3px] top-32 w-[3px] h-16 bg-gray-600 rounded-r" />
      <div className="absolute -right-[3px] top-52 w-[3px] h-10 bg-gray-600 rounded-r" />
      <div className="absolute -left-[3px] top-28 w-[3px] h-8 bg-gray-600 rounded-l" />
    </div>
  );
}
