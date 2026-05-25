namespace FemboyLifeSim.Core.Attributes
{
    /// <summary>
    /// 可见属性：玩家明确感知
    /// </summary>
    public struct VisibleStats
    {
        /// <summary>女性化外表综合指数</summary>
        public float Appearance { get; set; }

        /// <summary>化妆、假发、穿搭、伪声、仪态</summary>
        public float MakeupSkill { get; set; }

        /// <summary>自我接纳度</summary>
        public float SelfAcceptance { get; set; }

        /// <summary>主流社会中的"正常化"表演能力</summary>
        public float SocialMask { get; set; }

        /// <summary>可支配存款</summary>
        public float Money { get; set; }

        /// <summary>全平台粉丝总量</summary>
        public float Followers { get; set; }

        /// <summary>身体素质</summary>
        public float Health { get; set; }

        /// <summary>装备质量（服装、假发、化妆品等）</summary>
        public float EquipmentQuality { get; set; }

        /// <summary>皮肤/体态维护水平</summary>
        public float SkinCondition { get; set; }

        /// <summary>当前状态（疲劳/情绪），影响呈现</summary>
        public float CurrentCondition { get; set; }

        public static VisibleStats Default => new VisibleStats
        {
            Appearance = 0,
            MakeupSkill = 0,
            SelfAcceptance = 30,
            SocialMask = 50,
            Money = 0,
            Followers = 0,
            Health = 80,
            EquipmentQuality = 0,
            SkinCondition = 50,
            CurrentCondition = 80,
        };
    }
}
