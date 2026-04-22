import { useState, useMemo, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp, TrendingDown, DollarSign, Wallet, Users, AlertTriangle, Building, ArrowLeft,
  Activity, Gauge, Layers, Banknote, Repeat, Percent,
} from "lucide-react";
import SummaryCard from "@/components/SummaryCard";
import MonthFilter from "@/components/MonthFilter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
  LineChart, Line, CartesianGrid, Legend, ComposedChart, Area, AreaChart,
} from "recharts";
import { otcSummary, monthlyPL, expenseBreakdown, partnerCapital, formatAED, getExpensesForMonth } from "@/data/otcData";
import ExecutiveSummary, { ExecMonthInput } from "@/components/ExecutiveSummary";

// Estimated average spread for OTC USDT/AED trades. Used to back-calculate
// trading volume from spread/commission revenue (gross profit).
const ASSUMED_SPREAD = 0.004; // 0.4%

// Whole-AED formatter — no decimals, comma separators. Used where decimals
// would clutter large round figures (e.g. counterparty loss tracker).
const formatAEDWhole = (value: number) => {
  const prefix = value < 0 ? "-AED " : "AED ";
  return `${prefix}${Math.abs(Math.round(value)).toLocaleString("en-US")}`;
};

const OtcDashboard = () => {
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [showAllMonths, setShowAllMonths] = useState(false);

  const months = useMemo(() => monthlyPL.map((m) => m.month), []);

  const filteredPL = useMemo(
    () => selectedMonth === "all" ? monthlyPL : monthlyPL.filter((m) => m.month === selectedMonth),
    [selectedMonth]
  );

  // === OTC-specific KPIs ===
  // Trading Income (revenue from spread / commission) = grossProfit
  const totalTradingIncome = filteredPL.reduce((s, m) => s + m.grossProfit, 0);
  const totalDirectCosts = filteredPL.reduce((s, m) => s + m.cashExpenses, 0);
  const totalScam = filteredPL.reduce((s, m) => s + m.scam, 0);
  const totalNetProfit = filteredPL.reduce((s, m) => s + m.netProfit, 0);
  const profitableMonths = filteredPL.filter((m) => m.netProfit > 0).length;

  const totalVolume = totalTradingIncome / ASSUMED_SPREAD;
  const avgSpreadPct = totalVolume > 0 ? (totalTradingIncome / totalVolume) * 100 : 0;
  const costToRevenue = totalTradingIncome > 0 ? (totalDirectCosts / totalTradingIncome) * 100 : 0;

  // Capital deployment: how much of total partner capital is committed (not sitting as cash)
  // Basis = total partner funding (gross capital injected), since net-capital can be skewed by withdrawals.
  const capitalBasis = partnerCapital.totalFunding;
  const capitalDeployed = Math.max(0, capitalBasis - otcSummary.cashPosition);
  const utilizationPct = capitalBasis > 0 ? (capitalDeployed / capitalBasis) * 100 : 0;

  // Burn rate from last 6 closed months (excluding scam outliers)
  const last6 = monthlyPL.slice(-6);
  const avgMonthlyBurn = last6.reduce((s, m) => s + m.cashExpenses, 0) / Math.max(1, last6.length);
  const daysRunway = avgMonthlyBurn > 0
    ? Math.round((otcSummary.cashPosition / avgMonthlyBurn) * 30)
    : 999;

  // Break-even: minimum monthly volume needed to cover average monthly costs at current spread
  const breakEvenVolume = avgMonthlyBurn / ASSUMED_SPREAD;

  // Risk Dashboard metrics — when a month is selected, look back over the
  // 12-month window ending at that month; otherwise the most recent 12.
  const selectedIdx = selectedMonth === "all"
    ? monthlyPL.length - 1
    : Math.max(0, monthlyPL.findIndex((m) => m.month === selectedMonth));
  const last12 = useMemo(
    () => monthlyPL.slice(Math.max(0, selectedIdx - 11), selectedIdx + 1),
    [selectedIdx]
  );
  const negativeMonths = last12.filter((m) => m.netProfit < 0).length;
  const MIN_LIQUIDITY = 500_000; // AED 500K minimum
  const liquidityHealthy = otcSummary.cashPosition >= MIN_LIQUIDITY;
  const liquidityRatio = (otcSummary.cashPosition / MIN_LIQUIDITY) * 100;

  // === Trend data: last 6 months ending at the selected month (or last 6 overall when "all") ===
  const trendMonths = useMemo(() => {
    const end = selectedIdx + 1;
    const start = Math.max(0, end - 6);
    return monthlyPL.slice(start, end);
  }, [selectedIdx]);

  const chartData = useMemo(
    () =>
      trendMonths.map((m) => {
        const vol = m.grossProfit / ASSUMED_SPREAD;
        const displayName = m.month.replace("Jan-Dec 2024", "2024");
        return {
          name: displayName,
          month: m.month,
          isSelected: selectedMonth !== "all" && m.month === selectedMonth,
          income: Math.round(m.grossProfit),
          costs: Math.round(m.cashExpenses),
          scam: Math.round(m.scam),
          net: Math.round(m.netProfit),
          volume: Math.round(vol),
          volumeM: parseFloat((vol / 1_000_000).toFixed(2)),
          revPerM: vol > 0 ? Math.round(m.grossProfit / (vol / 1_000_000)) : 0,
          spreadPct: vol > 0 ? parseFloat(((m.grossProfit / vol) * 100).toFixed(3)) : 0,
          ratio: m.grossProfit > 0 ? parseFloat(((m.cashExpenses / m.grossProfit) * 100).toFixed(1)) : 0,
        };
      }),
    [trendMonths, selectedMonth]
  );

  // Spread trend uses same window now
  const spreadTrend = chartData;

  // Theme colors for chart highlight
  const COLOR_GOLD = "hsl(43, 74%, 52%)";
  const COLOR_GOLD_DIM = "hsl(43, 30%, 35%)";
  const COLOR_BLUE = "hsl(200, 50%, 45%)";
  const COLOR_BLUE_DIM = "hsl(200, 25%, 30%)";
  const COLOR_GREEN = "hsl(160, 60%, 45%)";

  // Custom dot for line charts: enlarged + bright when selected
  const makeHighlightDot = (color: string) => (props: any) => {
    const { cx, cy, payload } = props;
    if (cx == null || cy == null) return null;
    if (payload?.isSelected) {
      return (
        <g>
          <circle cx={cx} cy={cy} r={7} fill={COLOR_GOLD} stroke="hsl(220 16% 11%)" strokeWidth={2} />
          <circle cx={cx} cy={cy} r={3} fill="hsl(220 16% 11%)" />
        </g>
      );
    }
    return <circle cx={cx} cy={cy} r={3} fill={color} />;
  };

  const expensePieData = useMemo(
    () => expenseBreakdown.filter((e) => e.amount > 0).map((e) => ({ name: e.category, value: Math.round(e.amount) })),
    []
  );

  const pieColors = [
    "hsl(43, 74%, 52%)",
    "hsl(200, 50%, 45%)",
    "hsl(160, 50%, 40%)",
    "hsl(280, 40%, 50%)",
    "hsl(20, 60%, 50%)",
    "hsl(43, 40%, 30%)",
    "hsl(0, 50%, 50%)",
  ];

  // Partner exposure (capital funding = "counterparty" exposure for an OTC desk)
  const partners = [
    { name: "Maria", funding: partnerCapital.maria.funding, net: partnerCapital.maria.netPosition },
    { name: "Ahmad", funding: partnerCapital.ahmad.funding, net: partnerCapital.ahmad.netPosition },
  ];
  const totalPartnerFunding = partners.reduce((s, p) => s + p.funding, 0);
  const partnersByExposure = [...partners].sort((a, b) => b.funding - a.funding);
  const concentrationRisk = partnersByExposure[0].funding / totalPartnerFunding > 0.55;

  const isFiltered = selectedMonth !== "all";
  const periodLabel = isFiltered ? selectedMonth : "Inception to Date";

  // ── Period-snapshot data (closing balances). ONLY months listed here have
  // a verified end-of-period snapshot. Any other selected month → dash (-).
  // "all" / Inception to Date resolves to the latest snapshot month.
  // NOTE: this is the single source of truth for: Cash Position, AR (client
  // funds in use), capital deployed, capital utilization, liquidity buffer.
  type PeriodSnapshot = {
    cashPosition: number;
    ar: number; // negative = owed to clients
    totalCash: number;
  };
  const periodSnapshots: Record<string, PeriodSnapshot> = {
    "Mar 2026": {
      cashPosition: otcSummary.cashPosition,
      ar: otcSummary.ar,
      totalCash: otcSummary.totalCash,
    },
  };
  const LATEST_SNAPSHOT_MONTH = "Mar 2026";
  const snapshotKey = selectedMonth === "all" ? LATEST_SNAPSHOT_MONTH : selectedMonth;
  const snapshot: PeriodSnapshot | null = periodSnapshots[snapshotKey] ?? null;
  const DASH = "—";
  const NA_TOOLTIP = "Data not available for this period";

  // Per-month verified trading metrics — single source of truth, used by KPI
  // cards, spread/volume subtitles and the realized-spread note.
  type MonthSpec = {
    volumeLabel: string;
    volumeSubtitle: string;
    txCount: number;
    spreadPct: number;
    revPerM: number;
    realizedSpread: number;
  };
  const monthSpecifics: Record<string, MonthSpec> = {
    "Mar 2026": {
      volumeLabel: "USDT 36.6M",
      volumeSubtitle: "18.7M bought + 17.9M sold · 23/31 active days",
      txCount: 196,
      spreadPct: 0.307,
      revPerM: 3066,
      realizedSpread: 198690,
    },
    "Feb 2026": {
      volumeLabel: "USDT 50.2M",
      volumeSubtitle: "22.9M bought + 27.3M sold · 24/28 active days",
      txCount: 254,
      spreadPct: 0.260,
      revPerM: 2599,
      realizedSpread: 162891,
    },
  };
  const activeSpec: MonthSpec | null = monthSpecifics[selectedMonth] ?? null;
  // Effective spread for any subtitle/headline that references "@ X%".
  // Falls back to the modeled assumption when no per-month spec exists.
  const effectiveSpreadPct = activeSpec ? activeSpec.spreadPct : ASSUMED_SPREAD * 100;

  const formatAEDCompact = (v: number) => {
    const abs = Math.abs(v);
    const prefix = v < 0 ? "-AED " : "AED ";
    if (abs >= 1_000_000) return `${prefix}${(abs / 1_000_000).toFixed(2)}M`;
    if (abs >= 1_000) return `${prefix}${(abs / 1_000).toFixed(1)}K`;
    return `${prefix}${abs.toFixed(0)}`;
  };

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
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
              <Building className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-serif font-bold text-foreground tracking-tight">OTC USDT/AED Desk</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Crypto Exchange · Trading Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MonthFilter months={months} value={selectedMonth} onChange={setSelectedMonth} />
            <Badge variant="secondary" className="text-xs">Currency: AED</Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* === Executive Summary (Performance Verdict) === */}
        <ExecutiveSummary
          businessName="OTC USDT/AED Desk"
          format={formatAED}
          currentMonth={selectedMonth === "all" ? undefined : selectedMonth}
          history={monthlyPL.map<ExecMonthInput>((m) => ({
            month: m.month,
            revenue: m.grossProfit,
            costs: m.cashExpenses + m.scam,
            grossProfit: m.grossProfit,
            netProfit: m.netProfit,
          }))}
          reasons={{
            revenueUp: "Higher trading volume / wider spreads",
            revenueDown: "Lower trading volume or spread compression",
            costsContext: "Direct trading costs + losses",
          }}
          extraIssues={(cur, prev) => {
            const issues: string[] = [];
            const m = monthlyPL.find((x) => x.month === cur.month);
            if (m && m.scam > 0) issues.push(`Counterparty / scam loss recorded: ${formatAED(m.scam)}`);
            if (prev) {
              const curVol = cur.revenue / ASSUMED_SPREAD;
              const prevVol = prev.revenue / ASSUMED_SPREAD;
              if (prevVol > 0) {
                const volDelta = ((curVol - prevVol) / prevVol) * 100;
                if (volDelta < -15) issues.push(`Trading volume down ${Math.abs(volDelta).toFixed(1)}% MoM`);
                if (volDelta > 15 && cur.netProfit < (prev.netProfit || 0)) {
                  issues.push("Volume up but margin compression detected");
                }
              }
            }
            return issues;
          }}
        />

        {/* === Ahmad's Capital Position — only in All Time === */}
        {!isFiltered && (
          <Card className="border-border/50 bg-gradient-to-r from-blue-500/10 to-blue-700/5 backdrop-blur-sm">
            <CardContent className="p-5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-medium tracking-wider uppercase text-muted-foreground">Ahmad's Capital Position</p>
                  <p className="text-2xl font-bold font-serif text-foreground">{formatAED(partnerCapital.ahmad.funding)}</p>
                  <p className="text-[10px] text-muted-foreground">Capital Funding</p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Withdrawals</p>
                <p className="text-lg font-bold font-serif text-loss">{formatAED(partnerCapital.ahmad.withdrawal)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Trading Loss Reserve (50%)</p>
                <p className="text-lg font-bold font-serif text-loss">{formatAED(partnerCapital.ahmad.scamLoss)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Expenses (50%)</p>
                <p className="text-lg font-bold font-serif text-loss">{formatAED(partnerCapital.ahmad.expenses)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Capital Position</p>
                <p className={`text-lg font-bold font-serif ${partnerCapital.ahmad.capitalPosition >= 0 ? "text-success" : "text-loss"}`}>{formatAED(partnerCapital.ahmad.capitalPosition)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Profit Share (50%)</p>
                <p className="text-lg font-bold font-serif text-success">{formatAED(partnerCapital.ahmad.profitShare)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground font-semibold">Net Position</p>
                <p className={`text-xl font-bold font-serif ${partnerCapital.ahmad.netPosition >= 0 ? "text-success" : "text-loss"}`}>{formatAED(partnerCapital.ahmad.netPosition)}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* === OTC-Specific KPI Cards (6) === */}
        {(() => {
          // Per-month verified trading metrics. Add new months here.
          const monthSpecifics: Record<string, {
            volumeLabel: string;
            volumeSubtitle: string;
            txCount: number;
            spreadPct: number;
            revPerM: number;
            realizedSpread: number;
          }> = {
            "Mar 2026": {
              volumeLabel: "USDT 36.6M",
              volumeSubtitle: "18.7M bought + 17.9M sold · 23/31 active days",
              txCount: 196,
              spreadPct: 0.307,
              revPerM: 3066,
              realizedSpread: 198690,
            },
            "Feb 2026": {
              volumeLabel: "USDT 50.2M",
              volumeSubtitle: "22.9M bought + 27.3M sold · 24/28 active days",
              txCount: 254,
              spreadPct: 0.260,
              revPerM: 2599,
              realizedSpread: 162891,
            },
          };
          const spec = monthSpecifics[selectedMonth];
          const hasSpec = !!spec;

          const displaySpread = hasSpec ? spec.spreadPct : avgSpreadPct;
          const spreadSubtitle = hasSpec
            ? `Weighted avg across ${spec.txCount} transactions`
            : "Income ÷ Volume";

          return (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <SummaryCard
                title={`Trading Volume (${periodLabel})`}
                value={hasSpec ? spec.volumeLabel : formatAEDCompact(totalVolume)}
                subtitle={hasSpec
                  ? spec.volumeSubtitle
                  : `USDT↔AED · est. @ ${(ASSUMED_SPREAD * 100).toFixed(2)}% spread`}
                icon={Repeat}
              />
              <SummaryCard
                title="Trading Income"
                value={formatAEDCompact(totalTradingIncome)}
                subtitle={hasSpec
                  ? `AED ${spec.revPerM.toLocaleString()} per 1M USDT traded`
                  : "Spread / commission earned"}
                icon={DollarSign}
                trend="up"
              />
              <SummaryCard
                title="Net Profit"
                value={formatAEDCompact(totalNetProfit)}
                subtitle={isFiltered ? (totalNetProfit >= 0 ? "Profitable month" : "Loss month") : `${profitableMonths}/${filteredPL.length} profitable months`}
                icon={TrendingUp}
                trend={totalNetProfit >= 0 ? "up" : "down"}
              />
              <SummaryCard
                title="Average Spread %"
                value={`${displaySpread.toFixed(3)}%`}
                subtitle={spreadSubtitle}
                icon={Percent}
              />
              <SummaryCard
                title="Cost-to-Revenue"
                value={`${costToRevenue.toFixed(1)}%`}
                subtitle={costToRevenue < 25 ? "Target: <25% ✅ Excellent" : costToRevenue < 40 ? "Target: <25% ⚠ Acceptable" : "Target: <25% ❌ High"}
                icon={Gauge}
                trend={costToRevenue < 30 ? "up" : "down"}
              />
              <SummaryCard
                title="Cash Position"
                value={snapshot ? formatAEDCompact(snapshot.cashPosition) : DASH}
                subtitle={snapshot ? "AED available for trading" : NA_TOOLTIP}
                icon={Banknote}
              />
            </div>
          );
        })()}

        {/* Profit method note */}
        {(() => {
          const realized: Record<string, number> = {
            "Mar 2026": 198690,
            "Feb 2026": 162891,
          };
          const r = realized[selectedMonth];
          return (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 flex items-start gap-2">
              <Activity className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="text-foreground font-medium">Profit method:</span> Calculated on USDT wallet balance movement (closing minus opening).
                {r ? <> Realized spread income for {selectedMonth}: <span className="text-primary font-semibold">{formatAEDWhole(r)}</span>.</> : null}
              </p>
            </div>
          );
        })()}

        {/* Gold divider */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        {/* === Trading Activity === */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-serif font-semibold uppercase tracking-wider text-foreground">Trading Activity</h2>
            <span className="text-[10px] text-muted-foreground">· Volume estimated from spread revenue @ {(ASSUMED_SPREAD * 100).toFixed(2)}%</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-serif text-foreground">Monthly Trading Volume (AED M)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 40, left: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 14% 18%)" />
                    <XAxis dataKey="name" tick={{ fill: "hsl(220 10% 50%)", fontSize: 9 }} angle={-45} textAnchor="end" />
                    <YAxis tick={{ fill: "hsl(220 10% 50%)", fontSize: 10 }} tickFormatter={(v) => `${v}M`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(220 16% 11%)", border: "1px solid hsl(220 14% 18%)", borderRadius: "8px", color: "hsl(40 20% 90%)", fontSize: 12 }}
                      formatter={(value: number) => [`AED ${value.toFixed(2)}M`, "Volume"]}
                    />
                    <Bar dataKey="volumeM" name="Volume (AED M)" fill={COLOR_GOLD_DIM} radius={[4, 4, 0, 0]}>
                      {chartData.map((d, i) => (
                        <Cell key={i} fill={d.isSelected ? COLOR_GOLD : COLOR_GOLD_DIM} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-[10px] text-muted-foreground mt-2">
                  Note: <span className="text-foreground font-medium">"2024"</span> bar aggregates 12 months (Jan–Dec 2024) into a single period — that's why it appears as a spike vs individual monthly bars after.
                </p>
                <div className="mt-3 p-3 rounded-lg border border-primary/30 bg-primary/5 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Break-even Volume / Month</p>
                    <p className="text-base font-bold font-serif text-primary">{formatAEDCompact(breakEvenVolume)}</p>
                  </div>
                  <p className="text-[10px] text-muted-foreground text-right max-w-[55%]">
                    Min monthly volume to cover {formatAEDCompact(avgMonthlyBurn)} avg costs @ {(ASSUMED_SPREAD * 100).toFixed(2)}% spread
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-serif text-foreground">Revenue per AED 1M Traded</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 40, left: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 14% 18%)" />
                    <XAxis dataKey="name" tick={{ fill: "hsl(220 10% 50%)", fontSize: 9 }} angle={-45} textAnchor="end" />
                    <YAxis tick={{ fill: "hsl(220 10% 50%)", fontSize: 10 }} tickFormatter={(v) => `${(v/1000).toFixed(1)}k`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(220 16% 11%)", border: "1px solid hsl(220 14% 18%)", borderRadius: "8px", color: "hsl(40 20% 90%)", fontSize: 12 }}
                      formatter={(value: number) => [formatAED(value), "Per AED 1M"]}
                    />
                    <Line type="monotone" dataKey="revPerM" stroke={COLOR_GREEN} strokeWidth={2} dot={makeHighlightDot(COLOR_GREEN)} />
                  </LineChart>
                </ResponsiveContainer>
                <p className="text-[10px] text-muted-foreground mt-2">
                  <span className="text-success font-medium">✓ Consistent spread maintained</span> — flat line indicates the desk holds a stable 0.40% margin (modeled assumption; wire live spread data to detect compression/expansion).
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Gold divider */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        {/* === Trading Activity Calendar (per-month) === */}
        {(() => {
          type CalCfg = {
            monthName: string;
            monthAbbrev: string;
            totalDays: number;
            firstDayOffset: number; // 0=Sun … 6=Sat
            zeroDays: number[];
            consecutiveZero: number[];
            consecutiveZeroLabel?: string;
            zeroNote?: string; // e.g. "Sunday closures — consistent weekly pattern"
            bestDay: { label: string; aed: number };
            worstDay: { label: string; aed: number };
            avgDailyProfit?: number; // active days only
            avgDailyVolumeUSDT?: number;
            totalCounterparties?: number;
          };
          const calendars: Record<string, CalCfg> = {
            "Mar 2026": {
              monthName: "March 2026",
              monthAbbrev: "Mar",
              totalDays: 31,
              firstDayOffset: 0, // Mar 1, 2026 = Sunday
              zeroDays: [1, 8, 15, 16, 20, 21, 22, 29],
              consecutiveZero: [15, 16, 20, 21, 22],
              consecutiveZeroLabel: "Mar 15, 16, 20, 21, 22",
              bestDay: { label: "Mar 30", aed: 109835 },
              worstDay: { label: "Mar 31", aed: -18039 },
              avgDailyProfit: 8639,
            },
            "Feb 2026": {
              monthName: "February 2026",
              monthAbbrev: "Feb",
              totalDays: 28,
              firstDayOffset: 0, // Feb 1, 2026 = Sunday
              zeroDays: [1, 8, 15, 22],
              consecutiveZero: [],
              zeroNote: "Sunday closures — consistent weekly pattern",
              bestDay: { label: "—", aed: 0 },
              worstDay: { label: "—", aed: 0 },
              avgDailyVolumeUSDT: 2_093_516,
              totalCounterparties: 54,
            },
          };
          const cfg = calendars[selectedMonth];
          if (!cfg) return null;

          const zeroSet = new Set(cfg.zeroDays);
          const consecSet = new Set(cfg.consecutiveZero);
          const days = Array.from({ length: cfg.totalDays }, (_, i) => i + 1);
          const activeCount = cfg.totalDays - zeroSet.size;
          const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];
          const formatUSDT = (v: number) => `${v.toLocaleString("en-US")} USDT`;

          return (
            <>
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  <h2 className="text-sm font-serif font-semibold uppercase tracking-wider text-foreground">
                    Trading Activity Calendar — {cfg.monthName}
                  </h2>
                </div>
                <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                  <CardContent className="p-5 space-y-5">
                    {/* Calendar grid */}
                    <div>
                      <div className="grid grid-cols-7 gap-2 mb-2">
                        {dayLabels.map((d, i) => (
                          <div key={i} className="text-[10px] uppercase tracking-wider text-muted-foreground text-center font-medium">
                            {d}
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-2">
                        {Array.from({ length: cfg.firstDayOffset }).map((_, i) => (
                          <div key={`pad-${i}`} />
                        ))}
                        {days.map((d) => {
                          const isZero = zeroSet.has(d);
                          const isConsecZero = consecSet.has(d);
                          const zeroTitle = cfg.zeroNote ?? "Zero trading day";
                          return (
                            <div
                              key={d}
                              title={
                                isConsecZero
                                  ? `${cfg.monthAbbrev} ${d} — Consecutive zero day`
                                  : isZero
                                  ? `${cfg.monthAbbrev} ${d} — ${zeroTitle}`
                                  : `${cfg.monthAbbrev} ${d} — Active trading day`
                              }
                              className={[
                                "aspect-square rounded-md flex items-center justify-center text-xs font-medium border transition-colors",
                                isZero
                                  ? "bg-muted/40 text-muted-foreground border-border/40"
                                  : "bg-success/15 text-success border-success/40",
                                isConsecZero ? "!border-amber-500 border-2 ring-1 ring-amber-500/30" : "",
                              ].join(" ")}
                            >
                              {d}
                            </div>
                          );
                        })}
                      </div>
                      {/* Legend */}
                      <div className="flex flex-wrap items-center gap-4 mt-4 text-[10px] text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <span className="h-3 w-3 rounded-sm bg-success/15 border border-success/40 inline-block" />
                          <span>Active trading day</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="h-3 w-3 rounded-sm bg-muted/40 border border-border/40 inline-block" />
                          <span>Zero trading day{cfg.zeroNote ? ` — ${cfg.zeroNote}` : ""}</span>
                        </div>
                        {cfg.consecutiveZero.length > 0 && (
                          <div className="flex items-center gap-1.5">
                            <span className="h-3 w-3 rounded-sm border-2 border-amber-500 inline-block" />
                            <span>Consecutive zero days{cfg.consecutiveZeroLabel ? ` (${cfg.consecutiveZeroLabel})` : ""}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-border/40">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Active Trading Days</p>
                        <p className="text-lg font-serif font-bold text-foreground">{activeCount} <span className="text-sm text-muted-foreground font-normal">/ {cfg.totalDays}</span></p>
                        {cfg.zeroNote && (
                          <p className="text-[10px] text-muted-foreground">{zeroSet.size} zero days (all Sundays)</p>
                        )}
                      </div>
                      {cfg.bestDay.label !== "—" ? (
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Best Day</p>
                          <p className="text-lg font-serif font-bold text-success">{formatAEDWhole(cfg.bestDay.aed)}</p>
                          <p className="text-[10px] text-muted-foreground">{cfg.bestDay.label}</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Avg Daily Volume</p>
                          <p className="text-lg font-serif font-bold text-primary tabular-nums">{cfg.avgDailyVolumeUSDT ? formatUSDT(cfg.avgDailyVolumeUSDT) : "—"}</p>
                          <p className="text-[10px] text-muted-foreground">Across active days</p>
                        </div>
                      )}
                      {cfg.worstDay.label !== "—" ? (
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Worst Day</p>
                          <p className="text-lg font-serif font-bold text-loss">{formatAEDWhole(cfg.worstDay.aed)}</p>
                          <p className="text-[10px] text-muted-foreground">{cfg.worstDay.label}</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total Counterparties</p>
                          <p className="text-lg font-serif font-bold text-foreground tabular-nums">{cfg.totalCounterparties ?? "—"}</p>
                          <p className="text-[10px] text-muted-foreground">Active during month</p>
                        </div>
                      )}
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{cfg.avgDailyProfit != null ? "Avg Daily Profit" : "Zero Days"}</p>
                        {cfg.avgDailyProfit != null ? (
                          <>
                            <p className="text-lg font-serif font-bold text-primary">{formatAEDWhole(cfg.avgDailyProfit)}</p>
                            <p className="text-[10px] text-muted-foreground">Active days only</p>
                          </>
                        ) : (
                          <>
                            <p className="text-lg font-serif font-bold text-foreground">{zeroSet.size} <span className="text-sm text-muted-foreground font-normal">/ {cfg.totalDays}</span></p>
                            <p className="text-[10px] text-muted-foreground">{cfg.zeroNote ? "All on Sundays" : "Non-trading days"}</p>
                          </>
                        )}
                      </div>
                    </div>

                    <p className="text-[11px] italic text-muted-foreground leading-relaxed">
                      Daily profit calculated on USDT wallet movement (closing minus opening balance). Large AED cash flow swings on individual days reflect pass-through USDT inventory trades and do not represent actual profit or loss.
                    </p>
                  </CardContent>
                </Card>
              </section>

              {/* Gold divider */}
              <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
            </>
          );
        })()}

        {/* === Liquidity & Capital Position === */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Banknote className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-serif font-semibold uppercase tracking-wider text-foreground">Liquidity & Capital Position</h2>
          </div>

          {(() => {
            const mariaCap = partnerCapital.maria.netPosition;
            const ahmadCap = partnerCapital.ahmad.netPosition;
            const ownCapital = mariaCap + ahmadCap;
            const arFloat = Math.abs(otcSummary.ar);
            const totalFunds = ownCapital + arFloat;
            const floatPct = totalFunds > 0 ? (arFloat / totalFunds) * 100 : 0;
            const ownRunwayDays = avgMonthlyBurn > 0
              ? Math.round((ownCapital / avgMonthlyBurn) * 30)
              : 999;

            const floatBadge = floatPct > 50
              ? { label: "Critical", cls: "border-loss/40 bg-loss/10 text-loss" }
              : floatPct > 30
              ? { label: "Elevated", cls: "border-amber-500/40 bg-amber-500/10 text-amber-400" }
              : { label: "Healthy", cls: "border-success/40 bg-success/10 text-success" };

            const imbalancePct = Math.max(mariaCap, ahmadCap) > 0
              ? Math.abs(mariaCap - ahmadCap) / Math.max(mariaCap, ahmadCap) * 100
              : 0;
            const lowerPartner = mariaCap < ahmadCap ? "Maria" : "Ahmad";

            const alerts: { tone: "warn" | "danger"; text: string }[] = [];
            if (imbalancePct > 20) {
              alerts.push({
                tone: "warn",
                text: `Capital imbalance between partners (${lowerPartner} ${imbalancePct.toFixed(1)}% lower) — review profit distribution`,
              });
            }
            if (floatPct > 35) {
              alerts.push({
                tone: "danger",
                text: `High client float dependency (${floatPct.toFixed(1)}% of total funds) — liquidity risk`,
              });
            }

            // Cumulative net profit from inception through the selected month.
            // When "all"/Inception to Date is selected, selectedIdx already points to last available month.
            const cumulativeNetProfit = monthlyPL
              .slice(0, selectedIdx + 1)
              .reduce((sum, m) => sum + m.netProfit, 0);
            const partnerProfitShare = cumulativeNetProfit / 2;
            const periodLabelForWaterfall = selectedMonth === "all"
              ? (monthlyPL[monthlyPL.length - 1]?.month ?? "Inception to Date")
              : selectedMonth;

            const waterfallRows = [
              {
                key: "injected",
                label: "Initial Capital Injected",
                sub: "Total capital ever injected into the business",
                maria: partnerCapital.maria.funding,
                ahmad: partnerCapital.ahmad.funding,
                total: partnerCapital.maria.funding + partnerCapital.ahmad.funding,
                tone: "neutral" as const,
              },
              {
                key: "withdrawals",
                label: "Less: Partner Withdrawals",
                sub: "Capital withdrawn to date",
                maria: -partnerCapital.maria.withdrawal,
                ahmad: -partnerCapital.ahmad.withdrawal,
                total: -(partnerCapital.maria.withdrawal + partnerCapital.ahmad.withdrawal),
                tone: "negative" as const,
              },
              {
                key: "net-capital",
                label: "Net Capital Remaining",
                sub: "Net capital injection remaining in business",
                maria: partnerCapital.maria.net,
                ahmad: partnerCapital.ahmad.net,
                total: partnerCapital.maria.net + partnerCapital.ahmad.net,
                tone: "subtotal" as const,
              },
              {
                key: "profit-share",
                label: `Plus: Cumulative Net Profit (through ${periodLabelForWaterfall})`,
                sub: "Sum of monthly net profits from inception, split 50/50",
                maria: partnerProfitShare,
                ahmad: partnerProfitShare,
                total: cumulativeNetProfit,
                tone: "positive" as const,
              },
              {
                key: "working",
                label: `Working Capital as at ${periodLabelForWaterfall}`,
                sub: "Net capital remaining + cumulative net profit through selected period",
                maria: partnerCapital.maria.net + partnerProfitShare,
                ahmad: partnerCapital.ahmad.net + partnerProfitShare,
                total: partnerCapital.maria.net + partnerCapital.ahmad.net + cumulativeNetProfit,
                tone: "total" as const,
              },
            ];

            const rowClasses = (tone: string) => {
              switch (tone) {
                case "negative": return "text-loss";
                case "positive": return "text-success";
                case "subtotal": return "bg-primary/10 border-y border-primary/40 text-primary font-semibold";
                case "total": return "bg-primary text-primary-foreground font-bold";
                default: return "text-foreground";
              }
            };

            return (
              <>
                {/* Capital Waterfall Table */}
                <Card className="border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-serif text-foreground">Capital Waterfall — Partner Journey</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border/50">
                          <TableHead className="w-[42%]">Stage</TableHead>
                          <TableHead className="text-right">Maria</TableHead>
                          <TableHead className="text-right">Ahmad</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {waterfallRows.map((r) => (
                          <TableRow key={r.key} className={`${rowClasses(r.tone)} hover:bg-transparent`}>
                            <TableCell className="align-top">
                              <p className="text-sm">{r.label}</p>
                              <p className={`text-[10px] mt-0.5 ${r.tone === "total" ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{r.sub}</p>
                            </TableCell>
                            <TableCell className="text-right font-serif tabular-nums">{formatAEDWhole(r.maria)}</TableCell>
                            <TableCell className="text-right font-serif tabular-nums">{formatAEDWhole(r.ahmad)}</TableCell>
                            <TableCell className="text-right font-serif tabular-nums">{formatAEDWhole(r.total)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* ROW 2 — Funding structure */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <Card className="border-amber-500/40 bg-amber-500/5 backdrop-blur-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Client Funds in Use</p>
                        <AlertTriangle className="h-4 w-4 text-amber-400" />
                      </div>
                      <p className="text-2xl font-bold font-serif text-amber-400 mt-2">{formatAEDCompact(arFloat)}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">AR float — owed to clients, not own capital</p>
                    </CardContent>
                  </Card>
                  <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Funds Available</p>
                      <p className="text-2xl font-bold font-serif text-foreground mt-2">{formatAEDCompact(totalFunds)}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">Own Capital + Client Float</p>
                    </CardContent>
                  </Card>
                  <Card className={`backdrop-blur-sm border ${floatBadge.cls}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Client Float % of Total</p>
                        <Badge variant="outline" className={`text-[10px] ${floatBadge.cls}`}>{floatBadge.label}</Badge>
                      </div>
                      <p className="text-2xl font-bold font-serif mt-2">{floatPct.toFixed(1)}%</p>
                      <p className="text-[10px] text-muted-foreground mt-1">Thresholds: amber &gt;30% · red &gt;50%</p>
                    </CardContent>
                  </Card>
                  {(() => {
                    const netFreeCapital = otcSummary.cashPosition;
                    const coverage = arFloat > 0 ? netFreeCapital / arFloat : 999;
                    const tone = coverage >= 2 ? "text-success" : coverage >= 1 ? "text-primary" : "text-loss";
                    const badge = coverage >= 2
                      ? { label: "Healthy", cls: "border-success/40 text-success" }
                      : coverage >= 1
                      ? { label: "Watch", cls: "border-primary/40 text-primary" }
                      : { label: "Risk", cls: "border-loss/40 text-loss" };
                    return (
                      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Liquidity Buffer</p>
                            <Badge variant="outline" className={`text-[10px] ${badge.cls}`}>{badge.label}</Badge>
                          </div>
                          <p className={`text-2xl font-bold font-serif mt-2 ${tone}`}>{formatAEDCompact(netFreeCapital)}</p>
                          <p className="text-[10px] text-muted-foreground mt-1 leading-tight">
                            Net Free Capital — available after covering all client obligations.
                          </p>
                          <p className={`text-[11px] mt-1.5 font-medium ${tone}`}>
                            Client Float Coverage: {coverage >= 999 ? "∞" : `${coverage.toFixed(1)}x`}
                          </p>
                          <p className="text-[10px] text-muted-foreground leading-tight">
                            Own capital covers client obligations {coverage >= 999 ? "fully" : `${coverage.toFixed(1)} times over`}.
                          </p>
                        </CardContent>
                      </Card>
                    );
                  })()}
                </div>

                {/* ROW 3 — Alert bar */}
                {alerts.length > 0 && (
                  <div className="space-y-2">
                    {alerts.map((a, i) => (
                      <div
                        key={i}
                        className={`w-full rounded-lg border p-3 flex items-start gap-2 ${
                          a.tone === "danger"
                            ? "border-loss/40 bg-loss/10 text-loss"
                            : "border-amber-500/40 bg-amber-500/10 text-amber-400"
                        }`}
                      >
                        <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                        <p className="text-xs font-medium">{a.text}</p>
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-[11px] italic text-muted-foreground">
                  Working capital = net capital injected after withdrawals + cumulative profit share. Client float of {formatAEDWhole(arFloat)} is excluded as it represents client obligations not distributable capital.
                </p>

                {/* Supplementary: Capital deployment metrics retained */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">AED Cash on Hand</p>
                      <p className="text-2xl font-bold font-serif text-foreground mt-1">{formatAEDCompact(otcSummary.cashPosition)}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">Total incl. AR: {formatAEDCompact(otcSummary.totalCash)}</p>
                    </CardContent>
                  </Card>
                  <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Capital Deployed</p>
                      <p className={`text-2xl font-bold font-serif mt-1 ${capitalDeployed >= 0 ? "text-foreground" : "text-loss"}`}>
                        {formatAEDCompact(capitalDeployed)}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1">Total funding − cash on hand</p>
                    </CardContent>
                  </Card>
                  <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Capital Utilization</p>
                      <p className="text-2xl font-bold font-serif text-foreground mt-1">{utilizationPct.toFixed(1)}%</p>
                      <div className="mt-2 h-1.5 w-full rounded-full bg-secondary/40 overflow-hidden">
                        <div className="h-full bg-primary transition-all" style={{ width: `${Math.min(100, utilizationPct)}%` }} />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">Of {formatAEDCompact(capitalBasis)} total partner funding</p>
                    </CardContent>
                  </Card>
                </div>
              </>
            );
          })()}
        </section>

        {/* Gold divider */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        {/* === Spread & Margin Analysis === */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Percent className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-serif font-semibold uppercase tracking-wider text-foreground">Spread & Margin Analysis</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-serif text-foreground">Monthly Spread % Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={spreadTrend} margin={{ top: 5, right: 5, bottom: 40, left: 5 }}>
                    <defs>
                      <linearGradient id="spreadFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(43, 74%, 52%)" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="hsl(43, 74%, 52%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 14% 18%)" />
                    <XAxis dataKey="name" tick={{ fill: "hsl(220 10% 50%)", fontSize: 9 }} angle={-45} textAnchor="end" />
                    <YAxis tick={{ fill: "hsl(220 10% 50%)", fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(220 16% 11%)", border: "1px solid hsl(220 14% 18%)", borderRadius: "8px", color: "hsl(40 20% 90%)", fontSize: 12 }}
                      formatter={(value: number) => [`${value}%`, "Spread"]}
                    />
                    <Area type="monotone" dataKey="spreadPct" stroke={COLOR_GOLD} strokeWidth={2} fill="url(#spreadFill)" dot={makeHighlightDot(COLOR_GOLD)} />
                  </AreaChart>
                </ResponsiveContainer>
                <p className="text-[10px] text-muted-foreground mt-2">
                  Flat line indicates stable assumed spread; live data would show real margin compression.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-serif text-foreground">Revenue vs Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <ComposedChart data={chartData} margin={{ top: 5, right: 5, bottom: 40, left: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 14% 18%)" />
                    <XAxis dataKey="name" tick={{ fill: "hsl(220 10% 50%)", fontSize: 9 }} angle={-45} textAnchor="end" />
                    <YAxis
                      yAxisId="left"
                      tick={{ fill: COLOR_BLUE, fontSize: 10 }}
                      tickFormatter={(v) => `${v}M`}
                      label={{ value: "Volume (AED M)", angle: -90, position: "insideLeft", fill: COLOR_BLUE, fontSize: 10, dy: 40 }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{ fill: COLOR_GOLD, fontSize: 10 }}
                      tickFormatter={(v) => `${(v/1000).toFixed(0)}k`}
                      domain={["dataMin - 20000", "dataMax + 20000"]}
                      label={{ value: "Trading Income (AED)", angle: 90, position: "insideRight", fill: COLOR_GOLD, fontSize: 10, dy: -50 }}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(220 16% 11%)", border: "1px solid hsl(220 14% 18%)", borderRadius: "8px", color: "hsl(40 20% 90%)", fontSize: 12 }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar yAxisId="left" dataKey="volumeM" name="Volume (AED M)" fill={COLOR_BLUE} radius={[4, 4, 0, 0]}>
                      {chartData.map((d, i) => (
                        <Cell key={i} fill={d.isSelected ? COLOR_GOLD : COLOR_BLUE_DIM} />
                      ))}
                    </Bar>
                    <Line yAxisId="right" type="monotone" dataKey="income" name="Trading Income (AED)" stroke={COLOR_GOLD} strokeWidth={2} dot={makeHighlightDot(COLOR_GOLD)} />
                  </ComposedChart>
                </ResponsiveContainer>
                <p className="text-[10px] text-muted-foreground mt-2">
                  Watch for volume rising while income flattens → margin squeeze.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Gold divider */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        {/* === Counterparty / Partner Exposure === */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-serif font-semibold uppercase tracking-wider text-foreground">Counterparty / Partner Exposure</h2>
          </div>
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-5">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {partnersByExposure.slice(0, 2).map((p, idx) => {
                  const sharePct = (p.funding / totalPartnerFunding) * 100;
                  const isTopRisky = idx === 0 && sharePct > 55;
                  return (
                    <div key={p.name} className={`p-4 rounded-lg border ${isTopRisky ? "border-loss/40 bg-loss/5" : "border-border/40 bg-secondary/20"}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs uppercase tracking-wider text-muted-foreground">#{idx + 1} Capital Partner</span>
                        <Badge variant={isTopRisky ? "destructive" : "secondary"} className="text-[10px]">
                          {sharePct.toFixed(1)}% share
                        </Badge>
                      </div>
                      <p className="text-lg font-serif font-bold text-foreground">{p.name}</p>
                      <div className="mt-3 space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Capital Funding</span>
                          <span className="tabular-nums font-medium text-foreground">{formatAEDCompact(p.funding)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Profit Contribution (50%) · {periodLabel}</span>
                          <span className={`tabular-nums font-medium ${totalNetProfit >= 0 ? "text-success" : "text-loss"}`}>{formatAEDCompact(totalNetProfit / 2)}</span>
                        </div>
                        <div className="flex justify-between text-xs pt-1.5 border-t border-border/30">
                          <span className="text-muted-foreground">Net Position</span>
                          <span className={`tabular-nums font-bold ${p.net >= 0 ? "text-success" : "text-loss"}`}>{formatAEDCompact(p.net)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Direct Clients (trading flow, no capital exposure) */}
                <div className="p-4 rounded-lg border border-border/40 bg-secondary/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase tracking-wider text-muted-foreground">Trading Flow</span>
                    <Badge variant="secondary" className="text-[10px]">Walk-in volume</Badge>
                  </div>
                  <p className="text-lg font-serif font-bold text-foreground">Direct Clients</p>
                  <div className="mt-3 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Capital Funding</span>
                      <span className="tabular-nums font-medium text-muted-foreground">—</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Volume Contribution</span>
                      <span className="tabular-nums font-medium text-foreground">~100%</span>
                    </div>
                    <div className="flex justify-between text-xs pt-1.5 border-t border-border/30">
                      <span className="text-muted-foreground">Trading Income · {periodLabel}</span>
                      <span className={`tabular-nums font-bold ${totalTradingIncome >= 0 ? "text-success" : "text-loss"}`}>{formatAEDCompact(totalTradingIncome)}</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2 leading-tight">
                    All USDT↔AED trades flow through direct/walk-in clients — Maria & Ahmad are capital-funding partners only.
                  </p>
                </div>
              </div>
              {concentrationRisk ? (
                <div className="mt-4 p-3 rounded-lg border border-loss/40 bg-loss/10 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-loss mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-loss">Concentration Risk</p>
                    <p className="text-[11px] text-muted-foreground">
                      Top partner holds {((partnersByExposure[0].funding / totalPartnerFunding) * 100).toFixed(1)}% of capital exposure — above the 55% concentration threshold.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-4 p-3 rounded-lg border border-success/30 bg-success/5 flex items-start gap-2">
                  <Users className="h-4 w-4 text-success mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    Partner exposure is balanced — no single counterparty above the 55% concentration threshold.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Gold divider */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        {/* === Counterparty Concentration Risk (per-month) === */}
        {(() => {
          type CpCfg = {
            monthName: string;
            list: { name: string; pct: number }[];
            totalActive: number;
            comparisonNote?: ReactNode;
          };
          const cpData: Record<string, CpCfg> = {
            "Mar 2026": {
              monthName: "March 2026",
              list: [
                { name: "NICK", pct: 22.8 },
                { name: "KKAA", pct: 16.8 },
                { name: "UZPAY", pct: 13.8 },
                { name: "ROLEX", pct: 11.2 },
                { name: "ROBERT", pct: 7.1 },
              ],
              totalActive: 28,
            },
            "Feb 2026": {
              monthName: "February 2026",
              list: [
                { name: "NICK", pct: 26.7 },
                { name: "ROLEX", pct: 16.3 },
                { name: "UZPAY", pct: 15.0 },
                { name: "KKAA", pct: 14.3 },
                { name: "GABE", pct: 5.4 },
              ],
              totalActive: 54,
              comparisonNote: (
                <>
                  <p className="font-medium text-foreground mb-1">February vs March 2026 — comparative insight</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    <li>February had higher volume (50.2M USDT) vs March (36.6M) but lower spread (0.260% vs 0.307%).</li>
                    <li>February had more diversified counterparties (54) vs March (28).</li>
                    <li>February zero days all fell on Sundays — consistent weekly pattern.</li>
                    <li>March had 8 zero days including 5 consecutive mid-month — irregular pattern.</li>
                  </ul>
                </>
              ),
            },
          };
          const cfg = cpData[selectedMonth];
          if (!cfg) return null;
          const top3 = cfg.list.slice(0, 3).reduce((s, c) => s + c.pct, 0);
          const isCritical = top3 > 50;
          const maxPct = Math.max(...cfg.list.map((c) => c.pct));

          return (
            <>
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <h2 className="text-sm font-serif font-semibold uppercase tracking-wider text-foreground">
                    Counterparty Concentration Risk — {cfg.monthName}
                  </h2>
                </div>
                <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Top 5 counterparties by trading volume</span>
                      <Badge variant="secondary" className="text-[10px]">
                        {cfg.totalActive} active counterparties
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      {cfg.list.map((c, i) => {
                        const widthPct = (c.pct / maxPct) * 100;
                        const isTop3 = i < 3;
                        return (
                          <div key={c.name} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-medium text-foreground tabular-nums">
                                <span className="text-muted-foreground mr-2">#{i + 1}</span>
                                {c.name}
                              </span>
                              <span className={`font-bold font-serif tabular-nums ${isTop3 ? "text-primary" : "text-foreground"}`}>
                                {c.pct.toFixed(1)}%
                              </span>
                            </div>
                            <div className="h-2.5 w-full rounded bg-secondary/40 overflow-hidden">
                              <div
                                className={`h-full rounded transition-all ${isTop3 ? "bg-primary" : "bg-muted-foreground/40"}`}
                                style={{ width: `${widthPct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-3 border-t border-border/30 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">Top 3 Concentration</span>
                      <span className="text-lg font-bold font-serif text-loss tabular-nums">{top3.toFixed(1)}% of all volume</span>
                    </div>

                    {isCritical && (
                      <div className="rounded-lg border border-loss/40 bg-loss/10 p-3 flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-loss mt-0.5 shrink-0" />
                        <p className="text-xs font-medium text-loss">
                          Critical — top 3 counterparties control over 50% of volume. Diversify or set per-counterparty exposure limits.
                        </p>
                      </div>
                    )}

                    {cfg.comparisonNote && (
                      <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground leading-relaxed">
                        {cfg.comparisonNote}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </section>

              <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
            </>
          );
        })()}

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-serif font-semibold uppercase tracking-wider text-foreground">Risk Dashboard</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Counterparty concentration */}
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Top Counterparty</p>
                  <Badge variant="secondary" className="text-[10px]">Volume share</Badge>
                </div>
                <p className="text-2xl font-bold font-serif text-foreground">~100%</p>
                <p className="text-[10px] text-muted-foreground mt-1 leading-tight">
                  All trading volume routes through direct walk-in clients — no single named client exposure tracked yet.
                </p>
                <p className="text-[10px] text-primary mt-1.5">⚠ Recommend tracking per-client volume to surface concentration.</p>
              </CardContent>
            </Card>

            {/* Negative months */}
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Loss-Making Months</p>
                  <Badge variant={negativeMonths >= 4 ? "destructive" : negativeMonths >= 2 ? "secondary" : "default"} className="text-[10px]">
                    {negativeMonths >= 4 ? "High" : negativeMonths >= 2 ? "Watch" : "Healthy"}
                  </Badge>
                </div>
                <p className={`text-2xl font-bold font-serif ${negativeMonths >= 4 ? "text-loss" : "text-foreground"}`}>
                  {negativeMonths} <span className="text-sm text-muted-foreground font-normal">/ {last12.length}</span>
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Months with negative net profit · {last12.length}-month window {isFiltered ? `ending ${selectedMonth}` : "(latest)"}
                </p>
              </CardContent>
            </Card>

            {/* Liquidity */}
            <Card className={`border-border/50 backdrop-blur-sm ${liquidityHealthy ? "bg-card/80" : "bg-loss/5 border-loss/30"}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Liquidity vs Minimum</p>
                  <Badge variant={liquidityHealthy ? "default" : "destructive"} className="text-[10px]">
                    {liquidityHealthy ? "✓ Above min" : "✗ Below min"}
                  </Badge>
                </div>
                <p className={`text-2xl font-bold font-serif ${liquidityHealthy ? "text-success" : "text-loss"}`}>
                  {(liquidityRatio / 100).toFixed(1)}×
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {formatAEDCompact(otcSummary.cashPosition)} cash vs {formatAEDCompact(MIN_LIQUIDITY)} min threshold
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Gold divider */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        {/* === 6-Month Trend === */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-serif text-foreground">Monthly Trading Income vs Direct Costs</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 40, left: 5 }}>
                  <XAxis dataKey="name" tick={{ fill: "hsl(220 10% 50%)", fontSize: 9 }} angle={-45} textAnchor="end" axisLine={{ stroke: "hsl(220 14% 18%)" }} tickLine={false} />
                  <YAxis tick={{ fill: "hsl(220 10% 50%)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(220 16% 11%)", border: "1px solid hsl(220 14% 18%)", borderRadius: "8px", color: "hsl(40 20% 90%)", fontSize: 12 }} formatter={(value: number) => [formatAED(value), ""]} />
                  <Bar dataKey="income" name="Trading Income" fill={COLOR_GOLD_DIM} radius={[4, 4, 0, 0]}>
                    {chartData.map((d, i) => (
                      <Cell key={`inc-${i}`} fill={d.isSelected ? COLOR_GOLD : COLOR_GOLD_DIM} />
                    ))}
                  </Bar>
                  <Bar dataKey="costs" name="Direct Trading Costs" fill={COLOR_BLUE_DIM} radius={[4, 4, 0, 0]}>
                    {chartData.map((d, i) => (
                      <Cell key={`cost-${i}`} fill={d.isSelected ? COLOR_BLUE : COLOR_BLUE_DIM} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-serif text-foreground">Net Profit Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 40, left: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 14% 18%)" />
                  <XAxis dataKey="name" tick={{ fill: "hsl(220 10% 50%)", fontSize: 9 }} angle={-45} textAnchor="end" axisLine={{ stroke: "hsl(220 14% 18%)" }} tickLine={false} />
                  <YAxis tick={{ fill: "hsl(220 10% 50%)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(220 16% 11%)", border: "1px solid hsl(220 14% 18%)", borderRadius: "8px", color: "hsl(40 20% 90%)", fontSize: 12 }} formatter={(value: number) => [formatAED(value), ""]} />
                  <Line type="monotone" dataKey="net" name="Net Profit" stroke={COLOR_GOLD} strokeWidth={2} dot={makeHighlightDot(COLOR_GOLD)} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* === Operational Insights === */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Cost-to-Revenue Ratio Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 30, left: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 14% 18%)" />
                  <XAxis dataKey="name" tick={{ fill: "hsl(220 10% 50%)", fontSize: 9 }} angle={-45} textAnchor="end" />
                  <YAxis tick={{ fill: "hsl(220 10% 50%)", fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(220 16% 11%)", border: "1px solid hsl(220 14% 18%)", borderRadius: "8px", color: "hsl(40 20% 90%)", fontSize: 12 }} formatter={(value: number) => [`${value}%`, "Cost-to-Revenue"]} />
                  <Line type="monotone" dataKey="ratio" stroke={COLOR_GOLD} strokeWidth={2} dot={makeHighlightDot(COLOR_GOLD)} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Scam / Counterparty Loss Tracker */}
          <Card className="border-loss/20 bg-loss/5 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-loss" />
                Counterparty Loss Tracker
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(() => {
                const lossesUpTo = monthlyPL.slice(0, selectedIdx + 1).filter((m) => m.scam > 0);
                const lossesTotal = lossesUpTo.reduce((s, m) => s + m.scam, 0);
                const incomeUpTo = monthlyPL.slice(0, selectedIdx + 1).reduce((s, m) => s + m.grossProfit, 0);
                const netUpTo = monthlyPL.slice(0, selectedIdx + 1).reduce((s, m) => s + m.netProfit, 0);
                return (
                  <>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Total Counterparty Losses {isFiltered ? `(through ${selectedMonth})` : "(YTD)"}
                      </p>
                      <p className="text-2xl font-bold font-serif text-loss">{formatAEDWhole(lossesTotal)}</p>
                    </div>
                    <div className="space-y-2">
                      {lossesUpTo.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic p-2">No counterparty losses recorded in this period.</p>
                      ) : lossesUpTo.map((m) => (
                        <div key={m.month} className="flex justify-between items-center text-xs p-2 rounded bg-loss/10">
                          <span className="text-muted-foreground">{m.month}</span>
                          <span className="font-bold text-loss">{formatAEDWhole(m.scam)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-2 border-t border-border/30">
                      <p className="text-xs text-muted-foreground">Impact on Net Profit</p>
                      <p className="text-sm font-semibold text-foreground">
                        Without losses: {formatAEDWhole(netUpTo + lossesTotal)} net profit
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Losses represent {incomeUpTo > 0 ? ((lossesTotal / incomeUpTo) * 100).toFixed(1) : "0.0"}% of trading income
                      </p>
                    </div>
                  </>
                );
              })()}
            </CardContent>
          </Card>
        </div>

        {/* === Expense Breakdown (period-aware) === */}
        {(() => {
          const periodExpenses = getExpensesForMonth(isFiltered ? selectedMonth : "all");
          const labelMap: Record<string, string> = {
            "General Exp": "General Expenses",
            "Car Exp": "Car Expenses",
            "Salaries": "Salaries",
            "TRX": "TRX",
            "DFZ Rent": "DFZ Rent",
            "Gatepass": "Gate Pass",
          };
          const expenseCats = periodExpenses.map((c) => ({
            name: labelMap[c.category] ?? c.category,
            amount: c.amount,
          }));
          const totalAbs = expenseCats.reduce((s, c) => s + Math.abs(c.amount), 0);
          const periodTotal = expenseCats.reduce((s, c) => s + c.amount, 0);
          const maxAbs = Math.max(1, ...expenseCats.map((c) => Math.abs(c.amount)));
          const largest = expenseCats.reduce(
            (m, c) => (Math.abs(c.amount) > Math.abs(m.amount) ? c : m),
            { name: "", amount: 0 }
          );
          const title = isFiltered
            ? `Expense Breakdown — ${selectedMonth}`
            : "YTD Expense Breakdown by Category";
          return (
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-serif text-foreground">{title}</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Source: Expenses tab · {isFiltered ? `${selectedMonth} total` : "YTD total"}: {formatAEDWhole(periodTotal)}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {expenseCats
                  .slice()
                  .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
                  .map((cat) => {
                    const pct = totalAbs > 0 ? (Math.abs(cat.amount) / totalAbs) * 100 : 0;
                    const widthPct = maxAbs > 0 ? (Math.abs(cat.amount) / maxAbs) * 100 : 0;
                    const isZero = cat.amount === 0;
                    const isLargest = !isZero && cat.name === largest.name && Math.abs(largest.amount) > 0;
                    const isNegative = cat.amount < 0;
                    const barColor = isZero
                      ? "bg-muted-foreground/15"
                      : isLargest
                      ? "bg-primary"
                      : isNegative
                      ? "bg-profit/60"
                      : "bg-muted-foreground/40";
                    return (
                      <div key={cat.name} className={`space-y-1 ${isZero ? "opacity-40" : ""}`}>
                        <div className="flex items-center justify-between text-xs">
                          <span className={`font-medium ${isLargest ? "text-primary" : "text-foreground"}`}>
                            {cat.name}
                            {isLargest && <span className="ml-2 text-[10px] uppercase tracking-wider">Largest cost</span>}
                            {isZero && <span className="ml-2 text-[10px] uppercase tracking-wider text-muted-foreground">No activity</span>}
                          </span>
                          <span className="tabular-nums text-muted-foreground">
                            <span className={`font-semibold ${isNegative ? "text-profit" : "text-foreground"}`}>
                              {formatAEDWhole(cat.amount)}
                            </span>
                            <span className="ml-2 text-[10px]">({pct.toFixed(1)}%)</span>
                          </span>
                        </div>
                        <div className="h-2 w-full rounded bg-secondary/40 overflow-hidden">
                          <div
                            className={`h-full ${barColor} rounded transition-all`}
                            style={{ width: `${widthPct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                <p className="text-[10px] text-muted-foreground italic pt-2 border-t border-border/30">
                  Negative TRX reflects net recoveries on transaction fees. Percentages calculated against absolute total.
                </p>
              </CardContent>
            </Card>
          );
        })()}

        {/* === Tabs === */}
        <Tabs defaultValue="monthly" className="space-y-4">
          <TabsList className="bg-secondary/50">
            <TabsTrigger value="monthly">Monthly P&L</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="capital">Partners</TabsTrigger>
          </TabsList>

          <TabsContent value="monthly">
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-serif text-foreground">Monthly Profit & Loss</CardTitle>
                {isFiltered && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setShowAllMonths((v) => !v)}
                  >
                    {showAllMonths ? "Show Selected Only" : "Show All Months"}
                  </Button>
                )}
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/50 hover:bg-transparent">
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider">Month</TableHead>
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">Trading Income</TableHead>
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">Direct Trading Costs</TableHead>
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">Counterparty Loss</TableHead>
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">Net Profit</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(isFiltered && !showAllMonths
                        ? monthlyPL.filter((m) => m.month === selectedMonth)
                        : monthlyPL
                      ).map((row) => {
                        const isSel = selectedMonth !== "all" && row.month === selectedMonth;
                        return (
                          <TableRow
                            key={row.month}
                            className={`border-border/30 hover:bg-secondary/30 ${isSel ? "bg-primary/15 hover:bg-primary/20 border-l-2 border-l-primary" : ""}`}
                          >
                            <TableCell className={`text-sm font-medium ${isSel ? "text-primary font-bold" : "text-foreground"}`}>
                              {row.month}{isSel && " ●"}
                            </TableCell>
                            <TableCell className="text-sm tabular-nums text-right text-foreground">{formatAED(row.grossProfit)}</TableCell>
                            <TableCell className="text-sm tabular-nums text-right text-muted-foreground">{formatAED(row.cashExpenses)}</TableCell>
                            <TableCell className="text-sm tabular-nums text-right text-loss">{row.scam > 0 ? formatAED(row.scam) : "—"}</TableCell>
                            <TableCell className={`text-sm tabular-nums text-right font-medium ${row.netProfit >= 0 ? "text-success" : "text-loss"}`}>{formatAED(row.netProfit)}</TableCell>
                          </TableRow>
                        );
                      })}
                      {(() => {
                        const upTo = monthlyPL.slice(0, selectedIdx + 1);
                        const tIncome = upTo.reduce((s, m) => s + m.grossProfit, 0);
                        const tCosts = upTo.reduce((s, m) => s + m.cashExpenses, 0);
                        const tScam = upTo.reduce((s, m) => s + m.scam, 0);
                        const tNet = upTo.reduce((s, m) => s + m.netProfit, 0);
                        return (
                          <TableRow className="border-border/50 bg-secondary/30 font-semibold">
                            <TableCell className="text-sm text-foreground">
                              {isFiltered ? `Running Total (through ${selectedMonth})` : "Total (YTD)"}
                            </TableCell>
                            <TableCell className="text-sm tabular-nums text-right text-foreground">{formatAED(tIncome)}</TableCell>
                            <TableCell className="text-sm tabular-nums text-right text-muted-foreground">{formatAED(tCosts)}</TableCell>
                            <TableCell className="text-sm tabular-nums text-right text-loss">{formatAED(tScam)}</TableCell>
                            <TableCell className={`text-sm tabular-nums text-right font-bold ${tNet >= 0 ? "text-success" : "text-loss"}`}>{formatAED(tNet)}</TableCell>
                          </TableRow>
                        );
                      })()}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Expense Breakdown */}
          <TabsContent value="expenses">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-serif text-foreground">Expense Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col lg:flex-row items-center gap-4">
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={expensePieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value" stroke="none">
                          {expensePieData.map((_, i) => (
                            <Cell key={i} fill={pieColors[i % pieColors.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: "hsl(220 16% 11%)", border: "1px solid hsl(220 14% 18%)", borderRadius: "8px", color: "hsl(40 20% 90%)", fontSize: 12 }} formatter={(value: number) => [formatAED(value), ""]} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2 w-full lg:w-auto">
                      {expenseBreakdown.map((item, i) => (
                        <div key={item.category} className="flex items-center gap-2 text-xs">
                          <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: pieColors[i % pieColors.length] }} />
                          <span className="text-muted-foreground whitespace-nowrap">{item.category}</span>
                          <span className={`ml-auto tabular-nums font-medium ${item.amount >= 0 ? "text-foreground" : "text-success"}`}>{formatAED(item.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-serif text-foreground">Expense Categories</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border/50 hover:bg-transparent">
                          <TableHead className="text-xs text-muted-foreground uppercase tracking-wider">Category</TableHead>
                          <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">Amount (AED)</TableHead>
                          <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">% of Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {expenseBreakdown.map((row) => {
                          const totalPositive = expenseBreakdown.filter((e) => e.amount > 0).reduce((s, e) => s + e.amount, 0);
                          return (
                            <TableRow key={row.category} className="border-border/30 hover:bg-secondary/30">
                              <TableCell className="text-sm font-medium text-foreground">{row.category}</TableCell>
                              <TableCell className={`text-sm tabular-nums text-right ${row.amount >= 0 ? "text-foreground" : "text-success"}`}>{formatAED(row.amount)}</TableCell>
                              <TableCell className="text-sm tabular-nums text-right text-muted-foreground">{row.amount > 0 ? ((row.amount / totalPositive) * 100).toFixed(1) : "—"}%</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Partners / Capital */}
          <TabsContent value="capital">
            <div className="space-y-6">
              {[
                { name: "Maria", ...partnerCapital.maria },
                { name: "Ahmad", ...partnerCapital.ahmad },
              ].map((p) => (
                <Card key={p.name} className="border-border/50 bg-card/80 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-serif text-foreground">{p.name}</CardTitle>
                      <Badge variant={p.netPosition >= 0 ? "default" : "destructive"} className="text-xs">
                        Net: {formatAED(p.netPosition)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
                      <div className="p-3 rounded-lg bg-secondary/30">
                        <p className="text-muted-foreground mb-1">Capital Funding</p>
                        <p className="tabular-nums font-bold text-foreground">{formatAED(p.funding)}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-secondary/30">
                        <p className="text-muted-foreground mb-1">Withdrawals</p>
                        <p className="tabular-nums font-bold text-loss">{formatAED(p.withdrawal)}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-secondary/30">
                        <p className="text-muted-foreground mb-1">Counterparty Loss (50%)</p>
                        <p className="tabular-nums font-bold text-loss">{formatAED(p.scamLoss)}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-secondary/30">
                        <p className="text-muted-foreground mb-1">Expenses (50%)</p>
                        <p className="tabular-nums font-bold text-loss">{formatAED(p.expenses)}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-secondary/30">
                        <p className="text-muted-foreground mb-1">Capital Position</p>
                        <p className={`tabular-nums font-bold ${p.capitalPosition >= 0 ? "text-success" : "text-loss"}`}>{formatAED(p.capitalPosition)}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-secondary/30">
                        <p className="text-muted-foreground mb-1">Profit Share (50%)</p>
                        <p className="tabular-nums font-bold text-success">{formatAED(p.profitShare)}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                        <p className="text-muted-foreground mb-1 font-semibold">Net Position</p>
                        <p className={`tabular-nums font-bold ${p.netPosition >= 0 ? "text-success" : "text-loss"}`}>{formatAED(p.netPosition)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-serif font-semibold text-primary">Combined Capital Position</span>
                      <span className={`text-sm tabular-nums font-bold ${partnerCapital.equityPosition >= 0 ? "text-success" : "text-loss"}`}>{formatAED(partnerCapital.equityPosition)}</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                      <div>
                        <p className="text-muted-foreground">Total Funding</p>
                        <p className="tabular-nums font-medium text-foreground">{formatAED(partnerCapital.totalFunding)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total Withdrawal</p>
                        <p className="tabular-nums font-medium text-loss">{formatAED(partnerCapital.totalWithdrawal)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Counterparty Loss</p>
                        <p className="tabular-nums font-medium text-loss">{formatAED(partnerCapital.scamLoss)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total Expenses</p>
                        <p className="tabular-nums font-medium text-muted-foreground">{formatAED(partnerCapital.totalExpenses)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default OtcDashboard;
