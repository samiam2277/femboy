// 对齐后端 C# 模型: FemboyLifeSim.Core.Attributes.VisibleStats
export interface VisibleStats {
  appearance: number;      // 外在呈现 0-100
  makeupSkill: number;     // 妆造技术
  selfAcceptance: number;  // 内心自洽
  socialMask: number;      // 社会面具
  money: number;           // 经济储备
  followers: number;       // 网络人气
  health: number;          // 健康/体能
  equipmentQuality: number;// 装备质量
  skinCondition: number;   // 皮肤/体态
  currentCondition: number;// 当前状态（疲劳/情绪）
}

export const DEFAULT_VISIBLE_STATS: VisibleStats = {
  appearance: 0,
  makeupSkill: 0,
  selfAcceptance: 30,
  socialMask: 50,
  money: 0,
  followers: 0,
  health: 80,
  equipmentQuality: 0,
  skinCondition: 50,
  currentCondition: 80,
};

// 对齐后端 C# 模型: HiddenStats
export interface HiddenStats {
  genderIdentitySpectrum: number; // 性别认同光谱 0-100
  traumaAccumulation: number;     // 创伤累积
  alienation: number;             // 异化值
  exposureRisk: number;           // 曝光风险
}

export const DEFAULT_HIDDEN_STATS: HiddenStats = {
  genderIdentitySpectrum: 0,
  traumaAccumulation: 0,
  alienation: 0,
  exposureRisk: 0,
};

// 底子属性（几乎不可变更的初始值）
export interface BaseStats {
  skeletonIndex: number; // 骨架指数
  voiceCondition: number; // 嗓音条件
  bodyHairGene: number;   // 体毛基因
  skinBase: number;       // 皮肤底子
}

// 游戏阶段
export type GameChapter =
  | 'prologue'   // 序章
  | 'chapter1'   // 萌芽 6-12岁
  | 'chapter2'   // 暗涌 13-18岁
  | 'chapter3'   // 裂变 18-25岁
  | 'chapter4'   // 沉降 25-40岁
  | 'chapter5';  // 回响 40岁-终章

// 房间阶段（影响出租屋桌面物品）
export type RoomStage =
  | 'empty'      // 初期：空荡荡
  | 'developing' // 中期：堆满化妆品、假发架、cos服
  | 'refined'    // 后期精致化
  | 'cleared';   // 退圈清空

// 职业路径
export type CareerPath =
  | 'office'     // 普通白领
  | 'service'    // 服务业/创意行业
  | 'streamer'   // 自媒体/主播
  | 'industry'   // 妆娘/摄影/二次元从业者
  | 'gray';      // 灰色地带

// 平台类型
export type SocialPlatform = 'bilibili' | 'xiaohongshu' | 'weibo' | 'twitter' | 'douyin';

// 玩家存档
export interface GameSave {
  id: string;
  chapter: GameChapter;
  roomStage: RoomStage;
  visibleStats: VisibleStats;
  hiddenStats: HiddenStats;
  baseStats: BaseStats;
  career: CareerPath | null;
  platforms: Record<SocialPlatform, PlatformAccount>;
  flags: string[]; // 已触发的伏笔标记
  createdAt: number;
  updatedAt: number;
}

export interface PlatformAccount {
  followers: number;
  activity: number;
  femaleRatio: number;
  authenticity: number;
  riskValue: number;
  contentFatigue: number;
}

// 手机 App 类型
export type PhoneApp =
  | 'home'       // 桌面/主界面
  | 'social'     // 社交平台
  | 'gallery'    // 相册
  | 'memo'       // 备忘录
  | 'chat'       // 聊天
  | 'stats'      // 属性面板
  | 'shop'       // 商店/装备
  | 'career';    // 职业/经济
