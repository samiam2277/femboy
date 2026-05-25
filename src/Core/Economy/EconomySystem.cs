using System;
using System.Collections.Generic;
using System.Linq;

namespace FemboyLifeSim.Core.Economy
{
    /// <summary>
    /// 经济系统：管理收入、支出、经济崩溃等级
    /// </summary>
    public class EconomySystem
    {
        private readonly List<IncomeSource> _incomes = new();
        private readonly List<Expense> _expenses = new();

        public float CurrentBalance { get; private set; }
        public int ConsecutiveDeficitMonths { get; private set; }
        public EconomicCollapseLevel CollapseLevel { get; private set; }

        public float TotalMonthlyIncome => _incomes.Sum(i => i.Amount);
        public float TotalMonthlyExpense => _expenses.Sum(e => e.Amount);
        public float NetMonthlyFlow => TotalMonthlyIncome - TotalMonthlyExpense;

        public EconomySystem(float initialBalance = 0)
        {
            CurrentBalance = initialBalance;
        }

        public void AddIncome(IncomeSource income)
        {
            _incomes.Add(income);
        }

        public void RemoveIncome(string id)
        {
            _incomes.RemoveAll(i => i.Id == id);
        }

        public void AddExpense(Expense expense)
        {
            _expenses.Add(expense);
        }

        public void RemoveExpense(string id)
        {
            _expenses.RemoveAll(e => e.Id == id);
        }

        /// <summary>结算一个月</summary>
        public void TickMonth()
        {
            CurrentBalance += NetMonthlyFlow;

            if (NetMonthlyFlow < 0)
            {
                ConsecutiveDeficitMonths++;
            }
            else
            {
                ConsecutiveDeficitMonths = 0;
            }

            UpdateCollapseLevel();
        }

        /// <summary>尝试支付一笔费用。余额不足时返回false。</summary>
        public bool TrySpend(float amount)
        {
            if (CurrentBalance < amount)
                return false;

            CurrentBalance -= amount;
            return true;
        }

        private void UpdateCollapseLevel()
        {
            CollapseLevel = ConsecutiveDeficitMonths switch
            {
                < 3 => EconomicCollapseLevel.None,
                < 6 => EconomicCollapseLevel.Level1,
                < 9 => EconomicCollapseLevel.Level2,
                _ => EconomicCollapseLevel.Level3,
            };
        }
    }

    public record IncomeSource(string Id, string Name, float Amount, JobType JobType);

    public record Expense(string Id, string Category, float Amount, bool IsEssential);

    public enum EconomicCollapseLevel
    {
        None,
        Level1, // 削减非必要支出
        Level2, // 搬到更差居住环境
        Level3, // 清仓事件——被迫彻底退圈或接受不愿做的交易
    }

    public enum JobType
    {
        WhiteCollar,      // 普通白领
        ServiceCreative,  // 服务业/创意行业
        Streamer,         // 自媒体/主播
        OtakuIndustry,    // 妆娘/摄影/二次元从业者
        GrayZone,         // 灰色地带
    }
}
