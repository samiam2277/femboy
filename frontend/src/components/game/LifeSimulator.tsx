import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLife } from '../../stores/LifeContext';
import {
  lifeEvents,
  getMundaneDesc,
  eraNews,
  determineEnding,
  drawTalents,
  type LifeEvent,
  type LifeChoice,
  type LifeStats,
  type Talent,
} from '../../data/storyData';
import CGScene from './CGScenes';

// ============================================================
// 标题画面
// ============================================================
function TitleScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white px-6">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-wider bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
          男娘人生模拟器
        </h1>
        <p className="text-gray-400 text-sm max-w-xs mx-auto leading-relaxed">
          在主流世界的缝隙中，经营你的第二人生。
          <br />
          每一个选择都有代价，每一条道路都通向不同的和解。
        </p>
        <div className="pt-4">
          <button
            onClick={onStart}
            className="px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-sm transition-all active:scale-95"
          >
            开始人生
          </button>
        </div>
        <p className="text-[10px] text-gray-600 pt-4">
          本游戏包含对亚文化身份、社会压力的写实描写。
          <br />
          这是一个个体的虚构故事，不代表任何群体，也不评判任何选择。
        </p>
      </div>
    </div>
  );
}

// ============================================================
// 天赋选择画面
// ============================================================
function TalentSelectScreen({ onConfirm }: { onConfirm: (talents: Talent[]) => void }) {
  const [pool, setPool] = useState<Talent[]>(() => drawTalents(10));
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < 3) {
        next.add(id);
      }
      return next;
    });
  };

  const handleRefresh = () => {
    setPool(drawTalents(10));
    setSelected(new Set());
  };

  const selectedTalents = pool.filter((t) => selected.has(t.id));

  return (
    <div className="h-full flex flex-col items-center justify-center bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white px-6">
      <div className="w-full max-w-sm space-y-4">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            天赋抽取
          </h2>
          <p className="text-gray-400 text-sm">从以下10个天赋中选择最多3个</p>
        </div>

        <div className="grid grid-cols-1 gap-2 max-h-[50vh] overflow-y-auto">
          {pool.map((t) => {
            const isSelected = selected.has(t.id);
            return (
              <button
                key={t.id}
                onClick={() => toggle(t.id)}
                className={`text-left p-3 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-pink-500/20 border-pink-500/40'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-medium ${t.rare ? 'text-amber-300' : 'text-white'}`}>
                    {t.name} {t.rare ? '★' : ''}
                  </span>
                  {isSelected && <span className="text-pink-400 text-xs">已选</span>}
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{t.description}</p>
              </button>
            );
          })}
        </div>

        <div className="text-center text-xs text-gray-500">
          已选择 {selected.size}/3
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm transition-all"
          >
            重新抽取
          </button>
          <button
            onClick={() => onConfirm(selectedTalents)}
            disabled={selected.size === 0}
            className="flex-1 py-2.5 bg-gradient-to-r from-pink-500/20 to-purple-500/20 hover:from-pink-500/30 hover:to-purple-500/30 border border-pink-500/20 rounded-xl text-sm font-medium transition-all disabled:opacity-40"
          >
            确认选择
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 属性分配画面
// ============================================================
function StatAllocateScreen({ onConfirm }: { onConfirm: (stats: Partial<LifeStats>) => void }) {
  const totalPoints = 20;
  const maxPerStat = 8;

  const [allocated, setAllocated] = useState<Partial<LifeStats>>({
    appearance: 0,
    selfAcceptance: 0,
    socialMask: 0,
    money: 0,
    health: 0,
    followers: 0,
    trauma: 0,
    genderSpectrum: 0,
  });

  const labels: Record<keyof LifeStats, string> = {
    appearance: '外在呈现',
    selfAcceptance: '内心自洽',
    socialMask: '社会面具',
    money: '经济储备',
    health: '健康',
    followers: '粉丝基础',
    trauma: '创伤韧性',
    genderSpectrum: '性别光谱',
  };

  const used = Object.values(allocated).reduce((sum, v) => sum + (v || 0), 0);
  const remaining = totalPoints - used;

  const adjust = (key: keyof LifeStats, delta: number) => {
    setAllocated((prev) => {
      const current = prev[key] || 0;
      const nextVal = Math.max(0, Math.min(maxPerStat, current + delta));
      if (delta > 0 && remaining <= 0) return prev;
      return { ...prev, [key]: nextVal };
    });
  };

  return (
    <div className="h-full flex flex-col items-center justify-center bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white px-6">
      <div className="w-full max-w-sm space-y-4">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            属性分配
          </h2>
          <p className="text-gray-400 text-sm">
            将 {totalPoints} 点属性分配到8项属性中（每项最多 {maxPerStat} 点）
          </p>
          <div className="text-pink-300 text-sm font-medium">剩余点数: {remaining}</div>
        </div>

        <div className="space-y-2">
          {(Object.keys(labels) as Array<keyof LifeStats>).map((key) => {
            const val = allocated[key] || 0;
            return (
              <div key={key} className="flex items-center gap-3 bg-white/5 rounded-xl px-3 py-2">
                <span className="text-xs text-gray-400 w-20">{labels[key]}</span>
                <div className="flex-1 flex items-center gap-2">
                  <button
                    onClick={() => adjust(key, -1)}
                    className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 text-xs flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="text-sm font-mono w-4 text-center">{val}</span>
                  <button
                    onClick={() => adjust(key, 1)}
                    disabled={val >= maxPerStat || remaining <= 0}
                    className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 text-xs flex items-center justify-center disabled:opacity-30"
                  >
                    +
                  </button>
                </div>
                <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-pink-400 to-purple-400"
                    style={{ width: `${(val / maxPerStat) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              const points = totalPoints;
              const keys: (keyof LifeStats)[] = ['appearance', 'selfAcceptance', 'socialMask', 'money', 'health', 'followers', 'trauma', 'genderSpectrum'];
              const alloc: Record<string, number> = {};
              keys.forEach((k) => (alloc[k] = 0));
              const order = [...keys].sort(() => Math.random() - 0.5);
              let r = points;
              for (const k of order) {
                const m = Math.min(maxPerStat, r);
                const v = Math.floor(Math.random() * (m + 1));
                alloc[k] = v;
                r -= v;
                if (r <= 0) break;
              }
              while (r > 0) {
                const k = order[Math.floor(Math.random() * order.length)];
                if (alloc[k] < maxPerStat) { alloc[k]++; r--; }
              }
              setAllocated(alloc as Partial<LifeStats>);
            }}
            className="flex-1 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-gray-300 transition-all active:scale-[0.98]"
          >
            随机分配
          </button>
          <button
            onClick={() => onConfirm(allocated)}
            disabled={remaining !== 0}
            className="flex-1 py-2 bg-gradient-to-r from-pink-500/20 to-purple-500/20 hover:from-pink-500/30 hover:to-purple-500/30 border border-pink-500/20 rounded-xl text-xs font-medium transition-all disabled:opacity-40"
          >
            {remaining > 0 ? `还有 ${remaining} 点` : '开始人生'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 年度推进组件
// ============================================================
function YearCard({
  age,
  year,
  description,
  isNews,
  isEvent,
}: {
  age: number;
  year: number;
  description: string;
  isNews?: boolean;
  isEvent?: boolean;
}) {
  return (
    <div
      className={`py-3 px-4 rounded-xl mb-2 text-sm leading-relaxed ${
        isNews
          ? 'bg-amber-500/10 border border-amber-500/20 text-amber-200'
          : isEvent
          ? 'bg-pink-500/10 border border-pink-500/20 text-pink-100'
          : 'bg-white/5 text-gray-300'
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-mono text-gray-500">
          {year}年 · {age}岁
        </span>
        {isNews && <span className="text-[10px] text-amber-400">时代</span>}
        {isEvent && <span className="text-[10px] text-pink-400">事件</span>}
      </div>
      {description}
    </div>
  );
}

// ============================================================
// 属性变化格式化
// ============================================================
const statLabels: Record<string, string> = {
  appearance: '外在',
  selfAcceptance: '自洽',
  socialMask: '面具',
  money: '金钱',
  health: '健康',
  followers: '粉丝',
  trauma: '创伤',
  genderSpectrum: '光谱',
};

function formatEffects(effects: Partial<LifeStats>): string {
  const parts = Object.entries(effects)
    .map(([key, value]) => {
      if (value === undefined || value === 0) return null;
      const sign = value > 0 ? '+' : '';
      return `${statLabels[key] || key}${sign}${value}`;
    })
    .filter(Boolean);
  return parts.length > 0 ? `\n[${parts.join(' | ')}]` : '';
}

// ============================================================
// 事件弹窗
// ============================================================
function EventModal({
  event,
  onChoose,
}: {
  event: LifeEvent;
  onChoose: (choice: LifeChoice) => void;
}) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-gray-900 border border-white/10 rounded-2xl p-5 shadow-2xl">
        <h3 className="text-lg font-semibold text-white mb-2">{event.title}</h3>
        <p className="text-sm text-gray-300 leading-relaxed mb-5">{event.description}</p>
        <div className="space-y-2">
          {event.choices.map((c, i) => (
            <button
              key={i}
              onClick={() => onChoose(c)}
              className="w-full text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/15 transition-all text-sm text-gray-200 active:scale-[0.98]"
            >
              {c.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 结局预览弹窗
// ============================================================
function PreviewModal({ onClose }: { onClose: () => void }) {
  const { state } = useLife();
  const ending = useMemo(() => determineEnding(state.stats, state.tags), [state.stats, state.tags]);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-gray-900 border border-white/10 rounded-2xl p-5 shadow-2xl text-center space-y-4">
        <h3 className="text-lg font-semibold text-white">当前人生走向</h3>
        <div className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
          {ending.title}
        </div>
        <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
          {ending.description}
        </p>
        <button
          onClick={onClose}
          className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm transition"
        >
          继续人生
        </button>
      </div>
    </div>
  );
}

// ============================================================
// 属性条
// ============================================================
function MiniStat({ label, value, color }: { label: string; value: number; color: string }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="bg-white/5 rounded-lg px-1.5 py-1 border border-white/5">
      <div className="flex items-baseline gap-0.5 mb-0.5">
        <span className="text-[10px] text-gray-400 leading-none">{label}</span>
        <span className="text-[10px] font-mono font-medium text-white leading-none tabular-nums min-w-[28px]">{value}</span>
      </div>
      <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

// ============================================================
// 标签显示
// ============================================================
const tagDisplayNames: Record<string, string> = {
  family_support: '家庭支持',
  family_oppose: '家庭对立',
  family_silent: '家庭沉默',
  school_bullied: '校园霸凌',
  school_friends: '校园友谊',
  school_hidden: '校园隐藏',
  net_active: '网络活跃',
  net_lurker: '网络潜水',
  open_public: '公开身份',
  deep_closet: '深柜',
  partial_out: '部分出柜',
  has_job: '有工作',
  student: '学生',
  has_lover: '有伴侣',
  single: '单身',
  heart_broken: '情伤',
  rich: '经济宽裕',
  poor: '经济拮据',
  streamer: '网红',
  gray_zone: '灰色地带',
  medical_transition: '医疗过渡',
  mentor: '前辈',
  peace: '和解',
  regret: '遗憾',
  route_college: '大学生',
  route_worker: '打工人',
  route_streamer: '网红',
  route_freelance: '自由职业',
  route_medical: '医疗过渡',
};

function TagDisplay({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null;
  const displayTags = tags.slice(0, 4);
  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {displayTags.map((t) => (
        <span key={t} className="text-[10px] px-1.5 py-0.5 bg-white/10 rounded text-gray-400">
          {tagDisplayNames[t] || t}
        </span>
      ))}
      {tags.length > 4 && <span className="text-[10px] text-gray-600">+{tags.length - 4}</span>}
    </div>
  );
}

// ============================================================
// 结局画面
// ============================================================
function EndingScreen({ onRestart }: { onRestart: () => void }) {
  const { state } = useLife();
  const ending = useMemo(() => determineEnding(state.stats, state.tags), [state.stats, state.tags]);

  return (
    <div className="h-full flex flex-col items-center justify-center bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white px-4">
      <div className="text-center space-y-4 max-w-sm w-full">
        {/* CG 画面 */}
        <CGScene endingId={ending.id} />

        <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
          {ending.title}
        </h2>
        <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
          {ending.description}
        </div>
        {ending.summary && (
          <div className="text-sm text-gray-400 leading-relaxed italic border-l-2 border-purple-500/30 pl-3 text-left">
            {ending.summary}
          </div>
        )}

        <div className="bg-white/5 rounded-xl p-4 space-y-2 text-left">
          <p className="text-xs text-gray-500 mb-2">最终属性</p>
          <MiniStat label="外在呈现" value={state.stats.appearance} color="#f472b6" />
          <MiniStat label="内心自洽" value={state.stats.selfAcceptance} color="#60a5fa" />
          <MiniStat label="社会面具" value={state.stats.socialMask} color="#94a3b8" />
          <MiniStat label="经济储备" value={Math.min(100, state.stats.money / 100)} color="#fbbf24" />
          <MiniStat label="网络影响" value={Math.min(100, state.stats.followers / 100)} color="#f87171" />
          <MiniStat label="健康" value={state.stats.health} color="#34d399" />
          <TagDisplay tags={state.tags} />
        </div>

        <button
          onClick={onRestart}
          className="px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-sm transition-all active:scale-95"
        >
          再来一次
        </button>
      </div>
    </div>
  );
}

// ============================================================
// 主游戏流程
// ============================================================
export default function LifeSimulator() {
  const { state, dispatch } = useLife();
  const [pendingEvent, setPendingEvent] = useState<LifeEvent | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [state.history.length]);

  // 关键年龄排队机制：存储待触发的第二个里程碑（general事件）
  const queuedMilestoneRef = useRef<LifeEvent | null>(null);

  // 新游戏/重置时清空排队
  useEffect(() => {
    if (state.phase === 'title' || state.phase === 'talent_select') {
      queuedMilestoneRef.current = null;
    }
  }, [state.phase]);

  // 查找指定年龄所有可触发的事件
  const findCandidatesAtAge = useCallback((age: number): LifeEvent[] => {
    return lifeEvents.filter((e) => {
      if (e.once && state.triggeredEvents.includes(e.id)) return false;
      if (age < e.minAge || age > e.maxAge) return false;
      if (e.condition && !e.condition({ stats: state.stats, tags: state.tags, age })) return false;
      return true;
    });
  }, [state.stats, state.tags, state.triggeredEvents]);

  // 从候选池中选择事件：高优先级(>=90)必定触发，普通事件按概率随机
  const pickRandomEvent = useCallback((candidates: LifeEvent[], age: number): LifeEvent | null => {
    if (candidates.length === 0) return null;
    // 里程碑事件（priority >= 90）必定触发，多个满足时随机抽取一个
    const criticals = candidates.filter((e) => (e.priority || 0) >= 100);
    if (criticals.length > 0) {
      return criticals[Math.floor(Math.random() * criticals.length)];
    }
    const milestones = candidates.filter((e) => (e.priority || 0) >= 90);
    if (milestones.length > 0) {
      return milestones[Math.floor(Math.random() * milestones.length)];
    }
    // 普通事件按概率触发（6-30岁上调60%，36+再降50%）
    const rate = age >= 36 ? 0.045 : age <= 30 ? 0.21 : 0.13;
    if (Math.random() > rate) return null;
    return candidates[Math.floor(Math.random() * candidates.length)];
  }, []);

  const KEY_AGES = [24, 26, 30];

  // 推进一年（40岁后每四年）
  const advanceYear = useCallback(() => {
    if (state.age >= 100) {
      dispatch({ type: 'END_GAME' });
      return;
    }

    // 40岁后扫描未来4年内的事件
    let event: LifeEvent | null = null;
    let eventAge = state.age;
    if (state.age >= 40) {
      for (let checkAge = state.age + 1; checkAge <= state.age + 4 && checkAge <= 100; checkAge++) {
        const candidatesForAge = findCandidatesAtAge(checkAge);
        const picked = pickRandomEvent(candidatesForAge, checkAge);
        if (picked) {
          event = picked;
          eventAge = checkAge;
          break;
        }
      }
    } else {
      const nextAge = state.age + 1;

      // 关键年龄(24/26/30)：分离职业事件和通用事件，各触发一个
      if (KEY_AGES.includes(nextAge)) {
        const candidates = findCandidatesAtAge(nextAge);
        const milestones = candidates.filter((e) => (e.priority || 0) >= 90);

        // 找出玩家当前的路线标签，确保职业事件锁定同一条路线
        const playerRoute = state.tags.find((t) => t.startsWith('route_')) || '';
        const isCareerForRoute = (e: LifeEvent) => {
          if (e.category !== 'career') return false;
          if (!playerRoute) return true; // 没有路线标签时不过滤
          const condStr = e.condition?.toString() || '';
          return condStr.includes(playerRoute);
        };

        let careerEvents = milestones.filter(isCareerForRoute);
        // 通用事件 + 死亡事件(priority>=100)竞争第二个槽位
        const generalEvents = milestones.filter((e) => e.category === 'general' || (e.priority || 0) >= 100);

        // 职业事件必须触发：条件不满足时从该年龄同路线职业事件中强制抽取
        if (careerEvents.length === 0) {
          const allCareerAtAge = lifeEvents.filter(
            (e) => isCareerForRoute(e)
              && nextAge >= e.minAge && nextAge <= e.maxAge
              && !(e.once && state.triggeredEvents.includes(e.id))
          );
          if (allCareerAtAge.length > 0) {
            careerEvents = allCareerAtAge;
          }
        }

        // 从职业和通用中各随机抽一个
        const pickedCareer = careerEvents.length > 0
          ? careerEvents[Math.floor(Math.random() * careerEvents.length)]
          : null;
        const pickedGeneral = generalEvents.length > 0
          ? generalEvents[Math.floor(Math.random() * generalEvents.length)]
          : null;

        // 先触发职业事件，通用事件排队等待
        event = pickedCareer || pickedGeneral;
        if (event) {
          eventAge = nextAge;
          dispatch({ type: 'SET_AGE', age: nextAge, year: state.birthYear + nextAge });
          // 如果职业和通用都有，把通用事件排进队列
          if (pickedCareer && pickedGeneral) {
            queuedMilestoneRef.current = pickedGeneral;
          }
        }
      } else {
        event = pickRandomEvent(findCandidatesAtAge(nextAge), nextAge);
        if (event) {
          eventAge = nextAge;
          dispatch({ type: 'SET_AGE', age: nextAge, year: state.birthYear + nextAge });
        }
      }
    }

    if (event) {
      if (state.age >= 40 && eventAge !== state.age) {
        dispatch({ type: 'SET_AGE', age: eventAge, year: state.birthYear + eventAge });
      }
      setPendingEvent(event);
      dispatch({ type: 'TRIGGER_EVENT', eventId: event.id });
      return;
    }

    // 没有事件，平淡年份
    const ageStep = state.age >= 40 ? 4 : 1;
    const newAge = state.age + ageStep;
    if (newAge >= 100) {
      dispatch({ type: 'END_GAME' });
      return;
    }
    const newYear = state.birthYear + newAge;

    let desc = '';
    let isNewsYear = false;
    if (state.age >= 40) {
      // 40岁后：收集这4年内的时代新闻
      const newsParts: string[] = [];
      for (let y = state.age + 1; y <= newAge; y++) {
        if (eraNews[y]) newsParts.push(eraNews[y]);
      }
      desc = getMundaneDesc(newAge, state.tags);
      if (newsParts.length > 0) {
        desc = newsParts.join(' ') + ' ' + desc;
        isNewsYear = true;
      }
    } else {
      isNewsYear = newAge % 5 === 0 && !!eraNews[newAge];
      desc = isNewsYear
        ? `${eraNews[newAge]} ${getMundaneDesc(newAge, state.tags)}`
        : getMundaneDesc(newAge, state.tags);
    }

    const record = {
      age: newAge,
      year: newYear,
      description: desc,
      statsSnapshot: { ...state.stats },
      tagsSnapshot: [...state.tags],
      isNews: isNewsYear,
    };

    dispatch({ type: 'ADVANCE_YEAR', record });
  }, [state.age, state.birthYear, state.stats, state.tags, dispatch, findCandidatesAtAge, pickRandomEvent]);

  // 处理事件选择
  const handleEventChoice = useCallback(
    (choice: LifeChoice) => {
      if (!pendingEvent) return;

      const effectsText = formatEffects(choice.effects);
      const record = {
        age: state.age,
        year: state.currentYear,
        description: `${pendingEvent.description}\n\n→ ${choice.resultText}${effectsText}`,
        eventId: pendingEvent.id,
        choiceIndex: pendingEvent.choices.indexOf(choice),
        statsSnapshot: { ...state.stats },
        tagsSnapshot: [...state.tags],
        isEvent: true,
      };

      dispatch({
        type: 'RESOLVE_EVENT',
        choiceIndex: pendingEvent.choices.indexOf(choice),
        effects: choice.effects,
        addTags: choice.addTags || [],
        removeTags: choice.removeTags || [],
        record,
      });
      setPendingEvent(null);

      if (choice.gameOver) {
        dispatch({ type: 'END_GAME' });
        return;
      }

      // 检查是否有排队的第二个里程碑（关键年龄的通用事件）
      const queued = queuedMilestoneRef.current;
      if (queued) {
        queuedMilestoneRef.current = null;
        // 先更新 triggerEvents 以排除已触发的职业事件
        // 排队事件在同一年龄立即触发，不需要推进年龄
        setPendingEvent(queued);
        dispatch({ type: 'TRIGGER_EVENT', eventId: queued.id });
      }
    },
    [pendingEvent, state.age, state.currentYear, state.stats, state.tags, dispatch]
  );

  // 自动播放
  useEffect(() => {
    if (!isAutoPlaying || state.phase !== 'playing' || state.age >= 100) {
      setIsAutoPlaying(false);
      return;
    }
    const timer = setTimeout(() => {
      advanceYear();
    }, 800);
    return () => clearTimeout(timer);
  }, [isAutoPlaying, state.phase, state.age, advanceYear]);

  // 游戏阶段切换
  if (state.phase === 'title') {
    return <TitleScreen onStart={() => dispatch({ type: 'START_GAME' })} />;
  }

  if (state.phase === 'talent_select') {
    return (
      <TalentSelectScreen
        onConfirm={(talents) => {
          dispatch({
            type: 'SELECT_TALENTS',
            talents: talents.map((t) => t.id),
          });
          // 应用天赋效果到初始状态（通过ALLOCATE_STATS合并时生效）
        }}
      />
    );
  }

  if (state.phase === 'stat_allocate') {
    return (
      <StatAllocateScreen
        onConfirm={(stats) => {
          dispatch({ type: 'ALLOCATE_STATS', stats });
        }}
      />
    );
  }

  if (state.phase === 'ended') {
    return <EndingScreen onRestart={() => dispatch({ type: 'RESET' })} />;
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white">
      {/* 顶部状态栏 */}
      <div className="px-4 pt-3 pb-2 border-b border-white/5">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-semibold">
            {state.currentYear}年 · {state.age}岁
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setShowPreview(true)}
              className="px-3 py-1 rounded-lg text-xs bg-purple-500/10 border border-purple-500/20 text-purple-300 hover:bg-purple-500/20 transition"
            >
              结局预览
            </button>
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className={`px-3 py-1 rounded-lg text-xs border transition ${
                isAutoPlaying
                  ? 'bg-pink-500/20 border-pink-500/30 text-pink-300'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
              }`}
            >
              {isAutoPlaying ? '暂停' : '自动'}
            </button>
            <button
              onClick={() => dispatch({ type: 'RESET' })}
              className="px-3 py-1 rounded-lg text-xs bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 transition"
            >
              重开
            </button>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-1">
          <MiniStat label="外在" value={state.stats.appearance} color="#f472b6" />
          <MiniStat label="自洽" value={state.stats.selfAcceptance} color="#60a5fa" />
          <MiniStat label="面具" value={state.stats.socialMask} color="#94a3b8" />
          <MiniStat label="健康" value={state.stats.health} color="#34d399" />
          <MiniStat label="金钱" value={Math.round(state.stats.money)} color="#fbbf24" />
          <MiniStat label="粉丝" value={Math.round(state.stats.followers)} color="#f87171" />
          <MiniStat label="创伤" value={state.stats.trauma} color="#c084fc" />
          <MiniStat label="光谱" value={state.stats.genderSpectrum} color="#22d3ee" />
        </div>
        <TagDisplay tags={state.tags} />
      </div>

      {/* 历史记录区 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-2">
        {state.history.map((h, i) => (
          <YearCard
            key={i}
            age={h.age}
            year={h.year}
            description={h.description}
            isNews={h.isNews}
            isEvent={!!h.eventId}
          />
        ))}
      </div>

      {/* 底部操作区 */}
      {state.phase === 'playing' && (
        <div className="px-4 py-3 border-t border-white/5">
          {state.age >= 100 ? (
            <button
              onClick={() => dispatch({ type: 'END_GAME' })}
              className="w-full py-3 bg-gradient-to-r from-amber-500/20 to-rose-500/20 hover:from-amber-500/30 hover:to-rose-500/30 border border-amber-500/20 rounded-2xl text-sm font-medium transition-all active:scale-[0.98]"
            >
              查看结局
            </button>
          ) : (
          <button
            onClick={advanceYear}
            className="w-full py-3 bg-gradient-to-r from-pink-500/20 to-purple-500/20 hover:from-pink-500/30 hover:to-purple-500/30 border border-pink-500/20 rounded-2xl text-sm font-medium transition-all active:scale-[0.98]"
          >
            {state.age === 0
              ? '出生'
              : state.history.length > 0 && state.history[state.history.length - 1].eventId
              ? '继续这一年'
              : state.age >= 40
              ? `进入${state.birthYear + state.age + 1}-${state.birthYear + Math.min(state.age + 4, 100)}年`
              : `进入${state.birthYear + state.age + 1}年`}
          </button>
          )}
        </div>
      )}

      {/* 事件弹窗 */}
      {state.phase === 'event' && pendingEvent && (
        <EventModal event={pendingEvent} onChoose={handleEventChoice} />
      )}

      {/* 结局预览弹窗 */}
      {showPreview && <PreviewModal onClose={() => setShowPreview(false)} />}
    </div>
  );
}
