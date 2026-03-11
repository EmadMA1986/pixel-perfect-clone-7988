import { Gem, TrendingUp, DollarSign, Wallet, Scale } from "lucide-react";
import SummaryCard from "@/components/SummaryCard";
import ProfitLossCard from "@/components/ProfitLossCard";
import SalesTable from "@/components/SalesTable";
import ProfitChart from "@/components/ProfitChart";
import ExpenseBreakdown from "@/components/ExpenseBreakdown";
import ClientBreakdown from "@/components/ClientBreakdown";
import BrokerBalance from "@/components/BrokerBalance";
import {
  goldPurchases,
  sales,
  profitLoss,
  brokerBalances,
  goldInventory,
  formatCurrency,
  formatNumber,
} from "@/data/goldData";

const Index = () => {
  const totalSalesRevenue = sales.reduce((s, p) => s + p.amountUSD, 0);
  const avgCostPerGram = goldInventory.costOfRemainingUSD / goldInventory.balanceGrams;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-gold-dark flex items-center justify-center">
              <Gem className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-serif font-bold text-foreground tracking-tight">MKX Gold</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Trading Dashboard</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground hidden sm:block">Last updated: Mar 10, 2026</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <SummaryCard
            title="Net Profit"
            value={formatCurrency(profitLoss.netProfit)}
            subtitle="Operating margin 10.6%"
            icon={TrendingUp}
            trend="up"
          />
          <SummaryCard
            title="Total Revenue"
            value={formatCurrency(totalSalesRevenue)}
            subtitle={`${sales.length} transactions`}
            icon={DollarSign}
          />
          <SummaryCard
            title="Gold Inventory"
            value={`${formatNumber(goldInventory.balanceGrams, 2)}g`}
            subtitle={`Avg cost $${formatNumber(avgCostPerGram, 2)}/g`}
            icon={Gem}
          />
          <SummaryCard
            title="Broker PY"
            value={formatCurrency(brokerBalances.brokerPY.usd)}
            subtitle="USD Balance"
            icon={Wallet}
          />
          <SummaryCard
            title="Gross Profit"
            value={formatCurrency(profitLoss.grossProfit)}
            subtitle="Before admin expenses"
            icon={Scale}
            trend="up"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProfitChart />
          <ExpenseBreakdown />
        </div>

        {/* Client Breakdown & Broker Balance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ClientBreakdown />
          </div>
          <BrokerBalance />
        </div>

        {/* P&L and Sales */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ProfitLossCard />
          <div className="lg:col-span-2">
            <SalesTable />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
