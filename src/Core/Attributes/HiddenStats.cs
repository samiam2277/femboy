namespace FemboyLifeSim.Core.Attributes
{
    /// <summary>
    /// 隐藏属性：玩家间接感知
    /// </summary>
    public struct HiddenStats
    {
        /// <summary>0=纯粹爱好，100=强烈认同为女性。不直接显示数值。</summary>
        public float GenderIdentitySpectrum { get; set; }

        /// <summary>霸凌、背叛、网络暴力的隐性伤痕。过高触发精神崩溃事件。</summary>
        public float TraumaAccumulation { get; set; }

        /// <summary>长期戴面具的代价。高则内心空洞，低则社会摩擦大。</summary>
        public float Alienation { get; set; }

        /// <summary>被现实身份关联到网络人格的概率。满格触发社会性死亡事件。</summary>
        public float ExposureRisk { get; set; }

        public static HiddenStats Default => new HiddenStats
        {
            GenderIdentitySpectrum = 20,
            TraumaAccumulation = 0,
            Alienation = 30,
            ExposureRisk = 0,
        };
    }
}
