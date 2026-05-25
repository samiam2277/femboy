namespace FemboyLifeSim.Core.Attributes
{
    /// <summary>
    /// 底子属性：几乎不可变更的初始值
    /// </summary>
    public struct BaseStats
    {
        /// <summary>肩宽、胯宽、身高综合。影响外在呈现上限。</summary>
        public float SkeletonIndex { get; set; }

        /// <summary>自然声线粗细。影响伪声训练难度。</summary>
        public float VoiceCondition { get; set; }

        /// <summary>毛发生长密度。影响脱毛成本与频次。</summary>
        public float BodyHairGenetics { get; set; }

        /// <summary>肤质、色素。影响化妆难度和成本。</summary>
        public float SkinBase { get; set; }

        public BaseStats(float skeleton, float voice, float hair, float skin)
        {
            SkeletonIndex = Clamp(skeleton);
            VoiceCondition = Clamp(voice);
            BodyHairGenetics = Clamp(hair);
            SkinBase = Clamp(skin);
        }

        private static float Clamp(float v) => v < 0 ? 0 : (v > 100 ? 100 : v);
    }
}
