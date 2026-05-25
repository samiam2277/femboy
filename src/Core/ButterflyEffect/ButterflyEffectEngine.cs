using System;
using System.Collections.Generic;
using System.Linq;

namespace FemboyLifeSim.Core.ButterflyEffect
{
    /// <summary>
    /// 蝴蝶效应引擎：管理伏笔的埋设与触发
    /// </summary>
    public class ButterflyEffectEngine
    {
        private readonly List<Foreshadowing> _foreshadowings = new();
        private readonly Dictionary<string, float> _attributes;

        public IReadOnlyList<Foreshadowing> AllForeshadowings => _foreshadowings;
        public IReadOnlyList<Foreshadowing> ActiveForeshadowings =>
            _foreshadowings.Where(f => !f.IsTriggered).ToList();

        public ButterflyEffectEngine(Dictionary<string, float>? attributes = null)
        {
            _attributes = attributes ?? new Dictionary<string, float>();
        }

        public void Plant(Foreshadowing foreshadowing)
        {
            _foreshadowings.Add(foreshadowing);
        }

        /// <summary>推进一个月，检查并触发所有满足条件的伏笔</summary>
        /// <returns>本轮触发的伏笔列表</returns>
        public List<Foreshadowing> TickMonth(int currentMonth)
        {
            var triggered = new List<Foreshadowing>();

            foreach (var f in _foreshadowings)
            {
                if (f.IsTriggered) continue;
                if (!f.IsInTriggerWindow(currentMonth)) continue;

                if (CheckCondition(f.Condition))
                {
                    f.MarkTriggered();
                    triggered.Add(f);
                }
            }

            return triggered;
        }

        /// <summary>强制触发一个伏笔（用于必然事件）</summary>
        public void ForceTrigger(string foreshadowingId)
        {
            var f = _foreshadowings.FirstOrDefault(x => x.Id == foreshadowingId);
            if (f == null)
                throw new ArgumentException($"伏笔 {foreshadowingId} 不存在");
            f.MarkTriggered();
        }

        public void UpdateAttribute(string name, float value)
        {
            _attributes[name] = value;
        }

        public float? GetAttribute(string name)
        {
            return _attributes.TryGetValue(name, out var v) ? v : null;
        }

        private bool CheckCondition(ForeshadowingCondition? condition)
        {
            if (condition == null) return true;
            if (!_attributes.TryGetValue(condition.AttributeName, out var value)) return false;

            return condition.Comparison switch
            {
                ComparisonType.GreaterThan => value > condition.Threshold,
                ComparisonType.LessThan => value < condition.Threshold,
                ComparisonType.Equal => Math.Abs(value - condition.Threshold) < 0.001f,
                _ => false,
            };
        }
    }
}
