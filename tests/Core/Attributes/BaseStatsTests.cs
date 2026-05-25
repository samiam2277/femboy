using NUnit.Framework;
using FemboyLifeSim.Core.Attributes;

namespace FemboyLifeSim.Tests.Core.Attributes
{
    [TestFixture]
    public class BaseStatsTests
    {
        [Test]
        public void Constructor_NormalValues_SetCorrectly()
        {
            var stats = new BaseStats(60, 70, 40, 80);
            Assert.That(stats.SkeletonIndex, Is.EqualTo(60f));
            Assert.That(stats.VoiceCondition, Is.EqualTo(70f));
            Assert.That(stats.BodyHairGenetics, Is.EqualTo(40f));
            Assert.That(stats.SkinBase, Is.EqualTo(80f));
        }

        [Test]
        public void Constructor_Negative_ClampedTo0()
        {
            var stats = new BaseStats(-10, -5, -20, -1);
            Assert.That(stats.SkeletonIndex, Is.EqualTo(0f));
            Assert.That(stats.VoiceCondition, Is.EqualTo(0f));
            Assert.That(stats.BodyHairGenetics, Is.EqualTo(0f));
            Assert.That(stats.SkinBase, Is.EqualTo(0f));
        }

        [Test]
        public void Constructor_Over100_ClampedTo100()
        {
            var stats = new BaseStats(150, 200, 999, 101);
            Assert.That(stats.SkeletonIndex, Is.EqualTo(100f));
            Assert.That(stats.VoiceCondition, Is.EqualTo(100f));
            Assert.That(stats.BodyHairGenetics, Is.EqualTo(100f));
            Assert.That(stats.SkinBase, Is.EqualTo(100f));
        }
    }
}
