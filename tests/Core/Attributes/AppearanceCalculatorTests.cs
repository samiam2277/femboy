using NUnit.Framework;
using FemboyLifeSim.Core.Attributes;

namespace FemboyLifeSim.Tests.Core.Attributes
{
    [TestFixture]
    public class AppearanceCalculatorTests
    {
        [Test]
        public void Calculate_PerfectStats_Returns100()
        {
            var result = AppearanceCalculator.Calculate(100, 100, 100, 100, 100);
            Assert.That(result, Is.EqualTo(100f).Within(0.01f));
        }

        [Test]
        public void Calculate_ZeroStats_Returns0()
        {
            var result = AppearanceCalculator.Calculate(0, 0, 0, 0, 0);
            Assert.That(result, Is.EqualTo(0f).Within(0.01f));
        }

        [Test]
        public void Calculate_MidStats_ReturnsExpectedWeightedAverage()
        {
            // 50 * 0.3 + 50 * 0.25 + 50 * 0.2 + 50 * 0.15 + 50 * 0.1 = 50
            var result = AppearanceCalculator.Calculate(50, 50, 50, 50, 50);
            Assert.That(result, Is.EqualTo(50f).Within(0.01f));
        }

        [Test]
        public void Calculate_Exceeds100_ClampedTo100()
        {
            var result = AppearanceCalculator.Calculate(200, 200, 200, 200, 200);
            Assert.That(result, Is.EqualTo(100f));
        }

        [Test]
        public void Calculate_Negative_ClampedTo0()
        {
            var result = AppearanceCalculator.Calculate(-10, -10, -10, -10, -10);
            Assert.That(result, Is.EqualTo(0f));
        }

        [Test]
        public void CalculatePhotoBonus_Selfie_IncreasesBy20Percent()
        {
            var result = AppearanceCalculator.CalculatePhotoBonus(50f, PhotoType.Selfie);
            Assert.That(result, Is.EqualTo(60f).Within(0.01f));
        }

        [Test]
        public void CalculatePhotoBonus_ControlledEnvironment_IncreasesBy40Percent()
        {
            var result = AppearanceCalculator.CalculatePhotoBonus(50f, PhotoType.ControlledEnvironment);
            Assert.That(result, Is.EqualTo(70f).Within(0.01f));
        }

        [Test]
        public void CalculatePhotoBonus_CandidShot_DecreasesTo70Percent()
        {
            var result = AppearanceCalculator.CalculatePhotoBonus(50f, PhotoType.CandidShot);
            Assert.That(result, Is.EqualTo(35f).Within(0.01f));
        }

        [Test]
        public void CalculatePhotoBonus_VideoLive_DecreasesTo85Percent()
        {
            var result = AppearanceCalculator.CalculatePhotoBonus(50f, PhotoType.VideoLive);
            Assert.That(result, Is.EqualTo(42.5f).Within(0.01f));
        }

        [Test]
        public void ApplyAgeDecay_Before25_NoDecay()
        {
            var result = AppearanceCalculator.ApplyAgeDecay(80f, 24);
            Assert.That(result, Is.EqualTo(80f).Within(0.01f));
        }

        [Test]
        public void ApplyAgeDecay_At25_NoDecay()
        {
            var result = AppearanceCalculator.ApplyAgeDecay(80f, 25);
            Assert.That(result, Is.EqualTo(80f).Within(0.01f));
        }

        [Test]
        public void ApplyAgeDecay_At28_MidDecay()
        {
            // 2.5 * (28 - 25) = 7.5
            var result = AppearanceCalculator.ApplyAgeDecay(80f, 28);
            Assert.That(result, Is.EqualTo(72.5f).Within(0.01f));
        }

        [Test]
        public void ApplyAgeDecay_At30_FullEarlyDecay()
        {
            // 2.5 * 6 = 15
            var result = AppearanceCalculator.ApplyAgeDecay(80f, 30);
            Assert.That(result, Is.EqualTo(67.5f).Within(0.01f));
        }

        [Test]
        public void ApplyAgeDecay_At35_LateDecay()
        {
            // 12.5 + 6.5 * 5 = 45
            var result = AppearanceCalculator.ApplyAgeDecay(80f, 35);
            Assert.That(result, Is.EqualTo(35f).Within(0.01f));
        }

        [Test]
        public void ApplyAgeDecay_VeryOld_ClampedTo0()
        {
            var result = AppearanceCalculator.ApplyAgeDecay(80f, 50);
            Assert.That(result, Is.EqualTo(0f));
        }
    }
}
