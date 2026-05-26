import { useGame } from '../../stores/GameContext';
import type { VisibleStats } from '../../types/game';

interface StatBarProps {
  label: string;
  value: number;
  color: string;
  icon: string;
  max?: number;
}

function StatBar({ label, value, color, icon, max = 100 }: StatBarProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="flex items-center gap-3 py-2">
      <span className="text-lg w-6 text-center">{icon}</span>
      <div className="flex-1">
        <div className="flex justify-between mb-1">
          <span className="text-xs text-gray-300">{label}</span>
          <span className="text-xs text-gray-400 font-mono">{Math.round(value)}</span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${pct}%`, backgroundColor: color }}
          />
        </div>
      </div>
    </div>
  );
}

const visibleStatConfig: { key: keyof VisibleStats; label: string; color: string; icon: string }[] = [
  { key: 'appearance', label: '颜值', color: '#f472b6', icon: '✨' },
  { key: 'makeupSkill', label: '妆造技术', color: '#c084fc', icon: '💄' },
  { key: 'selfAcceptance', label: '精神', color: '#60a5fa', icon: '💙' },
  { key: 'socialMask', label: '伪装', color: '#94a3b8', icon: '🎭' },
  { key: 'money', label: '经济储备', color: '#fbbf24', icon: '💰' },
  { key: 'followers', label: '网络人气', color: '#f87171', icon: '🔥' },
  { key: 'health', label: '健康/体能', color: '#34d399', icon: '💪' },
  { key: 'equipmentQuality', label: '装备质量', color: '#a78bfa', icon: '👗' },
  { key: 'skinCondition', label: '皮肤/体态', color: '#fb923c', icon: '🧴' },
  { key: 'currentCondition', label: '当前状态', color: '#22d3ee', icon: '⚡' },
];

export default function StatsScreen() {
  const { state, dispatch } = useGame();

  return (
    <div className="h-full flex flex-col bg-app-dark"
      style={{ background: 'linear-gradient(180deg, #1c1c1e 0%, #0f0f11 100%)' }}
    >
      {/* 头部 */}
      <div className="px-5 pt-4 pb-2">
        <h2 className="text-lg font-semibold text-white">角色属性</h2>
        <p className="text-xs text-gray-500 mt-0.5">可见属性 · 玩家明确感知</p>
      </div>

      {/* 属性列表 */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        <div className="bg-white/5 rounded-2xl p-3 mb-3">
          {visibleStatConfig.map((cfg) => (
            <StatBar
              key={cfg.key}
              label={cfg.label}
              value={state.visibleStats[cfg.key]}
              color={cfg.color}
              icon={cfg.icon}
            />
          ))}
        </div>

        {/* 隐藏属性暗示 */}
        <div className="bg-white/5 rounded-2xl p-3 mb-3">
          <h3 className="text-xs text-gray-500 mb-2">隐藏属性</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">女心</span>
              <span className="text-gray-600 italic">???</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">创伤累积</span>
              <span className="text-gray-600 italic">???</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">异化值</span>
              <span className="text-gray-600 italic">???</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">曝光风险</span>
              <span className="text-gray-600 italic">???</span>
            </div>
          </div>
          <p className="text-[10px] text-gray-600 mt-2 leading-relaxed">
            这些属性不会直接显示数值，但会通过内心独白和梦境事件暗示。
          </p>
        </div>

        {/* 测试按钮 */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => dispatch({ type: 'UPDATE_VISIBLE_STATS', stats: { appearance: state.visibleStats.appearance + 5 } })}
            className="flex-1 py-2 bg-accent-bg border border-accent-border rounded-xl text-xs text-accent hover:bg-accent/20 transition"
          >
            +5 颜值
          </button>
          <button
            onClick={() => dispatch({ type: 'UPDATE_VISIBLE_STATS', stats: { money: state.visibleStats.money + 100 } })}
            className="flex-1 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-xs text-yellow-400 hover:bg-yellow-500/20 transition"
          >
            +100 金钱
          </button>
        </div>
      </div>

      {/* 返回按钮 */}
      <div className="px-4 py-3 border-t border-white/5">
        <button
          onClick={() => dispatch({ type: 'SET_APP', app: 'home' })}
          className="w-full py-3 bg-white/10 rounded-xl text-sm text-white hover:bg-white/15 transition"
        >
          返回桌面
        </button>
      </div>
    </div>
  );
}
