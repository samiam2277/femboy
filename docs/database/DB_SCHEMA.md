# 数据库表结构设计 v1.0

**日期**：2026-05-25
**决策人**：老板（资深游戏制作人）
**状态**：已冻结，T001/T002 以此为准继续细化

---

## 选型

- **单机模式**：SQLite（嵌入 Unity，零部署）
- **在线模式**：PostgreSQL（云存档、排行榜、跨设备同步）
- **ORM/访问层**：Dapper（手写 SQL，性能可控；复杂查询用 EF Core 迁移）

---

## 表清单

| 表名 | 说明 | 单行大小估算 | 备注 |
|------|------|-------------|------|
| `players` | 玩家账号/设备标识 | 256B | 单机可降级为本地 GUID |
| `game_saves` | 存档槽位 | 2KB | 支持多周目、快速存档 |
| `character_stats` | 角色属性快照 | 1KB | 按游戏月记录历史，用于回溯 |
| `foreshadowings` | 伏笔状态 | 512B | 与存档绑定 |
| `events` | 已触发/待触发事件 | 1KB | 含事件结果选择 |
| `npc_relations` | NPC 关系网络 | 512B | 同心圆结构量化 |
| `economy_logs` | 经济流水 | 256B/条 | 月度收支明细 |
| `social_accounts` | 平台账号矩阵 | 512B | B站/小红书/微博/X/抖音 |
| `inventory` | 道具/装备背包 | 256B/条 | 含购买来源、使用次数 |
| `achievements` | 成就/结局解锁 | 128B | 多周目继承用 |
| `comments` | 评论区存档 | 512B/条 | 网络人格运营反馈 |

---

## 详细设计

### 1. players（玩家）

```sql
CREATE TABLE players (
    player_id       TEXT PRIMARY KEY,           -- UUID/GUID
    device_id       TEXT NOT NULL UNIQUE,       -- 设备指纹
    created_at      INTEGER NOT NULL,           -- Unix 时间戳
    last_login      INTEGER,
    total_playtime  INTEGER DEFAULT 0,          -- 秒
    ng_plus_count   INTEGER DEFAULT 0           -- 新游戏+次数
);
```

### 2. game_saves（存档）

```sql
CREATE TABLE game_saves (
    save_id         TEXT PRIMARY KEY,
    player_id       TEXT NOT NULL REFERENCES players(player_id),
    slot_index      INTEGER NOT NULL,           -- 1~10
    save_name       TEXT,
    chapter         INTEGER NOT NULL DEFAULT 1, -- 当前章节 1~5
    game_month      INTEGER NOT NULL DEFAULT 0, -- 游戏内总月数
    character_age   INTEGER NOT NULL DEFAULT 6, -- 当前年龄
    is_ng_plus      INTEGER DEFAULT 0,          -- 0/1
    created_at      INTEGER NOT NULL,
    updated_at      INTEGER NOT NULL,
    checksum        TEXT,                       -- 防篡改
    UNIQUE(player_id, slot_index)
);
```

### 3. character_stats（角色属性）

**分当前值 + 历史快照两张表**，避免存档膨胀。

#### 3a. current_stats（当前属性）

```sql
CREATE TABLE current_stats (
    save_id         TEXT PRIMARY KEY REFERENCES game_saves(save_id),

    -- 底子（几乎不变）
    base_skeleton   REAL NOT NULL DEFAULT 50,
    base_voice      REAL NOT NULL DEFAULT 50,
    base_bodyhair   REAL NOT NULL DEFAULT 50,
    base_skin       REAL NOT NULL DEFAULT 50,

    -- 可见属性
    vis_appearance  REAL NOT NULL DEFAULT 0,
    vis_makeup      REAL NOT NULL DEFAULT 0,
    vis_selfaccept  REAL NOT NULL DEFAULT 30,
    vis_socialmask  REAL NOT NULL DEFAULT 50,
    vis_money       REAL NOT NULL DEFAULT 0,
    vis_followers   REAL NOT NULL DEFAULT 0,
    vis_health      REAL NOT NULL DEFAULT 80,
    vis_equipment   REAL NOT NULL DEFAULT 0,
    vis_skincond    REAL NOT NULL DEFAULT 50,
    vis_condition   REAL NOT NULL DEFAULT 80,

    -- 隐藏属性
    hid_gender_spectrum REAL NOT NULL DEFAULT 20,
    hid_trauma          REAL NOT NULL DEFAULT 0,
    hid_alienation      REAL NOT NULL DEFAULT 30,
    hid_exposure_risk   REAL NOT NULL DEFAULT 0
);
```

#### 3b. stats_history（属性历史，用于图表/回溯）

```sql
CREATE TABLE stats_history (
    history_id      INTEGER PRIMARY KEY AUTOINCREMENT,
    save_id         TEXT NOT NULL REFERENCES game_saves(save_id),
    game_month      INTEGER NOT NULL,
    vis_appearance  REAL,
    vis_money       REAL,
    vis_health      REAL,
    hid_trauma      REAL,
    hid_exposure_risk REAL,
    UNIQUE(save_id, game_month)
);
```

### 4. foreshadowings（伏笔）

```sql
CREATE TABLE foreshadowings (
    foreshadowing_id TEXT PRIMARY KEY,          -- 如 "fs_junior_confession"
    save_id          TEXT NOT NULL REFERENCES game_saves(save_id),
    display_name     TEXT NOT NULL,
    planted_month    INTEGER NOT NULL,
    min_trigger_month INTEGER NOT NULL,
    max_trigger_month INTEGER DEFAULT 0,        -- 0 = 无期限
    is_triggered     INTEGER DEFAULT 0,
    triggered_month  INTEGER,
    condition_attr   TEXT,                      -- 关联属性名
    condition_op     TEXT,                      -- ">" / "<" / "="
    condition_value  REAL,
    result_event_id  TEXT                       -- 触发后解锁的事件
);
```

### 5. events（事件）

```sql
CREATE TABLE events (
    event_instance_id TEXT PRIMARY KEY,         -- UUID
    save_id           TEXT NOT NULL REFERENCES game_saves(save_id),
    event_template_id TEXT NOT NULL,            -- 如 "evt_toilet_dilemma"
    chapter           INTEGER,
    trigger_month     INTEGER,
    is_resolved       INTEGER DEFAULT 0,
    choice_index      INTEGER DEFAULT -1,       -- 玩家选择 0/1/2... -1=未选
    choice_consequences TEXT,                   -- JSON: {"money_delta": -500, "trauma_delta": 10}
    related_foreshadowing_id TEXT REFERENCES foreshadowings(foreshadowing_id)
);
```

### 6. npc_relations（NPC 关系）

```sql
CREATE TABLE npc_relations (
    relation_id     INTEGER PRIMARY KEY AUTOINCREMENT,
    save_id         TEXT NOT NULL REFERENCES game_saves(save_id),
    npc_template_id TEXT NOT NULL,              -- 如 "npc_childhood_friend"
    relation_layer  INTEGER NOT NULL DEFAULT 3, -- 1=核心圈, 2=同温层, 3=外围假面
    intimacy        REAL NOT NULL DEFAULT 0,    -- 亲密度 0~100
    trust           REAL NOT NULL DEFAULT 0,    -- 信任度
    knows_secret    INTEGER DEFAULT 0,          -- 是否知道主角身份
    has_betrayed    INTEGER DEFAULT 0,
    last_interaction_month INTEGER DEFAULT 0
);
```

### 7. economy_logs（经济流水）

```sql
CREATE TABLE economy_logs (
    log_id          INTEGER PRIMARY KEY AUTOINCREMENT,
    save_id         TEXT NOT NULL REFERENCES game_saves(save_id),
    game_month      INTEGER NOT NULL,
    income_total    REAL DEFAULT 0,
    expense_total   REAL DEFAULT 0,
    balance_after   REAL NOT NULL,
    collapse_level  INTEGER DEFAULT 0,          -- 0/1/2/3
    detail_json     TEXT                        -- [{"type":"income","name":"直播","amount":2000}]
);
```

### 8. social_accounts（平台账号）

```sql
CREATE TABLE social_accounts (
    account_id      INTEGER PRIMARY KEY AUTOINCREMENT,
    save_id         TEXT NOT NULL REFERENCES game_saves(save_id),
    platform        TEXT NOT NULL,              -- bilibili/xiaohongshu/weibo/x/douyin
    followers       INTEGER DEFAULT 0,
    activity_rate   REAL DEFAULT 0,             -- 近30日互动率
    female_ratio    REAL DEFAULT 0.5,
    authenticity    REAL DEFAULT 50,            -- 真实度
    risk_value      REAL DEFAULT 0,
    content_fatigue REAL DEFAULT 0
);
```

### 9. inventory（背包）

```sql
CREATE TABLE inventory (
    item_id         INTEGER PRIMARY KEY AUTOINCREMENT,
    save_id         TEXT NOT NULL REFERENCES game_saves(save_id),
    item_template_id TEXT NOT NULL,             -- 如 "item_wig_01"
    category        TEXT NOT NULL,              -- cosmetic/clothing/prop/medical
    quality         REAL DEFAULT 50,
    durability      REAL DEFAULT 100,           -- 耐久/使用次数
    acquired_month  INTEGER,
    acquired_from   TEXT                        -- 购买/掉落/赠送
);
```

### 10. achievements（成就/结局）

```sql
CREATE TABLE achievements (
    achievement_id  TEXT PRIMARY KEY,
    player_id       TEXT NOT NULL REFERENCES players(player_id),
    template_id     TEXT NOT NULL,              -- 如 "ending_a_stars"
    unlocked_at     INTEGER NOT NULL,
    save_id         TEXT REFERENCES game_saves(save_id),
    is_ng_plus_carryover INTEGER DEFAULT 1      -- 新游戏+是否继承
);
```

### 11. comments（评论存档）

```sql
CREATE TABLE comments (
    comment_id      INTEGER PRIMARY KEY AUTOINCREMENT,
    save_id         TEXT NOT NULL REFERENCES game_saves(save_id),
    platform        TEXT NOT NULL,
    game_month      INTEGER NOT NULL,
    content         TEXT NOT NULL,
    sentiment       REAL DEFAULT 0,             -- -1~1，负面到正面
    is_pinned       INTEGER DEFAULT 0           -- 是否置顶显示
);
```

---

## 索引建议

```sql
-- 高频查询：读档时拉取当前属性
CREATE INDEX idx_current_stats_save ON current_stats(save_id);

-- 高频查询：按月回溯属性曲线
CREATE INDEX idx_stats_history_save_month ON stats_history(save_id, game_month);

-- 事件触发查询：按存档+章节筛选
CREATE INDEX idx_events_save_chapter ON events(save_id, chapter);

-- 伏笔查询：待触发列表
CREATE INDEX idx_foreshadowings_active ON foreshadowings(save_id, is_triggered, min_trigger_month);
```

---

## 与 T001 API 的对接点

| API 模块 | 主表 | 关键接口 |
|---------|------|---------|
| 存档管理 | `game_saves` | CRUD + 槽位覆盖校验 |
| 属性系统 | `current_stats` + `stats_history` | 读取当前值 / 写入月度快照 |
| 事件系统 | `events` + `foreshadowings` | 触发事件时写 `events`，更新 `foreshadowings` |
| 经济系统 | `economy_logs` | 月度结算时追加记录 |
| NPC 系统 | `npc_relations` | 对话/送礼后更新亲密度 |
| 网络运营 | `social_accounts` + `comments` | 发内容后涨粉、生成评论 |

---

## 遗留待决（留给 Beta 期）

1. **加密字段**：`players.device_id`、`game_saves.checksum` 是否需要 HMAC？
2. **云同步冲突**：多设备同时玩时，存档合并策略（Last-Write-Wins vs 字段级合并）
3. **审核合规**：`comments.content` 是否需要本地敏感词过滤 + 上传前脱敏
