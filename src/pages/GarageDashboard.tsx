import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  ArrowLeft,
  Wrench,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Activity,
  Target,
  Zap,
  Eye,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import MonthFilter from "@/components/MonthFilter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  ComposedChart,
  ReferenceLine,
  Cell as BarCell,
} from "recharts";
import {
  monthlyPL,
  balanceSheet,
  partners,
  formatAED,
  formatAEDFull,
} from "@/data/garageData";
import MonthlyExecutiveSummary, {
  ExecMetricRow,
} from "@/components/MonthlyExecutiveSummary";

// ---------- helpers ----------
const pct = (curr: number, prev: number) =>
  prev === 0 ? 0 : ((curr - prev) / Math.abs(prev)) * 100;

const fmtPctSigned = (v: number, digits = 1) =>
  `${v >= 0 ? "+" : ""}${v.toFixed(digits)}%`;

const COLORS = {
  primary: "hsl(var(--primary))",
  success: "hsl(142, 71%, 45%)",
  loss: "hsl(0, 84%, 60%)",
  warning: "hsl(38, 92%, 50%)",
  muted: "hsl(var(--muted-foreground))",
  border: "hsl(var(--border))",
  labour: "hsl(var(--primary))",
  parts: "hsl(200, 60%, 50%)",
  paint: "hsl(280, 60%, 55%)",
  other: "hsl(var(--muted-foreground))",
};

// ---------- component ----------
const GarageDashboard = () => {
  // Default to most recent closed month so dashboard tells a single coherent story
  const months = useMemo(() => monthlyPL.map((m) => m.month), []);
  const [selectedMonth, setSelectedMonth] = useState<string>(
    monthlyPL[monthlyPL.length - 1].month,
  );
  const [showMomTable, setShowMomTable] = useState(true);
  const [showFullPL, setShowFullPL] = useState(false);

  const isAll = selectedMonth === "all";
  const selectedIdx = isAll
    ? monthlyPL.length - 1
    : monthlyPL.findIndex((m) => m.month === selectedMonth);
  const current = monthlyPL[selectedIdx];
  const previous = selectedIdx > 0 ? monthlyPL[selectedIdx - 1] : null;

  // Trailing 6 months ending at selected (inclusive)
  const trailing6 = useMemo(() => {
    const start = Math.max(0, selectedIdx - 5);
    return monthlyPL.slice(start, selectedIdx + 1);
  }, [selectedIdx]);

  // ---- Section 1: Verdict ----
  const verdict = useMemo(() => {
    if (!previous)
      return { label: "BASELINE", tone: "neutral", deltaPct: 0, deltaAed: 0 };
    const deltaAed = current.netProfit - previous.netProfit;
    const deltaPct = pct(current.netProfit, previous.netProfit);
    // Net loss improved (less negative) = improving, worse = declining
    const improving = current.netProfit > previous.netProfit;
    return {
      label: improving ? "IMPROVING" : "DECLINING",
      tone: improving ? "good" : "bad",
      deltaPct,
      deltaAed,
    };
  }, [current, previous]);

  const grossMargin = (gp: number, rev: number) => (rev > 0 ? (gp / rev) * 100 : 0);
  const currMargin = grossMargin(current.grossProfit, current.totalRevenue);
  const prevMargin = previous
    ? grossMargin(previous.grossProfit, previous.totalRevenue)
    : 0;

  // ---- Intelligence cards content ----
  const revDelta = previous ? pct(current.totalRevenue, previous.totalRevenue) : 0;
  const isRevDrop = revDelta < -10;
  const isImprovingDespiteRevDrop = verdict.tone === "good" && isRevDrop;

  const mainIssue = isImprovingDespiteRevDrop
    ? `Net loss improved ${Math.abs(verdict.deltaPct).toFixed(1)}% vs ${previous!.month} despite revenue decline — cost reduction offset revenue drop`
    : isRevDrop
    ? `Revenue dropped ${Math.abs(revDelta).toFixed(1)}%`
    : current.netProfit < 0
    ? `Operating at a loss of ${formatAEDFull(current.netProfit)}`
    : `Margins remain tight at ${currMargin.toFixed(1)}%`;

  const mainDriver = (() => {
    if (!previous) return "First period — establishing baseline";
    if (isImprovingDespiteRevDrop)
      return `Indirect costs cut from ${formatAEDFull(previous.indirectExpenses)} to ${formatAEDFull(current.indirectExpenses)} — payroll dropped ${formatAEDFull(previous.payroll - current.payroll)}`;
    if (current.payroll / current.totalRevenue > 0.4)
      return `Payroll ${((current.payroll / current.totalRevenue) * 100).toFixed(0)}% of revenue — too high`;
    if (current.costOfSales / current.totalRevenue > 0.5)
      return "High cost of sales eroding gross profit";
    return "Indirect expenses outpacing gross profit";
  })();

  const action = isImprovingDespiteRevDrop
    ? "Rebuild revenue while keeping cost discipline"
    : current.totalRevenue < 100000
    ? "Drive revenue: chase AR, push labour jobs"
    : current.netProfit < 0
    ? "Cut indirect costs & collect AR"
    : "Sustain — monitor monthly burn";

  // ---- Section 4: Monthly Exec Summary rows ----
  const execRows: ExecMetricRow[] = previous
    ? [
        { label: "Real Revenue (ex-dummy)", current: current.totalRevenue, previous: previous.totalRevenue, kind: "currency", goodDirection: "up" },
        { label: "Cost of Sales", current: current.costOfSales, previous: previous.costOfSales, kind: "currency", goodDirection: "down" },
        { label: "Gross Profit", current: current.grossProfit, previous: previous.grossProfit, kind: "currency", goodDirection: "up" },
        { label: "Gross Margin %", current: currMargin, previous: prevMargin, kind: "percent", goodDirection: "up", deltaMode: "absolute" },
        { label: "Indirect Expenses", current: current.indirectExpenses, previous: previous.indirectExpenses, kind: "currency", goodDirection: "down" },
        { label: "Payroll (ex-dummy)", current: current.payroll, previous: previous.payroll, kind: "currency", goodDirection: "down" },
        { label: "Net Profit / Loss", current: current.netProfit, previous: previous.netProfit, kind: "currency", goodDirection: "up" },
        { label: "Labour Revenue", current: current.labourRevenue ?? 0, previous: previous.labourRevenue ?? 0, kind: "currency", goodDirection: "up" },
        { label: "Parts Revenue", current: current.partsRevenue ?? 0, previous: previous.partsRevenue ?? 0, kind: "currency", goodDirection: "up" },
        { label: "Paint Revenue", current: current.paintRevenue ?? 0, previous: previous.paintRevenue ?? 0, kind: "currency", goodDirection: "up" },
      ]
    : [];

  const execNarrative = previous ? (
    <>
      <strong>{current.month}</strong> revenue{" "}
      {revDelta >= 0 ? (
        <span className="text-success">grew {fmtPctSigned(revDelta)}</span>
      ) : (
        <span className="text-loss">fell {fmtPctSigned(revDelta)}</span>
      )}{" "}
      vs {previous.month} ({formatAEDFull(previous.totalRevenue)} →{" "}
      {formatAEDFull(current.totalRevenue)}). Gross margin moved from{" "}
      {prevMargin.toFixed(1)}% to {currMargin.toFixed(1)}%. Net{" "}
      {current.netProfit >= 0 ? "profit" : "loss"} of{" "}
      <span className={current.netProfit >= 0 ? "text-success" : "text-loss"}>
        {formatAEDFull(current.netProfit)}
      </span>
      , a {Math.abs(verdict.deltaPct).toFixed(1)}%{" "}
      {verdict.tone === "good" ? "improvement" : "deterioration"} MoM. Payroll at{" "}
      {((current.payroll / current.totalRevenue) * 100).toFixed(0)}% of revenue
      {current.payroll / current.totalRevenue > 0.4
        ? " remains the largest fixed cost burden."
        : " is within range."}
    </>
  ) : (
    <>Baseline period — no prior month to compare.</>
  );

  const improved: string[] = [];
  const deteriorated: string[] = [];
  const watch: string[] = [];
  if (previous) {
    if (current.totalRevenue > previous.totalRevenue) improved.push("Revenue grew MoM");
    else deteriorated.push(`Revenue fell ${Math.abs(revDelta).toFixed(1)}% MoM`);
    if (current.grossProfit > previous.grossProfit) improved.push("Gross profit improved");
    else deteriorated.push("Gross profit dropped");
    if (current.netProfit > previous.netProfit) improved.push("Net loss narrowed");
    else deteriorated.push("Net loss widened");
    if (current.payroll / current.totalRevenue > 0.4)
      watch.push("Payroll ratio above 40% of revenue");
    if (current.totalRevenue < 80000) watch.push("Revenue below break-even threshold");
    if (currMargin < 30) watch.push("Gross margin under 30%");
  }

  // ---- Section 6: 6-month trend chart data ----
  const trendData = useMemo(
    () =>
      trailing6.map((m) => ({
        name: m.month,
        revenue: Math.round(m.totalRevenue),
        grossProfit: Math.round(m.grossProfit),
        netProfit: Math.round(m.netProfit),
        isSelected: m.month === current.month,
      })),
    [trailing6, current.month],
  );

  // Break-even reference line value for trend chart
  const avgFixed = useMemo(() => {
    const last6 = trailing6;
    return last6.reduce((s, m) => s + m.payroll + m.rent, 0) / last6.length;
  }, [trailing6]);
  const avgGM = useMemo(() => {
    const last6 = trailing6;
    return (
      last6.reduce(
        (s, m) => s + (m.totalRevenue > 0 ? m.grossProfit / m.totalRevenue : 0),
        0,
      ) / last6.length
    );
  }, [trailing6]);
  const breakEvenRevenue = avgGM > 0 ? avgFixed / avgGM : 0;

  // ---- Section 7: Revenue mix ----
  const mixMonthly = useMemo(
    () =>
      monthlyPL
        .filter((m) => m.labourRevenue !== undefined)
        .map((m) => ({
          name: m.month,
          Labour: Math.round(m.labourRevenue ?? 0),
          Parts: Math.round(m.partsRevenue ?? 0),
          Paint: Math.round(m.paintRevenue ?? 0),
          Other: Math.round(m.otherRevenue ?? 0),
        })),
    [],
  );

  const mixCurrent = useMemo(() => {
    const c = current;
    const items = [
      { name: "Labour", value: Math.round(c.labourRevenue ?? 0), color: COLORS.labour },
      { name: "Parts", value: Math.round(c.partsRevenue ?? 0), color: COLORS.parts },
      { name: "Paint", value: Math.round(c.paintRevenue ?? 0), color: COLORS.paint },
      { name: "Other", value: Math.round(c.otherRevenue ?? 0), color: COLORS.other },
    ];
    return items.filter((i) => i.value > 0);
  }, [current]);

  const partsInsight = useMemo(() => {
    const recent = monthlyPL.filter((m) => m.partsRevenue !== undefined).slice(-2);
    if (recent.length < 2) return null;
    const [prev, curr] = recent;
    const change = pct(curr.partsRevenue ?? 0, prev.partsRevenue ?? 0);
    if (change < -30)
      return `Parts revenue declining sharply — ${curr.month} parts ${formatAEDFull(curr.partsRevenue ?? 0)} vs ${prev.month} ${formatAEDFull(prev.partsRevenue ?? 0)} (${change.toFixed(1)}%). Labour becoming dominant revenue source.`;
    return null;
  }, []);

  // ---- Section 9: Expense breakdown for selected month (granular line items) ----
  const expenseItems = useMemo(() => {
    const detail = indirectExpenseDetail[current.month] ?? {};
    const totalDetail = Object.values(detail).reduce((s, v) => s + (v || 0), 0) || current.indirectExpenses;
    const items = Object.entries(detail)
      .filter(([, v]) => v && v > 0)
      .map(([name, value]) => ({
        name,
        value,
        pct: (value / totalDetail) * 100,
        fixed: name === "Payroll" || name === "Rent",
        flag: name === "Payroll" && value / current.totalRevenue > 0.4,
        oneOff: name === "Trade License" || name === "Visa Fine",
      }))
      .sort((a, b) => b.value - a.value);
    return items;
  }, [current]);

  const fixedCostMonthly = current.payroll + current.rent;

  // ---- Section 10: Partner table ----
  const totalLoss = balanceSheet.profitAndLoss;
  const partnerRows = partners.map((p) => ({
    ...p,
    totalExposure: p.shareCapital + p.loanToCompany,
    shareOfLoss: totalLoss * (p.ownershipPct / 100),
  }));
  const partnerTotal = {
    shareCapital: partners.reduce((s, p) => s + p.shareCapital, 0),
    loanToCompany: partners.reduce((s, p) => s + p.loanToCompany, 0),
    totalExposure: partners.reduce((s, p) => s + p.shareCapital + p.loanToCompany, 0),
    shareOfLoss: totalLoss,
  };

  // ---- Critical alerts ----
  const alerts = [
    { sev: "critical", text: `Cash overdraft ${formatAEDFull(balanceSheet.currentAssets.cashInHand)} — urgent cash injection or AR collection required` },
    { sev: "critical", text: `${current.month} revenue ${formatAEDFull(current.totalRevenue)}${previous && revDelta < -20 ? ` — dropped ${Math.abs(revDelta).toFixed(1)}% from ${previous.month} ${formatAEDFull(previous.totalRevenue)} — investigate cause` : ""}` },
    { sev: "critical", text: `Accumulated losses ${formatAEDFull(balanceSheet.profitAndLoss)} exceed share capital ${formatAEDFull(balanceSheet.capital.total)} — technically insolvent on equity` },
    { sev: "warning", text: `AR ${formatAEDFull(balanceSheet.currentAssets.accountsReceivable)} uncollected — ${(balanceSheet.currentAssets.accountsReceivable / current.totalRevenue).toFixed(1)} months of ${current.month} revenue sitting uncollected` },
    { sev: "warning", text: `Rent liability ${formatAEDFull(balanceSheet.currentLiabilities.rentLiability)} outstanding — landlord payment overdue` },
    { sev: "warning", text: `Goodwill ${formatAEDFull(balanceSheet.fixedAssets.goodwill)} = ${((balanceSheet.fixedAssets.goodwill / balanceSheet.totalAssets) * 100).toFixed(0)}% of total assets — Ignite Garage acquisition — assess for impairment` },
    ...(previous && current.payroll < previous.payroll * 0.7
      ? [{ sev: "warning" as const, text: `${current.month} payroll ${formatAEDFull(current.payroll)} vs ${previous.month} ${formatAEDFull(previous.payroll)} — ${(((previous.payroll - current.payroll) / previous.payroll) * 100).toFixed(0)}% drop — confirm all staff fully paid` }]
      : []),
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center">
              <Wrench className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-serif font-bold text-foreground tracking-tight">
                MK Auto Garage
              </h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Al Quoz Ind Area 3, Dubai
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MonthFilter months={months} value={selectedMonth} onChange={setSelectedMonth} />
            <Badge variant="secondary" className="text-xs">Currency: AED</Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">

        {/* Permanent dummy income note */}
        <div className="rounded-md border border-border/50 bg-muted/20 px-4 py-2 text-xs text-muted-foreground">
          ℹ️ Revenue and payroll exclude visa sponsorship pass-through of AED 26,500 (Oct-25)
          and AED 30,000/month (Nov-25 to Mar-26). Net profit unaffected — both sides reduced equally.
        </div>

        {/* === SECTION 1 — Verdict Banner === */}
        <Card
          className={`border ${
            verdict.tone === "good"
              ? "border-success/40 bg-success/10"
              : verdict.tone === "bad"
              ? "border-loss/40 bg-loss/10"
              : "border-border/50 bg-card/50"
          }`}
        >
          <CardContent className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div
                  className={`h-12 w-12 rounded-full flex items-center justify-center ${
                    verdict.tone === "good" ? "bg-success/20" : "bg-loss/20"
                  }`}
                >
                  {verdict.tone === "good" ? (
                    <TrendingUp className="h-6 w-6 text-success" />
                  ) : (
                    <TrendingDown className="h-6 w-6 text-loss" />
                  )}
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                    Performance Verdict — {current.month}
                  </p>
                  <p
                    className={`text-3xl font-bold font-serif ${
                      verdict.tone === "good" ? "text-success" : "text-loss"
                    }`}
                  >
                    {verdict.label}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-6 text-sm">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Net Profit MoM</p>
                  <p className={`text-lg font-bold font-serif ${verdict.tone === "good" ? "text-success" : "text-loss"}`}>
                    {fmtPctSigned(verdict.deltaPct)} | {formatAEDFull(verdict.deltaAed)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Main Issue</p>
                  <p className="text-sm font-medium text-foreground">{mainIssue}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Action</p>
                  <p className="text-sm font-medium text-foreground">{action}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* === SECTION 2 — 4 Intelligence Cards === */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { icon: Activity, label: "Performance", value: verdict.label, tone: verdict.tone },
            { icon: AlertCircle, label: "Main Issue", value: mainIssue, tone: "bad" },
            { icon: Target, label: "Main Driver", value: mainDriver, tone: "neutral" },
            { icon: Zap, label: "Recommended Action", value: action, tone: "neutral" },
          ].map((c) => {
            const Icon = c.icon;
            const tone = c.tone === "good" ? "text-success" : c.tone === "bad" ? "text-loss" : "text-foreground";
            return (
              <Card key={c.label} className="border-border/50 bg-card/80 backdrop-blur-sm">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${tone}`} />
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{c.label}</p>
                  </div>
                  <p className={`text-sm font-semibold leading-snug ${tone}`}>{c.value}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* === SECTION 3 — Critical Alerts === */}
        <Card className="border-loss/30 bg-loss/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-loss">
              <AlertTriangle className="h-4 w-4" />
              Critical Issues & Watch List
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {alerts.map((a, i) => (
              <div
                key={i}
                className={`flex items-start gap-2 text-xs rounded p-2 ${
                  a.sev === "critical" ? "bg-loss/10 text-loss" : "bg-warning/10 text-warning"
                }`}
              >
                <span className="font-bold">{a.sev === "critical" ? "🔴" : "⚠️"}</span>
                <span className="leading-relaxed">{a.text}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* === SECTION 4 — Monthly Executive Summary === */}
        {previous && (
          <MonthlyExecutiveSummary
            currentLabel={current.month}
            previousLabel={previous.month}
            rows={execRows}
            narrative={execNarrative}
            improved={improved}
            deteriorated={deteriorated}
            watch={watch}
          />
        )}

        {/* === SECTION 5 — KPI Cards (2 rows) === */}
        <div className="space-y-3">
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-medium">
            Trading Performance — {current.month}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { label: "Real Revenue", value: formatAED(current.totalRevenue), sub: previous ? `${fmtPctSigned(revDelta)} MoM` : "—", tone: revDelta >= 0 ? "good" : "bad" },
              { label: "Gross Profit", value: formatAED(current.grossProfit), sub: `Margin ${currMargin.toFixed(1)}%`, tone: "good" },
              { label: "Net Profit / Loss", value: formatAED(current.netProfit), sub: previous ? `${fmtPctSigned(verdict.deltaPct)} MoM` : "—", tone: current.netProfit >= 0 ? "good" : "bad" },
              { label: "Gross Margin %", value: `${currMargin.toFixed(1)}%`, sub: previous ? `${(currMargin - prevMargin).toFixed(1)} pts` : "—", tone: currMargin >= prevMargin ? "good" : "bad" },
              { label: "Indirect Expenses", value: formatAED(current.indirectExpenses), sub: previous ? `${fmtPctSigned(pct(current.indirectExpenses, previous.indirectExpenses))} MoM` : "—", tone: previous && current.indirectExpenses < previous.indirectExpenses ? "good" : "bad" },
            ].map((k) => (
              <Card key={k.label} className="border-border/50 bg-card/80 backdrop-blur-sm">
                <CardContent className="p-3 space-y-1">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{k.label}</p>
                  <p className={`text-lg font-bold font-serif ${k.tone === "bad" ? "text-loss" : k.tone === "good" ? "text-foreground" : ""}`}>{k.value}</p>
                  <p className={`text-[10px] ${k.tone === "good" ? "text-success" : "text-loss"}`}>{k.sub}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-medium pt-2">
            Financial Health — Balance Sheet Snapshot (As at 31-Mar-26)
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { label: "Payroll (ex-dummy)", value: formatAED(current.payroll), sub: `${((current.payroll / current.totalRevenue) * 100).toFixed(0)}% of revenue`, tone: current.payroll / current.totalRevenue > 0.4 ? "bad" : "good" },
              { label: "Accounts Receivable", value: formatAED(balanceSheet.currentAssets.accountsReceivable), sub: "⚠️ uncollected", tone: "warn" },
              { label: "Cash Position", value: formatAED(balanceSheet.currentAssets.cashInHand), sub: "🔴 overdraft", tone: "bad" },
              { label: "Accumulated Loss", value: formatAED(balanceSheet.profitAndLoss), sub: "🔴 exceeds capital", tone: "bad" },
              { label: "Rent Liability", value: formatAED(balanceSheet.currentLiabilities.rentLiability), sub: "🔴 overdue", tone: "bad" },
            ].map((k) => (
              <Card key={k.label} className="border-border/50 bg-card/80 backdrop-blur-sm">
                <CardContent className="p-3 space-y-1">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{k.label}</p>
                  <p className={`text-lg font-bold font-serif ${k.tone === "bad" ? "text-loss" : k.tone === "warn" ? "text-warning" : "text-foreground"}`}>{k.value}</p>
                  <p className="text-[10px] text-muted-foreground">{k.sub}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* === SECTION 6 — 6-Month Revenue Trend === */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Real Revenue Trend — last 6 months ending {current.month} (visa pass-through excluded)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <ComposedChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: COLORS.muted }} />
                <YAxis tick={{ fontSize: 10, fill: COLORS.muted }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(v: number) => formatAEDFull(v)} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <ReferenceLine y={Math.round(breakEvenRevenue)} stroke={COLORS.warning} strokeDasharray="4 4" label={{ value: `Break-even ${formatAED(breakEvenRevenue)}`, fill: COLORS.warning, fontSize: 10, position: "insideTopRight" }} />
                <Bar dataKey="revenue" name="Real Revenue" radius={[4, 4, 0, 0]}>
                  {trendData.map((d, i) => (
                    <BarCell key={i} fill={d.isSelected ? COLORS.primary : "hsl(var(--primary) / 0.35)"} />
                  ))}
                </Bar>
                <Line type="monotone" dataKey="grossProfit" name="Gross Profit" stroke={COLORS.success} strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="netProfit" name="Net Profit/Loss" stroke={COLORS.loss} strokeWidth={2} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* === SECTION 7 — Revenue Breakdown by Type === */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Revenue Mix by Month — Labour | Parts | Paint | Other</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={mixMonthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: COLORS.muted }} />
                  <YAxis tick={{ fontSize: 10, fill: COLORS.muted }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(v: number) => formatAEDFull(v)} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="Labour" stackId="a" fill={COLORS.labour} />
                  <Bar dataKey="Parts" stackId="a" fill={COLORS.parts} />
                  <Bar dataKey="Paint" stackId="a" fill={COLORS.paint} />
                  <Bar dataKey="Other" stackId="a" fill={COLORS.other} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{current.month} Revenue Mix</CardTitle>
            </CardHeader>
            <CardContent>
              {mixCurrent.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={mixCurrent} dataKey="value" innerRadius={50} outerRadius={90} paddingAngle={2}>
                      {mixCurrent.map((e, i) => (<Cell key={i} fill={e.color} />))}
                    </Pie>
                    <Tooltip formatter={(v: number, n) => [formatAEDFull(v), n as string]} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-xs text-muted-foreground py-12 text-center">No revenue mix breakdown for this period</p>
              )}
              <div className="space-y-1 mt-2">
                {mixCurrent.map((m) => {
                  const total = mixCurrent.reduce((s, x) => s + x.value, 0);
                  const p = total > 0 ? (m.value / total) * 100 : 0;
                  return (
                    <div key={m.name} className="flex items-center gap-2 text-xs">
                      <span className="h-2 w-2 rounded-full" style={{ background: m.color }} />
                      <span className="text-muted-foreground">{m.name}</span>
                      <span className="ml-auto tabular-nums text-foreground font-medium">{p.toFixed(1)}%</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
        {partsInsight && (
          <div className="rounded-md border border-warning/30 bg-warning/10 px-4 py-2 text-xs text-warning">
            💡 {partsInsight}
          </div>
        )}

        {/* === SECTION 8 — MoM Variance Table === */}
        {previous && (
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium">
                MoM Variance — {previous.month} vs {current.month}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowMomTable((v) => !v)}>
                {showMomTable ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CardHeader>
            {showMomTable && (
              <CardContent className="pt-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Metric</TableHead>
                      <TableHead className="text-xs text-right">{previous.month}</TableHead>
                      <TableHead className="text-xs text-right">{current.month}</TableHead>
                      <TableHead className="text-xs text-right">Δ AED</TableHead>
                      <TableHead className="text-xs text-right">Δ %</TableHead>
                      <TableHead className="text-xs">Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { l: "Revenue", c: current.totalRevenue, p: previous.totalRevenue, good: "up", note: "Real revenue ex-dummy" },
                      { l: "Cost of Sales", c: current.costOfSales, p: previous.costOfSales, good: "down", note: "Parts + sublet" },
                      { l: "Gross Profit", c: current.grossProfit, p: previous.grossProfit, good: "up", note: "" },
                      { l: "Gross Margin %", c: currMargin, p: prevMargin, good: "up", note: "Percentage points", isPct: true },
                      { l: "Indirect Expenses", c: current.indirectExpenses, p: previous.indirectExpenses, good: "down", note: "Payroll + rent + admin" },
                      { l: "Payroll (ex-dummy)", c: current.payroll, p: previous.payroll, good: "down", note: "Largest fixed cost" },
                      { l: "Net Profit", c: current.netProfit, p: previous.netProfit, good: "up", note: "" },
                    ].map((r) => {
                      const delta = r.c - r.p;
                      const dPct = r.isPct ? delta : pct(r.c, r.p);
                      const positive = (r.good === "up" && delta >= 0) || (r.good === "down" && delta <= 0);
                      return (
                        <TableRow key={r.l}>
                          <TableCell className="text-xs font-medium">{r.l}</TableCell>
                          <TableCell className="text-xs text-right">{r.isPct ? `${r.p.toFixed(1)}%` : formatAEDFull(r.p)}</TableCell>
                          <TableCell className="text-xs text-right">{r.isPct ? `${r.c.toFixed(1)}%` : formatAEDFull(r.c)}</TableCell>
                          <TableCell className={`text-xs text-right ${positive ? "text-success" : "text-loss"}`}>
                            {r.isPct ? `${delta >= 0 ? "+" : ""}${delta.toFixed(1)} pts` : formatAEDFull(delta)}
                          </TableCell>
                          <TableCell className={`text-xs text-right ${positive ? "text-success" : "text-loss"}`}>
                            {r.isPct ? "—" : fmtPctSigned(dPct)}
                          </TableCell>
                          <TableCell className="text-[11px] text-muted-foreground">{r.note}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            )}
          </Card>
        )}

        {/* === SECTION 9 — Expense Breakdown === */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Expense Breakdown — {current.month}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={Math.max(180, expenseItems.length * 50)}>
              <BarChart data={expenseItems} layout="vertical" margin={{ left: 100 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                <XAxis type="number" tick={{ fontSize: 10, fill: COLORS.muted }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: COLORS.muted }} width={150} />
                <Tooltip formatter={(v: number) => formatAEDFull(v)} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {expenseItems.map((e, i) => (
                    <BarCell key={i} fill={e.flag ? COLORS.loss : e.fixed ? COLORS.primary : COLORS.parts} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="text-[11px] text-muted-foreground mt-2">
              Fixed costs (Payroll + Rent) = <span className="font-semibold text-foreground">{formatAEDFull(fixedCostMonthly)}</span> per month minimum regardless of revenue
            </p>
          </CardContent>
        </Card>

        {/* === SECTION 10 — Partner Capital Position === */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Partner Investment Position — MK Auto Garage</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Partner</TableHead>
                  <TableHead className="text-xs text-right">Ownership</TableHead>
                  <TableHead className="text-xs text-right">Share Capital</TableHead>
                  <TableHead className="text-xs text-right">Loan to Company</TableHead>
                  <TableHead className="text-xs text-right">Total Exposure</TableHead>
                  <TableHead className="text-xs text-right">Share of Loss</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {partnerRows.map((p) => (
                  <TableRow key={p.name}>
                    <TableCell className="text-xs font-medium">{p.name}</TableCell>
                    <TableCell className="text-xs text-right">{p.ownershipPct}%</TableCell>
                    <TableCell className="text-xs text-right">{formatAEDFull(p.shareCapital)}</TableCell>
                    <TableCell className="text-xs text-right">{p.loanToCompany > 0 ? formatAEDFull(p.loanToCompany) : "—"}</TableCell>
                    <TableCell className="text-xs text-right font-semibold">{formatAEDFull(p.totalExposure)}</TableCell>
                    <TableCell className="text-xs text-right text-loss">{formatAEDFull(p.shareOfLoss)}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="border-t-2 border-border bg-muted/20">
                  <TableCell className="text-xs font-bold">TOTAL</TableCell>
                  <TableCell className="text-xs text-right font-bold">100%</TableCell>
                  <TableCell className="text-xs text-right font-bold">{formatAEDFull(partnerTotal.shareCapital)}</TableCell>
                  <TableCell className="text-xs text-right font-bold">{formatAEDFull(partnerTotal.loanToCompany)}</TableCell>
                  <TableCell className="text-xs text-right font-bold">{formatAEDFull(partnerTotal.totalExposure)}</TableCell>
                  <TableCell className="text-xs text-right font-bold text-loss">{formatAEDFull(partnerTotal.shareOfLoss)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <p className="text-[11px] text-muted-foreground mt-3 leading-relaxed">
              Ahmad and Manal Mussa have provided AED 400,000 and AED 480,000 in loans respectively beyond their share capital to fund operations. Total partner exposure {formatAEDFull(partnerTotal.totalExposure)} against accumulated losses of {formatAEDFull(partnerTotal.shareOfLoss)}.
            </p>
          </CardContent>
        </Card>

        {/* === SECTION 11 — Balance Sheet Summary === */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Balance Sheet Summary — As at {balanceSheet.asOf}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Assets */}
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold pb-1 border-b border-border/30">Assets</p>
                {[
                  { l: "Goodwill (Ignite Garage)", v: balanceSheet.fixedAssets.goodwill, flag: "⚠️ assess impairment" },
                  { l: "Garage Tools", v: balanceSheet.fixedAssets.garageTools },
                  { l: "PPE & Equipment", v: balanceSheet.fixedAssets.ppe + balanceSheet.fixedAssets.laptop + balanceSheet.fixedAssets.mobile },
                  { l: "Software", v: balanceSheet.fixedAssets.software },
                ].map((r) => (
                  <div key={r.l} className="flex justify-between py-0.5">
                    <span className="text-muted-foreground">{r.l} {r.flag && <span className="text-warning">{r.flag}</span>}</span>
                    <span className="tabular-nums text-foreground">{formatAEDFull(r.v)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-semibold py-1 border-t border-border/30">
                  <span>Total Fixed Assets</span><span className="tabular-nums">{formatAEDFull(balanceSheet.fixedAssets.total)}</span>
                </div>
                {[
                  { l: "Accounts Receivable", v: balanceSheet.currentAssets.accountsReceivable, flag: "⚠️" },
                  { l: "Prepaid Rent", v: balanceSheet.currentAssets.prepaidRent },
                  { l: "Bank", v: balanceSheet.currentAssets.bankAccounts },
                  { l: "Cash in Hand", v: balanceSheet.currentAssets.cashInHand, flag: "🔴" },
                ].map((r) => (
                  <div key={r.l} className="flex justify-between py-0.5">
                    <span className="text-muted-foreground">{r.l} {r.flag}</span>
                    <span className={`tabular-nums ${r.v < 0 ? "text-loss" : "text-foreground"}`}>{formatAEDFull(r.v)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-semibold py-1 border-t border-border/30">
                  <span>Total Current Assets</span><span className="tabular-nums">{formatAEDFull(balanceSheet.currentAssets.total)}</span>
                </div>
                <div className="flex justify-between font-bold py-1.5 border-t-2 border-border bg-muted/20 px-2 rounded">
                  <span>TOTAL ASSETS</span><span className="tabular-nums">{formatAEDFull(balanceSheet.totalAssets)}</span>
                </div>
              </div>

              {/* Liabilities */}
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold pb-1 border-b border-border/30">Liabilities & Equity</p>
                <div className="flex justify-between py-0.5"><span className="text-muted-foreground">Partner Capital</span><span className="tabular-nums">{formatAEDFull(balanceSheet.capital.total)}</span></div>
                <div className="flex justify-between py-0.5"><span className="text-muted-foreground">Partner Loans</span><span className="tabular-nums">{formatAEDFull(balanceSheet.loans.manalMussaCurrent + balanceSheet.loans.mrAhmedCurrent)}</span></div>
                <div className="flex justify-between py-0.5"><span className="text-muted-foreground">Sister Co (MK Autos)</span><span className="tabular-nums">{formatAEDFull(balanceSheet.loans.sisterCompanyMkAutos)}</span></div>
                <div className="flex justify-between py-0.5"><span className="text-muted-foreground">Accounts Payable</span><span className="tabular-nums">{formatAEDFull(balanceSheet.currentLiabilities.accountsPayable)}</span></div>
                <div className="flex justify-between py-0.5"><span className="text-muted-foreground">Salary Payable</span><span className="tabular-nums">{formatAEDFull(balanceSheet.currentLiabilities.employeeSalary)}</span></div>
                <div className="flex justify-between py-0.5"><span className="text-muted-foreground">Rent Liability 🔴</span><span className="tabular-nums text-loss">{formatAEDFull(balanceSheet.currentLiabilities.rentLiability)}</span></div>
                <div className="flex justify-between py-0.5"><span className="text-muted-foreground">Accumulated P&L Loss</span><span className="tabular-nums text-loss">{formatAEDFull(balanceSheet.profitAndLoss)}</span></div>
                <div className="flex justify-between font-bold py-1.5 mt-2 border-t-2 border-border bg-muted/20 px-2 rounded">
                  <span>TOTAL LIABILITIES</span><span className="tabular-nums">{formatAEDFull(balanceSheet.totalLiabilities)}</span>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold pb-1 border-b border-border/30">Notes</p>
                <div className="rounded bg-warning/10 border border-warning/30 p-2 text-warning">
                  ⚠️ Goodwill {formatAEDFull(balanceSheet.fixedAssets.goodwill)} ({((balanceSheet.fixedAssets.goodwill / balanceSheet.totalAssets) * 100).toFixed(0)}% of total assets) — Ignite Garage acquisition. Assess for impairment given accumulated losses.
                </div>
                <div className="rounded bg-loss/10 border border-loss/30 p-2 text-loss">
                  🔴 Cash overdraft {formatAEDFull(balanceSheet.currentAssets.cashInHand)} — urgent cash injection or AR collection required.
                </div>
                <div className="rounded bg-muted/30 border border-border/50 p-2 text-muted-foreground">
                  ℹ️ MK Autos owes MK Garage {formatAEDFull(balanceSheet.loans.sisterCompanyMkAutos)} — reconcile with MK Autos payables in portfolio consolidation.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* === SECTION 12 — Monthly P&L Table === */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Monthly Profit & Loss — Full History</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setShowFullPL((v) => !v)}>
              {showFullPL ? "Hide" : "Show"} Full History
              {showFullPL ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />}
            </Button>
          </CardHeader>
          {showFullPL && (
            <CardContent className="pt-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Month</TableHead>
                      <TableHead className="text-xs text-right">Real Revenue</TableHead>
                      <TableHead className="text-xs text-right">CoS</TableHead>
                      <TableHead className="text-xs text-right">Gross Profit</TableHead>
                      <TableHead className="text-xs text-right">GP %</TableHead>
                      <TableHead className="text-xs text-right">Indirect Exp</TableHead>
                      <TableHead className="text-xs text-right">Payroll</TableHead>
                      <TableHead className="text-xs text-right">Net Profit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {monthlyPL.map((m) => {
                      const gpPct = m.totalRevenue > 0 ? (m.grossProfit / m.totalRevenue) * 100 : 0;
                      const isSel = m.month === current.month;
                      return (
                        <TableRow key={m.month} className={isSel ? "bg-primary/10" : ""}>
                          <TableCell className={`text-xs font-medium ${isSel ? "text-primary" : ""}`}>{m.month}</TableCell>
                          <TableCell className="text-xs text-right">{formatAEDFull(m.totalRevenue)}</TableCell>
                          <TableCell className="text-xs text-right text-loss">{formatAEDFull(m.costOfSales)}</TableCell>
                          <TableCell className="text-xs text-right text-success">{formatAEDFull(m.grossProfit)}</TableCell>
                          <TableCell className="text-xs text-right">{gpPct.toFixed(1)}%</TableCell>
                          <TableCell className="text-xs text-right text-loss">{formatAEDFull(m.indirectExpenses)}</TableCell>
                          <TableCell className="text-xs text-right">{formatAEDFull(m.payroll)}</TableCell>
                          <TableCell className={`text-xs text-right font-bold ${m.netProfit >= 0 ? "text-success" : "text-loss"}`}>{formatAEDFull(m.netProfit)}</TableCell>
                        </TableRow>
                      );
                    })}
                    {(() => {
                      const t = monthlyPL.reduce(
                        (a, m) => ({
                          rev: a.rev + m.totalRevenue,
                          cos: a.cos + m.costOfSales,
                          gp: a.gp + m.grossProfit,
                          ind: a.ind + m.indirectExpenses,
                          pay: a.pay + m.payroll,
                          np: a.np + m.netProfit,
                        }),
                        { rev: 0, cos: 0, gp: 0, ind: 0, pay: 0, np: 0 },
                      );
                      const gpPct = t.rev > 0 ? (t.gp / t.rev) * 100 : 0;
                      return (
                        <TableRow className="border-t-2 border-border bg-muted/30">
                          <TableCell className="text-xs font-bold">TOTAL</TableCell>
                          <TableCell className="text-xs text-right font-bold">{formatAEDFull(t.rev)}</TableCell>
                          <TableCell className="text-xs text-right font-bold text-loss">{formatAEDFull(t.cos)}</TableCell>
                          <TableCell className="text-xs text-right font-bold text-success">{formatAEDFull(t.gp)}</TableCell>
                          <TableCell className="text-xs text-right font-bold">{gpPct.toFixed(1)}%</TableCell>
                          <TableCell className="text-xs text-right font-bold text-loss">{formatAEDFull(t.ind)}</TableCell>
                          <TableCell className="text-xs text-right font-bold">{formatAEDFull(t.pay)}</TableCell>
                          <TableCell className={`text-xs text-right font-bold ${t.np >= 0 ? "text-success" : "text-loss"}`}>{formatAEDFull(t.np)}</TableCell>
                        </TableRow>
                      );
                    })()}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          )}
        </Card>
      </main>
    </div>
  );
};

export default GarageDashboard;
