import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp, TrendingDown, DollarSign, Building2, ArrowLeft,
  AlertTriangle, Target, Zap, Activity, Minus, ChevronRight,
} from "lucide-react";
import MonthFilter from "@/components/MonthFilter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from "recharts";
import { formatAED, balanceSheetSnapshots, monthlyPL } from "@/data/mkAutosData";

const MkAutosCompanyDashboard = () => {
  const months = useMemo(() => balanceSheetSnapshots.map((s) => s.monthKey), []);
  const [selectedMonth, setSelectedMonth] = useState<string>(
    balanceSheetSnapshots[balanceSheetSnapshots.length - 1].monthKey
  );

  const snapshot = useMemo(
    () => balanceSheetSnapshots.find((s) => s.monthKey === selectedMonth) ?? balanceSheetSnapshots[balanceSheetSnapshots.length - 1],
    [selectedMonth]
  );

  const allMode = selectedMonth === "all";

  // ===== Executive analysis =====
  const exec = useMemo(() => {
    const anchorKey = allMode ? monthlyPL[monthlyPL.length - 1].month : selectedMonth;
    const idx = monthlyPL.findIndex((m) => m.month === anchorKey);
    if (idx < 0) return null;
    const cur = monthlyPL[idx];
    const prev = idx > 0 ? monthlyPL[idx - 1] : null;

    const pct = (a: number, b: number) => (b === 0 ? 0 : ((a - b) / Math.abs(b)) * 100);
    const costCur = cur.costOfSales + cur.indirectExpenses + cur.otherExpense;
    const costPrev = prev ? prev.costOfSales + prev.indirectExpenses + prev.otherExpense : 0;

    const revPct = prev ? pct(cur.directIncome, prev.directIncome) : 0;
    const costPct = prev ? pct(costCur, costPrev) : 0;
    const npPct = prev ? pct(cur.netProfit, prev.netProfit) : 0;
    const gpMargin = cur.directIncome ? (cur.grossProfit / cur.directIncome) * 100 : 0;
    const npMargin = cur.directIncome ? (cur.netProfit / cur.directIncome) * 100 : 0;

    // Verdict
    let verdict: "improving" | "stable" | "declining";
    if (prev && cur.netProfit > prev.netProfit && cur.netProfit >= 0) verdict = "improving";
    else if (Math.abs(npPct) < 10) verdict = "stable";
    else verdict = "declining";

    // Main driver
    let mainDriver = "";
    if (prev) {
      const revDelta = cur.directIncome - prev.directIncome;
      const costDelta = costCur - costPrev;
      if (Math.abs(revDelta) > Math.abs(costDelta)) {
        mainDriver = revDelta >= 0
          ? `Revenue up ${formatAED(revDelta)} (+${revPct.toFixed(1)}%)`
          : `Revenue down ${formatAED(Math.abs(revDelta))} (${revPct.toFixed(1)}%)`;
      } else {
        mainDriver = costDelta >= 0
          ? `Costs up ${formatAED(costDelta)} (+${costPct.toFixed(1)}%)`
          : `Costs cut ${formatAED(Math.abs(costDelta))} (${costPct.toFixed(1)}%)`;
      }
    }

    // Main issue
    let mainIssue = "No critical issue detected";
    const issues: string[] = [];
    if (cur.netProfit < 0) issues.push("Operating at a net loss");
    if (cur.indirectExpenses > cur.grossProfit) issues.push("Overheads exceed gross profit");
    if (prev && cur.directIncome < prev.directIncome * 0.85) issues.push("Sharp revenue decline >15%");
    if (gpMargin < 30) issues.push(`Thin gross margin (${gpMargin.toFixed(0)}%)`);
    if (issues.length) mainIssue = issues[0];

    // Single recommendation
    let action = "Maintain current operations and monitor next month closely.";
    if (cur.netProfit < 0 && cur.indirectExpenses > cur.grossProfit)
      action = "URGENT: Cut overheads — they exceed gross profit.";
    else if (cur.netProfit < 0)
      action = "Cut indirect expenses immediately to restore profitability.";
    else if (revPct < -10)
      action = "Boost fleet utilization — re-activate idle vehicles now.";
    else if (costPct > 15)
      action = "Audit cost spike and freeze non-essential spending.";
    else if (verdict === "improving")
      action = "Reinvest surplus into highest-ROI vehicles to scale.";

    // Performance snapshot for chart (last 6 months)
    const trendData = monthlyPL.slice(Math.max(0, idx - 5), idx + 1).map((m) => ({
      month: m.month,
      Revenue: Math.round(m.directIncome),
      Costs: Math.round(m.costOfSales + m.indirectExpenses + m.otherExpense),
      "Net Profit": Math.round(m.netProfit),
    }));

    return {
      cur, prev, revPct, costPct, npPct, costCur, costPrev,
      gpMargin, npMargin, verdict, mainDriver, mainIssue, issues, action, trendData,
    };
  }, [selectedMonth, allMode]);

  const verdictStyle = exec?.verdict === "improving"
    ? { bg: "bg-success/10", border: "border-success/40", text: "text-success", label: "IMPROVING", Icon: TrendingUp }
    : exec?.verdict === "declining"
    ? { bg: "bg-loss/10", border: "border-loss/40", text: "text-loss", label: "DECLINING", Icon: TrendingDown }
    : { bg: "bg-muted/40", border: "border-border", text: "text-muted-foreground", label: "STABLE", Icon: Minus };

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
              <h1 className="text-xl font-serif font-bold text-foreground tracking-tight">MK Autos — Executive View</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Decision-Focused Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <MonthFilter months={months} value={selectedMonth} onChange={setSelectedMonth} />
            <Link to="/mk-autos">
              <Button variant="outline" size="sm" className="text-xs">← Cars Dashboard</Button>
            </Link>
            <Badge variant="secondary" className="text-xs">AED</Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-5">
        {exec && (
          <>
            {/* === 1. VERDICT BANNER === */}
            <Card className={`border-2 ${verdictStyle.border} ${verdictStyle.bg} backdrop-blur-sm`}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-full ${verdictStyle.bg} border-2 ${verdictStyle.border}`}>
                      <verdictStyle.Icon className={`h-7 w-7 ${verdictStyle.text}`} />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Performance Verdict — {exec.cur.month}</p>
                      <p className={`text-3xl font-serif font-bold ${verdictStyle.text} tracking-wide`}>{verdictStyle.label}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Net Profit MoM</p>
                    <p className={`text-2xl font-bold tabular-nums ${exec.npPct >= 0 ? "text-success" : "text-loss"}`}>
                      {exec.npPct >= 0 ? "▲" : "▼"} {Math.abs(exec.npPct).toFixed(1)}%
                    </p>
                    <p className="text-xs text-muted-foreground tabular-nums">{formatAED(exec.cur.netProfit)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* === 2. KEY MESSAGES (4 cards) === */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <Card className="border-border/50 bg-card/80">
                <CardContent className="p-4 space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Activity className="h-3.5 w-3.5" />
                    <p className="text-[10px] uppercase tracking-wider">Performance</p>
                  </div>
                  <p className={`text-lg font-bold ${verdictStyle.text}`}>{verdictStyle.label}</p>
                  <p className="text-xs text-muted-foreground">vs {exec.prev?.month ?? "—"}</p>
                </CardContent>
              </Card>
              <Card className="border-border/50 bg-card/80">
                <CardContent className="p-4 space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <p className="text-[10px] uppercase tracking-wider">Main Issue</p>
                  </div>
                  <p className={`text-sm font-semibold leading-snug ${exec.issues.length ? "text-loss" : "text-success"}`}>
                    {exec.mainIssue}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border/50 bg-card/80">
                <CardContent className="p-4 space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Zap className="h-3.5 w-3.5" />
                    <p className="text-[10px] uppercase tracking-wider">Main Driver</p>
                  </div>
                  <p className="text-sm font-semibold text-foreground leading-snug">{exec.mainDriver || "No prior month"}</p>
                </CardContent>
              </Card>
              <Card className="border-2 border-primary/40 bg-primary/5">
                <CardContent className="p-4 space-y-1">
                  <div className="flex items-center gap-2 text-primary">
                    <Target className="h-3.5 w-3.5" />
                    <p className="text-[10px] uppercase tracking-wider font-semibold">Action</p>
                  </div>
                  <p className="text-sm font-semibold text-foreground leading-snug">{exec.action}</p>
                </CardContent>
              </Card>
            </div>

            {/* === 3. CRITICAL ISSUES ALERT === */}
            {exec.issues.length > 0 && (
              <Alert className="border-loss/50 bg-loss/5">
                <AlertTriangle className="h-4 w-4 !text-loss" />
                <AlertTitle className="text-loss font-semibold">Critical Issues Detected ({exec.issues.length})</AlertTitle>
                <AlertDescription>
                  <ul className="mt-2 space-y-1 text-sm text-foreground">
                    {exec.issues.map((i) => (
                      <li key={i} className="flex items-start gap-2">
                        <ChevronRight className="h-3.5 w-3.5 mt-0.5 text-loss shrink-0" />
                        <span>{i}</span>
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* === 4. DECISION KPIs (only what matters) === */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Card className="border-border/50 bg-card/80">
                <CardContent className="p-4">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Revenue</p>
                  <p className="text-xl font-bold tabular-nums text-foreground mt-1">{formatAED(exec.cur.directIncome)}</p>
                  <p className={`text-xs font-medium mt-1 ${exec.revPct >= 0 ? "text-success" : "text-loss"}`}>
                    {exec.revPct >= 0 ? "▲" : "▼"} {Math.abs(exec.revPct).toFixed(1)}% MoM
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border/50 bg-card/80">
                <CardContent className="p-4">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total Costs</p>
                  <p className="text-xl font-bold tabular-nums text-foreground mt-1">{formatAED(exec.costCur)}</p>
                  <p className={`text-xs font-medium mt-1 ${exec.costPct <= 0 ? "text-success" : "text-loss"}`}>
                    {exec.costPct >= 0 ? "▲" : "▼"} {Math.abs(exec.costPct).toFixed(1)}% MoM
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border/50 bg-card/80">
                <CardContent className="p-4">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Net Profit</p>
                  <p className={`text-xl font-bold tabular-nums mt-1 ${exec.cur.netProfit >= 0 ? "text-success" : "text-loss"}`}>
                    {formatAED(exec.cur.netProfit)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Margin: {exec.npMargin.toFixed(1)}%</p>
                </CardContent>
              </Card>
              <Card className="border-border/50 bg-card/80">
                <CardContent className="p-4">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Gross Margin</p>
                  <p className="text-xl font-bold tabular-nums text-foreground mt-1">{exec.gpMargin.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground mt-1">{formatAED(exec.cur.grossProfit)} GP</p>
                </CardContent>
              </Card>
            </div>

            {/* === 5. TREND VISUALIZATION === */}
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-serif text-foreground">6-Month Trend — Revenue, Costs & Net Profit</CardTitle>
                <p className="text-[10px] text-muted-foreground tracking-wider uppercase">Visual decision context</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <ComposedChart data={exec.trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                    <YAxis
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                      tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                      formatter={(v: number) => formatAED(v)}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="Revenue" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="Costs" fill="hsl(var(--muted-foreground))" radius={[3, 3, 0, 0]} opacity={0.6} />
                    <Line type="monotone" dataKey="Net Profit" stroke="hsl(var(--success))" strokeWidth={2.5} dot={{ r: 4 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* === 6. MoM COMPARISON SUMMARY === */}
            {exec.prev && (
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-serif text-foreground">
                    Month-over-Month: {exec.cur.month} vs {exec.prev.month}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border/50 text-[10px] uppercase tracking-wider text-muted-foreground">
                          <th className="text-left py-2">Metric</th>
                          <th className="text-right py-2">{exec.prev.month}</th>
                          <th className="text-right py-2">{exec.cur.month}</th>
                          <th className="text-right py-2">Change</th>
                          <th className="text-left py-2 pl-4">Reason</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs">
                        {[
                          { label: "Revenue", prev: exec.prev.directIncome, cur: exec.cur.directIncome, pct: exec.revPct, inverse: false,
                            reason: exec.revPct >= 0 ? "Higher fleet utilization / more rentals" : "Lower bookings or idle vehicles" },
                          { label: "Cost of Sales", prev: exec.prev.costOfSales, cur: exec.cur.costOfSales,
                            pct: exec.prev.costOfSales ? ((exec.cur.costOfSales - exec.prev.costOfSales) / Math.abs(exec.prev.costOfSales)) * 100 : 0,
                            inverse: true, reason: "Direct rental & vehicle running costs" },
                          { label: "Indirect Expenses", prev: exec.prev.indirectExpenses, cur: exec.cur.indirectExpenses,
                            pct: exec.prev.indirectExpenses ? ((exec.cur.indirectExpenses - exec.prev.indirectExpenses) / Math.abs(exec.prev.indirectExpenses)) * 100 : 0,
                            inverse: true, reason: "Salaries, rent, admin overhead" },
                          { label: "Net Profit", prev: exec.prev.netProfit, cur: exec.cur.netProfit, pct: exec.npPct, inverse: false,
                            reason: exec.npPct >= 0 ? "Profit improved on revenue/cost mix" : "Profit eroded by costs or weaker sales" },
                        ].map((r) => {
                          const good = r.inverse ? r.pct < 0 : r.pct >= 0;
                          return (
                            <tr key={r.label} className="border-b border-border/20">
                              <td className="py-2.5 font-medium text-foreground">{r.label}</td>
                              <td className="py-2.5 text-right tabular-nums text-muted-foreground">{formatAED(r.prev)}</td>
                              <td className="py-2.5 text-right tabular-nums text-foreground">{formatAED(r.cur)}</td>
                              <td className={`py-2.5 text-right tabular-nums font-semibold ${good ? "text-success" : "text-loss"}`}>
                                {r.pct >= 0 ? "▲" : "▼"} {Math.abs(r.pct).toFixed(1)}%
                              </td>
                              <td className="py-2.5 pl-4 text-muted-foreground">{r.reason}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* === 7. STRONG ACTION CALLOUT === */}
            <Card className="border-2 border-primary bg-gradient-to-br from-primary/10 to-primary/5">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Target className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-primary font-semibold">Recommended Action</p>
                  <p className="text-base md:text-lg font-serif font-semibold text-foreground mt-1 leading-snug">
                    {exec.action}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Light context footer — balance sheet snapshot at-a-glance */}
            <Card className="border-border/40 bg-card/40">
              <CardContent className="p-4">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                  Balance Sheet Context — As at {snapshot.asOf}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <p className="text-muted-foreground">Capital</p>
                    <p className="font-semibold tabular-nums text-foreground">{formatAED(snapshot.capitalAccount)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Loans</p>
                    <p className="font-semibold tabular-nums text-foreground">{formatAED(snapshot.loansTotal)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Current Ratio</p>
                    <p className="font-semibold tabular-nums text-foreground">
                      {(snapshot.currentAssetsTotal / snapshot.currentLiabilitiesTotal).toFixed(2)}x
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Debt / Equity</p>
                    <p className="font-semibold tabular-nums text-foreground">
                      {(snapshot.loansTotal / snapshot.capitalAccount).toFixed(2)}x
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
};

export default MkAutosCompanyDashboard;
