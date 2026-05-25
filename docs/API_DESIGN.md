# 《男娘人生模拟器》后端 API 接口设计文档

**版本**：v1.0-draft
**日期**：2026-05-25
**状态**：草案（待数据库表结构 T004 确认后迭代）
**负责人**：Claude

---

## 1. 通用约定

### 1.1 基础信息

| 项 | 约定 |
|---|---|
| 基础路径 | `/api/v1` |
| 数据格式 | JSON（UTF-8） |
| 认证方式 | Bearer Token（JWT），`Authorization: Bearer <token>` |
| 时区 | 服务端统一 UTC，客户端自行转换 |
| ID 格式 | 雪花算法（Snowflake）64 位整数，序列化为字符串 |

### 1.2 通用响应结构

```json
{
  "code": 0,
  "message": "success",
  "data": {},
  "request_id": "req_xxxxxxxx"
}
```

| 字段 | 说明 |
|---|---|
| `code` | 业务状态码，`0` 为成功，非零为错误 |
| `message` | 人类可读描述 |
| `data` | 响应载荷，类型随接口变化 |
| `request_id` | 唯一请求追踪 ID |

### 1.3 分页约定

列表接口统一使用游标分页（适合时间线型数据）：

```json
{
  "data": {
    "list": [...],
    "pagination": {
      "next_cursor": "cursor_string",
      "has_more": true,
      "total": 100
    }
  }
}
```

请求参数：`?cursor=<cursor>&limit=20`（默认 20，最大 100）

### 1.4 全局错误码

| 错误码 | 含义 | HTTP 状态码 |
|---|---|---|
| `0` | 成功 | 200 |
| `1001` | 参数校验失败 | 400 |
| `1002` | 未授权 / Token 无效 | 401 |
| `1003` | 禁止访问 | 403 |
| `1004` | 资源不存在 | 404 |
| `1005` | 资源冲突（如唯一键重复） | 409 |
| `1006` | 请求频率超限 | 429 |
| `2001` | 业务规则冲突（如金钱不足） | 422 |
| `2002` | 游戏状态异常（如不在事件中） | 422 |
| `5000` | 服务端内部错误 | 500 |

---

## 2. 认证与用户模块

### 2.1 注册

```
POST /auth/register
```

**请求体：**

```json
{
  "username": "string, 3-20位, 字母数字下划线",
  "password": "string, 8-32位",
  "nickname": "string, optional"
}
```

**响应：**

```json
{
  "code": 0,
  "data": {
    "user_id": "123456789",
    "username": "player1",
    "token": "jwt_token_string",
    "expires_at": "2026-06-25T12:00:00Z"
  }
}
```

### 2.2 登录

```
POST /auth/login
```

### 2.3 Token 刷新

```
POST /auth/refresh
```

### 2.4 获取当前用户信息

```
GET /users/me
```

**响应：**

```json
{
  "code": 0,
  "data": {
    "user_id": "123456789",
    "username": "player1",
    "nickname": "小透明",
    "avatar_url": "",
    "created_at": "2026-05-25T10:00:00Z",
    "stats": {
      "total_playtime_minutes": 360,
      "endings_unlocked": 3,
      "total_runs": 5
    }
  }
}
```

### 2.5 更新用户信息

```
PATCH /users/me
```

---

## 3. 存档管理模块

核心机制：支持多周目、多存档槽、伏笔追踪、结局继承。

### 3.1 存档列表

```
GET /saves
```

**响应：**

```json
{
  "code": 0,
  "data": {
    "list": [
      {
        "save_id": "save_001",
        "slot_index": 1,
        "display_name": "第三章-裂变",
        "chapter": 3,
        "in_game_date": "2020-06-15",
        "playtime_minutes": 180,
        "created_at": "2026-05-25T10:00:00Z",
        "updated_at": "2026-05-25T12:00:00Z",
        "is_new_game_plus": false,
        "unlocked_endings": ["ending_01", "ending_05"],
        "thumbnail_data": "base64_or_url"
      }
    ]
  }
}
```

### 3.2 创建新存档

```
POST /saves
```

**请求体：**

```json
{
  "slot_index": 1,
  "base_save_id": "", // 为空表示全新开局；填 save_id 表示基于某存档的新周目
  "new_game_plus_options": {
    "carry_over_foreshadowing": true,
    "carry_over_wardrobe": true,
    "carry_over_npc_profiles": true
  }
}
```

### 3.3 读取存档详情

```
GET /saves/{save_id}
```

返回完整的存档状态快照（见第 4-8 节各子资源）。

### 3.4 覆盖存档

```
PUT /saves/{save_id}
```

自动存档由服务端在游戏节点触发时创建，手动存档通过此接口。

**请求体：**完整游戏状态对象（结构与 GET /saves/{save_id} 响应一致）。

### 3.5 删除存档

```
DELETE /saves/{save_id}
```

### 3.6 存档快照（自动存档历史）

```
GET /saves/{save_id}/snapshots
```

支持回滚到任意历史节点。

---

## 4. 角色属性模块

### 4.1 获取角色完整状态

```
GET /saves/{save_id}/character
```

**响应：**

```json
{
  "code": 0,
  "data": {
    "character_id": "char_001",
    "age": 22,
    "current_chapter": 3,
    "current_scene_id": "scene_3_15",
    "visible_stats": {
      "appearance": 68,
      "makeup_skill": 55,
      "inner_peace": 42,
      "social_mask": 70,
      "savings": 12500,
      "online_fame": 15000,
      "health": 80
    },
    "hidden_stats": {
      "gender_identity_spectrum": 45,  // 不直接展示给玩家
      "trauma_accumulation": 15,
      "alienation": 30,
      "exposure_risk": 20
    },
    "base_stats": {
      "skeleton_index": 65,
      "voice_condition": 50,
      "body_hair_gene": 70,
      "skin_quality": 60
    },
    "appearance_breakdown": {
      "base_contribution": 19.5,
      "makeup_contribution": 13.75,
      "equipment_contribution": 11.0,
      "skin_contribution": 10.2,
      "status_contribution": 6.8,
      "total": 61.25
    }
  }
}
```

> 注：`hidden_stats` 仅服务端计算使用，正常响应中可过滤；调试/开发者模式可返回。

### 4.2 批量修改属性（用于事件结算、日常抉择）

```
PATCH /saves/{save_id}/character/stats
```

**请求体：**

```json
{
  "changes": [
    { "stat_key": "savings", "delta": -1500, "reason": "equipment_purchase" },
    { "stat_key": "makeup_skill", "delta": 2, "reason": "daily_practice" },
    { "stat_key": "inner_peace", "delta": -5, "reason": "social_pressure_event" }
  ],
  "trigger_event_id": "evt_12345"
}
```

**校验规则：**
- 储蓄不能为负（触发经济崩溃事件时由专门接口处理）
- 属性有上下界（0-100 或根据设计调整）
- 所有修改原子性提交

---

## 5. 经济系统模块

### 5.1 获取经济状态

```
GET /saves/{save_id}/economy
```

**响应：**

```json
{
  "code": 0,
  "data": {
    "savings": 12500,
    "monthly_income": 8000,
    "monthly_expenses": 6500,
    "career_path": "office_worker",
    "expense_breakdown": {
      "housing": 2500,
      "basic_maintenance": 800,
      "equipment": 1500,
      "content_production": 1000,
      "medical": 700
    },
    "economic_collapse_level": 0,  // 0=正常, 1=一级, 2=二级, 3=三级
    "transaction_history_cursor": "cursor_xyz"
  }
}
```

### 5.2 执行交易/收支变动

```
POST /saves/{save_id}/economy/transactions
```

**请求体：**

```json
{
  "type": "expense",  // income | expense
  "category": "equipment",
  "amount": 1500,
  "description": "购入新假发与义乳",
  "related_item_id": "item_789",
  "trigger_event_id": "evt_123"
}
```

### 5.3 切换职业路径

```
POST /saves/{save_id}/economy/career/change
```

**请求体：**

```json
{
  "new_career_path": "content_creator",
  "reason_event_id": "evt_456"
}
```

### 5.4 获取收支历史

```
GET /saves/{save_id}/economy/transactions?cursor=&limit=20
```

---

## 6. 物品与装备模块

### 6.1 获取背包

```
GET /saves/{save_id}/inventory
```

**响应：**

```json
{
  "code": 0,
  "data": {
    "items": [
      {
        "item_id": "item_001",
        "template_id": "wig_long_black",
        "name": "黑色长直假发",
        "category": "wig",
        "quality": 3,  // 1-5
        "equipped": true,
        "durability": 85,
        "obtained_at": "2026-05-20T10:00:00Z"
      }
    ],
    "wardrobe_unlocked": ["wig_long_black", "cos_dress_01", ...]
  }
}
```

### 6.2 装备/卸下物品

```
POST /saves/{save_id}/inventory/equip
```

```json
{
  "item_id": "item_001",
  "slot": "head"  // head | face | body | legs | accessory
}
```

---

## 7. 事件与叙事模块

### 7.1 获取当前场景

```
GET /saves/{save_id}/scene
```

**响应：**

```json
{
  "code": 0,
  "data": {
    "scene_id": "scene_3_15",
    "chapter": 3,
    "type": "daily_choice",  // daily_choice | event | critical_decision | ending
    "background": "bg_apartment_night",
    "narrative_text": "深夜，你独自坐在出租屋里...",
    "characters_present": ["npc_mom"],
    "choices": [
      {
        "choice_id": "ch_001",
        "text": "给母亲回消息",
        "preconditions": [],
        "visible": true,
        "consequence_preview": "可能会触发家庭线事件"
      },
      {
        "choice_id": "ch_002",
        "text": "继续修图",
        "preconditions": [{ "stat": "energy", ">=": 10 }],
        "visible": true
      }
    ],
    "music_cue": "lofi_night",
    "time_of_day": "23:30"
  }
}
```

### 7.2 提交选择

```
POST /saves/{save_id}/scene/choose
```

**请求体：**

```json
{
  "choice_id": "ch_001",
  "timestamp": "2026-05-25T12:00:00Z"
}
```

**响应：** 返回下一 `scene` 对象 + 触发的属性变动 + 新触发的 `events`。

```json
{
  "code": 0,
  "data": {
    "next_scene": { ... },
    "stat_changes": [...],
    "triggered_events": ["evt_789"],
    "new_foreshadowing_tags": ["tag_secret_known_by_mom"],
    "flag_changes": { "mom_knows": true }
  }
}
```

### 7.3 查询历史场景（已读剧情）

```
GET /saves/{save_id}/history?cursor=&limit=50
```

用于「快速跳过」已读文本。

---

## 8. 蝴蝶效应与伏笔模块（B.A.E）

### 8.1 获取当前存档的伏笔状态

```
GET /saves/{save_id}/foreshadowing
```

**响应：**

```json
{
  "code": 0,
  "data": {
    "active_tags": [
      {
        "tag_id": "tag_secret_known_by_classmate",
        "source_event_id": "evt_10",
        "created_at": "2015-06-01",
        "trigger_conditions": [
          { "type": "time_elapsed", "years": 10 },
          { "type": "scene_match", "scene_pool": ["job_interview", "blind_date"] }
        ],
        "status": "dormant"
      }
    ],
    "triggered_tags": [
      {
        "tag_id": "tag_that_photo",
        "source_event_id": "evt_25",
        "triggered_at": "2020-08-15",
        "triggered_by": "evt_200",
        "resolution": "exposure_risk_increased"
      }
    ]
  }
}
```

### 8.2 埋设伏笔（内部/GM 用）

```
POST /saves/{save_id}/foreshadowing
```

一般由事件结算系统自动调用。

### 8.3 检查并触发到期伏笔

```
POST /saves/{save_id}/foreshadowing/check
```

推进时间线后调用，服务端评估所有 `dormant` 标签是否满足触发条件，返回触发的伏笔列表。

---

## 9. 社交关系模块

### 9.1 获取 NPC 关系网

```
GET /saves/{save_id}/relationships
```

**响应：**

```json
{
  "code": 0,
  "data": {
    "npcs": [
      {
        "npc_id": "npc_qingmei",
        "name": "林晓薇",
        "codename": "青梅",
        "layer": "core",  // core | inner_circle | outer_mask
        "affinity": 78,
        "trust": 85,
        "secrets_known": ["daily_crossdress"],
        "last_interaction": "2020-06-10",
        "relationship_status": "close_friend",
        "flags": { "confessed_in_middle_school": true }
      }
    ]
  }
}
```

### 9.2 更新 NPC 关系值

```
PATCH /saves/{save_id}/relationships/{npc_id}
```

```json
{
  "affinity_delta": 5,
  "trust_delta": -3,
  "new_secret": "online_identity",
  "flag_updates": { "knows_about_streaming": true }
}
```

---

## 10. 网络账号运营模块

### 10.1 获取全平台账号状态

```
GET /saves/{save_id}/social_media
```

**响应：**

```json
{
  "code": 0,
  "data": {
    "accounts": [
      {
        "platform": "bilibili",
        "handle": "@小透明酱",
        "followers": 5000,
        "activity_rate": 0.65,
        "female_follower_ratio": 0.35,
        "authenticity": 0.7,
        "risk_score": 15,
        "content_fatigue": 0.2,
        "monthly_revenue": 800,
        "is_banned": false
      },
      {
        "platform": "xiaohongshu",
        "handle": "小透明酱",
        "followers": 12000,
        "activity_rate": 0.8,
        "female_follower_ratio": 0.72,
        "authenticity": 0.6,
        "risk_score": 25,
        "content_fatigue": 0.4,
        "monthly_revenue": 1500,
        "is_banned": false
      }
    ]
  }
}
```

### 10.2 发布内容

```
POST /saves/{save_id}/social_media/post
```

```json
{
  "platform": "bilibili",
  "content_type": "video",  // video | image | text | live
  "quality_level": 3,
  "authenticity_level": 0.7,
  "risk_level": 0.1,
  "cost": { "time_hours": 8, "money": 200 }
}
```

**响应：** 返回内容表现预测/结果（播放量、互动、涨粉、风险变化）。

---

## 11. 结局与成就模块

### 11.1 获取结局矩阵

```
GET /endings
```

返回全结局图鉴（含未解锁的占位信息）。

### 11.2 标记结局达成

```
POST /saves/{save_id}/endings
```

```json
{
  "ending_id": "ending_a_stars",
  "happiness_level": "high",
  "authenticity_level": "high",
  "unlocked_at": "2026-05-25T15:00:00Z"
}
```

### 11.3 获取玩家全局成就

```
GET /users/me/achievements
```

---

## 12. 配置与元数据模块

### 12.1 获取游戏配置

```
GET /config
```

返回多语言文本、数值参数、事件模板等静态配置（客户端可缓存）。

### 12.2 获取数值表（Game Design 参数）

```
GET /config/game_design
```

```json
{
  "appearance_formula": {
    "base_weight": 0.3,
    "makeup_weight": 0.25,
    "equipment_weight": 0.2,
    "skin_weight": 0.15,
    "status_weight": 0.1
  },
  "age_decay": {
    "18_25": 0,
    "25_30": { "min": 2, "max": 3 },
    "30_plus": { "min": 5, "max": 8 }
  }
}
```

---

## 13. WebSocket 实时接口（可选扩展）

用于评论区弹幕、实时通知、心跳同步。

### 13.1 连接

```
WS /ws/v1/saves/{save_id}
```

携带相同 JWT Token 作为 `?token=` 查询参数。

### 13.2 服务端推送事件

| 事件类型 | 说明 |
|---|---|
| `scene.change` | 场景切换 |
| `stat.update` | 属性实时变动（如弹幕飘过影响内心自洽） |
| `notification` | 系统通知（经济崩溃预警、伏笔触发） |
| `comment.scroll` | 模拟评论区滚动弹幕（PRD 中屏幕侧面滚动评论） |

---

## 14. 未决事项（依赖 T004）

以下接口需待数据库表结构确认后细化：

1. **伏笔引擎的持久化结构**：`foreshadowing_tags` 的触发条件如何存储与索引，影响查询性能。
2. **场景图/叙事分支的存储**：如果选择自研叙事脚本工具（而非 Ink/Yarn），需补充 `/scenes/{scene_id}/branch_tree` 等接口。
3. **评论内容生成与缓存**：PRD 中「评论区视觉化」需要大量动态生成的评论文本，需确定是服务端实时生成还是客户端根据规则生成。
4. **存档体积优化**：完整存档状态对象可能很大，需确认是否使用增量同步（Delta Sync）或二进制序列化（如 protobuf + msgpack）。

---

## 15. 附录：接口总览表

| 模块 | 接口 | 方法 | 说明 |
|---|---|---|---|
| 认证 | `/auth/register` | POST | 注册 |
| 认证 | `/auth/login` | POST | 登录 |
| 认证 | `/auth/refresh` | POST | 刷新 Token |
| 用户 | `/users/me` | GET/PATCH | 用户信息 |
| 存档 | `/saves` | GET/POST | 存档列表/创建 |
| 存档 | `/saves/{id}` | GET/PUT/DELETE | 存档读写删 |
| 存档 | `/saves/{id}/snapshots` | GET | 自动存档历史 |
| 角色 | `/saves/{id}/character` | GET | 角色状态 |
| 角色 | `/saves/{id}/character/stats` | PATCH | 属性修改 |
| 经济 | `/saves/{id}/economy` | GET | 经济状态 |
| 经济 | `/saves/{id}/economy/transactions` | GET/POST | 交易记录/执行 |
| 经济 | `/saves/{id}/economy/career/change` | POST | 切换职业 |
| 物品 | `/saves/{id}/inventory` | GET | 背包 |
| 物品 | `/saves/{id}/inventory/equip` | POST | 装备/卸下 |
| 叙事 | `/saves/{id}/scene` | GET | 当前场景 |
| 叙事 | `/saves/{id}/scene/choose` | POST | 提交选择 |
| 叙事 | `/saves/{id}/history` | GET | 已读历史 |
| 伏笔 | `/saves/{id}/foreshadowing` | GET/POST | 伏笔查询/埋设 |
| 伏笔 | `/saves/{id}/foreshadowing/check` | POST | 检查触发 |
| 社交 | `/saves/{id}/relationships` | GET | 关系网 |
| 社交 | `/saves/{id}/relationships/{npc}` | PATCH | 更新关系 |
| 社媒 | `/saves/{id}/social_media` | GET | 平台账号状态 |
| 社媒 | `/saves/{id}/social_media/post` | POST | 发布内容 |
| 结局 | `/endings` | GET | 结局图鉴 |
| 结局 | `/saves/{id}/endings` | POST | 标记结局 |
| 成就 | `/users/me/achievements` | GET | 玩家成就 |
| 配置 | `/config` | GET | 游戏配置 |
| 配置 | `/config/game_design` | GET | 数值参数 |
| 实时 | `/ws/v1/saves/{id}` | WS | WebSocket |

---

**文档结束**
