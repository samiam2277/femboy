namespace FemboyLifeSim.Core.Attributes
{
    /// <summary>
    /// 外貌呈现计算器
    /// 公式：实际外在呈现 = 底子×0.3 + 妆造技术×0.25 + 装备质量×0.2 + 皮肤/体态×0.15 + 状态×0.1
    /// </summary>
    public static class AppearanceCalculator
    {
        public const float SkeletonWeight = 0.30f;
        public const float MakeupWeight = 0.25f;
        public const float EquipmentWeight = 0.20f;
        public const float SkinWeight = 0.15f;
        public const float ConditionWeight = 0.10f;

        public static float Calculate(
            float skeletonIndex,
            float makeupSkill,
            float equipmentQuality,
            float skinCondition,
            float currentCondition)
        {
            var raw = skeletonIndex * SkeletonWeight
                    + makeupSkill * MakeupWeight
                    + equipmentQuality * EquipmentWeight
                    + skinCondition * SkinWeight
                    + currentCondition * ConditionWeight;

            return Clamp(raw);
        }

        public static float CalculatePhotoBonus(float baseAppearance, PhotoType photoType)
        {
            var multiplier = photoType switch
            {
                PhotoType.Selfie => 1.20f,
                PhotoType.ControlledEnvironment => 1.40f,
                PhotoType.ConventionReturn => 1.0f,
                PhotoType.CandidShot => 0.70f,
                PhotoType.VideoLive => 0.85f,
                _ => 1.0f,
            };

            return Clamp(baseAppearance * multiplier);
        }

        public static float ApplyAgeDecay(float baseSkeleton, int age)
        {
            var decay = age switch
            {
                <= 25 => 0f,                        // 18-25岁黄金期，不衰减
                <= 30 => 2.5f * (age - 25),          // 26-30岁，每年自然衰减2.5
                _ => 12.5f + 6.5f * (age - 30),      // 31岁后，每年衰减6.5
            };

            return Clamp(baseSkeleton - decay);
        }

        private static float Clamp(float v) => v < 0 ? 0 : (v > 100 ? 100 : v);
    }

    public enum PhotoType
    {
        Selfie,
        ControlledEnvironment,
        ConventionReturn,
        CandidShot,
        VideoLive,
    }
}
