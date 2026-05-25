import { useEffect, useState } from 'react';

export default function StatusBar() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center justify-between px-8 pt-3 pb-1 text-white text-xs font-medium select-none" style={{ zIndex: 21 }}>
      <span>{time}</span>
      <div className="flex items-center gap-1">
        {/* 信号 */}
        <div className="flex items-end gap-[2px] h-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-[3px] bg-white rounded-sm" style={{ height: `${i * 3}px` }} />
          ))}
        </div>
        {/* WiFi */}
        <svg width="14" height="11" viewBox="0 0 14 11" fill="none" className="text-white">
          <path d="M7 0L0.5 4.5L1.5 6L7 2L12.5 6L13.5 4.5L7 0Z" fill="currentColor" />
          <path d="M7 4L3 7L4 8.5L7 6L10 8.5L11 7L7 4Z" fill="currentColor" />
        </svg>
        {/* 电量 */}
        <div className="flex items-center gap-[2px]">
          <span>85%</span>
          <div className="w-5 h-[10px] border border-white/60 rounded-[2px] p-[1px] flex items-center">
            <div className="h-full w-[80%] bg-white rounded-[1px]" />
          </div>
        </div>
      </div>
    </div>
  );
}
