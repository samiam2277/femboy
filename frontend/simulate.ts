/**
 * 男娘人生模拟器 — 蒙特卡洛结局概率模拟
 * 运行: npx tsx simulate.ts [迭代次数, 默认10000]
 */
import {
  lifeEvents,
  endings,
  drawTalents,
  determineEnding,
} from './src/data/storyData';
import type { LifeStats, LifeEvent, LifeChoice } from './src/types/game';

const ITERATIONS = parseInt(process.argv[2] || '10000', 10);

// ---- 工具函数 ----
function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function hasTag(tags: string[], tag: string) {
  return tags.includes(tag);
}

// ---- 初始状态 ----
const DEFAULT_STATS: LifeStats = {
  appearance: 0, selfAcceptance: 10, socialMask: 10,
  money: 0, health: 50, followers: 0,
  trauma: 0, genderSpectrum: 5,
};

function randomAllocStats(): Partial<LifeStats> {
  const points = 20;
  const keys: (keyof LifeStats)[] = [
    'appearance', 'selfAcceptance', 'socialMask', 'money',
    'health', 'followers', 'trauma', 'genderSpectrum',
  ];
  const alloc: Record<string, number> = {};
  keys.forEach((k) => (alloc[k] = 0));

  // 随机分配 20 点到各属性（每项上限 8）
  const order = keys.sort(() => Math.random() - 0.5);
  let remaining = points;
  for (const key of order) {
    const max = Math.min(8, remaining);
    const val = Math.floor(Math.random() * (max + 1));
    alloc[key] = val;
    remaining -= val;
    if (remaining <= 0) break;
  }
  // 如果还有剩余点，随机加
  while (remaining > 0) {
    const k = order[Math.floor(Math.random() * order.length)];
    if (alloc[k] < 8) {
      alloc[k]++;
      remaining--;
    }
  }
  return alloc as Partial<LifeStats>;
}

// ---- 单局模拟 ----
interface SimResult {
  endingId: string;
  deathAge: number | null;
  stats: LifeStats;
  tags: string[];
}

function simulateOnce(): SimResult {
  // 1. 天赋抽取（玩家随机选 0-3 个）
  const pool = drawTalents(10);
  const pickCount = Math.floor(Math.random() * 4); // 0~3
  const picked = pool.slice(0, pickCount);

  // 2. 属性分配
  const allocated = randomAllocStats();

  // 3. 初始属性 + 天赋效果
  const stats: LifeStats = { ...DEFAULT_STATS };
  for (const [k, v] of Object.entries(allocated)) {
    if (v !== undefined) (stats as any)[k] += v;
  }
  const tags: string[] = [];
  for (const t of picked) {
    for (const [k, v] of Object.entries(t.effects)) {
      if (v !== undefined) (stats as any)[k] += v;
    }
    if (t.addTags) {
      for (const tag of t.addTags) {
        if (!tags.includes(tag)) tags.push(tag);
      }
    }
  }

  // 4. 应用属性上下限
  stats.appearance = clamp(stats.appearance, 0, 100);
  stats.selfAcceptance = Math.max(0, stats.selfAcceptance);
  stats.socialMask = clamp(stats.socialMask, 0, 100);
  stats.money = Math.max(0, stats.money);
  stats.health = clamp(stats.health, 0, 100);
  stats.followers = Math.max(0, stats.followers);
  stats.trauma = clamp(stats.trauma, 0, 100);
  stats.genderSpectrum = clamp(stats.genderSpectrum, 0, 100);

  const triggeredEvents = new Set<string>();
  let deathAge: number | null = null;

  // 5. 年度模拟
  let age = 0;
  while (age < 100) {
    // 确定下一步年龄
    let nextAge: number;
    const ageStep = age >= 40 ? 4 : 1;
    nextAge = age + ageStep;
    if (nextAge > 100) nextAge = 100;

    // 查找候选事件
    let event: LifeEvent | null = null;
    let eventAge = nextAge;

    if (age >= 40) {
      // 扫描未来 4 年
      for (let ca = age + 1; ca <= age + 4 && ca <= 100; ca++) {
        const candidates = lifeEvents.filter((e) => {
          if (e.once && triggeredEvents.has(e.id)) return false;
          if (ca < e.minAge || ca > e.maxAge) return false;
          if (e.condition && !e.condition({ stats, tags, age: ca })) return false;
          return true;
        });
        const picked = pickEvent(candidates, ca);
        if (picked) {
          event = picked;
          eventAge = ca;
          break;
        }
      }
    } else {
      const candidates = lifeEvents.filter((e) => {
        if (e.once && triggeredEvents.has(e.id)) return false;
        if (nextAge < e.minAge || nextAge > e.maxAge) return false;
        if (e.condition && !e.condition({ stats, tags, age: nextAge })) return false;
        return true;
      });
      event = pickEvent(candidates, nextAge);
    }

    if (event) {
      age = eventAge;
      if (event.once) triggeredEvents.add(event.id);

      // 做选择 — 避开 gameOver 选项（模拟真实玩家行为）
      const safeChoices = event.choices.filter((c) => !c.gameOver);
      const hasGameOverChoice = safeChoices.length < event.choices.length;

      let choice: LifeChoice;
      if (safeChoices.length > 0) {
        // 55% 概率选安全选项中的随机一个，45% 概率作死
        if (hasGameOverChoice && Math.random() < 0.45) {
          choice = event.choices[Math.floor(Math.random() * event.choices.length)];
        } else {
          choice = safeChoices[Math.floor(Math.random() * safeChoices.length)];
        }
      } else {
        choice = event.choices[Math.floor(Math.random() * event.choices.length)];
      }

      // 应用选项效果
      for (const [k, v] of Object.entries(choice.effects)) {
        if (v !== undefined) (stats as any)[k] += v;
      }
      if (choice.addTags) {
        for (const tag of choice.addTags) {
          if (!tags.includes(tag)) tags.push(tag);
        }
      }
      if (choice.removeTags) {
        for (const tag of choice.removeTags) {
          const idx = tags.indexOf(tag);
          if (idx >= 0) tags.splice(idx, 1);
        }
      }

      // 属性 clamp
      stats.appearance = clamp(stats.appearance, 0, 100);
      stats.selfAcceptance = Math.max(0, stats.selfAcceptance);
      stats.socialMask = clamp(stats.socialMask, 0, 100);
      stats.money = Math.max(0, stats.money);
      stats.health = clamp(stats.health, 0, 100);
      stats.followers = Math.max(0, stats.followers);
      stats.trauma = clamp(stats.trauma, 0, 100);
      stats.genderSpectrum = clamp(stats.genderSpectrum, 0, 100);

      if (choice.gameOver) {
        deathAge = age;
        break;
      }
    } else {
      age = nextAge;
    }
  }

  // 6. 判定结局
  const ending = determineEnding(stats, tags);
  return { endingId: ending.id, deathAge, stats, tags };
}

function pickEvent(candidates: LifeEvent[], age: number): LifeEvent | null {
  if (candidates.length === 0) return null;
  // 致命事件（>=100, 如死亡事件）绝对优先
  const criticals = candidates.filter((e) => (e.priority || 0) >= 100);
  if (criticals.length > 0) {
    return criticals[Math.floor(Math.random() * criticals.length)];
  }
  // 里程碑事件必定触发
  const milestones = candidates.filter((e) => (e.priority || 0) >= 90);
  if (milestones.length > 0) {
    return milestones[Math.floor(Math.random() * milestones.length)];
  }
  // 普通事件按概率
  const rate = age >= 36 ? 0.045 : age <= 30 ? 0.21 : 0.13;
  if (Math.random() > rate) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

// ---- 批量模拟 ----
const counts: Record<string, number> = {};
const deathAges: number[] = [];
const endingTitleMap: Record<string, string> = {};
const allStats: LifeStats[] = [];
const allTags: string[][] = [];

// 预加载 ending title
for (const e of endings) {
  endingTitleMap[e.id] = e.title;
}

console.log(`模拟 ${ITERATIONS} 局...`);
const startTime = Date.now();

for (let i = 0; i < ITERATIONS; i++) {
  const result = simulateOnce();
  counts[result.endingId] = (counts[result.endingId] || 0) + 1;
  if (result.deathAge !== null) deathAges.push(result.deathAge);
  allStats.push(result.stats);
  allTags.push(result.tags);

  if ((i + 1) % 1000 === 0) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    process.stdout.write(`\r  已完成 ${i + 1}/${ITERATIONS} (${elapsed}s)`);
  }
}

const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
console.log(`\r  已完成 ${ITERATIONS}/${ITERATIONS} (${elapsed}s)\n`);

// ---- 输出 ----
// 按优先级排序 ending
const endingOrder = endings
  .filter((e) => counts[e.id])
  .sort((a, b) => (counts[b.id] || 0) - (counts[a.id] || 0));

console.log('═'.repeat(60));
console.log('结局概率分布（按触发率降序）');
console.log('═'.repeat(60));

for (const e of endingOrder) {
  const pct = ((counts[e.id] / ITERATIONS) * 100).toFixed(1);
  const bar = '█'.repeat(Math.round(Number(pct) / 2));
  console.log(`  ${e.title.padEnd(18)} ${String(pct + '%').padStart(6)}  ${bar}`);
}

console.log(`\n${'─'.repeat(60)}`);
console.log('分项统计:');
console.log(`${'─'.repeat(60)}`);

const deathCount = deathAges.length;
const survivalCount = ITERATIONS - deathCount;
console.log(`  存活至结局: ${survivalCount} (${((survivalCount / ITERATIONS) * 100).toFixed(1)}%)`);
console.log(`  中途死亡:   ${deathCount} (${((deathCount / ITERATIONS) * 100).toFixed(1)}%)`);
if (deathAges.length > 0) {
  const avgDeath = deathAges.reduce((a, b) => a + b, 0) / deathAges.length;
  console.log(`  平均死亡年龄: ${avgDeath.toFixed(1)} 岁`);
}

// 按死亡类型分组
console.log(`\n${'─'.repeat(60)}`);
console.log('死亡结局细分:');
console.log(`${'─'.repeat(60)}`);
const deathEndingIds = [
  'ending_death_fall', 'ending_death_hate_crime', 'ending_death_grey_zone',
  'ending_death_alone_sick', 'ending_death_disappear',
];
for (const id of deathEndingIds) {
  const c = counts[id] || 0;
  if (c > 0) {
    const pct = ((c / ITERATIONS) * 100).toFixed(2);
    console.log(`  ${(endingTitleMap[id] || id).padEnd(20)} ${String(pct + '%').padStart(6)}  (${c} 局)`);
  }
}

console.log(`\n${'═'.repeat(60)}`);
console.log('所有结局完整列表:');
console.log(`${'═'.repeat(60)}`);
console.log(
  'ID'.padEnd(35) + '名称'.padEnd(20) + '次数'.padStart(8) + '比例'.padStart(10)
);
console.log('-'.repeat(73));
for (const e of endings) {
  const c = counts[e.id] || 0;
  const pct = ((c / ITERATIONS) * 100).toFixed(2);
  console.log(e.id.padEnd(35) + e.title.padEnd(20) + String(c).padStart(8) + String(pct + '%').padStart(10));
}

// ---- 数值分布统计 ----
console.log(`\n${'═'.repeat(60)}`);
console.log('终局数值分布 (中位数 [Q1-Q3])');
console.log(`${'═'.repeat(60)}`);
const statKeys: (keyof LifeStats)[] = ['selfAcceptance', 'trauma', 'socialMask', 'money', 'followers', 'appearance', 'health', 'genderSpectrum'];
for (const key of statKeys) {
  const vals = allStats.map(s => s[key]).sort((a, b) => a - b);
  const med = vals[Math.floor(vals.length / 2)];
  const q1 = vals[Math.floor(vals.length * 0.25)];
  const q3 = vals[Math.floor(vals.length * 0.75)];
  console.log(`  ${key.padEnd(18)} ${String(q1).padStart(5)}  ${String(med).padStart(5)}  ${String(q3).padStart(5)}`);
}

// 标签频率 (top 15)
console.log(`\n${'─'.repeat(60)}`);
console.log('标签出现频率 (top 15):');
console.log(`${'─'.repeat(60)}`);
const tagFreq: Record<string, number> = {};
for (const t of allTags) {
  for (const tag of t) {
    tagFreq[tag] = (tagFreq[tag] || 0) + 1;
  }
}
const sortedTags = Object.entries(tagFreq).sort((a, b) => b[1] - a[1]).slice(0, 15);
for (const [tag, count] of sortedTags) {
  const pct = ((count / ITERATIONS) * 100).toFixed(1);
  console.log(`  ${tag.padEnd(22)} ${String(pct + '%').padStart(6)}`);
}
