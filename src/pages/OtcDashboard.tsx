import { useState, useMemo } from "react";
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
import { otcSummary, monthlyPL, expenseBreakdown, partnerCapital, formatAED } from "@/data/otcData";
import ExecutiveSummary, { ExecMonthInput } from "@/components/ExecutiveSummary";

// Estimated average spread for OTC USDT/AED trades. Used to back-calculate
// trading volume from spread/commission revenue (gross profit).
const ASSUMED_SPREAD = 0.004; // 0.4%

const OtcDashboard = () => {
  const [selectedMonth, setSelectedMonth] = useState("all");

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

  // Capital deployment
  const capitalDeployed = otcSummary.netCapital - otcSummary.cashPosition;
  const utilizationPct = otcSummary.netCapital > 0
    ? (Math.max(0, capitalDeployed) / otcSummary.netCapital) * 100
    : 0;

  // Burn rate from last 6 closed months (excluding scam outliers)
  const last6 = monthlyPL.slice(-6);
  const avgMonthlyBurn = last6.reduce((s, m) => s + m.cashExpenses, 0) / Math.max(1, last6.length);
  const daysRunway = avgMonthlyBurn > 0
    ? Math.round((otcSummary.cashPosition / avgMonthlyBurn) * 30)
    : 999;

  const chartData = useMemo(
    () =>
      filteredPL.map((m) => {
        const vol = m.grossProfit / ASSUMED_SPREAD;
        return {
          name: m.month.replace("Jan-Dec 2024", "2024"),
          income: Math.round(m.grossProfit),
          costs: Math.round(m.cashExpenses),
          scam: Math.round(m.scam),
          net: Math.round(m.netProfit),
          volume: Math.round(vol),
          volumeM: parseFloat((vol / 1_000_000).toFixed(2)),
          revPerM: vol > 0 ? Math.round(m.grossProfit / (vol / 1_000_000)) : 0,
          spreadPct: vol > 0 ? parseFloat(((m.grossProfit / vol) * 100).toFixed(3)) : 0,
        };
      }),
    [filteredPL]
  );

  // 6-month spread trend (full history, not filtered)
  const spreadTrend = useMemo(
    () => monthlyPL.map((m) => {
      const vol = m.grossProfit / ASSUMED_SPREAD;
      return {
        name: m.month.replace("Jan-Dec 2024", "2024"),
        spreadPct: vol > 0 ? parseFloat(((m.grossProfit / vol) * 100).toFixed(3)) : 0,
        volumeM: parseFloat((vol / 1_000_000).toFixed(2)),
        income: Math.round(m.grossProfit),
      };
    }),
    []
  );

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
  const periodLabel = isFiltered ? selectedMonth : "YTD";

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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <SummaryCard
            title={`Trading Volume (${periodLabel})`}
            value={formatAEDCompact(totalVolume)}
            subtitle={`USDT↔AED · est. @ ${(ASSUMED_SPREAD * 100).toFixed(2)}% spread`}
            icon={Repeat}
          />
          <SummaryCard
            title="Trading Income"
            value={formatAEDCompact(totalTradingIncome)}
            subtitle="Spread / commission earned"
            icon={DollarSign}
            trend="up"
          />
          <SummaryCard
            title="Net Profit"
            value={formatAEDCompact(totalNetProfit)}
            subtitle={`${profitableMonths}/${filteredPL.length} profitable months`}
            icon={TrendingUp}
            trend={totalNetProfit >= 0 ? "up" : "down"}
          />
          <SummaryCard
            title="Average Spread %"
            value={`${avgSpreadPct.toFixed(3)}%`}
            subtitle="Income ÷ Volume"
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
            value={formatAEDCompact(otcSummary.cashPosition)}
            subtitle="AED available for trading"
            icon={Banknote}
          />
        </div>

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
                    <Bar dataKey="volumeM" name="Volume (AED M)" fill="hsl(43, 74%, 52%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
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
                    <Line type="monotone" dataKey="revPerM" stroke="hsl(160, 60%, 45%)" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
                <p className="text-[10px] text-muted-foreground mt-2">
                  Spread efficiency. Trending down = margin compression.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Gold divider */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        {/* === Liquidity Position === */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Banknote className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-serif font-semibold uppercase tracking-wider text-foreground">Liquidity Position</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">AED Cash Available</p>
                <p className="text-2xl font-bold font-serif text-foreground mt-1">{formatAEDCompact(otcSummary.cashPosition)}</p>
                <p className="text-[10px] text-muted-foreground mt-1">Total cash incl. AR: {formatAEDCompact(otcSummary.totalCash)}</p>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Capital Deployed</p>
                <p className={`text-2xl font-bold font-serif mt-1 ${capitalDeployed >= 0 ? "text-foreground" : "text-loss"}`}>
                  {formatAEDCompact(capitalDeployed)}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">Net capital − cash on hand</p>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Capital Utilization</p>
                <p className="text-2xl font-bold font-serif text-foreground mt-1">{utilizationPct.toFixed(1)}%</p>
                <div className="mt-2 h-1.5 w-full rounded-full bg-secondary/40 overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${Math.min(100, utilizationPct)}%` }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">Of {formatAEDCompact(otcSummary.netCapital)} net capital</p>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Cash Runway</p>
                <p className={`text-2xl font-bold font-serif mt-1 ${daysRunway > 365 ? "text-success" : daysRunway > 90 ? "text-foreground" : "text-loss"}`}>
                  {daysRunway > 999 ? "999+" : daysRunway} days
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">@ {formatAEDCompact(avgMonthlyBurn)}/mo burn (last 6mo)</p>
              </CardContent>
            </Card>
          </div>
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
                    <Area type="monotone" dataKey="spreadPct" stroke="hsl(43, 74%, 52%)" strokeWidth={2} fill="url(#spreadFill)" />
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
                    <YAxis yAxisId="left" tick={{ fill: "hsl(220 10% 50%)", fontSize: 10 }} tickFormatter={(v) => `${v}M`} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fill: "hsl(220 10% 50%)", fontSize: 10 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(220 16% 11%)", border: "1px solid hsl(220 14% 18%)", borderRadius: "8px", color: "hsl(40 20% 90%)", fontSize: 12 }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar yAxisId="left" dataKey="volumeM" name="Volume (AED M)" fill="hsl(200, 50%, 45%)" radius={[4, 4, 0, 0]} />
                    <Line yAxisId="right" type="monotone" dataKey="income" name="Trading Income (AED)" stroke="hsl(43, 74%, 52%)" strokeWidth={2} dot={{ r: 3 }} />
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
                {partnersByExposure.slice(0, 3).map((p, idx) => {
                  const sharePct = (p.funding / totalPartnerFunding) * 100;
                  const isTopRisky = idx === 0 && sharePct > 55;
                  return (
                    <div key={p.name} className={`p-4 rounded-lg border ${isTopRisky ? "border-loss/40 bg-loss/5" : "border-border/40 bg-secondary/20"}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs uppercase tracking-wider text-muted-foreground">#{idx + 1} Partner</span>
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
                          <span className="text-muted-foreground">Profit Contribution (50%)</span>
                          <span className="tabular-nums font-medium text-success">{formatAEDCompact(totalNetProfit / 2)}</span>
                        </div>
                        <div className="flex justify-between text-xs pt-1.5 border-t border-border/30">
                          <span className="text-muted-foreground">Net Position</span>
                          <span className={`tabular-nums font-bold ${p.net >= 0 ? "text-success" : "text-loss"}`}>{formatAEDCompact(p.net)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
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
                  <Bar dataKey="income" name="Trading Income" fill="hsl(43, 74%, 52%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="costs" name="Direct Trading Costs" fill="hsl(200, 50%, 45%)" radius={[4, 4, 0, 0]} />
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
                  <Line type="monotone" dataKey="net" name="Net Profit" stroke="hsl(43, 74%, 52%)" strokeWidth={2} dot={{ r: 4, fill: "hsl(43, 74%, 52%)" }} />
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
                <LineChart data={monthlyPL.filter(m => !m.month.includes("Dec 2024")).map(m => ({
                  name: m.month.replace("Jan-Dec 2024", "2024"),
                  ratio: m.grossProfit > 0 ? parseFloat(((m.cashExpenses / m.grossProfit) * 100).toFixed(1)) : 0,
                  grossProfit: m.grossProfit,
                }))} margin={{ top: 5, right: 20, bottom: 30, left: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 14% 18%)" />
                  <XAxis dataKey="name" tick={{ fill: "hsl(220 10% 50%)", fontSize: 9 }} angle={-45} textAnchor="end" />
                  <YAxis tick={{ fill: "hsl(220 10% 50%)", fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(220 16% 11%)", border: "1px solid hsl(220 14% 18%)", borderRadius: "8px", color: "hsl(40 20% 90%)", fontSize: 12 }} formatter={(value: number) => [`${value}%`, "Cost-to-Revenue"]} />
                  <Line type="monotone" dataKey="ratio" stroke="hsl(43, 74%, 52%)" strokeWidth={2} dot={{ r: 3, fill: "hsl(43, 74%, 52%)" }} />
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
              <div>
                <p className="text-xs text-muted-foreground">Total Counterparty Losses</p>
                <p className="text-2xl font-bold font-serif text-loss">{formatAED(otcSummary.scamYTD)}</p>
              </div>
              <div className="space-y-2">
                {monthlyPL.filter(m => m.scam > 0).map(m => (
                  <div key={m.month} className="flex justify-between items-center text-xs p-2 rounded bg-loss/10">
                    <span className="text-muted-foreground">{m.month}</span>
                    <span className="font-bold text-loss">{formatAED(m.scam)}</span>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-border/30">
                <p className="text-xs text-muted-foreground">Impact on Net Profit</p>
                <p className="text-sm font-semibold text-foreground">
                  Without losses: {formatAED(otcSummary.netProfitYTD + otcSummary.scamYTD)} net profit
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Losses represent {((otcSummary.scamYTD / otcSummary.grossProfitYTD) * 100).toFixed(1)}% of trading income
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* === Tabs === */}
        <Tabs defaultValue="monthly" className="space-y-4">
          <TabsList className="bg-secondary/50">
            <TabsTrigger value="monthly">Monthly P&L</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="capital">Partners</TabsTrigger>
          </TabsList>

          <TabsContent value="monthly">
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-serif text-foreground">Monthly Profit & Loss</CardTitle>
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
                      {filteredPL.map((row) => (
                        <TableRow key={row.month} className="border-border/30 hover:bg-secondary/30">
                          <TableCell className="text-sm font-medium text-foreground">{row.month}</TableCell>
                          <TableCell className="text-sm tabular-nums text-right text-foreground">{formatAED(row.grossProfit)}</TableCell>
                          <TableCell className="text-sm tabular-nums text-right text-muted-foreground">{formatAED(row.cashExpenses)}</TableCell>
                          <TableCell className="text-sm tabular-nums text-right text-loss">{row.scam > 0 ? formatAED(row.scam) : "—"}</TableCell>
                          <TableCell className={`text-sm tabular-nums text-right font-medium ${row.netProfit >= 0 ? "text-success" : "text-loss"}`}>{formatAED(row.netProfit)}</TableCell>
                        </TableRow>
                      ))}
                      {filteredPL.length > 1 && (
                        <TableRow className="border-border/50 bg-secondary/30 font-semibold">
                          <TableCell className="text-sm text-foreground">Total</TableCell>
                          <TableCell className="text-sm tabular-nums text-right text-foreground">{formatAED(totalTradingIncome)}</TableCell>
                          <TableCell className="text-sm tabular-nums text-right text-muted-foreground">{formatAED(totalDirectCosts)}</TableCell>
                          <TableCell className="text-sm tabular-nums text-right text-loss">{formatAED(totalScam)}</TableCell>
                          <TableCell className={`text-sm tabular-nums text-right font-bold ${totalNetProfit >= 0 ? "text-success" : "text-loss"}`}>{formatAED(totalNetProfit)}</TableCell>
                        </TableRow>
                      )}
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
