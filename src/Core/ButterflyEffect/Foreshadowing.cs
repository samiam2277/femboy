using System;

namespace FemboyLifeSim.Core.ButterflyEffect
{
    /// <summary>
    /// 单个伏笔标记
    /// </summary>
    public class Foreshadowing
    {
        public string Id { get; }
        public string Name { get; }
        public string Description { get; }

        /// <summary>埋下时间（游戏月）</summary>
        public int PlantedMonth { get; }

        /// <summary>最早触发时间（游戏月）</summary>
        public int MinTriggerMonth { get; }

        /// <summary>最晚触发时间（游戏月），0表示无期限</summary>
        public int MaxTriggerMonth { get; }

        /// <summary>是否已经触发</summary>
        public bool IsTriggered { get; private set; }

        /// <summary>触发后的结果事件ID</summary>
        public string? ResultEventId { get; }

        /// <summary>额外条件：触发时需要满足的某个属性阈值</summary>
        public ForeshadowingCondition? Condition { get; }

        public Foreshadowing(
            string id,
            string name,
            string description,
            int plantedMonth,
            int minTriggerMonth,
            int maxTriggerMonth = 0,
            string? resultEventId = null,
            ForeshadowingCondition? condition = null)
        {
            Id = id;
            Name = name;
            Description = description;
            PlantedMonth = plantedMonth;
            MinTriggerMonth = minTriggerMonth;
            MaxTriggerMonth = maxTriggerMonth;
            ResultEventId = resultEventId;
            Condition = condition;
            IsTriggered = false;
        }

        public void MarkTriggered()
        {
            if (IsTriggered)
                throw new InvalidOperationException($"伏笔 {Id} 已经触发过了");
            IsTriggered = true;
        }

        /// <summary>检查当前月份是否处于可触发窗口</summary>
        public bool IsInTriggerWindow(int currentMonth)
        {
            if (IsTriggered) return false;
            if (currentMonth < MinTriggerMonth) return false;
            if (MaxTriggerMonth > 0 && currentMonth > MaxTriggerMonth) return false;
            return true;
        }
    }

    public record ForeshadowingCondition(string AttributeName, float Threshold, ComparisonType Comparison);

    public enum ComparisonType
    {
        GreaterThan,
        LessThan,
        Equal,
    }
}
