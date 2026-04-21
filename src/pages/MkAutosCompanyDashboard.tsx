import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { TrendingUp, DollarSign, Wallet, Building2, ArrowLeft, BarChart3, Percent, User, Landmark, Users, FileText } from "lucide-react";
import SummaryCard from "@/components/SummaryCard";
import MonthFilter from "@/components/MonthFilter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatAED, balanceSheet, balanceSheetSnapshots, monthlyPL } from "@/data/mkAutosData";

const MkAutosCompanyDashboard = () => {
  // Available periods for the selector (BS snapshots: Dec-25, Jan-26, Feb-26, Mar-26)
  const months = useMemo(() => balanceSheetSnapshots.map((s) => s.monthKey), []);
  const [selectedMonth, setSelectedMonth] = useState<string>("Mar-26"); // default to latest

  const snapshot = useMemo(
    () => balanceSheetSnapshots.find((s) => s.monthKey === selectedMonth) ?? balanceSheetSnapshots[balanceSheetSnapshots.length - 1],
    [selectedMonth]
  );
  const pl = useMemo(() => monthlyPL.find((m) => m.month === selectedMonth), [selectedMonth]);

  const isAll = selectedMonth === "all";
  const allMode = isAll;

  // Aggregate "All Time" view — sum of P&L months, latest BS for stocks
  const allPL = useMemo(() => {
    return monthlyPL.reduce(
      (acc, m) => ({
        directIncome: acc.directIncome + m.directIncome,
        costOfSales: acc.costOfSales + m.costOfSales,
        grossProfit: acc.grossProfit + m.grossProfit,
        indirectExpenses: acc.indirectExpenses + m.indirectExpenses,
        otherExpense: acc.otherExpense + m.otherExpense,
        netProfit: acc.netProfit + m.netProfit,
      }),
      { directIncome: 0, costOfSales: 0, grossProfit: 0, indirectExpenses: 0, otherExpense: 0, netProfit: 0 }
    );
  }, []);

  const view = allMode
    ? {
        asOf: "All Time (May-25 → Mar-26)",
        capitalAccount: balanceSheetSnapshots.at(-1)!.capitalAccount,
        fixedAssetsTotal: balanceSheetSnapshots.at(-1)!.fixedAssetsTotal,
        currentAssetsTotal: balanceSheetSnapshots.at(-1)!.currentAssetsTotal,
        currentLiabilitiesTotal: balanceSheetSnapshots.at(-1)!.currentLiabilitiesTotal,
        loansTotal: balanceSheetSnapshots.at(-1)!.loansTotal,
        profitLoss: { opening: 0, currentPeriod: allPL.netProfit, total: allPL.netProfit },
        plMonth: allPL,
      }
    : {
        asOf: snapshot.asOf,
        capitalAccount: snapshot.capitalAccount,
        fixedAssetsTotal: snapshot.fixedAssetsTotal,
        currentAssetsTotal: snapshot.currentAssetsTotal,
        currentLiabilitiesTotal: snapshot.currentLiabilitiesTotal,
        loansTotal: snapshot.loansTotal,
        profitLoss: snapshot.profitLoss,
        plMonth: pl,
      };

  const currentRatio = view.currentAssetsTotal / view.currentLiabilitiesTotal;
  const debtToEquity = view.loansTotal / view.capitalAccount;

  // ===== Executive Summary: current vs previous month =====
  const execSummary = useMemo(() => {
    // Always anchor on a real month (use latest if "all" selected)
    const anchorKey = allMode ? monthlyPL[monthlyPL.length - 1].month : selectedMonth;
    const idx = monthlyPL.findIndex((m) => m.month === anchorKey);
    if (idx <= 0) return null;
    const cur = monthlyPL[idx];
    const prev = monthlyPL[idx - 1];

    const pct = (a: number, b: number) => (b === 0 ? 0 : ((a - b) / Math.abs(b)) * 100);
    const revPct = pct(cur.directIncome, prev.directIncome);
    const costTotalCur = cur.costOfSales + cur.indirectExpenses + cur.otherExpense;
    const costTotalPrev = prev.costOfSales + prev.indirectExpenses + prev.otherExpense;
    const costPct = pct(costTotalCur, costTotalPrev);
    const npPct = pct(cur.netProfit, prev.netProfit);

    // Driver detection
    const drivers: string[] = [];
    if (revPct >= 5) drivers.push(`revenue grew ${revPct.toFixed(1)}%`);
    else if (revPct <= -5) drivers.push(`revenue dropped ${Math.abs(revPct).toFixed(1)}%`);
    if (costPct >= 10) drivers.push(`total costs rose ${costPct.toFixed(1)}%`);
    else if (costPct <= -10) drivers.push(`costs reduced ${Math.abs(costPct).toFixed(1)}%`);
    if (cur.grossProfit > prev.grossProfit * 1.05) drivers.push("gross margin improved");
    else if (cur.grossProfit < prev.grossProfit * 0.95) drivers.push("gross margin weakened");

    // Risks
    const risks: string[] = [];
    if (cur.netProfit < 0) risks.push("Operating at a net loss");
    if (cur.indirectExpenses > cur.grossProfit) risks.push("Overheads exceed gross profit");
    if (cur.directIncome < prev.directIncome * 0.85) risks.push("Sharp revenue decline (>15%)");

    // Verdict + recommendation
    let verdict: "improving" | "stable" | "declining";
    if (cur.netProfit > prev.netProfit && cur.netProfit >= 0) verdict = "improving";
    else if (Math.abs(npPct) < 10) verdict = "stable";
    else verdict = "declining";

    const mainReason =
      Math.abs(revPct) > Math.abs(costPct)
        ? revPct >= 0 ? "stronger top-line revenue" : "weaker rental income"
        : costPct >= 0 ? "rising operating costs" : "tighter cost control";

    let recommendation = "Maintain current operations and monitor monthly trend.";
    if (cur.netProfit < 0 && cur.indirectExpenses > prev.indirectExpenses)
      recommendation = "Cut indirect expenses immediately and renegotiate fixed overheads.";
    else if (revPct < -10)
      recommendation = "Boost fleet utilization and re-activate idle vehicles to recover revenue.";
    else if (costPct > 15)
      recommendation = "Audit cost-of-sales spike and freeze non-essential spending.";
    else if (verdict === "improving")
      recommendation = "Reinvest surplus into highest-ROI vehicles and scale rental capacity.";

    return { cur, prev, revPct, costPct, npPct, costTotalCur, costTotalPrev, drivers, risks, verdict, mainReason, recommendation };
  }, [selectedMonth, allMode]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-serif font-bold text-foreground tracking-tight">MK Autos — Company</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Balance Sheet & Financial Overview</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <MonthFilter months={months} value={selectedMonth} onChange={setSelectedMonth} />
            <Link to="/mk-autos">
              <Button variant="outline" size="sm" className="text-xs">← Cars Dashboard</Button>
            </Link>
            <Badge variant="secondary" className="text-xs">Currency: AED</Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Summary Cards */}
        <div>
          <p className="text-xs font-medium tracking-wider uppercase text-muted-foreground mb-2">
            MK Autos — As at {view.asOf}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <SummaryCard title="Capital Account" value={formatAED(view.capitalAccount)} subtitle="Ahmad + Jamal + Moez" icon={Users} />
            <SummaryCard title="Fixed Assets" value={formatAED(view.fixedAssetsTotal)} subtitle="Vehicles & equipment" icon={Building2} />
            <SummaryCard title="Current Assets" value={formatAED(view.currentAssetsTotal)} subtitle="Receivables, cash, bank" icon={Wallet} />
            <SummaryCard title="Current Liabilities" value={formatAED(view.currentLiabilitiesTotal)} subtitle="Payables & dues" icon={TrendingUp} />
            <SummaryCard title="Loans" value={formatAED(view.loansTotal)} subtitle="Banks + Investors" icon={Landmark} />
            <SummaryCard
              title="Profit & Loss"
              value={formatAED(Math.abs(view.profitLoss.total))}
              subtitle={view.profitLoss.total < 0 ? "Net loss" : "Net profit"}
              icon={BarChart3}
              trend={view.profitLoss.total >= 0 ? "up" : "down"}
            />
          </div>
        </div>

        {/* Monthly P&L summary for the selected period */}
        {view.plMonth && (
          <div>
            <p className="text-xs font-medium tracking-wider uppercase text-muted-foreground mb-2">
              {allMode ? "Cumulative P&L (May-25 → Mar-26)" : `P&L — ${selectedMonth}`}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <SummaryCard title="Direct Income" value={formatAED(view.plMonth.directIncome)} subtitle="Rental + extras" icon={DollarSign} />
              <SummaryCard title="Cost of Sales" value={formatAED(view.plMonth.costOfSales)} subtitle="Direct expenses" icon={FileText} />
              <SummaryCard title="Gross Profit" value={formatAED(view.plMonth.grossProfit)} subtitle="Income − COGS" icon={TrendingUp} trend="up" />
              <SummaryCard title="Indirect Expenses" value={formatAED(view.plMonth.indirectExpenses)} subtitle="Operating overhead" icon={FileText} />
              <SummaryCard title="Other Expense" value={formatAED(view.plMonth.otherExpense)} subtitle="Investor profits etc." icon={User} />
              <SummaryCard
                title="Net Profit"
                value={formatAED(Math.abs(view.plMonth.netProfit))}
                subtitle={view.plMonth.netProfit < 0 ? "Net loss" : "Net profit"}
                icon={BarChart3}
                trend={view.plMonth.netProfit >= 0 ? "up" : "down"}
              />
            </div>
          </div>
        )}

        {/* Financial Ratios */}
        <div>
          <p className="text-xs font-medium tracking-wider uppercase text-muted-foreground mb-2">Financial Ratios — {view.asOf}</p>
          <div className="grid grid-cols-2 gap-3">
            <SummaryCard
              title="Current Ratio"
              value={`${currentRatio.toFixed(2)}x`}
              subtitle={currentRatio >= 2 ? "✅ Healthy" : currentRatio >= 1 ? "⚠ Adequate" : "⚠ Risky — below 1x"}
              icon={BarChart3}
              trend={currentRatio >= 1 ? "up" : "down"}
            />
            <Card className="relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
              <CardContent className="p-5 relative">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 w-full">
                    <p className="text-xs font-medium tracking-wider uppercase text-muted-foreground">Debt-to-Equity</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-bold font-serif text-foreground">
                        {debtToEquity.toFixed(2)}x
                      </p>
                      <span className={`text-xs font-medium ${debtToEquity > 5 ? "text-loss" : "text-success"}`}>
                        {debtToEquity > 10 ? "⚠ Very High Risk" : debtToEquity > 5 ? "⚠ High Risk" : debtToEquity > 2 ? "Moderate" : "Healthy"}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground pt-1 border-t border-border/30">
                      Total loans / capital account
                    </p>
                  </div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Percent className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Detailed Balance Sheet — shown only when no specific older snapshot is picked (item-level data is Feb-26 reference) */}
        {(allMode || selectedMonth === "Feb-26") && (
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-serif text-foreground">MK Autos Balance Sheet — Itemized</CardTitle>
              <p className="text-xs text-muted-foreground tracking-wider uppercase">As of Feb 2026</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
                {/* Fixed Assets */}
                <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                  <CardHeader className="py-3 px-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-serif text-foreground">Fixed Assets</CardTitle>
                      <Badge variant="secondary" className="text-xs font-bold">{formatAED(balanceSheet.fixedAssets.total)}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 pb-3 pt-0 max-h-64 overflow-y-auto">
                    {balanceSheet.fixedAssets.items.map((item) => (
                      <div key={item.name} className="flex items-center justify-between py-1 text-xs">
                        <span className="text-muted-foreground truncate mr-2">{item.name}</span>
                        <span className="tabular-nums font-medium text-foreground whitespace-nowrap">{formatAED(item.amount)}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Current Assets */}
                <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                  <CardHeader className="py-3 px-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-serif text-foreground">Current Assets</CardTitle>
                      <Badge variant="secondary" className="text-xs font-bold">{formatAED(balanceSheet.currentAssets.total)}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 pb-3 pt-0 max-h-64 overflow-y-auto">
                    {balanceSheet.currentAssets.items.filter((i) => i.amount !== 0).map((item) => (
                      <div key={item.name} className="flex items-center justify-between py-1 text-xs">
                        <span className="text-muted-foreground truncate mr-2">{item.name}</span>
                        <span className="tabular-nums font-medium text-foreground whitespace-nowrap">{formatAED(item.amount)}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Current Liabilities */}
                <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                  <CardHeader className="py-3 px-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-serif text-foreground">Current Liabilities</CardTitle>
                      <Badge variant="secondary" className="text-xs font-bold">{formatAED(balanceSheet.currentLiabilities.total)}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 pb-3 pt-0 max-h-64 overflow-y-auto">
                    {balanceSheet.currentLiabilities.items.map((item) => (
                      <div key={item.name} className="flex items-center justify-between py-1 text-xs">
                        <span className="text-muted-foreground truncate mr-2">{item.name}</span>
                        <span className={`tabular-nums font-medium whitespace-nowrap ${item.amount < 0 ? "text-success" : "text-foreground"}`}>{formatAED(item.amount)}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Loans & Capital */}
                <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                  <CardHeader className="py-3 px-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-serif text-foreground">Loans</CardTitle>
                      <Badge variant="secondary" className="text-xs font-bold">{formatAED(balanceSheet.loans.total)}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 pb-3 pt-0 max-h-64 overflow-y-auto">
                    {balanceSheet.loans.items.map((item) => (
                      <div key={item.name} className="flex items-center justify-between py-1 text-xs">
                        <span className="text-muted-foreground truncate mr-2">{item.name}</span>
                        <span className={`tabular-nums font-medium whitespace-nowrap ${item.amount < 0 ? "text-success" : "text-foreground"}`}>{formatAED(item.amount)}</span>
                      </div>
                    ))}
                    <div className="border-t border-border/30 mt-2 pt-2 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground font-medium">Capital Account</span>
                        <span className="tabular-nums font-bold text-foreground">{formatAED(balanceSheet.capitalAccount)}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground font-medium">P&L (Current)</span>
                        <span className={`tabular-nums font-bold ${balanceSheet.profitLoss.currentPeriod >= 0 ? "text-success" : "text-loss"}`}>{formatAED(balanceSheet.profitLoss.currentPeriod)}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground font-medium">P&L (Total)</span>
                        <span className={`tabular-nums font-bold ${balanceSheet.profitLoss.total >= 0 ? "text-success" : "text-loss"}`}>{formatAED(balanceSheet.profitLoss.total)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Monthly P&L history table */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-serif text-foreground">Monthly Profit & Loss History</CardTitle>
            <p className="text-[10px] text-muted-foreground tracking-wider uppercase">May 2025 → March 2026</p>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/50 text-muted-foreground">
                  <th className="text-left py-2 px-2">Month</th>
                  <th className="text-right py-2 px-2">Direct Income</th>
                  <th className="text-right py-2 px-2">Cost of Sales</th>
                  <th className="text-right py-2 px-2">Gross Profit</th>
                  <th className="text-right py-2 px-2">Indirect Exp</th>
                  <th className="text-right py-2 px-2">Other Exp</th>
                  <th className="text-right py-2 px-2">Net Profit</th>
                </tr>
              </thead>
              <tbody>
                {monthlyPL.map((m) => {
                  const isSel = !allMode && m.month === selectedMonth;
                  return (
                    <tr
                      key={m.month}
                      className={`border-b border-border/20 hover:bg-secondary/30 transition-colors ${isSel ? "bg-primary/10" : ""}`}
                    >
                      <td className="py-2 px-2 font-medium text-foreground">{m.month}</td>
                      <td className="py-2 px-2 text-right tabular-nums">{formatAED(m.directIncome)}</td>
                      <td className="py-2 px-2 text-right tabular-nums">{formatAED(m.costOfSales)}</td>
                      <td className="py-2 px-2 text-right tabular-nums text-success">{formatAED(m.grossProfit)}</td>
                      <td className="py-2 px-2 text-right tabular-nums">{formatAED(m.indirectExpenses)}</td>
                      <td className="py-2 px-2 text-right tabular-nums">{formatAED(m.otherExpense)}</td>
                      <td className={`py-2 px-2 text-right tabular-nums font-semibold ${m.netProfit >= 0 ? "text-success" : "text-loss"}`}>
                        {formatAED(m.netProfit)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default MkAutosCompanyDashboard;
