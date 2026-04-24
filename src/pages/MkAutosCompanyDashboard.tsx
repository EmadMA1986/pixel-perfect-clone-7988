import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp, TrendingDown, Building2, ArrowLeft,
  AlertTriangle, Target, Zap, Activity, Minus, ChevronRight, Banknote, Users,
} from "lucide-react";
import MonthFilter from "@/components/MonthFilter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine, Cell, LabelList,
} from "recharts";
import MonthlyExecutiveSummary, { type ExecMetricRow } from "@/components/MonthlyExecutiveSummary";
import {
  formatAED, balanceSheetSnapshots, monthlyPL,
  marchBalanceSheet, investorBalances, bankLoans,
  totalBankDebt, totalInvestorBalances, grandTotalLoans, marchCash,
} from "@/data/mkAutosData";

const fmtCompact = (v: number) => `AED ${(v / 1000).toFixed(0)}K`;

const MkAutosCompanyDashboard = () => {
  const months = useMemo(() => monthlyPL.map((m) => m.month), []);
  const [selectedMonth, setSelectedMonth] = useState<string>(monthlyPL[monthlyPL.length - 1].month);
  const [showFullHistory, setShowFullHistory] = useState(false);

  const idx = monthlyPL.findIndex((m) => m.month === selectedMonth);
  const cur = monthlyPL[idx] ?? monthlyPL[monthlyPL.length - 1];
  const prev = idx > 0 ? monthlyPL[idx - 1] : null;

  // Snapshot — use March data for selected if available, else fall back
  const snapshot = useMemo(
    () => balanceSheetSnapshots.find((s) => s.monthKey === selectedMonth)
      ?? balanceSheetSnapshots[balanceSheetSnapshots.length - 1],
    [selectedMonth]
  );
  const isMarch = selectedMonth === "Mar-26";

  const exec = useMemo(() => {
    const pct = (a: number, b: number) => (b === 0 ? 0 : ((a - b) / Math.abs(b)) * 100);
    const costCur = cur.costOfSales + cur.indirectExpenses + cur.otherExpense;
    const costPrev = prev ? prev.costOfSales + prev.indirectExpenses + prev.otherExpense : 0;
    const revPct = prev ? pct(cur.directIncome, prev.directIncome) : 0;
    const costPct = prev ? pct(costCur, costPrev) : 0;
    const npPct = prev ? pct(cur.netProfit, prev.netProfit) : 0;
    const gpMargin = cur.directIncome ? (cur.grossProfit / cur.directIncome) * 100 : 0;
    const npMargin = cur.directIncome ? (cur.netProfit / cur.directIncome) * 100 : 0;

    let verdict: "improving" | "stable" | "declining";
    if (prev && cur.netProfit > prev.netProfit && cur.netProfit >= 0) verdict = "improving";
    else if (prev && cur.netProfit < prev.netProfit) verdict = "declining";
    else if (Math.abs(npPct) < 10) verdict = "stable";
    else verdict = cur.netProfit < 0 ? "declining" : "improving";

    let mainIssue = "Operations within expected range";
    if (cur.netProfit < 0) mainIssue = "Operating at net loss — revenue insufficient to cover costs";
    else if (cur.indirectExpenses > cur.grossProfit) mainIssue = "Overheads exceed gross profit";

    let mainDriver = "—";
    if (prev) {
      const revDelta = cur.directIncome - prev.directIncome;
      if (revPct < -10) mainDriver = `Revenue down ${Math.abs(revPct).toFixed(1)}% MoM — idle vehicles or shorter rental periods`;
      else if (revPct > 10) mainDriver = `Revenue up ${revPct.toFixed(1)}% MoM — better fleet utilization`;
      else if (Math.abs(revDelta) < Math.abs(costCur - costPrev)) mainDriver = costPct >= 0 ? `Costs up ${costPct.toFixed(1)}% MoM` : `Costs cut ${Math.abs(costPct).toFixed(1)}% MoM`;
      else mainDriver = "Stable revenue and cost mix";
    }

    let action = "Maintain operations and monitor next month closely.";
    if (cur.netProfit < 0) action = "Activate idle vehicles immediately. Chase AR AED 436K urgently.";
    else if (revPct < -10) action = "Boost fleet utilization — re-activate idle vehicles now.";

    return { revPct, costPct, npPct, costCur, costPrev, gpMargin, npMargin, verdict, mainIssue, mainDriver, action };
  }, [cur, prev]);

  const verdictStyle = exec.verdict === "improving"
    ? { bg: "bg-success/10", border: "border-success/40", text: "text-success", label: "IMPROVING", Icon: TrendingUp }
    : exec.verdict === "declining"
    ? { bg: "bg-loss/10", border: "border-loss/40", text: "text-loss", label: "DECLINING", Icon: TrendingDown }
    : { bg: "bg-muted/40", border: "border-border", text: "text-muted-foreground", label: "STABLE", Icon: Minus };

  // Trend chart — last 6 months ending on selected
  const trendData = useMemo(() => {
    const start = Math.max(0, idx - 5);
    return monthlyPL.slice(start, idx + 1).map((m) => ({
      month: m.month,
      revenue: Math.round(m.directIncome),
      isSelected: m.month === selectedMonth,
    }));
  }, [idx, selectedMonth]);

  const breakEven = useMemo(() => {
    // Approx: indirect + other expense / gross margin
    const fixed = cur.indirectExpenses + cur.otherExpense;
    const gm = exec.gpMargin / 100;
    return gm > 0 ? fixed / gm : 0;
  }, [cur, exec.gpMargin]);

  // Exec summary rows
  const totalLoansPrev = 3696676;
  const cashPrev = isMarch ? 162752 : marchCash.total; // Feb-26 cash
  const summaryRows: ExecMetricRow[] = isMarch && prev ? [
    { label: "Real Revenue", current: cur.directIncome, previous: prev.directIncome, kind: "currency", goodDirection: "up" },
    { label: "Cost of Sales", current: cur.costOfSales, previous: prev.costOfSales, kind: "currency", goodDirection: "down" },
    { label: "Gross Profit", current: cur.grossProfit, previous: prev.grossProfit, kind: "currency", goodDirection: "up" },
    { label: "Gross Margin %", current: exec.gpMargin, previous: prev.directIncome ? (prev.grossProfit / prev.directIncome) * 100 : 0, kind: "percent", goodDirection: "up", deltaMode: "absolute" },
    { label: "Indirect Expenses", current: cur.indirectExpenses, previous: prev.indirectExpenses, kind: "currency", goodDirection: "down" },
    { label: "Net Profit/Loss", current: cur.netProfit, previous: prev.netProfit, kind: "currency", goodDirection: "up" },
    { label: "Cash Position", current: marchCash.total, previous: cashPrev, kind: "currency", goodDirection: "up" },
    { label: "Total Loans", current: grandTotalLoans, previous: totalLoansPrev, kind: "currency", goodDirection: "down" },
  ] : prev ? [
    { label: "Real Revenue", current: cur.directIncome, previous: prev.directIncome, kind: "currency", goodDirection: "up" },
    { label: "Cost of Sales", current: cur.costOfSales, previous: prev.costOfSales, kind: "currency", goodDirection: "down" },
    { label: "Gross Profit", current: cur.grossProfit, previous: prev.grossProfit, kind: "currency", goodDirection: "up" },
    { label: "Indirect Expenses", current: cur.indirectExpenses, previous: prev.indirectExpenses, kind: "currency", goodDirection: "down" },
    { label: "Net Profit/Loss", current: cur.netProfit, previous: prev.netProfit, kind: "currency", goodDirection: "up" },
  ] : [];

  // Critical alerts
  const totalAR = 275368 + 160955;
  const alerts = isMarch ? [
    { sev: "high" as const, text: `Cash critically low: AED ${marchCash.hand.toLocaleString()} cash + AED ${marchCash.bank.toLocaleString()} bank = AED ${marchCash.total.toLocaleString()} total — urgent` },
    { sev: "high" as const, text: "Revenue declining 6 consecutive months: Oct AED 404K → Mar AED 246K (-39.2%)" },
    { sev: "high" as const, text: `Net loss resumed: ${formatAED(cur.netProfit)} after two profitable months` },
    { sev: "high" as const, text: "Debt-to-Equity 28.1x: AED 3.66M loans vs AED 130K equity — highly leveraged" },
    { sev: "high" as const, text: "Traffic fines AED 156,743 unpaid and growing" },
    { sev: "warn" as const, text: `Total uncollected AR: AED ${totalAR.toLocaleString()} (trade AED 275K + legal cases AED 161K)` },
    { sev: "warn" as const, text: "Employee salary payable: AED 24,159 — staff partially unpaid" },
    { sev: "warn" as const, text: "Ahmad investor balance owed: AED 445,160 — largest outstanding obligation" },
  ] : [];

  const investorTotal = totalInvestorBalances;
  const totalEquity = 300000 + (-169645);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/"><Button variant="ghost" size="icon" className="h-9 w-9"><ArrowLeft className="h-4 w-4" /></Button></Link>
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-serif font-bold text-foreground tracking-tight">MK Autos — Executive View</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Decision-Focused Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <MonthFilter months={months} value={selectedMonth} onChange={setSelectedMonth} />
            <Link to="/mk-autos"><Button variant="outline" size="sm" className="text-xs">← Cars Dashboard</Button></Link>
            <Badge variant="secondary" className="text-xs">AED</Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-5">
        {/* Permanent disclosure */}
        <div className="rounded-md border border-border/40 bg-muted/20 px-3 py-2 text-[11px] text-muted-foreground">
          <span className="font-semibold text-foreground">Note:</span> Revenue and indirect expenses exclude visa sponsorship pass-through (Dummy Investor / Dummy Payroll): Oct-25 AED 83K | Nov-25 AED 8K | Dec-25 to Feb-26 AED 78K/month. Net profit unaffected. Mar-26 already clean.
        </div>

        {/* === SECTION 1 — VERDICT BANNER === */}
        <Card className={`border-2 ${verdictStyle.border} ${verdictStyle.bg} backdrop-blur-sm`}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className={`flex h-14 w-14 items-center justify-center rounded-full ${verdictStyle.bg} border-2 ${verdictStyle.border}`}>
                  <verdictStyle.Icon className={`h-7 w-7 ${verdictStyle.text}`} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Performance Verdict — {cur.month}</p>
                  <p className={`text-3xl font-serif font-bold ${verdictStyle.text} tracking-wide`}>{verdictStyle.label}</p>
                  {prev && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Revenue down {formatAED(Math.abs(cur.directIncome - prev.directIncome))} ({exec.revPct.toFixed(1)}%) vs {prev.month}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Net Profit MoM</p>
                <p className={`text-2xl font-bold tabular-nums ${exec.npPct >= 0 ? "text-success" : "text-loss"}`}>
                  {exec.npPct >= 0 ? "▲" : "▼"} {Math.abs(exec.npPct).toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground tabular-nums">{formatAED(cur.netProfit)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* === SECTION 2 — 4 INTELLIGENCE CARDS === */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="border-border/50 bg-card/80">
            <CardContent className="p-4 space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground"><Activity className="h-3.5 w-3.5" /><p className="text-[10px] uppercase tracking-wider">Performance</p></div>
              <p className={`text-lg font-bold ${verdictStyle.text}`}>{verdictStyle.label}</p>
              <p className="text-xs text-muted-foreground">vs {prev?.month ?? "—"}</p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/80">
            <CardContent className="p-4 space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground"><AlertTriangle className="h-3.5 w-3.5" /><p className="text-[10px] uppercase tracking-wider">Main Issue</p></div>
              <p className={`text-sm font-semibold leading-snug ${cur.netProfit < 0 ? "text-loss" : "text-success"}`}>{exec.mainIssue}</p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/80">
            <CardContent className="p-4 space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground"><Zap className="h-3.5 w-3.5" /><p className="text-[10px] uppercase tracking-wider">Main Driver</p></div>
              <p className="text-sm font-semibold text-foreground leading-snug">{exec.mainDriver}</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-primary/40 bg-primary/5">
            <CardContent className="p-4 space-y-1">
              <div className="flex items-center gap-2 text-primary"><Target className="h-3.5 w-3.5" /><p className="text-[10px] uppercase tracking-wider font-semibold">Action</p></div>
              <p className="text-sm font-semibold text-foreground leading-snug">{exec.action}</p>
            </CardContent>
          </Card>
        </div>

        {/* === SECTION 3 — CRITICAL ALERTS === */}
        {alerts.length > 0 && (
          <Alert className="border-loss/50 bg-loss/5">
            <AlertTriangle className="h-4 w-4 !text-loss" />
            <AlertTitle className="text-loss font-semibold">Critical Alerts ({alerts.length})</AlertTitle>
            <AlertDescription>
              <ul className="mt-2 space-y-1.5 text-sm text-foreground">
                {alerts.map((a, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-0.5 shrink-0">{a.sev === "high" ? "🔴" : "⚠️"}</span>
                    <span className={a.sev === "high" ? "text-foreground" : "text-muted-foreground"}>{a.text}</span>
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* === SECTION 4 — MONTHLY EXECUTIVE SUMMARY === */}
        {prev && (
          <MonthlyExecutiveSummary
            currentLabel={cur.month}
            previousLabel={prev.month}
            rows={summaryRows}
            narrative={isMarch
              ? "March 2026 recorded a net loss of AED 13,677 on real revenue of AED 246,433 — a 32.3% decline vs February. Despite gross margin holding at 82.8%, revenue has now fallen 39.2% from October peak. Cash position is critically low at AED 50,989. The business carries AED 3.66M in bank and investor loans creating fixed monthly obligations. Immediate action required on revenue recovery and AR collection."
              : `${cur.month} closed with ${cur.netProfit >= 0 ? "a net profit" : "a net loss"} of ${formatAED(cur.netProfit)} on revenue of ${formatAED(cur.directIncome)}.`}
            improved={isMarch
              ? ["Gross margin stable 82.8%", "Costs reduced", "Bank loans being repaid (ADIB down AED 69K since Dec)"]
              : []}
            deteriorated={isMarch
              ? ["Revenue -32.3%", "Net loss resumed", "Cash critically low", "6-month revenue decline"]
              : []}
            watch={isMarch
              ? ["Traffic fines growing", "Interest expense rising", "Idle vehicles reducing revenue"]
              : []}
          />
        )}

        {/* === SECTION 5 — KPI CARDS (2 ROWS) === */}
        <div className="space-y-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">Trading Performance</p>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <KpiCard label="Real Revenue" value={formatAED(cur.directIncome)} sub={prev ? `${exec.revPct >= 0 ? "▲" : "▼"} ${Math.abs(exec.revPct).toFixed(1)}% MoM` : "—"} subTone={exec.revPct >= 0 ? "good" : "bad"} />
            <KpiCard label="Gross Profit" value={formatAED(cur.grossProfit)} sub={`${exec.gpMargin.toFixed(1)}%`} />
            <KpiCard label="Net Profit/Loss" value={formatAED(cur.netProfit)} valueTone={cur.netProfit >= 0 ? "good" : "bad"} sub={cur.netProfit < 0 ? "🔴" : "🟢"} />
            <KpiCard label="Total Costs" value={formatAED(exec.costCur)} />
            <KpiCard label="Gross Margin" value={`${exec.gpMargin.toFixed(1)}%`} sub="🟢" />
          </div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold pt-2">Financial Health</p>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <KpiCard label="Cash Total" value={formatAED(marchCash.total)} sub={`hand ${formatAED(marchCash.hand)} + bank ${formatAED(marchCash.bank)}`} valueTone="bad" />
            <KpiCard label="Total Loans" value={formatAED(grandTotalLoans)} sub="🔴" valueTone="bad" />
            <KpiCard label="Debt-to-Equity" value={`${(grandTotalLoans / Math.max(totalEquity, 1)).toFixed(1)}x`} sub="🔴" valueTone="bad" />
            <KpiCard label="Traffic Fines" value={formatAED(156743)} sub="🔴" valueTone="bad" />
            <KpiCard label="Total AR" value={formatAED(totalAR)} sub="⚠️" />
          </div>
        </div>

        {/* === SECTION 6 — REVENUE TREND CHART === */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-serif text-foreground">Real Revenue Trend — Dummy Income Excluded</CardTitle>
            <p className="text-[10px] text-muted-foreground tracking-wider uppercase">6-Month View — Selected Month in Gold</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={trendData} margin={{ top: 30, right: 80, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => formatAED(v)} />
                <ReferenceLine y={Math.round(breakEven)} stroke="hsl(var(--warning, 38 92% 50%))" strokeDasharray="4 4"
                  label={{ value: `Break-even ${fmtCompact(breakEven)}`, position: "right", fill: "hsl(38 92% 50%)", fontSize: 10 }} />
                <Bar dataKey="revenue" radius={[3, 3, 0, 0]}>
                  {trendData.map((d, i) => (
                    <Cell key={i} fill={d.isSelected ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"} opacity={d.isSelected ? 1 : 0.5} />
                  ))}
                  <LabelList
                    dataKey="revenue"
                    position="top"
                    content={(props: any) => {
                      const { x, y, width, value, index } = props;
                      const d = trendData[index];
                      const isSel = d?.isSelected;
                      return (
                        <text
                          x={Number(x) + Number(width) / 2}
                          y={Number(y) - 6}
                          textAnchor="middle"
                          fontSize={isSel ? 12 : 10}
                          fontWeight={isSel ? 700 : 400}
                          fill={isSel ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
                        >
                          {fmtCompact(Number(value))}
                        </text>
                      );
                    }}
                  />
                </Bar>
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--loss))" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* === SECTION 7 — MoM VARIANCE TABLE === */}
        {prev && (
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-serif text-foreground">Month-over-Month Variance — {cur.month} vs {prev.month}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50 text-[10px] uppercase tracking-wider text-muted-foreground">
                      <th className="text-left py-2">Metric</th>
                      <th className="text-right py-2">{prev.month}</th>
                      <th className="text-right py-2">{cur.month}</th>
                      <th className="text-right py-2">Change</th>
                      <th className="text-left py-2 pl-4">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs">
                    {[
                      { label: "Revenue", prev: prev.directIncome, cur: cur.directIncome, pct: exec.revPct, inverse: false, reason: exec.revPct >= 0 ? "Higher fleet utilization" : "Lower bookings or idle vehicles" },
                      { label: "Cost of Sales", prev: prev.costOfSales, cur: cur.costOfSales, pct: prev.costOfSales ? ((cur.costOfSales - prev.costOfSales) / Math.abs(prev.costOfSales)) * 100 : 0, inverse: true, reason: "Direct rental & vehicle running costs" },
                      { label: "Gross Profit", prev: prev.grossProfit, cur: cur.grossProfit, pct: prev.grossProfit ? ((cur.grossProfit - prev.grossProfit) / Math.abs(prev.grossProfit)) * 100 : 0, inverse: false, reason: "Result of revenue and direct costs" },
                      { label: "Indirect Expenses", prev: prev.indirectExpenses, cur: cur.indirectExpenses, pct: prev.indirectExpenses ? ((cur.indirectExpenses - prev.indirectExpenses) / Math.abs(prev.indirectExpenses)) * 100 : 0, inverse: true, reason: "Salaries, rent, admin overhead" },
                      { label: "Net Profit", prev: prev.netProfit, cur: cur.netProfit, pct: exec.npPct, inverse: false, reason: exec.npPct >= 0 ? "Profit improved" : "Profit eroded by costs or weaker sales" },
                    ].map((r) => {
                      const good = r.inverse ? r.pct < 0 : r.pct >= 0;
                      return (
                        <tr key={r.label} className="border-b border-border/20">
                          <td className="py-2.5 font-medium text-foreground">{r.label}</td>
                          <td className="py-2.5 text-right tabular-nums text-muted-foreground">{formatAED(r.prev)}</td>
                          <td className="py-2.5 text-right tabular-nums text-foreground">{formatAED(r.cur)}</td>
                          <td className={`py-2.5 text-right tabular-nums font-semibold ${good ? "text-success" : "text-loss"}`}>{r.pct >= 0 ? "▲" : "▼"} {Math.abs(r.pct).toFixed(1)}%</td>
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

        {/* === SECTION 8 — LOAN & DEBT SCHEDULE === */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-serif text-foreground flex items-center gap-2"><Banknote className="h-4 w-4" /> Bank Loans & Debt Position</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {bankLoans.map((l) => {
                const delta = l.current - l.prior;
                const isUp = l.trend === "up";
                return (
                  <div key={l.name} className={`rounded-lg border p-4 ${isUp ? "border-loss/40 bg-loss/5" : "border-success/30 bg-success/5"}`}>
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{l.name}</p>
                      <span className={`text-xs font-bold ${isUp ? "text-loss" : "text-success"}`}>{isUp ? "▲" : "▼"}</span>
                    </div>
                    <p className="text-lg font-bold tabular-nums text-foreground mt-1">{formatAED(l.current)}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {l.priorMonth}: {formatAED(l.prior)} →{" "}
                      {isUp
                        ? <span className="text-loss font-semibold">▲ increased {formatAED(Math.abs(delta))} 🔴</span>
                        : <span className="text-success font-semibold">▼ repaying {formatAED(Math.abs(delta))} ✅</span>}
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-border/30">
              <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total Bank Debt</p><p className="text-lg font-bold tabular-nums text-foreground">{formatAED(totalBankDebt)}</p></div>
              <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total Investor Balances Owed</p><p className="text-lg font-bold tabular-nums text-foreground">{formatAED(totalInvestorBalances)}</p></div>
              <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Grand Total Loans</p><p className="text-lg font-bold tabular-nums text-loss">{formatAED(grandTotalLoans)}</p></div>
            </div>
            <p className="text-[11px] text-muted-foreground italic">Monthly loan repayments create fixed cash obligations regardless of revenue.</p>
          </CardContent>
        </Card>

        {/* === SECTION 9 — INVESTOR BALANCES === */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-serif text-foreground flex items-center gap-2"><Users className="h-4 w-4" /> Investor Balances Owed — March 2026</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow><TableHead>Investor</TableHead><TableHead className="text-right">Balance Owed</TableHead><TableHead className="text-right">% of Total</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {investorBalances.map((i) => {
                  const isAhmad = i.name === "Ahmad";
                  return (
                    <TableRow key={i.name} className={isAhmad ? "bg-primary/10 hover:bg-primary/15 border-l-2 border-l-primary" : ""}>
                      <TableCell className={`text-xs ${isAhmad ? "font-bold text-primary" : "font-medium text-foreground"}`}>{i.name}{isAhmad && " ⭐ (largest)"}</TableCell>
                      <TableCell className={`text-xs text-right tabular-nums ${isAhmad ? "font-bold text-primary" : i.amount < 0 ? "text-loss" : "text-foreground"}`}>{formatAED(i.amount)}</TableCell>
                      <TableCell className={`text-xs text-right tabular-nums ${isAhmad ? "font-bold text-primary" : "text-muted-foreground"}`}>{((i.amount / investorTotal) * 100).toFixed(1)}%</TableCell>
                    </TableRow>
                  );
                })}
                <TableRow className="bg-muted/30 font-bold">
                  <TableCell className="text-xs">Total</TableCell>
                  <TableCell className="text-xs text-right tabular-nums">{formatAED(investorTotal)}</TableCell>
                  <TableCell className="text-xs text-right tabular-nums">100.0%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <p className="text-[11px] text-muted-foreground italic mt-3">These are accumulated investor profits not yet withdrawn. Ahmad is owed AED 445,160 — the largest single balance.</p>
          </CardContent>
        </Card>

        {/* === SECTION 10 — BALANCE SHEET SUMMARY === */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <Card className="border-border/50 bg-card/80">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-serif text-foreground">Assets — {marchBalanceSheet.asOf}</CardTitle></CardHeader>
            <CardContent>
              <ul className="text-xs space-y-1.5">
                {marchBalanceSheet.assets.map((a) => (
                  <li key={a.name} className="flex justify-between gap-2">
                    <span className="text-muted-foreground truncate">{a.name}</span>
                    <span className="tabular-nums text-foreground shrink-0">{formatAED(a.amount)}</span>
                  </li>
                ))}
                <li className="flex justify-between gap-2 pt-2 mt-2 border-t border-border/40 font-bold">
                  <span className="text-foreground">Total Assets</span>
                  <span className="tabular-nums text-primary">{formatAED(marchBalanceSheet.totals.assets)}</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/80">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-serif text-foreground">Liabilities — {marchBalanceSheet.asOf}</CardTitle></CardHeader>
            <CardContent>
              <ul className="text-xs space-y-1.5 h-[400px] overflow-y-auto pr-2">
                {marchBalanceSheet.liabilities.map((l) => (
                  <li key={l.name} className="flex justify-between gap-2">
                    <span className="text-muted-foreground truncate">{l.name}</span>
                    <span className={`tabular-nums shrink-0 ${l.amount < 0 ? "text-loss" : "text-foreground"}`}>{formatAED(l.amount)}</span>
                  </li>
                ))}
                <li className="flex justify-between gap-2 pt-2 mt-2 border-t border-border/40 font-bold">
                  <span className="text-foreground">Total Liabilities</span>
                  <span className="tabular-nums text-primary">{formatAED(marchBalanceSheet.totals.liabilities)}</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/80">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-serif text-foreground">Key Ratios</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Current Ratio</span><span className="tabular-nums font-semibold text-success">3.53x ✅</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Debt-to-Equity</span><span className="tabular-nums font-semibold text-loss">{(grandTotalLoans / Math.max(totalEquity, 1)).toFixed(1)}x 🔴</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Total Equity</span><span className="tabular-nums font-semibold text-foreground">{formatAED(totalEquity)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Accumulated Loss</span><span className="tabular-nums font-semibold text-loss">{formatAED(-169645)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Capital Account</span><span className="tabular-nums font-semibold text-foreground">{formatAED(300000)}</span></div>
              <div className="pt-2 mt-2 border-t border-border/40">
                <div className="flex justify-between items-start gap-2">
                  <span className="text-muted-foreground">Total AR to Revenue</span>
                  <span className="tabular-nums font-semibold text-amber-500">1.77x ⚠️</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1 leading-snug">AED 436K AR vs AED 246K monthly revenue — collecting takes nearly 2 months</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Intercompany note */}
        <div className="rounded-md border border-amber-500/40 bg-amber-500/5 p-3 text-xs text-foreground">
          <span className="font-semibold">Intercompany:</span> MK Autos is owed <span className="font-bold tabular-nums">AED 79,125</span> by Sister Company MK Garage. Reconcile with MK Garage payables in portfolio consolidation.
        </div>

        {/* === SECTION 11 — MONTHLY P&L TABLE === */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-2 flex-row items-center justify-between">
            <CardTitle className="text-base font-serif text-foreground">Monthly P&L — Real Revenue (Dummy Income Excluded)</CardTitle>
            <Button variant="outline" size="sm" className="text-xs" onClick={() => setShowFullHistory((v) => !v)}>
              {showFullHistory ? "Hide" : "Show"} Full History
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[10px] uppercase">Month</TableHead>
                    <TableHead className="text-[10px] uppercase text-right">Real Revenue</TableHead>
                    <TableHead className="text-[10px] uppercase text-right">CoS</TableHead>
                    <TableHead className="text-[10px] uppercase text-right">Gross Profit</TableHead>
                    <TableHead className="text-[10px] uppercase text-right">GP%</TableHead>
                    <TableHead className="text-[10px] uppercase text-right">Indirect Exp</TableHead>
                    <TableHead className="text-[10px] uppercase text-right">Net Profit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(showFullHistory ? monthlyPL : monthlyPL.slice(Math.max(0, idx - 5), idx + 1)).map((m) => {
                    const gp = m.directIncome ? (m.grossProfit / m.directIncome) * 100 : 0;
                    const isSel = m.month === selectedMonth;
                    return (
                      <TableRow key={m.month} className={isSel ? "bg-primary/10" : ""}>
                        <TableCell className={`text-xs font-medium ${isSel ? "text-primary" : "text-foreground"}`}>{m.month}{isSel && " ★"}</TableCell>
                        <TableCell className="text-xs text-right tabular-nums text-foreground">{formatAED(m.directIncome)}</TableCell>
                        <TableCell className="text-xs text-right tabular-nums text-muted-foreground">{formatAED(m.costOfSales)}</TableCell>
                        <TableCell className="text-xs text-right tabular-nums text-foreground">{formatAED(m.grossProfit)}</TableCell>
                        <TableCell className="text-xs text-right tabular-nums text-muted-foreground">{gp.toFixed(1)}%</TableCell>
                        <TableCell className="text-xs text-right tabular-nums text-muted-foreground">{formatAED(m.indirectExpenses)}</TableCell>
                        <TableCell className={`text-xs text-right tabular-nums font-semibold ${m.netProfit >= 0 ? "text-success" : "text-loss"}`}>{formatAED(m.netProfit)}</TableCell>
                      </TableRow>
                    );
                  })}
                  {showFullHistory && (() => {
                    const t = monthlyPL.reduce((a, m) => ({
                      r: a.r + m.directIncome, c: a.c + m.costOfSales, g: a.g + m.grossProfit, i: a.i + m.indirectExpenses, n: a.n + m.netProfit,
                    }), { r: 0, c: 0, g: 0, i: 0, n: 0 });
                    return (
                      <TableRow className="bg-muted/30 font-bold border-t-2 border-border">
                        <TableCell className="text-xs">Total</TableCell>
                        <TableCell className="text-xs text-right tabular-nums">{formatAED(t.r)}</TableCell>
                        <TableCell className="text-xs text-right tabular-nums">{formatAED(t.c)}</TableCell>
                        <TableCell className="text-xs text-right tabular-nums">{formatAED(t.g)}</TableCell>
                        <TableCell className="text-xs text-right tabular-nums">{t.r ? ((t.g / t.r) * 100).toFixed(1) : "0"}%</TableCell>
                        <TableCell className="text-xs text-right tabular-nums">{formatAED(t.i)}</TableCell>
                        <TableCell className={`text-xs text-right tabular-nums ${t.n >= 0 ? "text-success" : "text-loss"}`}>{formatAED(t.n)}</TableCell>
                      </TableRow>
                    );
                  })()}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

// === Helper: KPI card ===
const KpiCard = ({ label, value, sub, valueTone, subTone }: {
  label: string; value: string; sub?: string;
  valueTone?: "good" | "bad"; subTone?: "good" | "bad";
}) => {
  const vClass = valueTone === "good" ? "text-success" : valueTone === "bad" ? "text-loss" : "text-foreground";
  const sClass = subTone === "good" ? "text-success" : subTone === "bad" ? "text-loss" : "text-muted-foreground";
  return (
    <Card className="border-border/50 bg-card/80">
      <CardContent className="p-4">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className={`text-lg font-bold tabular-nums mt-1 ${vClass}`}>{value}</p>
        {sub && <p className={`text-[11px] mt-1 ${sClass}`}>{sub}</p>}
      </CardContent>
    </Card>
  );
};

export default MkAutosCompanyDashboard;
