using System;
using System.Collections.Generic;
using NUnit.Framework;
using FemboyLifeSim.Core.ButterflyEffect;

namespace FemboyLifeSim.Tests.Core.ButterflyEffect
{
    [TestFixture]
    public class ButterflyEffectEngineTests
    {
        [Test]
        public void Plant_Foreshadowing_AddedToList()
        {
            var engine = new ButterflyEffectEngine();
            var fs = new Foreshadowing("fs1", "秘密", "测试", 0, 6);
            engine.Plant(fs);
            Assert.That(engine.AllForeshadowings.Count, Is.EqualTo(1));
        }

        [Test]
        public void TickMonth_BeforeMinTrigger_DoesNotTrigger()
        {
            var engine = new ButterflyEffectEngine();
            engine.Plant(new Foreshadowing("fs1", "秘密", "测试", 0, 6));
            var triggered = engine.TickMonth(3);
            Assert.That(triggered.Count, Is.EqualTo(0));
        }

        [Test]
        public void TickMonth_AfterMinTrigger_NoCondition_Triggers()
        {
            var engine = new ButterflyEffectEngine();
            engine.Plant(new Foreshadowing("fs1", "秘密", "测试", 0, 6));
            var triggered = engine.TickMonth(6);
            Assert.That(triggered.Count, Is.EqualTo(1));
            Assert.That(triggered[0].Id, Is.EqualTo("fs1"));
        }

        [Test]
        public void TickMonth_AfterMaxTrigger_DoesNotTrigger()
        {
            var engine = new ButterflyEffectEngine();
            engine.Plant(new Foreshadowing("fs1", "秘密", "测试", 0, 6, maxTriggerMonth: 12));
            var triggered = engine.TickMonth(15);
            Assert.That(triggered.Count, Is.EqualTo(0));
        }

        [Test]
        public void TickMonth_ConditionMet_Triggers()
        {
            var engine = new ButterflyEffectEngine(new Dictionary<string, float> { ["exposure"] = 80 });
            var condition = new ForeshadowingCondition("exposure", 50, ComparisonType.GreaterThan);
            engine.Plant(new Foreshadowing("fs1", "曝光", "测试", 0, 6, condition: condition));
            var triggered = engine.TickMonth(6);
            Assert.That(triggered.Count, Is.EqualTo(1));
        }

        [Test]
        public void TickMonth_ConditionNotMet_DoesNotTrigger()
        {
            var engine = new ButterflyEffectEngine(new Dictionary<string, float> { ["exposure"] = 30 });
            var condition = new ForeshadowingCondition("exposure", 50, ComparisonType.GreaterThan);
            engine.Plant(new Foreshadowing("fs1", "曝光", "测试", 0, 6, condition: condition));
            var triggered = engine.TickMonth(6);
            Assert.That(triggered.Count, Is.EqualTo(0));
        }

        [Test]
        public void TickMonth_AlreadyTriggered_DoesNotTriggerAgain()
        {
            var engine = new ButterflyEffectEngine();
            engine.Plant(new Foreshadowing("fs1", "秘密", "测试", 0, 6));
            engine.TickMonth(6);
            var triggered = engine.TickMonth(7);
            Assert.That(triggered.Count, Is.EqualTo(0));
        }

        [Test]
        public void ForceTrigger_ValidId_MarksTriggered()
        {
            var engine = new ButterflyEffectEngine();
            engine.Plant(new Foreshadowing("fs1", "秘密", "测试", 0, 100));
            engine.ForceTrigger("fs1");
            Assert.That(engine.ActiveForeshadowings.Count, Is.EqualTo(0));
        }

        [Test]
        public void ForceTrigger_InvalidId_Throws()
        {
            var engine = new ButterflyEffectEngine();
            Assert.Throws<ArgumentException>(() => engine.ForceTrigger("nonexist"));
        }

        [Test]
        public void MarkTriggered_Twice_Throws()
        {
            var fs = new Foreshadowing("fs1", "秘密", "测试", 0, 6);
            fs.MarkTriggered();
            Assert.Throws<InvalidOperationException>(() => fs.MarkTriggered());
        }

        [Test]
        public void IsInTriggerWindow_BeforeMin_ReturnsFalse()
        {
            var fs = new Foreshadowing("fs1", "秘密", "测试", 0, 6);
            Assert.That(fs.IsInTriggerWindow(3), Is.False);
        }

        [Test]
        public void IsInTriggerWindow_AfterMax_ReturnsFalse()
        {
            var fs = new Foreshadowing("fs1", "秘密", "测试", 0, 6, maxTriggerMonth: 12);
            Assert.That(fs.IsInTriggerWindow(15), Is.False);
        }

        [Test]
        public void IsInTriggerWindow_InsideWindow_ReturnsTrue()
        {
            var fs = new Foreshadowing("fs1", "秘密", "测试", 0, 6, maxTriggerMonth: 12);
            Assert.That(fs.IsInTriggerWindow(8), Is.True);
        }

        [Test]
        public void IsInTriggerWindow_Triggered_ReturnsFalse()
        {
            var fs = new Foreshadowing("fs1", "秘密", "测试", 0, 6);
            fs.MarkTriggered();
            Assert.That(fs.IsInTriggerWindow(10), Is.False);
        }

        [Test]
        public void UpdateAttribute_GetAttribute_RoundTrips()
        {
            var engine = new ButterflyEffectEngine();
            engine.UpdateAttribute("stress", 75f);
            Assert.That(engine.GetAttribute("stress"), Is.EqualTo(75f));
        }

        [Test]
        public void GetAttribute_Missing_ReturnsNull()
        {
            var engine = new ButterflyEffectEngine();
            Assert.That(engine.GetAttribute("missing"), Is.Null);
        }

        [Test]
        public void TickMonth_MultipleFores_TriggersOnlyReadyOnes()
        {
            var engine = new ButterflyEffectEngine();
            engine.Plant(new Foreshadowing("early", "早", "测试", 0, 3));
            engine.Plant(new Foreshadowing("late", "晚", "测试", 0, 10));
            var triggered = engine.TickMonth(5);
            Assert.That(triggered.Count, Is.EqualTo(1));
            Assert.That(triggered[0].Id, Is.EqualTo("early"));
        }

        [Test]
        public void Condition_LessThan_Works()
        {
            var engine = new ButterflyEffectEngine(new Dictionary<string, float> { ["money"] = 20 });
            var condition = new ForeshadowingCondition("money", 50, ComparisonType.LessThan);
            engine.Plant(new Foreshadowing("fs1", "破产", "测试", 0, 6, condition: condition));
            var triggered = engine.TickMonth(6);
            Assert.That(triggered.Count, Is.EqualTo(1));
        }

        [Test]
        public void Condition_Equal_Works()
        {
            var engine = new ButterflyEffectEngine(new Dictionary<string, float> { ["trauma"] = 100 });
            var condition = new ForeshadowingCondition("trauma", 100, ComparisonType.Equal);
            engine.Plant(new Foreshadowing("fs1", "崩溃", "测试", 0, 6, condition: condition));
            var triggered = engine.TickMonth(6);
            Assert.That(triggered.Count, Is.EqualTo(1));
        }
    }
}
