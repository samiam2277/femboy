using NUnit.Framework;
using FemboyLifeSim.Core.Economy;

namespace FemboyLifeSim.Tests.Core.Economy
{
    [TestFixture]
    public class EconomySystemTests
    {
        [Test]
        public void Constructor_InitialBalance_SetCorrectly()
        {
            var eco = new EconomySystem(5000);
            Assert.That(eco.CurrentBalance, Is.EqualTo(5000f));
        }

        [Test]
        public void TotalMonthlyIncome_SumsAllSources()
        {
            var eco = new EconomySystem();
            eco.AddIncome(new IncomeSource("job1", "IT工作", 8000, JobType.WhiteCollar));
            eco.AddIncome(new IncomeSource("stream", "直播打赏", 2000, JobType.Streamer));
            Assert.That(eco.TotalMonthlyIncome, Is.EqualTo(10000f));
        }

        [Test]
        public void TotalMonthlyExpense_SumsAllExpenses()
        {
            var eco = new EconomySystem();
            eco.AddExpense(new Expense("rent", "房租", 3000, true));
            eco.AddExpense(new Expense("cos", "装备采购", 1500, false));
            Assert.That(eco.TotalMonthlyExpense, Is.EqualTo(4500f));
        }

        [Test]
        public void TickMonth_Surplus_IncreasesBalance()
        {
            var eco = new EconomySystem(1000);
            eco.AddIncome(new IncomeSource("job", "工作", 5000, JobType.WhiteCollar));
            eco.AddExpense(new Expense("rent", "房租", 2000, true));
            eco.TickMonth();
            Assert.That(eco.CurrentBalance, Is.EqualTo(4000f));
            Assert.That(eco.ConsecutiveDeficitMonths, Is.EqualTo(0));
        }

        [Test]
        public void TickMonth_Deficit_DecreasesBalanceAndCountsDeficit()
        {
            var eco = new EconomySystem(1000);
            eco.AddIncome(new IncomeSource("job", "兼职", 2000, JobType.ServiceCreative));
            eco.AddExpense(new Expense("rent", "房租", 3000, true));
            eco.TickMonth();
            Assert.That(eco.CurrentBalance, Is.EqualTo(0f));
            Assert.That(eco.ConsecutiveDeficitMonths, Is.EqualTo(1));
        }

        [Test]
        public void TickMonth_ThreeMonthsDeficit_Level1Collapse()
        {
            var eco = new EconomySystem(0);
            eco.AddExpense(new Expense("rent", "房租", 3000, true));
            eco.TickMonth(); // month 1
            eco.TickMonth(); // month 2
            eco.TickMonth(); // month 3 -> Level1
            Assert.That(eco.CollapseLevel, Is.EqualTo(EconomicCollapseLevel.Level1));
        }

        [Test]
        public void TickMonth_SixMonthsDeficit_Level2Collapse()
        {
            var eco = new EconomySystem(0);
            eco.AddExpense(new Expense("rent", "房租", 3000, true));
            for (int i = 0; i < 6; i++) eco.TickMonth();
            Assert.That(eco.CollapseLevel, Is.EqualTo(EconomicCollapseLevel.Level2));
        }

        [Test]
        public void TickMonth_NineMonthsDeficit_Level3Collapse()
        {
            var eco = new EconomySystem(0);
            eco.AddExpense(new Expense("rent", "房租", 3000, true));
            for (int i = 0; i < 9; i++) eco.TickMonth();
            Assert.That(eco.CollapseLevel, Is.EqualTo(EconomicCollapseLevel.Level3));
        }

        [Test]
        public void TickMonth_Recovery_ResetDeficitCounter()
        {
            var eco = new EconomySystem(0);
            eco.AddExpense(new Expense("rent", "房租", 3000, true));
            eco.TickMonth(); // deficit 1
            eco.TickMonth(); // deficit 2
            eco.AddIncome(new IncomeSource("job", "工作", 5000, JobType.WhiteCollar));
            eco.TickMonth(); // surplus -> reset
            Assert.That(eco.ConsecutiveDeficitMonths, Is.EqualTo(0));
            Assert.That(eco.CollapseLevel, Is.EqualTo(EconomicCollapseLevel.None));
        }

        [Test]
        public void TrySpend_EnoughBalance_Success()
        {
            var eco = new EconomySystem(1000);
            var success = eco.TrySpend(500);
            Assert.That(success, Is.True);
            Assert.That(eco.CurrentBalance, Is.EqualTo(500f));
        }

        [Test]
        public void TrySpend_InsufficientBalance_Fails()
        {
            var eco = new EconomySystem(1000);
            var success = eco.TrySpend(1500);
            Assert.That(success, Is.False);
            Assert.That(eco.CurrentBalance, Is.EqualTo(1000f));
        }

        [Test]
        public void TrySpend_ExactBalance_Success()
        {
            var eco = new EconomySystem(1000);
            var success = eco.TrySpend(1000);
            Assert.That(success, Is.True);
            Assert.That(eco.CurrentBalance, Is.EqualTo(0f));
        }

        [Test]
        public void RemoveIncome_ById_RemovesCorrectly()
        {
            var eco = new EconomySystem();
            eco.AddIncome(new IncomeSource("job", "工作", 5000, JobType.WhiteCollar));
            eco.RemoveIncome("job");
            Assert.That(eco.TotalMonthlyIncome, Is.EqualTo(0f));
        }

        [Test]
        public void RemoveExpense_ById_RemovesCorrectly()
        {
            var eco = new EconomySystem();
            eco.AddExpense(new Expense("rent", "房租", 3000, true));
            eco.RemoveExpense("rent");
            Assert.That(eco.TotalMonthlyExpense, Is.EqualTo(0f));
        }
    }
}
