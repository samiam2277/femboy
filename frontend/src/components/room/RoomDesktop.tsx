import { useGame } from '../../stores/GameContext';

// 房间物品配置（随 roomStage 变化）
const roomItems: Record<string, { emoji: string; label: string; x: number; y: number; scale?: number }[]> = {
  empty: [
    { emoji: '📱', label: '旧手机', x: 45, y: 55, scale: 1.2 },
    { emoji: '🪞', label: '小镜子', x: 30, y: 40, scale: 1.0 },
  ],
  developing: [
    { emoji: '📱', label: '手机', x: 70, y: 60, scale: 1.2 },
    { emoji: '🪞', label: '化妆镜', x: 25, y: 35, scale: 1.3 },
    { emoji: '💄', label: '化妆品', x: 35, y: 50, scale: 0.9 },
    { emoji: '👘', label: 'cos服', x: 60, y: 30, scale: 1.4 },
    { emoji: '🎀', label: '假发架', x: 15, y: 45, scale: 1.1 },
    { emoji: '📸', label: '相机', x: 80, y: 40, scale: 1.0 },
    { emoji: '💡', label: '打光灯', x: 50, y: 20, scale: 1.2 },
  ],
  refined: [
    { emoji: '📱', label: '新手机', x: 70, y: 60, scale: 1.3 },
    { emoji: '🪞', label: '专业化妆台', x: 20, y: 35, scale: 1.5 },
    { emoji: '💄', label: '大牌化妆品', x: 35, y: 50, scale: 1.0 },
    { emoji: '👗', label: '高级定制', x: 60, y: 30, scale: 1.4 },
    { emoji: '📷', label: '专业相机', x: 80, y: 40, scale: 1.3 },
    { emoji: '🖥️', label: '修图工作站', x: 45, y: 55, scale: 1.4 },
    { emoji: '✨', label: '氛围灯', x: 50, y: 20, scale: 1.1 },
  ],
  cleared: [
    { emoji: '📦', label: '打包箱', x: 40, y: 50, scale: 1.3 },
    { emoji: '🪞', label: '一面镜子', x: 60, y: 40, scale: 1.0 },
    { emoji: '📱', label: '手机', x: 30, y: 60, scale: 1.1 },
  ],
};

export default function RoomDesktop() {
  const { state, dispatch } = useGame();
  const items = roomItems[state.roomStage] ?? roomItems.empty;

  return (
    <div className="w-full h-full relative overflow-hidden"
      style={{
        background: state.roomStage === 'empty'
          ? 'linear-gradient(135deg, #2a2520 0%, #1a1815 100%)'
          : state.roomStage === 'developing'
            ? 'linear-gradient(135deg, #3d2b3d 0%, #1f1520 100%)'
            : state.roomStage === 'refined'
              ? 'linear-gradient(135deg, #2d2535 0%, #1a1520 100%)'
              : 'linear-gradient(135deg, #252a2a 0%, #151a1a 100%)',
      }}
    >
      {/* 房间背景装饰 */}
      <div className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle at 30% 40%, rgba(255,200,150,0.3) 0%, transparent 50%),
                            radial-gradient(circle at 70% 60%, rgba(200,150,255,0.2) 0%, transparent 40%)`,
        }}
      />

      {/* 桌面区域 */}
      <div className="absolute bottom-0 left-0 right-0 h-[65%]"
        style={{
          background: state.roomStage === 'empty'
            ? 'linear-gradient(to bottom, transparent 0%, rgba(139,119,101,0.3) 100%)'
            : 'linear-gradient(to bottom, transparent 0%, rgba(100,80,120,0.3) 100%)',
        }}
      />

      {/* 可交互物品 */}
      {items.map((item, idx) => (
        <button
          key={idx}
          className="absolute transition-all duration-300 hover:scale-110 active:scale-95 group"
          style={{
            left: `${item.x}%`,
            top: `${item.y}%`,
            transform: `translate(-50%, -50%) scale(${item.scale ?? 1})`,
          }}
          onClick={() => {
            // 临时：点击物品切换房间阶段（演示用）
            if (item.label === '旧手机' || item.label === '手机' || item.label === '新手机') {
              dispatch({ type: 'SET_APP', app: 'chat' });
            }
          }}
        >
          <div className="text-4xl drop-shadow-lg filter"
            style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))' }}
          >
            {item.emoji}
          </div>
          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap
            text-[10px] text-white/60 bg-black/40 px-2 py-0.5 rounded-full
            opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {item.label}
          </div>
        </button>
      ))}

      {/* 阶段提示 */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start"
        style={{ zIndex: 5 }}
      >
        <div className="text-xs text-white/40">
          <div>阶段: {state.chapter}</div>
          <div>房间: {state.roomStage}</div>
        </div>
        <button
          onClick={() => {
            const stages = ['empty', 'developing', 'refined', 'cleared'] as const;
            const next = stages[(stages.indexOf(state.roomStage) + 1) % stages.length];
            dispatch({ type: 'SET_ROOM_STAGE', stage: next });
          }}
          className="text-[10px] px-2 py-1 bg-white/10 rounded-full text-white/50 hover:bg-white/20 transition"
        >
          切换阶段 (测试)
        </button>
      </div>
    </div>
  );
}
