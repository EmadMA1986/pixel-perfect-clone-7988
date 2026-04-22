import { useState, useMemo, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp, TrendingDown, Minus, AlertTriangle, Target, Zap, Activity,
  DollarSign, Wallet, Car, ArrowLeft, BarChart3, ChevronRight, ChevronDown, ChevronUp,
} from "lucide-react";
import SummaryCard from "@/components/SummaryCard";
import MonthFilter from "@/components/MonthFilter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  ComposedChart, Line, ReferenceLine, CartesianGrid, Legend,
} from "recharts";
import {
  mkAutosSummary, vehicles, monthlyIncome, formatAED, ahmadCapital, vehicleKeys, vehicleLabels,
} from "@/data/mkAutosData";

// ────────────────────────────────────────────────────────────
// Static, source-of-truth depreciation per vehicle (AED / month)
// ────────────────────────────────────────────────────────────
const monthlyDepreciation: Record<string, number> = {
  g63: 13000,
  lamborghini: 22500,
  corvette: 8411.5,
  cadillac: 7997.91,
  patrol: 3916.66,
  bmw440i: 3116.66,
  gle53: 8733.33,
  c200: 5616.66,
  q8: 0,
  cayenne: 0,
};
const TOTAL_MONTHLY_DEPR = 73292.72;

const vehicleDisplayName: Record<string, string> = {
  g63: "G63-2021",
  lamborghini: "Lamborghini-2023",
  corvette: "Corvette-2023",
  cadillac: "Cadillac-2023",
  patrol: "Patrol-2023",
  bmw440i: "BMW440i-2023",
  gle53: "GLE53-2024",
  c200: "C200-2023",
  q8: "Q8",
  cayenne: "Cayenne",
};

// Map a vehicle data row → its key
const vehicleKeyOf = (name: string): string => {
  const n = name.toLowerCase();
  if (n.includes("g63")) return "g63";
  if (n.includes("lambo")) return "lamborghini";
  if (n.includes("corvette")) return "corvette";
  if (n.includes("cadillac")) return "cadillac";
  if (n.includes("patrol")) return "patrol";
  if (n.includes("bmw")) return "bmw440i";
  if (n.includes("gle")) return "gle53";
  if (n.includes("c 200") || n.includes("c200")) return "c200";
  if (n.includes("q8")) return "q8";
  if (n.includes("cayenne")) return "cayenne";
  return n;
};

const Divider = () => <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent my-2" />;

const SectionTitle = ({ children }: { children: ReactNode }) => (
  <h2 className="text-sm font-serif font-semibold uppercase tracking-[0.2em] text-foreground">{children}</h2>
);

const MkAutosCarsDashboard = () => {
  const months = useMemo(() => monthlyIncome.map((m) => m.month), []);
  const [selectedMonth, setSelectedMonth] = useState(months[months.length - 1] ?? "Mar-26");
  const [showSummary, setShowSummary] = useState(true);

  const selectedIdx = monthlyIncome.findIndex((m) => m.month === selectedMonth);
  const cur = selectedIdx >= 0 ? monthlyIncome[selectedIdx] : monthlyIncome[monthlyIncome.length - 1];
  const prev = selectedIdx > 0 ? monthlyIncome[selectedIdx - 1] : null;

  const activeCount = (row: typeof cur) =>
    vehicleKeys.reduce((c, k) => c + ((row as any)[k] > 0 ? 1 : 0), 0);

  const trackedKeys = ["g63", "lamborghini", "corvette", "cadillac", "patrol", "bmw440i", "gle53", "c200"];
  const trackedActive = (row: typeof cur) =>
    trackedKeys.reduce((c, k) => c + ((row as any)[k] > 0 ? 1 : 0), 0);

  const curIncome = cur.total;
  const prevIncome = prev?.total ?? null;
  const incomeMoM = prev && prev.total > 0 ? ((curIncome - prev.total) / prev.total) * 100 : null;
  const cashProfit = curIncome * 6.17; // calibrated to deliver Mar AED 162,891 / Feb AED 107,462 demo? — replaced below

  // Cash profit per month (income minus avg maintenance allocation; spec values)
  const cashProfitByMonth: Record<string, number> = {
    "Feb-26": 162891,
    "Mar-26": 107462,
  };
  const curCashProfit = cashProfitByMonth[selectedMonth];
  const prevCashProfit = prev ? cashProfitByMonth[prev.month] : undefined;
  const cashProfitMoM = curCashProfit != null && prevCashProfit != null && prevCashProfit !== 0
    ? ((curCashProfit - prevCashProfit) / prevCashProfit) * 100 : null;

  const incomeVsDepr = curIncome - TOTAL_MONTHLY_DEPR;
  const prevIncomeVsDepr = prev ? prev.total - TOTAL_MONTHLY_DEPR : null;

  // ── Verdict
  const verdict =
    incomeMoM == null ? "stable"
    : incomeMoM <= -10 ? "declining"
    : incomeMoM >= 10 ? "improving"
    : "stable";
  const vStyle = verdict === "improving"
    ? { bg: "bg-success/10", border: "border-success/40", text: "text-success", label: "IMPROVING", Icon: TrendingUp }
    : verdict === "declining"
    ? { bg: "bg-loss/10", border: "border-loss/40", text: "text-loss", label: "DECLINING", Icon: TrendingDown }
    : { bg: "bg-muted/40", border: "border-border", text: "text-muted-foreground", label: "STABLE", Icon: Minus };

  const idleVehicles = trackedKeys.filter((k) => (cur as any)[k] === 0).map((k) => vehicleDisplayName[k]);
  const peakIncome = Math.max(...monthlyIncome.slice(-12).map((m) => m.total));
  const peakMonth = monthlyIncome.slice(-12).find((m) => m.total === peakIncome)?.month ?? "";
  const peakDecline = peakIncome > 0 ? ((peakIncome - curIncome) / peakIncome) * 100 : 0;

  // ── 6-month income trend
  const last6 = monthlyIncome.slice(Math.max(0, selectedIdx - 5), selectedIdx + 1);
  const trendData = last6.map((m) => ({
    month: m.month,
    Income: Math.round(m.total),
    isSelected: m.month === selectedMonth,
  }));

  // ── Monthly income by vehicle (last 12 months) — stacked
  const last12 = monthlyIncome.slice(Math.max(0, selectedIdx - 11), selectedIdx + 1);
  const stackedData = last12.map((m) => {
    const r: Record<string, number | string> = { month: m.month };
    trackedKeys.forEach((k) => { r[vehicleLabels[k]] = Math.round((m as any)[k] || 0); });
    return r;
  });
  const stackColors = [
    "hsl(43, 74%, 52%)", "hsl(280, 50%, 55%)", "hsl(200, 60%, 50%)", "hsl(160, 50%, 45%)",
    "hsl(20, 70%, 55%)", "hsl(0, 60%, 55%)", "hsl(170, 55%, 50%)", "hsl(43, 30%, 40%)",
  ];

  // ── Vehicle matrix (sorted by realProfit desc), tracked vehicles only
  const fleetVehicles = vehicles
    .filter((v) => v.initialInvestment > 0)
    .map((v) => {
      const key = vehicleKeyOf(v.name);
      const marIncome = (cur as any)[key] ?? 0;
      const decision: "KEEP" | "SELL" = v.realROI < -20 ? "SELL" : "KEEP";
      return { ...v, key, marIncome, decision, displayName: vehicleDisplayName[key] ?? v.name };
    })
    .sort((a, b) => b.realProfit - a.realProfit);

  const totals = fleetVehicles.reduce(
    (a, v) => ({
      cost: a.cost + v.initialInvestment,
      sale: a.sale + v.saleValue,
      income: a.income + v.totalProfit,
      maint: a.maint + v.maintenanceExpenses,
      net: a.net + v.netProfit,
      real: a.real + v.realProfit,
      monthly: a.monthly + v.avgMonthlyProfit,
      curMonth: a.curMonth + v.marIncome,
    }),
    { cost: 0, sale: 0, income: 0, maint: 0, net: 0, real: 0, monthly: 0, curMonth: 0 }
  );

  const keepVehicles = fleetVehicles.filter((v) => v.decision === "KEEP");
  const sellVehicles = fleetVehicles.filter((v) => v.decision === "SELL");

  // ── Break-even threshold (depreciation)
  const breakEvenLabel = formatAED(TOTAL_MONTHLY_DEPR);

  // ── MoM variance table
  const variance = prev ? [
    {
      label: "Revenue", prev: prev.total, cur: curIncome,
      pct: prev.total > 0 ? ((curIncome - prev.total) / prev.total) * 100 : 0,
      reason: idleVehicles.length > 0 ? `${idleVehicles.length} vehicles idle` : "Active fleet",
    },
    { label: "Maintenance", prev: null, cur: null, pct: 0, reason: "—" },
    {
      label: "Net Profit",
      prev: prevCashProfit ?? null, cur: curCashProfit ?? null,
      pct: cashProfitMoM ?? 0,
      reason: cashProfitMoM != null && cashProfitMoM < 0 ? "Lower income after costs" : "Improved utilization",
    },
  ] : [];

  // ── Expense breakdown by selected month — placeholder (no per-month breakdown in data)
  // We display the inception maintenance distribution per vehicle as the only available view.

  // Check whether selected month has any data
  const noData = curIncome === 0 && trackedActive(cur) === 0;

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
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
              <Car className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-serif font-bold text-foreground tracking-tight">MK Autos — Cars</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Ahmad's Rental Fleet</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <MonthFilter months={months} value={selectedMonth} onChange={setSelectedMonth} />
            <Link to="/mk-autos-company">
              <Button variant="outline" size="sm" className="text-xs">Company Dashboard →</Button>
            </Link>
            <Badge variant="secondary" className="text-xs">AED</Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-5">
        {/* ═════ SECTION 1 — Performance Verdict ═════ */}
        <Card className={`border-2 ${vStyle.border} ${vStyle.bg} backdrop-blur-sm`}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className={`flex h-14 w-14 items-center justify-center rounded-full ${vStyle.bg} border-2 ${vStyle.border}`}>
                  <vStyle.Icon className={`h-7 w-7 ${vStyle.text}`} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                    MK Autos Cars — Performance Verdict — {selectedMonth}
                  </p>
                  <p className={`text-3xl font-serif font-bold ${vStyle.text} tracking-wide`}>{vStyle.label}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {prev ? `Net Profit MoM (${selectedMonth} vs ${prev.month})` : "Net Profit MoM"}
                </p>
                <p className={`text-2xl font-bold tabular-nums ${(cashProfitMoM ?? 0) >= 0 ? "text-success" : "text-loss"}`}>
                  {cashProfitMoM != null ? `${cashProfitMoM >= 0 ? "▲" : "▼"} ${Math.abs(cashProfitMoM).toFixed(1)}%` : "—"}
                </p>
                <p className="text-xs text-muted-foreground tabular-nums">
                  {curCashProfit != null ? formatAED(curCashProfit) : "—"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Divider />

        {/* ═════ SECTION 2 — 4 Intelligence Cards ═════ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="border-border/50 bg-card/80">
            <CardContent className="p-4 space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Activity className="h-3.5 w-3.5" />
                <p className="text-[10px] uppercase tracking-wider">Performance</p>
              </div>
              <p className={`text-lg font-bold ${vStyle.text}`}>{vStyle.label}</p>
              <p className="text-xs text-muted-foreground">vs {prev?.month ?? "—"}</p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/80">
            <CardContent className="p-4 space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground">
                <AlertTriangle className="h-3.5 w-3.5" />
                <p className="text-[10px] uppercase tracking-wider">Main Issue</p>
              </div>
              <p className={`text-sm font-semibold leading-snug ${idleVehicles.length > 0 ? "text-loss" : "text-success"}`}>
                {idleVehicles.length > 0
                  ? `${idleVehicles.length} of 8 vehicles idle in ${selectedMonth} (${idleVehicles.slice(0, 3).join(", ")})`
                  : "All vehicles generating income"}
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/80">
            <CardContent className="p-4 space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Zap className="h-3.5 w-3.5" />
                <p className="text-[10px] uppercase tracking-wider">Main Driver</p>
              </div>
              <p className="text-sm font-semibold text-foreground leading-snug">
                {peakIncome > 0
                  ? `Monthly income fallen from ${formatAED(peakIncome)} (${peakMonth}) to ${formatAED(curIncome)} (${selectedMonth}) — ${peakDecline.toFixed(1)}% decline`
                  : "—"}
              </p>
            </CardContent>
          </Card>
          <Card className="border-2 border-primary/40 bg-primary/5">
            <CardContent className="p-4 space-y-1">
              <div className="flex items-center gap-2 text-primary">
                <Target className="h-3.5 w-3.5" />
                <p className="text-[10px] uppercase tracking-wider font-semibold">Action</p>
              </div>
              <p className="text-sm font-semibold text-foreground leading-snug">
                URGENT — GLE53 and C200 recommended for sale. Activate idle vehicles or list for sale.
              </p>
            </CardContent>
          </Card>
        </div>

        <Divider />

        {/* ═════ SECTION 3 — Monthly Executive Summary ═════ */}
        {prev && (
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <SectionTitle>Executive Summary — {selectedMonth} vs {prev.month}</SectionTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowSummary((v) => !v)} className="h-8 px-2 text-xs">
                  {showSummary ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  <span className="ml-1">{showSummary ? "Collapse" : "Expand"}</span>
                </Button>
              </div>

              {showSummary && (
                <>
                  <div className="rounded-lg border border-border/40 overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/30 hover:bg-muted/30">
                          <TableHead className="text-[10px] uppercase tracking-wider">Metric</TableHead>
                          <TableHead className="text-[10px] uppercase tracking-wider text-right">{prev.month}</TableHead>
                          <TableHead className="text-[10px] uppercase tracking-wider text-right">{selectedMonth}</TableHead>
                          <TableHead className="text-[10px] uppercase tracking-wider text-right">Change</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[
                          {
                            label: "Monthly Income",
                            p: prev.total, c: curIncome,
                            pct: prev.total ? ((curIncome - prev.total) / prev.total) * 100 : 0,
                            good: "up" as const, fmt: formatAED,
                          },
                          {
                            label: "Active Vehicles",
                            p: trackedActive(prev), c: trackedActive(cur),
                            pct: trackedActive(prev) ? ((trackedActive(cur) - trackedActive(prev)) / trackedActive(prev)) * 100 : 0,
                            good: "up" as const, fmt: (v: number) => `${v}/8`,
                          },
                          {
                            label: "Maintenance Costs",
                            p: null, c: null, pct: 0, good: "down" as const, fmt: () => "—",
                          },
                          {
                            label: "Total Depreciation",
                            p: TOTAL_MONTHLY_DEPR, c: TOTAL_MONTHLY_DEPR, pct: 0,
                            good: "down" as const, fmt: formatAED,
                          },
                          {
                            label: "Cash Profit",
                            p: prevCashProfit ?? null, c: curCashProfit ?? null,
                            pct: cashProfitMoM ?? 0, good: "up" as const, fmt: formatAED,
                          },
                          {
                            label: "Income vs Depreciation",
                            p: prevIncomeVsDepr, c: incomeVsDepr,
                            pct: prevIncomeVsDepr ? ((incomeVsDepr - prevIncomeVsDepr) / Math.abs(prevIncomeVsDepr)) * 100 : 0,
                            good: "up" as const, fmt: formatAED,
                          },
                        ].map((row) => {
                          const isGood = row.p == null || row.c == null
                            ? null
                            : row.good === "up" ? row.c > row.p : row.c < row.p;
                          const cls = isGood == null ? "text-muted-foreground" : isGood ? "text-success" : "text-loss";
                          const arrow = isGood == null ? "—" : isGood ? "▲" : "▼";
                          return (
                            <TableRow key={row.label} className="hover:bg-muted/20">
                              <TableCell className="text-xs font-medium text-foreground">{row.label}</TableCell>
                              <TableCell className="text-xs text-right tabular-nums text-muted-foreground">
                                {row.p == null ? "—" : row.fmt(row.p)}
                              </TableCell>
                              <TableCell className="text-xs text-right tabular-nums text-foreground">
                                {row.c == null ? "—" : row.fmt(row.c)}
                              </TableCell>
                              <TableCell className={`text-xs text-right tabular-nums font-semibold ${cls}`}>
                                {isGood == null ? "—" : `${arrow} ${Math.abs(row.pct).toFixed(1)}%`}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {selectedMonth === "Mar-26"
                        ? `March 2026 recorded ${formatAED(curIncome)} rental income — the lowest month in the fleet history. Only ${trackedActive(cur)} of 8 vehicles generated income. Monthly depreciation of ${formatAED(TOTAL_MONTHLY_DEPR)} exceeds income by ${formatAED(Math.abs(incomeVsDepr))} — the fleet is destroying value in cash terms this month. Revenue has declined ${peakDecline.toFixed(1)}% from the ${peakMonth} peak of ${formatAED(peakIncome)}. Immediate action required on idle vehicles.`
                        : `${selectedMonth} recorded ${formatAED(curIncome)} rental income with ${trackedActive(cur)} of 8 vehicles active. Monthly depreciation of ${formatAED(TOTAL_MONTHLY_DEPR)} ${incomeVsDepr >= 0 ? "is covered by income" : `exceeds income by ${formatAED(Math.abs(incomeVsDepr))}`}.`}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="rounded-lg border border-border/40 border-l-4 border-l-success bg-card/60 p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-success" />
                        <p className="text-xs font-semibold uppercase tracking-wider text-success">Improved</p>
                      </div>
                      <p className="text-xs text-muted-foreground italic">Nothing improved vs last month.</p>
                    </div>
                    <div className="rounded-lg border border-border/40 border-l-4 border-l-loss bg-card/60 p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingDown className="h-4 w-4 text-loss" />
                        <p className="text-xs font-semibold uppercase tracking-wider text-loss">Deteriorated</p>
                      </div>
                      <ul className="text-xs text-foreground space-y-1 list-disc list-inside">
                        <li>Income {(incomeMoM ?? 0) >= 0 ? "▲" : "▼"} {Math.abs(incomeMoM ?? 0).toFixed(1)}%</li>
                        <li>Active vehicles {trackedActive(cur) - trackedActive(prev) >= 0 ? "▲" : "▼"} {Math.abs(trackedActive(cur) - trackedActive(prev))}</li>
                        <li>Income vs depreciation gap widened</li>
                      </ul>
                    </div>
                    <div className="rounded-lg border border-border/40 border-l-4 border-l-amber-500 bg-card/60 p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        <p className="text-xs font-semibold uppercase tracking-wider text-amber-500">Watch</p>
                      </div>
                      <ul className="text-xs text-foreground space-y-1 list-disc list-inside">
                        <li>Lamborghini idle since Feb — review pricing</li>
                        <li>Patrol idle since Feb</li>
                        <li>C200 idle since Jul 2025</li>
                      </ul>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        <Divider />

        {/* ═════ SECTION 4 — KPI Cards (two rows) ═════ */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <SummaryCard
            title="Monthly Income" value={formatAED(curIncome)}
            subtitle={incomeMoM != null ? `${incomeMoM >= 0 ? "▲" : "▼"} ${Math.abs(incomeMoM).toFixed(1)}% MoM` : selectedMonth}
            icon={DollarSign} trend={incomeMoM != null && incomeMoM >= 0 ? "up" : "down"}
          />
          <SummaryCard
            title="Active Vehicles" value={`${trackedActive(cur)}/8`}
            subtitle={`${8 - trackedActive(cur)} idle`} icon={Car}
            trend={trackedActive(cur) >= 6 ? "up" : "down"}
          />
          <SummaryCard
            title="Total Maintenance" value={formatAED(mkAutosSummary.totalMaintenanceExpenses)}
            subtitle="Inception-to-date" icon={DollarSign}
          />
          <SummaryCard
            title="Monthly Depreciation" value={formatAED(TOTAL_MONTHLY_DEPR)}
            subtitle="Fixed run-rate" icon={TrendingDown} trend="down"
          />
          <SummaryCard
            title="Income vs Depreciation" value={formatAED(incomeVsDepr)}
            subtitle={incomeVsDepr >= 0 ? "Surplus" : "Income shortfall"}
            icon={BarChart3} trend={incomeVsDepr >= 0 ? "up" : "down"}
          />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <SummaryCard
            title="Total Investment" value={formatAED(mkAutosSummary.totalInitialInvestment)}
            subtitle="Ahmad's capital" icon={Wallet}
          />
          <SummaryCard
            title="Cash ROI" value={`${mkAutosSummary.overallROI}%`}
            subtitle="Net profit vs investment" icon={TrendingUp} trend="up"
          />
          <SummaryCard
            title="Real ROI" value={`${mkAutosSummary.realROI}%`}
            subtitle="After depreciation" icon={TrendingDown} trend="down"
          />
          <SummaryCard
            title="NBV Fleet" value={formatAED(mkAutosSummary.totalNBV)}
            subtitle="Current book value" icon={Car}
          />
          <SummaryCard
            title="If Sold Today" value={formatAED(mkAutosSummary.totalSaleValue)}
            subtitle={`Surplus vs NBV: ${formatAED(mkAutosSummary.totalSaleValue - mkAutosSummary.totalNBV)}`}
            icon={DollarSign} trend="up"
          />
        </div>

        <Divider />

        {/* ═════ SECTION 5 — 6-Month Income Trend vs Depreciation ═════ */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-serif text-foreground">6-Month Income Trend vs Depreciation Threshold</CardTitle>
            <p className="text-[10px] text-muted-foreground tracking-wider uppercase">
              Income must exceed {breakEvenLabel}/month to create real value
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => formatAED(v)}
                />
                <ReferenceLine y={TOTAL_MONTHLY_DEPR} stroke="hsl(var(--loss))" strokeDasharray="4 4" label={{ value: `Depreciation ${breakEvenLabel}`, position: "right", fill: "hsl(var(--loss))", fontSize: 10 }} />
                <Bar dataKey="Income" radius={[4, 4, 0, 0]}>
                  {trendData.map((d, i) => (
                    <Cell key={i} fill={d.isSelected ? "hsl(var(--primary))" : "hsl(160, 50%, 40%)"} />
                  ))}
                </Bar>
                <Line type="monotone" dataKey="Income" stroke="hsl(var(--loss))" strokeWidth={2} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Divider />

        {/* ═════ SECTION 6 — MoM Variance Table ═════ */}
        {prev && (
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-serif text-foreground">
                Month-over-Month Variance — {selectedMonth} vs {prev.month}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50 hover:bg-transparent">
                    <TableHead className="text-[10px] uppercase tracking-wider">Metric</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-right">{prev.month}</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-right">{selectedMonth}</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-right">Change</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider">Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {variance.map((row) => {
                    const cls = row.pct >= 0 ? "text-success" : "text-loss";
                    return (
                      <TableRow key={row.label} className="border-border/30 hover:bg-secondary/30">
                        <TableCell className="text-xs font-medium text-foreground">{row.label}</TableCell>
                        <TableCell className="text-xs text-right tabular-nums text-muted-foreground">{row.prev != null ? formatAED(row.prev) : "—"}</TableCell>
                        <TableCell className="text-xs text-right tabular-nums text-foreground">{row.cur != null ? formatAED(row.cur) : "—"}</TableCell>
                        <TableCell className={`text-xs text-right tabular-nums font-semibold ${row.prev == null ? "text-muted-foreground" : cls}`}>
                          {row.prev == null ? "—" : `${row.pct >= 0 ? "▲" : "▼"} ${Math.abs(row.pct).toFixed(1)}%`}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{row.reason}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        <Divider />

        {/* ═════ SECTION 7 — Vehicle Performance Matrix ═════ */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-serif text-foreground">Fleet Performance — Vehicle by Vehicle</CardTitle>
            <p className="text-[10px] text-muted-foreground tracking-wider uppercase">
              Inception-to-date totals · Last column shows {selectedMonth} income
            </p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50 hover:bg-transparent">
                    <TableHead className="text-[10px] uppercase tracking-wider">Vehicle</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-right">Cost</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-right">Sale Value</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-right">Total Income</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-right">Maint Cost</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-right">Net Profit</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-right">Real Profit</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-right">Cash ROI</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-right">Real ROI</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-right">Monthly Avg</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-right">{selectedMonth}</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-center">Decision</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fleetVehicles.map((v) => {
                    const realRoiCls = v.realROI > 5 ? "text-success" : v.realROI >= 0 ? "text-amber-500" : "text-loss";
                    const realProfitCls = v.realProfit >= 0 ? "text-success" : "text-loss";
                    const idle = v.marIncome === 0;
                    return (
                      <TableRow key={v.name} className="border-border/30 hover:bg-secondary/30">
                        <TableCell className="text-xs font-medium text-foreground">{v.displayName}</TableCell>
                        <TableCell className="text-xs tabular-nums text-right text-foreground">{formatAED(v.initialInvestment)}</TableCell>
                        <TableCell className="text-xs tabular-nums text-right text-foreground">{formatAED(v.saleValue)}</TableCell>
                        <TableCell className="text-xs tabular-nums text-right text-success">{formatAED(v.totalProfit)}</TableCell>
                        <TableCell className="text-xs tabular-nums text-right text-muted-foreground">{formatAED(v.maintenanceExpenses)}</TableCell>
                        <TableCell className={`text-xs tabular-nums text-right font-medium ${v.netProfit >= 0 ? "text-success" : "text-loss"}`}>{formatAED(v.netProfit)}</TableCell>
                        <TableCell className={`text-xs tabular-nums text-right font-semibold ${realProfitCls}`}>{formatAED(v.realProfit)}</TableCell>
                        <TableCell className="text-xs tabular-nums text-right text-foreground">{v.roiOnInvestment.toFixed(1)}%</TableCell>
                        <TableCell className={`text-xs tabular-nums text-right font-semibold ${realRoiCls}`}>{v.realROI.toFixed(1)}%</TableCell>
                        <TableCell className="text-xs tabular-nums text-right text-foreground">{formatAED(v.avgMonthlyProfit)}</TableCell>
                        <TableCell className={`text-xs tabular-nums text-right ${idle ? "text-loss" : "text-foreground"}`}>
                          {idle ? "AED 0 ⚠️" : formatAED(v.marIncome)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={v.decision === "KEEP" ? "default" : "destructive"} className={`text-[10px] ${v.decision === "KEEP" ? "bg-success/20 text-success border-success/40" : ""}`}>
                            {v.decision}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  <TableRow className="border-border/50 bg-secondary/30 font-semibold">
                    <TableCell className="text-xs text-foreground">TOTAL</TableCell>
                    <TableCell className="text-xs tabular-nums text-right text-foreground">{formatAED(totals.cost)}</TableCell>
                    <TableCell className="text-xs tabular-nums text-right text-foreground">{formatAED(totals.sale)}</TableCell>
                    <TableCell className="text-xs tabular-nums text-right text-success">{formatAED(totals.income)}</TableCell>
                    <TableCell className="text-xs tabular-nums text-right text-muted-foreground">{formatAED(totals.maint)}</TableCell>
                    <TableCell className="text-xs tabular-nums text-right text-success">{formatAED(totals.net)}</TableCell>
                    <TableCell className={`text-xs tabular-nums text-right ${totals.real >= 0 ? "text-success" : "text-loss"}`}>{formatAED(totals.real)}</TableCell>
                    <TableCell className="text-xs tabular-nums text-right text-foreground">{mkAutosSummary.overallROI}%</TableCell>
                    <TableCell className={`text-xs tabular-nums text-right ${mkAutosSummary.realROI >= 0 ? "text-success" : "text-loss"}`}>{mkAutosSummary.realROI}%</TableCell>
                    <TableCell className="text-xs tabular-nums text-right text-foreground">{formatAED(totals.monthly)}</TableCell>
                    <TableCell className="text-xs tabular-nums text-right text-foreground">{formatAED(totals.curMonth)}</TableCell>
                    <TableCell className="text-center text-xs text-muted-foreground">—</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Divider />

        {/* ═════ SECTION 8 — Keep / Sell Decision Panel ═════ */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-serif text-foreground">Fleet Optimization — Keep vs Sell</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-lg border-2 border-success/40 bg-success/5 p-4">
                <p className="text-xs uppercase tracking-wider text-success font-bold mb-2">✅ Keep ({keepVehicles.length} vehicles)</p>
                <p className="text-sm font-semibold text-foreground mb-2">
                  {keepVehicles.map((v) => v.displayName.split("-")[0]).join(", ")}
                </p>
                <p className="text-xs text-muted-foreground">Annual net profit exceeds or approaches annual depreciation.</p>
              </div>
              <div className="rounded-lg border-2 border-loss/40 bg-loss/5 p-4 space-y-3">
                <p className="text-xs uppercase tracking-wider text-loss font-bold">🔴 Sell Recommended ({sellVehicles.length} vehicles)</p>
                {sellVehicles.map((v) => {
                  const annualDepr = (monthlyDepreciation[v.key] ?? 0) * 12;
                  const annualNetProfit = v.avgMonthlyProfit * 12;
                  const gap = annualDepr - annualNetProfit;
                  return (
                    <div key={v.key} className="text-xs space-y-0.5">
                      <p className="font-bold text-foreground">{v.displayName}</p>
                      <p className="text-muted-foreground">
                        Sale value {formatAED(v.saleValue)} | Annual depreciation {formatAED(annualDepr)} | Annual net profit {formatAED(annualNetProfit)}
                      </p>
                      <p className="text-loss">
                        {gap > 0 ? `Depreciation exceeds profit by ${formatAED(gap)}/year` : `Nearly break-even`} → SELL
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
              <p className="text-xs text-foreground">
                <span className="font-semibold text-primary">If GLE53 and C200 sold today:</span>{" "}
                Cash inflow {formatAED(sellVehicles.reduce((s, v) => s + v.saleValue, 0))} | Eliminate{" "}
                {formatAED(sellVehicles.reduce((s, v) => s + (monthlyDepreciation[v.key] ?? 0), 0))}/month depreciation | Redeploy capital into higher-performing assets.
              </p>
            </div>
          </CardContent>
        </Card>

        <Divider />

        {/* ═════ SECTION 9 — Ahmad's Capital Position ═════ */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-serif text-foreground">Ahmad's Investment Position — MK Autos Cars</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
              {[
                { l: "Initial Investment", v: formatAED(mkAutosSummary.totalInitialInvestment), c: "text-foreground" },
                { l: "Total Income", v: formatAED(mkAutosSummary.totalGrossProfit), c: "text-success" },
                { l: "Maintenance", v: `-${formatAED(ahmadCapital.carsMaintenance)}`, c: "text-loss" },
                { l: "Net Cash Profit", v: formatAED(mkAutosSummary.netProfit), c: "text-success" },
                { l: "Withdrawals", v: `-${formatAED(ahmadCapital.cashWithdrawal)}`, c: "text-loss" },
                { l: "Old Loan", v: `-${formatAED(ahmadCapital.loan)}`, c: "text-loss" },
                { l: `Final Balance (${selectedMonth})`, v: formatAED(ahmadCapital.positionAgainstCars), c: "text-success" },
                { l: "Total Depreciation", v: `-${formatAED(mkAutosSummary.totalDepreciation)}`, c: "text-loss" },
                { l: "Real Profit", v: formatAED(-355470), c: "text-loss" },
                { l: "Fleet NBV", v: formatAED(mkAutosSummary.totalNBV), c: "text-foreground" },
                { l: "Fleet Market Value", v: formatAED(mkAutosSummary.totalSaleValue), c: "text-foreground" },
                { l: "Unrealized Gain", v: `+${formatAED(mkAutosSummary.totalSaleValue - mkAutosSummary.totalNBV)}`, c: "text-success" },
              ].map((k) => (
                <div key={k.l} className="rounded-lg border border-border/40 bg-card/60 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{k.l}</p>
                  <p className={`text-sm font-bold tabular-nums mt-1 ${k.c}`}>{k.v}</p>
                </div>
              ))}
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Cash profit is positive ({formatAED(mkAutosSummary.netProfit)}) but real profit after depreciation is negative ({formatAED(-355470)}).
                However fleet market value exceeds NBV by {formatAED(mkAutosSummary.totalSaleValue - mkAutosSummary.totalNBV)} — suggesting vehicles hold value better than accounting depreciation implies.
              </p>
            </div>
          </CardContent>
        </Card>

        <Divider />

        {/* ═════ SECTION 10 — Monthly Income by Vehicle (stacked) ═════ */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-serif text-foreground">Monthly Income by Vehicle — Last 12 Months</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={stackedData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} angle={-30} textAnchor="end" height={50} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }}
                  formatter={(v: number) => formatAED(v)}
                />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                {trackedKeys.map((k, i) => (
                  <Bar key={k} dataKey={vehicleLabels[k]} stackId="a" fill={stackColors[i]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Divider />

        {/* ═════ SECTION 11 — Depreciation Schedule ═════ */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-serif text-foreground">Monthly Depreciation by Vehicle</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="text-[10px] uppercase tracking-wider">Vehicle</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider text-right">Monthly Depreciation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trackedKeys.map((k) => (
                  <TableRow key={k} className="border-border/30 hover:bg-secondary/30">
                    <TableCell className="text-xs font-medium text-foreground">{vehicleDisplayName[k]}</TableCell>
                    <TableCell className="text-xs tabular-nums text-right text-muted-foreground">{formatAED(monthlyDepreciation[k])}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="border-border/50 bg-secondary/30 font-semibold">
                  <TableCell className="text-xs text-foreground">TOTAL</TableCell>
                  <TableCell className="text-xs tabular-nums text-right text-foreground">{formatAED(TOTAL_MONTHLY_DEPR)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <div className={`rounded-lg border p-3 ${incomeVsDepr >= 0 ? "border-success/30 bg-success/5" : "border-loss/30 bg-loss/5"}`}>
              <p className={`text-xs ${incomeVsDepr >= 0 ? "text-success" : "text-loss"}`}>
                Monthly depreciation {formatAED(TOTAL_MONTHLY_DEPR)} — fleet must generate at least this much income to avoid real value destruction.
                {" "}{selectedMonth} income {formatAED(curIncome)} = {incomeVsDepr >= 0 ? "surplus" : "shortfall"} of {formatAED(Math.abs(incomeVsDepr))}
                {incomeVsDepr >= 0 ? " 🟢" : " 🔴"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Divider />

        {/* ═════ SECTION 12 — Monthly Income by Vehicle (table with depr & real profit) ═════ */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-serif text-foreground">Monthly Income by Vehicle — Detail</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50 hover:bg-transparent">
                    <TableHead className="text-[10px] uppercase tracking-wider">Month</TableHead>
                    {trackedKeys.map((k) => (
                      <TableHead key={k} className="text-[10px] uppercase tracking-wider text-right">{vehicleLabels[k]}</TableHead>
                    ))}
                    <TableHead className="text-[10px] uppercase tracking-wider text-right font-bold">Total</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-right">vs Depr</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthlyIncome.slice(Math.max(0, selectedIdx - 11), selectedIdx + 1).map((row) => {
                    const diff = row.total - TOTAL_MONTHLY_DEPR;
                    const isSel = row.month === selectedMonth;
                    return (
                      <TableRow key={row.month} className={isSel ? "bg-primary/10 hover:bg-primary/15 border-primary/30" : "border-border/30 hover:bg-secondary/30"}>
                        <TableCell className={`text-xs font-medium whitespace-nowrap ${isSel ? "text-primary font-bold" : "text-foreground"}`}>{row.month}</TableCell>
                        {trackedKeys.map((k) => {
                          const v = (row as any)[k] as number;
                          return (
                            <TableCell key={k} className={`text-xs tabular-nums text-right ${v === 0 ? "text-loss/60" : "text-muted-foreground"}`}>
                              {v > 0 ? formatAED(v) : "—"}
                            </TableCell>
                          );
                        })}
                        <TableCell className="text-xs tabular-nums text-right font-medium text-success">{formatAED(row.total)}</TableCell>
                        <TableCell className={`text-xs tabular-nums text-right font-semibold ${diff >= 0 ? "text-success" : "text-loss"}`}>{formatAED(diff)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default MkAutosCarsDashboard;
