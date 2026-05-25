import { useMemo, useState } from 'react';

/* ============================================================
   Anime-style character primitives
   ============================================================ */

/** 动漫脸 — 正脸或微侧，可定制眼睛/嘴/眉毛 */
function AnimeFace({
  cx, cy, eyeColor, mouthType, blush, tears,
}: {
  cx: number; cy: number; eyeColor: string; mouthType: 'smile' | 'sad' | 'neutral' | 'open' | 'tremble';
  blush?: boolean; tears?: boolean;
}) {
  const r = 28;
  return (
    <g transform={`translate(${cx - r},${cy - r})`}>
      {/* 脸轮廓 — 鹅蛋脸稍尖 */}
      <path d="M28,0 C38,8 42,22 40,34 C38,46 30,54 28,56 C26,54 18,46 16,34 C14,22 18,8 28,0Z"
        fill="#ffe4c9" stroke="#e8c8a8" strokeWidth="0.8" />

      {/* 眉毛 */}
      <path d="M14,20 Q20,17 26,19" stroke="#3a2a2a" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M30,19 Q36,17 42,20" stroke="#3a2a2a" strokeWidth="1.2" fill="none" strokeLinecap="round" />

      {/* 眼睛 — 大眼 anime 风格 */}
      {/* 左眼 */}
      <ellipse cx="20" cy="26" rx="8" ry="9" fill="white" stroke="#2a1a2a" strokeWidth="1" />
      <ellipse cx="20" cy="26" rx="6" ry="7.5" fill={eyeColor} />
      <ellipse cx="20" cy="26" rx="3.5" ry="5" fill="#1a0a2a" />
      <circle cx="18" cy="23" r="2" fill="white" />
      <circle cx="21" cy="25" r="1" fill="white" />
      {/* 睫毛 */}
      <path d="M12,24 Q14,20 18,19" stroke="#2a1a2a" strokeWidth="0.8" fill="none" />
      <path d="M22,19 Q26,20 28,24" stroke="#2a1a2a" strokeWidth="0.8" fill="none" />

      {/* 右眼 */}
      <ellipse cx="36" cy="26" rx="8" ry="9" fill="white" stroke="#2a1a2a" strokeWidth="1" />
      <ellipse cx="36" cy="26" rx="6" ry="7.5" fill={eyeColor} />
      <ellipse cx="36" cy="26" rx="3.5" ry="5" fill="#1a0a2a" />
      <circle cx="34" cy="23" r="2" fill="white" />
      <circle cx="37" cy="25" r="1" fill="white" />
      <path d="M28,24 Q30,20 34,19" stroke="#2a1a2a" strokeWidth="0.8" fill="none" />
      <path d="M38,19 Q42,20 44,24" stroke="#2a1a2a" strokeWidth="0.8" fill="none" />

      {/* 鼻子 — 小点 */}
      <path d="M27,33 Q28,34 29,33" stroke="#d4a888" strokeWidth="0.7" fill="none" />

      {/* 嘴 */}
      {mouthType === 'smile' && (
        <path d="M23,39 Q28,44 33,39" stroke="#c97a6a" strokeWidth="1" fill="none" strokeLinecap="round" />
      )}
      {mouthType === 'sad' && (
        <path d="M23,41 Q28,38 33,41" stroke="#c97a6a" strokeWidth="1" fill="none" strokeLinecap="round" />
      )}
      {mouthType === 'neutral' && (
        <line x1="24" y1="40" x2="32" y2="40" stroke="#c97a6a" strokeWidth="0.8" strokeLinecap="round" />
      )}
      {mouthType === 'open' && (
        <ellipse cx="28" cy="40" rx="4" ry="5" fill="#5a3030" />
      )}
      {mouthType === 'tremble' && (
        <path d="M23,39 Q25,38 27,39.5 Q29,41 31,39.5 Q33,38 33,41" stroke="#c97a6a" strokeWidth="0.8" fill="none" strokeLinecap="round" />
      )}

      {/* 腮红 */}
      {blush && (
        <>
          <ellipse cx="12" cy="34" rx="5" ry="3" fill="#ffb3b3" opacity="0.4" />
          <ellipse cx="44" cy="34" rx="5" ry="3" fill="#ffb3b3" opacity="0.4" />
        </>
      )}

      {/* 眼泪 */}
      {tears && (
        <>
          <ellipse cx="15" cy="30" rx="2" ry="3" fill="#93c5fd" opacity="0.5" />
          <ellipse cx="41" cy="30" rx="2" ry="3" fill="#93c5fd" opacity="0.5" />
        </>
      )}
    </g>
  );
}

/** 动漫长发 */
function AnimeHair({ cx, cy, color, highlights }: { cx: number; cy: number; color: string; highlights: string }) {
  return (
    <g transform={`translate(${cx - 28},${cy - 28})`}>
      {/* 后发 */}
      <path d="M8,16 Q4,40 12,62 Q18,72 28,74 Q38,72 44,62 Q52,40 48,16Z"
        fill={color} />
      {/* 侧发 */}
      <path d="M8,16 Q2,32 6,54 Q8,62 14,64 Q10,52 10,36 Q10,24 12,16Z" fill={color} />
      <path d="M48,16 Q54,32 50,54 Q48,62 42,64 Q46,52 46,36 Q46,24 44,16Z" fill={color} />
      {/* 前发 / 刘海 */}
      <path d="M12,12 Q16,0 22,2 Q28,-1 34,2 Q40,0 44,12 Q40,18 36,16 Q30,20 28,18 Q26,20 20,16 Q16,18 12,12Z"
        fill={color} />
      {/* 高光 */}
      <path d="M16,14 Q20,4 28,5" stroke={highlights} strokeWidth="2" fill="none" opacity="0.5" strokeLinecap="round" />
      <path d="M36,14 Q40,6 44,14" stroke={highlights} strokeWidth="1.5" fill="none" opacity="0.4" strokeLinecap="round" />
      {/* 呆毛 */}
      <path d="M28,2 Q30,-6 34,-10 Q32,-4 30,2" fill={color} stroke={highlights} strokeWidth="0.5" opacity="0.6" />
    </g>
  );
}

/* ============================================================
   CG 1 — 星辰
   ============================================================ */
function CGStars() {
  const stars = useMemo(() => Array.from({ length: 50 }, () => ({
    cx: Math.random() * 375, cy: Math.random() * 240, r: Math.random() * 2 + 0.5, d: Math.random() * 3,
  })), []);
  const sparks = useMemo(() => Array.from({ length: 20 }, () => ({
    cx: 140 + Math.random() * 100, cy: 120 + Math.random() * 180, d: Math.random() * 4, s: 0.5 + Math.random() * 1.5,
  })), []);

  return (
    <svg viewBox="0 0 375 420" className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="s1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0a0a2e"/><stop offset="50%" stopColor="#151040"/><stop offset="100%" stopColor="#1a1040"/></linearGradient>
        <radialGradient id="s2" cx="50%" cy="30%" r="55%"><stop offset="0%" stopColor="#c4b5fd" stopOpacity="0.12"/><stop offset="100%" stopColor="transparent"/></radialGradient>
        <filter id="sf1"><feGaussianBlur stdDeviation="2"/></filter>
      </defs>
      <rect width="375" height="420" fill="url(#s1)"/>
      <rect width="375" height="280" fill="url(#s2)"/>
      {/* 星星 */}
      {stars.map((s, i) => (
        <g key={i}>
          <circle cx={s.cx} cy={s.cy} r={s.r} fill="white" opacity={0.2 + s.d * 0.2} filter="url(#sf1)">
            <animate attributeName="opacity" values={`${0.2 + s.d * 0.2};${0.05 + s.d * 0.05};${0.2 + s.d * 0.2}`} dur={`${2 + s.d}s`} repeatCount="indefinite"/>
          </circle>
        </g>
      ))}
      {/* 银河 */}
      <ellipse cx="190" cy="100" rx="170" ry="6" fill="white" opacity="0.04" transform="rotate(-12 190 100)"/>
      {/* 地面 */}
      <path d="M0,340 Q100,300 200,320 Q300,340 375,310 L375,420 L0,420Z" fill="#0d0d28"/>
      <path d="M0,355 Q120,330 220,345 Q300,355 375,338 L375,420 L0,420Z" fill="#0f0f2e" opacity="0.5"/>
      {/* 人物 */}
      <g transform="translate(0,-10)">
        <AnimeHair cx={187} cy={260} color="#3a2860" highlights="#7c6aaa"/>
        <AnimeFace cx={187} cy={260} eyeColor="#c4b5fd" mouthType="smile" blush/>
        {/* 身体 + 连衣裙 */}
        <path d="M173,288 Q168,320 162,355 L212,355 Q206,320 201,288Z" fill="#2a1a4e"/>
        <path d="M162,355 Q148,372 135,385 L175,382Z" fill="#2a1a4e"/>
        <path d="M212,355 Q226,372 239,385 L199,382Z" fill="#2a1a4e"/>
        {/* 裙褶 */}
        <line x1="165" y1="362" x2="155" y2="382" stroke="#3a2860" strokeWidth="0.5" opacity="0.5"/>
        <line x1="209" y1="362" x2="219" y2="382" stroke="#3a2860" strokeWidth="0.5" opacity="0.5"/>
        {/* 领口蝴蝶结 */}
        <circle cx="187" cy="290" r="4" fill="#c4b5fd" opacity="0.6"/>
        <path d="M183,290 Q178,286 180,292Z" fill="#c4b5fd" opacity="0.5"/>
        <path d="M191,290 Q196,286 194,292Z" fill="#c4b5fd" opacity="0.5"/>
        {/* 手臂微张 — 仰望星空 */}
        <path d="M173,300 Q158,290 148,282" stroke="#ffe4c9" strokeWidth="5" fill="none" strokeLinecap="round"/>
        <path d="M201,300 Q216,290 226,282" stroke="#ffe4c9" strokeWidth="5" fill="none" strokeLinecap="round"/>
      </g>
      {/* 光粒上升 */}
      {sparks.map((p, i) => (
        <circle key={i} cx={p.cx} cy={p.cy} r={p.s} fill="#e9d5ff" opacity="0" filter="url(#sf1)">
          <animate attributeName="opacity" values="0;0.7;0" dur={`${3 + p.d}s`} repeatCount="indefinite" begin={`${p.d}s`}/>
          <animate attributeName="cy" from={p.cy + 40} to={p.cy - 60} dur={`${4 + p.d}s`} repeatCount="indefinite" begin={`${p.d}s`}/>
        </circle>
      ))}
      {/* kira 效果 */}
      {[100,250,300].map((x, i) => (
        <g key={`k${i}`} transform={`translate(${x},${60 + i * 40})`} opacity="0">
          <path d="M0,-8 L2,-2 L8,0 L2,2 L0,8 L-2,2 L-8,0 L-2,-2Z" fill="white" filter="url(#sf1)">
            <animate attributeName="opacity" values="0;0.8;0" dur={`${2.5 + i}s`} repeatCount="indefinite"/>
          </path>
        </g>
      ))}
      <text x="187" y="48" textAnchor="middle" fill="#c4b5fd" fontSize="30" fontWeight="bold" fontFamily="system-ui" filter="url(#sf1)" opacity="0.9">星辰</text>
    </svg>
  );
}

/* ============================================================
   CG 2 — 小满
   ============================================================ */
function CGSmallContent() {
  return (
    <svg viewBox="0 0 375 420" className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="x1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1a1828"/><stop offset="100%" stopColor="#2d1f1a"/></linearGradient>
        <linearGradient id="x2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fbbf24" stopOpacity="0.5"/><stop offset="50%" stopColor="#f97316" stopOpacity="0.3"/><stop offset="100%" stopColor="#991b1b" stopOpacity="0.08"/></linearGradient>
        <filter id="xf1"><feGaussianBlur stdDeviation="3"/></filter>
      </defs>
      <rect width="375" height="420" fill="url(#x1)"/>
      {/* 窗户 */}
      <rect x="50" y="50" width="170" height="210" rx="4" fill="#0f0f1a" stroke="#2a2a3a" strokeWidth="2"/>
      <rect x="54" y="54" width="162" height="202" fill="url(#x2)"/>
      <line x1="135" y1="54" x2="135" y2="256" stroke="#1a1a2a" strokeWidth="3"/>
      <line x1="54" y1="153" x2="216" y2="153" stroke="#1a1a2a" strokeWidth="3"/>
      {/* 窗外建筑 */}
      <rect x="70" y="185" width="28" height="71" fill="#1a1a2e" opacity="0.6"/>
      <rect x="110" y="165" width="18" height="91" fill="#1a1a2e" opacity="0.6"/>
      <rect x="150" y="195" width="32" height="61" fill="#1a1a2e" opacity="0.6"/>
      {/* 夕阳 */}
      <circle cx="195" cy="195" r="24" fill="#fbbf24" opacity="0.45" filter="url(#xf1)"/>
      {/* 窗台 */}
      <rect x="45" y="256" width="180" height="6" rx="2" fill="#1a1a2a"/>
      {/* 盆栽 */}
      <rect x="220" y="244" width="14" height="12" rx="2" fill="#3d2b1f"/>
      <ellipse cx="227" cy="240" rx="9" ry="7" fill="#2d4a2d"/>
      <path d="M222,243 Q225,232 232,243" stroke="#3a5a3a" fill="none" strokeWidth="1.5"/>
      {/* 人物 */}
      <g transform="translate(20,0)">
        <AnimeHair cx={250} cy={268} color="#4a3020" highlights="#8a6a50"/>
        <AnimeFace cx={250} cy={268} eyeColor="#a78b6f" mouthType="smile"/>
        {/* 身体 — 宽松家居服 */}
        <path d="M237,296 Q232,328 228,358 L272,358 Q268,328 263,296Z" fill="#5a4a3a"/>
        {/* 手中热茶 */}
        <rect x="268" y="330" width="14" height="12" rx="3" fill="#e8d5c4"/>
        <path d="M282,334 Q288,334 288,340 Q288,346 282,346" stroke="#e8d5c4" fill="none" strokeWidth="2"/>
        {/* 蒸汽 */}
        <path d="M274,326 Q277,318 273,312" stroke="#fbbf24" strokeWidth="1" fill="none" opacity="0.3">
          <animate attributeName="opacity" values="0.3;0.1;0.3" dur="3s" repeatCount="indefinite"/>
        </path>
        <path d="M280,328 Q283,320 279,314" stroke="#fbbf24" strokeWidth="1" fill="none" opacity="0.2">
          <animate attributeName="opacity" values="0.2;0.05;0.2" dur="2.5s" repeatCount="indefinite"/>
        </path>
      </g>
      {/* 地板光 */}
      <rect x="220" y="352" width="120" height="68" fill="#fbbf24" opacity="0.04"/>
      <text x="187" y="42" textAnchor="middle" fill="#fbbf24" fontSize="28" fontWeight="bold" fontFamily="system-ui" opacity="0.8">小满</text>
    </svg>
  );
}

/* ============================================================
   CG 3 — 燃尽
   ============================================================ */
function CGBurntOut() {
  const embers = useMemo(() => Array.from({ length: 45 }, () => ({
    cx: 130 + Math.random() * 120, cy: 120 + Math.random() * 260, r: Math.random() * 2 + 0.5, d: Math.random() * 4,
  })), []);
  return (
    <svg viewBox="0 0 375 420" className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
      <defs>
        <radialGradient id="b1" cx="50%" cy="55%" r="40%"><stop offset="0%" stopColor="#ff6b35" stopOpacity="0.25"/><stop offset="35%" stopColor="#7c2d12" stopOpacity="0.15"/><stop offset="100%" stopColor="#050505"/></radialGradient>
        <filter id="bf1"><feGaussianBlur stdDeviation="2"/></filter>
      </defs>
      <rect width="375" height="420" fill="#050505"/>
      <rect width="375" height="420" fill="url(#b1)"/>
      {/* 人物 — 半消散 */}
      <g opacity="0.55">
        <AnimeHair cx={187} cy={270} color="#2a1010" highlights="#5a2020"/>
        <AnimeFace cx={187} cy={270} eyeColor="#ff6b35" mouthType="open"/>
        <path d="M173,298 Q166,335 160,365 L214,365 Q208,335 201,298Z" fill="#150808"/>
        <path d="M160,365 Q145,382 132,395 L175,390Z" fill="#150808"/>
        <path d="M214,365 Q229,382 242,395 L199,390Z" fill="#150808"/>
        {/* 手臂下垂 */}
        <path d="M173,310 Q160,330 155,350" stroke="#ffe4c9" strokeWidth="4.5" fill="none" strokeLinecap="round" opacity="0.5"/>
        <path d="M201,310 Q214,330 219,350" stroke="#ffe4c9" strokeWidth="4.5" fill="none" strokeLinecap="round" opacity="0.5"/>
      </g>
      {/* 胸口燃烧 */}
      <circle cx="187" cy="305" r="14" fill="#ff6b35" opacity="0.35" filter="url(#bf1)">
        <animate attributeName="r" values="14;18;14" dur="2s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.35;0.15;0.35" dur="2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="187" cy="305" r="6" fill="#fbbf24" opacity="0.5" filter="url(#bf1)">
        <animate attributeName="r" values="6;10;6" dur="1.5s" repeatCount="indefinite"/>
      </circle>
      {/* 余烬 */}
      {embers.map((e, i) => (
        <circle key={i} cx={e.cx} cy={e.cy} r={e.r} fill={i % 3 === 0 ? '#ff6b35' : i % 3 === 1 ? '#fbbf24' : '#991b1b'} opacity="0" filter="url(#bf1)">
          <animate attributeName="opacity" values="0;0.6;0" dur={`${2 + e.d}s`} repeatCount="indefinite" begin={`${e.d}s`}/>
          <animate attributeName="cy" from={e.cy} to={e.cy - 50} dur={`${3 + e.d}s`} repeatCount="indefinite" begin={`${e.d}s`}/>
        </circle>
      ))}
      {/* 灰烬地面 */}
      <ellipse cx="187" cy="380" rx="55" ry="8" fill="#1a0505" opacity="0.4"/>
      <text x="187" y="50" textAnchor="middle" fill="#ff6b35" fontSize="28" fontWeight="bold" fontFamily="system-ui" opacity="0.7">燃尽</text>
    </svg>
  );
}

/* ============================================================
   CG 4 — 镀金牢笼
   ============================================================ */
function CGGildedCage() {
  return (
    <svg viewBox="0 0 375 420" className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0f0f1a"/><stop offset="100%" stopColor="#1a1020"/></linearGradient>
        <linearGradient id="g2" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#78350f"/><stop offset="30%" stopColor="#f59e0b"/><stop offset="50%" stopColor="#fbbf24"/><stop offset="70%" stopColor="#f59e0b"/><stop offset="100%" stopColor="#78350f"/></linearGradient>
        <filter id="gf1"><feGaussianBlur stdDeviation="1.5"/></filter>
      </defs>
      <rect width="375" height="420" fill="url(#g1)"/>
      {/* 窗外夜景 */}
      <rect x="35" y="55" width="305" height="195" rx="8" fill="#08081a" stroke="#78350f" strokeWidth="1.5"/>
      {Array.from({ length: 28 }, (_, i) => (
        <rect key={i} x={50 + (i % 8) * 36} y={125 + Math.floor(i / 8) * 42} width={7} height={14 + Math.random() * 28} fill="#fbbf24" opacity={0.12 + Math.random() * 0.18} rx="1"/>
      ))}
      <circle cx="295" cy="88" r="16" fill="#e5e7eb" opacity="0.12"/>
      {/* 金笼竖条 */}
      {Array.from({ length: 12 }, (_, i) => (
        <line key={i} x1={72 + i * 21} y1="95" x2={72 + i * 21} y2="385" stroke="url(#g2)" strokeWidth="2.5" opacity="0.65"/>
      ))}
      {/* 金笼横条 */}
      {[115, 160, 210, 260, 310, 360].map((y, i) => (
        <line key={i} x1="68" y1={y} x2="308" y2={y} stroke="url(#g2)" strokeWidth="2" opacity="0.55"/>
      ))}
      {/* 笼顶 */}
      <path d="M65,95 Q187,50 310,95" stroke="url(#g2)" strokeWidth="3" fill="none"/>
      <circle cx="187" cy="58" r="7" fill="#fbbf24" opacity="0.25" filter="url(#gf1)"/>
      {/* 笼中人物 */}
      <AnimeHair cx={187} cy={275} color="#2a1a30" highlights="#5a3a60"/>
      <AnimeFace cx={187} cy={275} eyeColor="#a78bfa" mouthType="sad"/>
      <path d="M175,303 Q170,338 165,365 L209,365 Q204,338 199,303Z" fill="#1a1030"/>
      <path d="M165,365 Q152,380 142,392 L178,388Z" fill="#1a1030"/>
      <path d="M209,365 Q222,380 232,392 L196,388Z" fill="#1a1030"/>
      {/* 手中面具 */}
      <ellipse cx="225" cy="340" rx="11" ry="13" fill="#78350f" opacity="0.35"/>
      <circle cx="222" cy="336" r="2.5" fill="#78350f" opacity="0.4"/>
      <circle cx="229" cy="336" r="2.5" fill="#78350f" opacity="0.4"/>
      <path d="M221,343 Q225,346 229,343" stroke="#78350f" strokeWidth="0.8" fill="none" opacity="0.4"/>
      <text x="187" y="43" textAnchor="middle" fill="#f59e0b" fontSize="26" fontWeight="bold" fontFamily="system-ui" opacity="0.8">镀金牢笼</text>
    </svg>
  );
}

/* ============================================================
   CG 5 — 旷野
   ============================================================ */
function CGWilderness() {
  const grass = useMemo(() => Array.from({ length: 45 }, () => ({
    x: Math.random() * 375, y: 310 + Math.random() * 100, h: 10 + Math.random() * 30, d: Math.random() * 2,
  })), []);
  return (
    <svg viewBox="0 0 375 420" className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="w1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1a1a2e"/><stop offset="40%" stopColor="#2a2a3e"/><stop offset="100%" stopColor="#4a4a5e"/></linearGradient>
      </defs>
      <rect width="375" height="420" fill="url(#w1)"/>
      {/* 云 */}
      {[0, 1, 2, 3].map((i) => (
        <ellipse key={i} cx={40 + i * 90} cy={50 + i * 35} rx={40 + i * 15} ry={7 + i * 3} fill="white" opacity="0.03">
          <animate attributeName="cx" values={`${40 + i * 90};${60 + i * 90};${40 + i * 90}`} dur={`${8 + i * 2}s`} repeatCount="indefinite"/>
        </ellipse>
      ))}
      {/* 远山 */}
      <path d="M0,270 Q60,230 120,260 Q180,220 240,250 Q300,225 375,255 L375,310 L0,310Z" fill="#2a2a1a" opacity="0.25"/>
      {/* 地面 */}
      <path d="M0,310 Q120,295 220,305 Q320,315 375,300 L375,420 L0,420Z" fill="#2d2d1a"/>
      {/* 草 */}
      {grass.map((g, i) => (
        <line key={i} x1={g.x} y1={g.y} x2={g.x + (i % 3 - 1) * 4} y2={g.y - g.h} stroke="#5a6a4a" strokeWidth="1.5" opacity="0.35">
          <animate attributeName="x2" values={`${g.x + (i % 3 - 1) * 4};${g.x + (i % 3 - 1) * 4 + 8};${g.x + (i % 3 - 1) * 4}`} dur={`${1.5 + g.d}s`} repeatCount="indefinite"/>
        </line>
      ))}
      {/* 小路 */}
      <path d="M155,420 Q165,365 178,340 Q188,320 185,305" stroke="#3a3a2a" strokeWidth="2.5" fill="none" opacity="0.25" strokeDasharray="4,3"/>
      {/* 渺小人物 */}
      <g transform="translate(0,15)">
        <AnimeHair cx={185} cy={290} color="#3a3050" highlights="#6a5a80"/>
        <AnimeFace cx={185} cy={290} eyeColor="#94a3b8" mouthType="neutral"/>
        <path d="M175,318 Q172,342 168,362 L202,362 Q198,342 195,318Z" fill="#2a2040"/>
        <path d="M168,362 Q158,375 150,385 L178,382Z" fill="#2a2040"/>
        <path d="M202,362 Q212,375 220,385 L192,382Z" fill="#2a2040"/>
      </g>
      {/* 飘动发丝 */}
      <path d="M185,310 Q195,305 205,308" stroke="#3a3050" strokeWidth="1.5" fill="none" opacity="0.4">
        <animate attributeName="d" values="M185,310 Q195,305 205,308;M185,310 Q198,302 210,306;M185,310 Q195,305 205,308" dur="2s" repeatCount="indefinite"/>
      </path>
      <text x="187" y="42" textAnchor="middle" fill="#94a3b8" fontSize="30" fontWeight="bold" fontFamily="system-ui" opacity="0.7">旷野</text>
    </svg>
  );
}

/* ============================================================
   CG 6 — 困兽
   ============================================================ */
function CGTrappedBeast() {
  return (
    <svg viewBox="0 0 375 420" className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
      <defs>
        <radialGradient id="t1" cx="50%" cy="55%" r="35%"><stop offset="0%" stopColor="#2a1a3e" stopOpacity="0.35"/><stop offset="100%" stopColor="#050510"/></radialGradient>
        <filter id="tf1"><feGaussianBlur stdDeviation="3"/></filter>
      </defs>
      <rect width="375" height="420" fill="#050510"/>
      <rect width="375" height="420" fill="url(#t1)"/>
      {/* 铁栏阴影 */}
      {Array.from({ length: 9 }, (_, i) => (
        <line key={i} x1={30 + i * 42} y1="50" x2={10 + i * 42} y2="400" stroke="#1a1030" strokeWidth={3.5 + (i % 3)} opacity="0.55" filter="url(#tf1)"/>
      ))}
      {[110, 170, 230, 290, 350].map((y, i) => (
        <line key={i} x1="0" y1={y} x2="375" y2={y - 10} stroke="#1a1030" strokeWidth="2.5" opacity="0.45" filter="url(#tf1)"/>
      ))}
      {/* 人物 — 蜷缩/挣扎 */}
      <g transform="translate(-5,5)">
        <AnimeHair cx={185} cy={280} color="#150818" highlights="#3a1a3a"/>
        <AnimeFace cx={185} cy={280} eyeColor="#8b5cf6" mouthType="tremble" tears/>
        {/* 身体 — 蜷缩 */}
        <path d="M168,308 Q158,345 162,372 L200,372 Q206,348 198,312 Q194,298 190,292Z" fill="#150818"/>
        <path d="M162,372 Q150,388 142,398 L176,394Z" fill="#150818"/>
        <path d="M200,372 Q212,388 220,398 L186,394Z" fill="#150818"/>
        {/* 手臂 — 抓栏 */}
        <path d="M168,318 Q150,308 138,312" stroke="#ffe4c9" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.5"/>
        <path d="M198,322 Q214,312 226,316" stroke="#ffe4c9" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.5"/>
      </g>
      {/* 上方微光 */}
      <rect x="170" y="60" width="35" height="3" rx="1.5" fill="#4a3a6e" opacity="0.25">
        <animate attributeName="opacity" values="0.25;0.08;0.25" dur="4s" repeatCount="indefinite"/>
      </rect>
      {/* 地面裂痕 */}
      <path d="M90,385 Q125,395 115,405" stroke="#2a1a3e" strokeWidth="1" fill="none" opacity="0.35"/>
      <path d="M255,387 Q245,397 260,408" stroke="#2a1a3e" strokeWidth="1" fill="none" opacity="0.35"/>
      <text x="187" y="42" textAnchor="middle" fill="#8b5cf6" fontSize="28" fontWeight="bold" fontFamily="system-ui" opacity="0.7">困兽</text>
    </svg>
  );
}

/* ============================================================
   CG 7 — 市集
   ============================================================ */
function CGMarketplace() {
  const lanterns = useMemo(() => Array.from({ length: 8 }, (_, i) => ({
    x: 35 + i * 45, y: 75 + Math.sin(i * 1.1) * 25, d: Math.random() * 2,
  })), []);
  return (
    <svg viewBox="0 0 375 420" className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="m1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1a1020"/><stop offset="100%" stopColor="#2a1a1a"/></linearGradient>
        <radialGradient id="m2" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#fbbf24" stopOpacity="0.25"/><stop offset="100%" stopColor="transparent"/></radialGradient>
        <filter id="mf1"><feGaussianBlur stdDeviation="3"/></filter>
      </defs>
      <rect width="375" height="420" fill="url(#m1)"/>
      {/* 灯笼 */}
      {lanterns.map((l, i) => (
        <g key={i}>
          <circle cx={l.x} cy={l.y} r="22" fill="url(#m2)" filter="url(#mf1)"/>
          <ellipse cx={l.x} cy={l.y} rx="7" ry="9" fill="#fbbf24" opacity="0.45" filter="url(#mf1)">
            <animate attributeName="opacity" values="0.45;0.25;0.45" dur={`${2 + l.d}s`} repeatCount="indefinite"/>
          </ellipse>
          <line x1={l.x} y1={l.y + 9} x2={l.x} y2={l.y + 28} stroke="#78350f" strokeWidth="0.8" opacity="0.35"/>
        </g>
      ))}
      {/* 地面 */}
      <path d="M0,320 Q120,310 220,315 Q320,320 375,310 L375,420 L0,420Z" fill="#1a1010"/>
      {/* 中心篝火 */}
      <circle cx="187" cy="300" r="35" fill="#fbbf24" opacity="0.08" filter="url(#mf1)"/>
      <circle cx="187" cy="300" r="18" fill="#f97316" opacity="0.12" filter="url(#mf1)"/>
      <path d="M184,302 L187,288 L190,302 L194,292 L191,304 L197,297 L192,306 L198,304 L192,308 L195,314 L189,308 L184,314 L187,308Z" fill="#fbbf24" opacity="0.35"/>
      {Array.from({ length: 10 }, (_, i) => (
        <circle key={i} cx={183 + Math.random() * 8} cy={280 + Math.random() * 12} r={0.8} fill="#fbbf24" opacity="0">
          <animate attributeName="opacity" values="0;0.5;0" dur={`${1 + Math.random() * 2}s`} repeatCount="indefinite"/>
          <animate attributeName="cy" from={288 + Math.random() * 5} to={265 + Math.random() * 10} dur={`${1.5 + Math.random() * 2}s`} repeatCount="indefinite"/>
        </circle>
      ))}
      {/* 四个围坐的 anime 人物 */}
      {[
        { x: 85, hair: '#3a2040', eye: '#f472b6', mouth: 'smile' as const },
        { x: 145, hair: '#4a3020', eye: '#60a5fa', mouth: 'smile' as const },
        { x: 230, hair: '#2a3040', eye: '#34d399', mouth: 'smile' as const },
        { x: 288, hair: '#402040', eye: '#fbbf24', mouth: 'smile' as const },
      ].map((p, i) => (
        <g key={i} transform={`translate(0,${i % 2 === 0 ? 0 : -5})`}>
          <AnimeHair cx={p.x} cy={330} color={p.hair} highlights="#ffffff11"/>
          <AnimeFace cx={p.x} cy={330} eyeColor={p.eye} mouthType={p.mouth} blush/>
          <path d={`M${p.x - 10},358 Q${p.x - 14},372 ${p.x - 16},385 L${p.x + 16},385 Q${p.x + 14},372 ${p.x + 10},358Z`} fill="#1a1020"/>
        </g>
      ))}
      {/* 温暖光罩 */}
      <rect x="0" y="260" width="375" height="160" fill="#fbbf24" opacity="0.025"/>
      <text x="187" y="43" textAnchor="middle" fill="#fbbf24" fontSize="28" fontWeight="bold" fontFamily="system-ui" opacity="0.8">市集</text>
    </svg>
  );
}

/* ============================================================
   CG 8 — 未发送的短信
   ============================================================ */
function CGUnsentMessage() {
  return (
    <svg viewBox="0 0 375 420" className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
      <defs>
        <radialGradient id="u1" cx="50%" cy="55%" r="45%"><stop offset="0%" stopColor="#60a5fa" stopOpacity="0.12"/><stop offset="100%" stopColor="transparent"/></radialGradient>
        <filter id="uf1"><feGaussianBlur stdDeviation="2"/></filter>
      </defs>
      <rect width="375" height="420" fill="#080810"/>
      <rect width="375" height="420" fill="url(#u1)"/>
      {/* 手机 */}
      <rect x="107" y="120" width="160" height="250" rx="14" fill="#0f172a" stroke="#1e293b" strokeWidth="2"/>
      <rect x="117" y="136" width="140" height="208" rx="5" fill="#0c1222"/>
      {/* 通知栏 */}
      <rect x="117" y="136" width="140" height="16" rx="5" fill="#0f172a"/>
      <text x="125" y="147" fill="#475569" fontSize="7" fontFamily="monospace">21:47</text>
      {/* 聊天 */}
      <text x="125" y="170" fill="#475569" fontSize="7" fontFamily="system-ui">妈妈</text>
      <line x1="125" y1="174" x2="253" y2="174" stroke="#1e293b" strokeWidth="0.5"/>
      <rect x="125" y="184" width="78" height="15" rx="5" fill="#1e293b"/>
      <text x="130" y="194" fill="#475569" fontSize="6.5" fontFamily="system-ui">最近还好吗？</text>
      <rect x="125" y="205" width="96" height="15" rx="5" fill="#1e293b"/>
      <text x="130" y="215" fill="#475569" fontSize="6.5" fontFamily="system-ui">天冷了，多穿点衣服</text>
      <rect x="125" y="226" width="68" height="15" rx="5" fill="#1e293b"/>
      <text x="130" y="236" fill="#475569" fontSize="6.5" fontFamily="system-ui">什么时候回家</text>
      {/* 输入框 + 未发出的消息 */}
      <rect x="123" y="296" width="128" height="36" rx="8" fill="#0f172a" stroke="#1e293b" strokeWidth="0.5"/>
      <text x="130" y="316" fill="#94a3b8" fontSize="8" fontFamily="system-ui">妈，其实我...</text>
      {/* 闪烁光标 */}
      <line x1="180" y1="309" x2="180" y2="321" stroke="#60a5fa" strokeWidth="1.5">
        <animate attributeName="opacity" values="1;0;1" dur="1.2s" repeatCount="indefinite"/>
      </line>
      {/* 未发送按钮 */}
      <rect x="256" y="304" width="18" height="12" rx="4" fill="#1e293b"/>
      <path d="M261,308 L267,311 L261,314" stroke="#475569" strokeWidth="1.5" fill="none"/>
      {/* 人物面部 — 屏幕光映照 */}
      <g transform="translate(0,15)">
        <AnimeHair cx={187} cy={320} color="#0d0d1a" highlights="#1a2a4e"/>
        <AnimeFace cx={187} cy={320} eyeColor="#60a5fa" mouthType="tremble" tears/>
      </g>
      {/* 手 */}
      <path d="M90,350 Q84,338 90,328 Q95,322 100,328 Q103,340 98,352" fill="#0d0d1a" stroke="#1a1a2e" strokeWidth="0.5"/>
      <path d="M270,350 Q282,336 278,326 Q274,320 268,324 Q264,336 268,350" fill="#0d0d1a" stroke="#1a1a2e" strokeWidth="0.5"/>
      <text x="187" y="42" textAnchor="middle" fill="#60a5fa" fontSize="22" fontWeight="bold" fontFamily="system-ui" opacity="0.7">未发送的短信</text>
    </svg>
  );
}

/* ============================================================
   CG 9 — 未命名
   ============================================================ */
function CGUnnamed() {
  return (
    <svg viewBox="0 0 375 420" className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="n1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#0f0f1a"/><stop offset="50%" stopColor="#1a1a2e"/><stop offset="100%" stopColor="#0f0f1a"/></linearGradient>
        <linearGradient id="n2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#334155"/><stop offset="50%" stopColor="#64748b"/><stop offset="100%" stopColor="#334155"/></linearGradient>
      </defs>
      <rect width="375" height="420" fill="url(#n1)"/>
      {/* 镜框 */}
      <ellipse cx="187" cy="240" rx="112" ry="172" fill="none" stroke="url(#n2)" strokeWidth="4"/>
      <ellipse cx="187" cy="240" rx="108" ry="168" fill="#0a0a14" opacity="0.4"/>
      {/* 镜面 */}
      <ellipse cx="187" cy="240" rx="102" ry="162" fill="#0f0f1a"/>
      {/* 镜中模糊人影 */}
      <g opacity="0.3">
        <AnimeHair cx={187} cy={275} color="#1a1a2e" highlights="#2a2a4e"/>
        <AnimeFace cx={187} cy={275} eyeColor="#64748b" mouthType="neutral"/>
        <path d="M175,303 Q170,338 165,365 L209,365 Q204,338 199,303Z" fill="#1a1a2e"/>
        <path d="M165,365 Q152,380 142,392 L178,388Z" fill="#1a1a2e"/>
        <path d="M209,365 Q222,380 232,392 L196,388Z" fill="#1a1a2e"/>
      </g>
      {/* 裂纹 */}
      <line x1="135" y1="165" x2="200" y2="280" stroke="#1a1a2e" strokeWidth="1.5" opacity="0.45"/>
      <line x1="200" y1="280" x2="165" y2="365" stroke="#1a1a2e" strokeWidth="1.5" opacity="0.45"/>
      <line x1="200" y1="280" x2="255" y2="325" stroke="#1a1a2e" strokeWidth="1.5" opacity="0.35"/>
      <line x1="155" y1="195" x2="225" y2="205" stroke="#1a1a2e" strokeWidth="1" opacity="0.25"/>
      {/* 碎片光 */}
      <polygon points="145,195 168,175 172,218" fill="white" opacity="0.015"/>
      <polygon points="200,145 222,135 216,178" fill="white" opacity="0.015"/>
      <polygon points="235,250 255,238 248,282" fill="white" opacity="0.015"/>
      {/* 镜前物品 */}
      <rect x="115" y="385" width="8" height="12" rx="2" fill="#1a1a2e" opacity="0.3"/>
      <circle cx="120" cy="383" r="5" fill="#2a1a3e" opacity="0.2"/>
      <path d="M135,390 Q145,380 155,393" stroke="#1a1a2e" strokeWidth="1.5" fill="none" opacity="0.25"/>
      <text x="187" y="42" textAnchor="middle" fill="#64748b" fontSize="26" fontWeight="bold" fontFamily="system-ui" opacity="0.7">未命名</text>
    </svg>
  );
}

/* ============================================================
   死亡 CG
   ============================================================ */
function CGDeathFall() {
  return (
    <svg viewBox="0 0 375 420" className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="d1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0a0a14"/><stop offset="100%" stopColor="#15152a"/></linearGradient>
      </defs>
      <rect width="375" height="420" fill="url(#d1)"/>
      <rect x="0" y="195" width="375" height="10" fill="#12122a"/>
      <rect x="0" y="185" width="375" height="15" fill="#0f0f25"/>
      {Array.from({ length: 22 }, (_, i) => (
        <rect key={i} x={15 + i * 17} y={210 + Math.random() * 155} width={4} height={2 + Math.random() * 5} fill="#fbbf24" opacity={0.04 + Math.random() * 0.1}/>
      ))}
      {/* 天台边缘的人物 */}
      <g transform="translate(0,-5)">
        <AnimeHair cx={187} cy={275} color="#12122a" highlights="#1a1a3a"/>
        <AnimeFace cx={187} cy={275} eyeColor="#475569" mouthType="sad"/>
        <path d="M175,303 Q170,338 165,365 L209,365 Q204,338 199,303Z" fill="#0f0f25"/>
        <path d="M165,365 Q152,380 142,392 L178,388Z" fill="#0f0f25"/>
        <path d="M209,365 Q222,380 232,392 L196,388Z" fill="#0f0f25"/>
      </g>
      {/* 风线 */}
      {Array.from({ length: 10 }, (_, i) => (
        <line key={i} x1={40 + i * 35} y1={90 + i * 18} x2={70 + i * 35} y2={85 + i * 18} stroke="white" strokeWidth="0.5" opacity="0.06"/>
      ))}
      <text x="187" y="43" textAnchor="middle" fill="#64748b" fontSize="26" fontWeight="bold" fontFamily="system-ui" opacity="0.6">坠落</text>
    </svg>
  );
}

function CGDeathHateCrime() {
  return (
    <svg viewBox="0 0 375 420" className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
      <rect width="375" height="420" fill="#050510"/>
      <rect x="0" y="210" width="375" height="210" fill="#08081a"/>
      <path d="M110,210 L135,420 M155,210 L148,420 M255,210 L248,420 M300,210 L310,420" stroke="#0d0d25" strokeWidth="18" fill="none"/>
      <ellipse cx="210" cy="385" rx="55" ry="7" fill="#1a1a40" opacity="0.15"/>
      {/* 地面假发 */}
      <path d="M240,378 Q248,362 258,378 Q252,372 248,380Z" fill="#1a1030" opacity="0.35"/>
      <circle cx="258" cy="380" r="2" fill="#ef4444" opacity="0.12"/>
      <circle cx="340" cy="225" r="3" fill="#fbbf24" opacity="0.18"/>
      <text x="187" y="43" textAnchor="middle" fill="#64748b" fontSize="24" fontWeight="bold" fontFamily="system-ui" opacity="0.6">消失在黑夜</text>
    </svg>
  );
}

function CGDeathGreyZone() {
  return (
    <svg viewBox="0 0 375 420" className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
      <rect width="375" height="420" fill="#050510"/>
      {/* 电脑屏幕 */}
      <rect x="82" y="145" width="210" height="145" rx="6" fill="#0a0a14" stroke="#1a1a2e" strokeWidth="2"/>
      <rect x="90" y="155" width="194" height="115" rx="3" fill="#0f0f1a"/>
      <text x="100" y="175" fill="#ef4444" fontSize="8" fontFamily="monospace" opacity="0.5">ERROR: Connection lost</text>
      <text x="100" y="190" fill="#475569" fontSize="7" fontFamily="monospace" opacity="0.4">Draft: 我现在很需要有人告诉我</text>
      <text x="100" y="202" fill="#475569" fontSize="7" fontFamily="monospace" opacity="0.3">我还能撑下去...</text>
      {/* 灰色头像 */}
      <circle cx="235" cy="245" r="16" fill="#334155" opacity="0.35"/>
      <circle cx="235" cy="245" r="13" fill="#1e293b"/>
      {/* 海中暗示 */}
      <path d="M0,355 Q100,345 200,353 Q300,361 375,350 L375,420 L0,420Z" fill="#0a0a1a" opacity="0.5"/>
      <text x="187" y="43" textAnchor="middle" fill="#64748b" fontSize="24" fontWeight="bold" fontFamily="system-ui" opacity="0.6">暗网的尽头</text>
    </svg>
  );
}

function CGDeathAloneSick() {
  return (
    <svg viewBox="0 0 375 420" className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
      <rect width="375" height="420" fill="#0a0a0f"/>
      {/* 荧光灯 */}
      <rect x="0" y="55" width="375" height="2.5" fill="#e2e8f0" opacity="0.12"/>
      <rect x="0" y="75" width="375" height="0.8" fill="#e2e8f0" opacity="0.06"/>
      {/* 病床 */}
      <rect x="95" y="245" width="185" height="10" rx="4" fill="#12122a"/>
      <rect x="105" y="225" width="165" height="22" rx="3" fill="#12122a" opacity="0.3"/>
      {/* 点滴架 */}
      <line x1="290" y1="200" x2="290" y2="300" stroke="#334155" strokeWidth="1.5"/>
      <rect x="285" y="200" width="10" height="16" rx="2" fill="#334155" opacity="0.25"/>
      <line x1="290" y1="216" x2="280" y2="235" stroke="#334155" strokeWidth="0.8"/>
      {/* 人物 — 躺卧 */}
      <g transform="translate(0,8)">
        <AnimeHair cx={175} cy={275} color="#15152a" highlights="#1a1a3a"/>
        <AnimeFace cx={175} cy={275} eyeColor="#64748b" mouthType="sad"/>
      </g>
      {/* 同意书 */}
      <rect x="125" y="315" width="105" height="38" rx="2" fill="#12122a" opacity="0.35"/>
      <line x1="135" y1="325" x2="220" y2="325" stroke="#475569" strokeWidth="0.5"/>
      <line x1="135" y1="331" x2="200" y2="331" stroke="#475569" strokeWidth="0.5"/>
      <line x1="135" y1="337" x2="210" y2="337" stroke="#475569" strokeWidth="0.5"/>
      {/* 空白签名 */}
      <line x1="165" y1="347" x2="220" y2="347" stroke="#475569" strokeWidth="0.5" strokeDasharray="3,2"/>
      <text x="187" y="43" textAnchor="middle" fill="#64748b" fontSize="20" fontWeight="bold" fontFamily="system-ui" opacity="0.6">病床上无人签的字</text>
    </svg>
  );
}

function CGDeathDisappear() {
  return (
    <svg viewBox="0 0 375 420" className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="e1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0a0a1a"/><stop offset="60%" stopColor="#1a1a3e"/><stop offset="100%" stopColor="#0a1a2e"/></linearGradient>
      </defs>
      <rect width="375" height="420" fill="url(#e1)"/>
      {/* 海面 */}
      <path d="M0,305 Q80,295 160,305 Q240,315 320,305 Q360,300 375,303 L375,420 L0,420Z" fill="#0a1a2e"/>
      <path d="M0,325 Q60,320 120,327 Q180,333 240,325 Q300,320 375,327 L375,420 L0,420Z" fill="#0a1628" opacity="0.55"/>
      {/* 礁石 */}
      <ellipse cx="290" cy="308" rx="28" ry="10" fill="#0f0f1a"/>
      {/* 碎花裙 */}
      <path d="M275,302 Q282,296 290,300 L293,304" stroke="#f472b6" strokeWidth="1.2" fill="none" opacity="0.18"/>
      <circle cx="285" cy="299" r="1.5" fill="#fbbf24" opacity="0.12"/>
      {/* 落日 */}
      <circle cx="310" cy="215" r="22" fill="#f97316" opacity="0.12"/>
      {/* 海鸥 */}
      <path d="M75,148 Q80,142 86,148" stroke="white" strokeWidth="0.7" fill="none" opacity="0.08"/>
      {/* 人物 — 走向海中 */}
      <g transform="translate(0,-8)" opacity="0.5">
        <AnimeHair cx={210} cy={300} color="#0d1a2e" highlights="#1a2a4e"/>
        <path d="M198,328 Q194,352 190,372 L230,372 Q226,352 222,328Z" fill="#0a1a2e"/>
        <path d="M190,372 Q178,385 168,395 L205,392Z" fill="#0a1a2e"/>
        <path d="M230,372 Q242,385 252,395 L215,392Z" fill="#0a1a2e"/>
      </g>
      <text x="187" y="43" textAnchor="middle" fill="#64748b" fontSize="20" fontWeight="bold" fontFamily="system-ui" opacity="0.6">那扇再也没打开的门</text>
    </svg>
  );
}

/* ============================================================
   映射 & 导出
   ============================================================ */
const cgMap: Record<string, React.ComponentType> = {
  ending_stars: CGStars,
  ending_content: CGSmallContent,
  ending_burnt: CGBurntOut,
  ending_cage: CGGildedCage,
  ending_wilderness: CGWilderness,
  ending_trapped: CGTrappedBeast,
  ending_ordinary: CGMarketplace,
  ending_regret: CGUnsentMessage,
  ending_default: CGUnnamed,
  ending_death_fall: CGDeathFall,
  ending_death_hate_crime: CGDeathHateCrime,
  ending_death_grey_zone: CGDeathGreyZone,
  ending_death_alone_sick: CGDeathAloneSick,
  ending_death_disappear: CGDeathDisappear,
};

export default function CGScene({ endingId }: { endingId: string }) {
  const SVGComponent = cgMap[endingId];
  const [imgFailed, setImgFailed] = useState(false);
  const imgSrc = `/cg/${endingId}.png`;

  if (!SVGComponent) return null;

  return (
    <div className="w-full overflow-hidden rounded-xl mb-3 relative">
      {/* 真实图片 — 优先显示，加载失败则隐藏 */}
      {!imgFailed && (
        <img
          src={imgSrc}
          alt=""
          className="w-full h-auto block"
          onError={() => setImgFailed(true)}
        />
      )}
      {/* SVG fallback — 图片未加载或失败时显示 */}
      {imgFailed && <SVGComponent />}
    </div>
  );
}
