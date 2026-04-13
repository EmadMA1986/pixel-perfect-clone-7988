import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  ArrowLeft,
  BarChart3,
  Shield,
  Activity,
  FileText,
  Building2,
} from "lucide-react";
import SummaryCard from "@/components/SummaryCard";
import MonthFilter from "@/components/MonthFilter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Area,
  AreaChart,
} from "recharts";
import {
  monthlyData,
  kpiData,
  mkxSummary,
  formatAED,
  formatAEDFull,
  plData,
  plMonths,
  balanceSheet,
} from "@/data/mkxData";

const MkxDashboard = () => {
  const [selectedMonth, setSelectedMonth] = useState("all");

  const allMonths = useMemo(() => plMonths, []);

  const filteredMonthly = useMemo(
    () => selectedMonth === "all" ? monthlyData : monthlyData.filter((m) => m.month === selectedMonth),
    [selectedMonth]
  );

  const filteredKPI = useMemo(
    () => selectedMonth === "all" ? kpiData : kpiData.filter((k) => k.month === selectedMonth),
    [selectedMonth]
  );

  const isFiltered = selectedMonth !== "all";
  const hasMonthlyData = filteredMonthly.length > 0;

  const revenueChartData = useMemo(
    () =>
      filteredMonthly.map((m) => ({
        name: m.month,
        revenue: Math.round(m.revenue),
        grossProfit: Math.round(m.grossProfit),
        expenses: Math.round(m.totalExpenses),
      })),
    [filteredMonthly]
  );

  const profitChartData = useMemo(
    () =>
      filteredMonthly.map((m) => ({
        name: m.month,
        netProfit: Math.round(m.netProfit),
      })),
    [filteredMonthly]
  );

  const volumeChartData = useMemo(
    () =>
      filteredMonthly.map((m) => ({
        name: m.month,
        volume: Math.round(m.tradingVolume),
      })),
    [filteredMonthly]
  );

  const liquidityChartData = useMemo(
    () =>
      filteredKPI.map((k) => ({
        name: k.month,
        buffer: Math.round(k.liquidityBuffer),
        coverage: k.assetCoverageRatio,
      })),
    [filteredKPI]
  );

  const formatPLValue = (v: number) => {
    if (v === 0) return "—";
    return formatAEDFull(v);
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
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-serif font-bold text-foreground tracking-tight">
                MKX
              </h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Virtual Assets Broker & Dealer Services
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MonthFilter months={allMonths} value={selectedMonth} onChange={setSelectedMonth} />
            <Badge variant="secondary" className="text-xs">
              Currency: AED
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Partners' Capital Position */}
        {/* Partners' Capital Position - only in All Time */}
        {!isFiltered && (<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Ahmad */}
          <Card className="border-border/50 bg-gradient-to-r from-violet-500/10 to-violet-700/5 backdrop-blur-sm">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-medium tracking-wider uppercase text-muted-foreground">Ahmad's Share Capital</p>
                  <p className="text-2xl font-bold font-serif text-foreground">{formatAEDFull(5329871.48)}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <p className="text-xs text-muted-foreground">Total Retained Earnings</p>
                  <p className="text-lg font-bold font-serif text-loss">{formatAEDFull(-7959404)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Ahmad's Share (50%)</p>
                  <p className="text-lg font-bold font-serif text-loss">{formatAEDFull(-3979702)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Ahmad's Net Position</p>
                  <p className="text-lg font-bold font-serif text-foreground">{formatAEDFull(5329871.48 - 3979702)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Maria */}
          <Card className="border-border/50 bg-gradient-to-r from-pink-500/10 to-pink-700/5 backdrop-blur-sm">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-medium tracking-wider uppercase text-muted-foreground">Maria's Share Capital</p>
                  <p className="text-2xl font-bold font-serif text-foreground">{formatAEDFull(5573975)}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <p className="text-xs text-muted-foreground">Total Retained Earnings</p>
                  <p className="text-lg font-bold font-serif text-loss">{formatAEDFull(-7959404)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Maria's Share (50%)</p>
                  <p className="text-lg font-bold font-serif text-loss">{formatAEDFull(-3979702)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Maria's Net Position</p>
                  <p className="text-lg font-bold font-serif text-foreground">{formatAEDFull(5573975 - 3979702)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        )}

        {/* MKX Crypto Assets - only in All Time */}
        {!isFiltered && (
        <Card className="border-border/50 bg-gradient-to-r from-emerald-500/10 to-violet-500/5 backdrop-blur-sm">
          <CardContent className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-xs font-medium tracking-wider uppercase text-muted-foreground">MKX Assets in Fiat</p>
                  <p className="text-2xl font-bold font-serif text-foreground">{formatAEDFull(1911111 - 429338)}</p>
                  <p className="text-[10px] text-muted-foreground">Client Money (1,911,111) − Fiat Due to Customers (429,338)</p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs font-medium tracking-wider uppercase text-muted-foreground">MKX Assets in VA</p>
                <p className="text-2xl font-bold font-serif text-foreground">{formatAEDFull(128144 + 1856037 - 1619190)}</p>
                <p className="text-[10px] text-muted-foreground">Cold Wallets + VA Holdings − VA Due to Customers</p>
              </div>
              <div className="text-center border-l border-r border-border/50 px-6">
                <p className="text-xs font-medium tracking-wider uppercase text-muted-foreground">February Gross Profit</p>
                <p className="text-2xl font-bold font-serif text-success">{formatAEDFull(58654)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium tracking-wider uppercase text-muted-foreground">Net MKX Assets</p>
                <p className="text-2xl font-bold font-serif text-foreground">{formatAEDFull((1911111 - 429338) + (128144 + 1856037 - 1619190) - 58654)}</p>
                <p className="text-[10px] text-muted-foreground">Fiat + VA − Feb Profit</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border/50 flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <p className="text-xs text-muted-foreground">Crypto Capital Injection:</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Ahmad</p>
                <p className="text-sm font-bold font-serif text-foreground">{formatAEDFull(1688442)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Maria</p>
                <p className="text-sm font-bold font-serif text-foreground">{formatAEDFull(200000)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-sm font-bold font-serif text-foreground">{formatAEDFull(1688442 + 200000)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        )}

        {/* Client Liabilities vs Assets */}
        {!isFiltered && (
        <Card className="border-border/50 bg-gradient-to-r from-amber-500/10 to-amber-700/5 backdrop-blur-sm">
          <CardContent className="p-5">
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 items-end">
              <div>
                <p className="text-xs font-medium tracking-wider uppercase text-muted-foreground">Fiat Client Liabilities</p>
                <p className="text-xl font-bold font-serif text-loss">{formatAEDFull(429338)}</p>
              </div>
              <div>
                <p className="text-xs font-medium tracking-wider uppercase text-muted-foreground">Fiat Assets Held</p>
                <p className="text-xl font-bold font-serif text-foreground">{formatAEDFull(1911111)}</p>
              </div>
              <div>
                <p className="text-xs font-medium tracking-wider uppercase text-muted-foreground">Fiat Surplus</p>
                <p className="text-xl font-bold font-serif text-success">{formatAEDFull(1911111 - 429338)}</p>
                <p className="text-[10px] text-muted-foreground">Ratio: {(1911111 / 429338).toFixed(2)}x</p>
              </div>
              <div>
                <p className="text-xs font-medium tracking-wider uppercase text-muted-foreground">VA Client Liabilities</p>
                <p className="text-xl font-bold font-serif text-loss">{formatAEDFull(1619190)}</p>
              </div>
              <div>
                <p className="text-xs font-medium tracking-wider uppercase text-muted-foreground">VA Assets Held</p>
                <p className="text-xl font-bold font-serif text-foreground">{formatAEDFull(128144 + 1856037)}</p>
              </div>
              <div>
                <p className="text-xs font-medium tracking-wider uppercase text-muted-foreground">VA Surplus</p>
                <p className="text-xl font-bold font-serif text-success">{formatAEDFull(128144 + 1856037 - 1619190)}</p>
                <p className="text-[10px] text-muted-foreground">Ratio: {((128144 + 1856037) / 1619190).toFixed(2)}x</p>
              </div>
            </div>
          </CardContent>
        </Card>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-4 space-y-1">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="h-4 w-4 text-primary" />
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Revenue (Convert + Withdrawal)</p>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">2025 (Jan–Dec)</span>
                <span className="text-sm font-semibold text-foreground">{formatAEDFull(168104.47)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">2026 YTD (Jan–Feb)</span>
                <span className="text-sm font-semibold text-foreground">{formatAEDFull(298654.24)}</span>
              </div>
              <div className="border-t border-border/50 pt-1 flex justify-between items-center">
                <span className="text-xs font-bold text-foreground">Total</span>
                <span className="text-sm font-bold text-foreground">{formatAEDFull(466758.71)}</span>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-4 space-y-1">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-success" />
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Gross Profit</p>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">2025 (Jan–Dec)</span>
                <span className="text-sm font-semibold text-foreground">{formatAEDFull(152213)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">2026 YTD (Jan–Feb)</span>
                <span className="text-sm font-semibold text-foreground">{formatAEDFull(288007)}</span>
              </div>
              <div className="border-t border-border/50 pt-1 flex justify-between items-center">
                <span className="text-xs font-bold text-foreground">Total</span>
                <span className="text-sm font-bold text-success">{formatAEDFull(440220)}</span>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-4 space-y-1">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Cumulative Net Loss Breakdown</p>
              {[
                { year: "2023", value: -783860.87 },
                { year: "2024", value: -2571547.87 },
                { year: "2025", value: -3905605.53 },
                { year: "2026 YTD", value: -698389.49 },
              ].map((item) => (
                <div key={item.year} className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">{item.year}</span>
                  <span className="text-sm font-semibold text-loss">{formatAEDFull(item.value)}</span>
                </div>
              ))}
              <div className="border-t border-border/50 pt-1 flex justify-between items-center">
                <span className="text-xs font-bold text-foreground">Total Retained Loss</span>
                <span className="text-sm font-bold text-loss">{formatAEDFull(-783860.87 + -2571547.87 + -3905605.53 + -698389.49)}</span>
              </div>
            </CardContent>
          </Card>
          <SummaryCard
            title="Current Assets"
            value={formatAED(1856037 + 128144 + 92628 + 96287 + 1911111)}
            subtitle="VA + Cold + Zand + Mashreq + CMA"
            icon={Building2}
          />
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-4 space-y-1">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="h-4 w-4 text-loss" />
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Current Liabilities</p>
              </div>
              {[
                { label: "Accounts Payable", value: 98440 },
                { label: "Fiat Due to Customers", value: 429338 },
                { label: "Payroll Staff Payable", value: 363864 },
                { label: "VAT Control", value: -111961 },
                { label: "VA Due to Customers", value: 1619190 },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                  <span className="text-sm font-semibold text-foreground">{formatAEDFull(item.value)}</span>
                </div>
              ))}
              <div className="border-t border-border/50 pt-1 flex justify-between items-center">
                <span className="text-xs font-bold text-foreground">Total</span>
                <span className="text-sm font-bold text-loss">{formatAEDFull(2398871)}</span>
              </div>
            </CardContent>
          </Card>
          <SummaryCard
            title="Asset Coverage"
            value={`${mkxSummary.latestAssetCoverage.toFixed(2)}x`}
            subtitle="Latest ratio"
            icon={Shield}
          />
          <SummaryCard
            title="Trading Volume"
            value={formatAED(mkxSummary.totalTradingVolume)}
            subtitle={`Avg ${formatAED(mkxSummary.avgTradingVolume)}/mo`}
            icon={BarChart3}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue & Gross Profit */}
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-serif text-foreground">
                Revenue vs Gross Profit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={revenueChartData}
                  margin={{ top: 5, right: 5, bottom: 40, left: 5 }}
                >
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "hsl(220 10% 50%)", fontSize: 10 }}
                    angle={-45}
                    textAnchor="end"
                    axisLine={{ stroke: "hsl(220 14% 18%)" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "hsl(220 10% 50%)", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(220 16% 11%)",
                      border: "1px solid hsl(220 14% 18%)",
                      borderRadius: "8px",
                      color: "hsl(40 20% 90%)",
                      fontSize: 12,
                    }}
                    formatter={(value: number) => [formatAEDFull(value), ""]}
                  />
                  <Bar
                    dataKey="revenue"
                    name="Revenue"
                    fill="hsl(263, 50%, 55%)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="grossProfit"
                    name="Gross Profit"
                    fill="hsl(160, 50%, 40%)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Trading Volume */}
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-serif text-foreground">
                Trading Volume
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart
                  data={volumeChartData}
                  margin={{ top: 5, right: 5, bottom: 40, left: 5 }}
                >
                  <defs>
                    <linearGradient
                      id="volumeGrad"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="hsl(263, 50%, 55%)"
                        stopOpacity={0.4}
                      />
                      <stop
                        offset="100%"
                        stopColor="hsl(263, 50%, 55%)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "hsl(220 10% 50%)", fontSize: 10 }}
                    angle={-45}
                    textAnchor="end"
                    axisLine={{ stroke: "hsl(220 14% 18%)" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "hsl(220 10% 50%)", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(220 16% 11%)",
                      border: "1px solid hsl(220 14% 18%)",
                      borderRadius: "8px",
                      color: "hsl(40 20% 90%)",
                      fontSize: 12,
                    }}
                    formatter={(value: number) => [formatAEDFull(value), ""]}
                  />
                  <Area
                    type="monotone"
                    dataKey="volume"
                    stroke="hsl(263, 50%, 55%)"
                    fill="url(#volumeGrad)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Second Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Net Profit Trend */}
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-serif text-foreground">
                Net Profit Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart
                  data={profitChartData}
                  margin={{ top: 5, right: 5, bottom: 40, left: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(220 14% 18%)"
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "hsl(220 10% 50%)", fontSize: 10 }}
                    angle={-45}
                    textAnchor="end"
                    axisLine={{ stroke: "hsl(220 14% 18%)" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "hsl(220 10% 50%)", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(220 16% 11%)",
                      border: "1px solid hsl(220 14% 18%)",
                      borderRadius: "8px",
                      color: "hsl(40 20% 90%)",
                      fontSize: 12,
                    }}
                    formatter={(value: number) => [formatAEDFull(value), ""]}
                  />
                  <Line
                    type="monotone"
                    dataKey="netProfit"
                    stroke="hsl(0, 60%, 50%)"
                    strokeWidth={2}
                    dot={{ fill: "hsl(0, 60%, 50%)", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Liquidity Buffer */}
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-serif text-foreground">
                Liquidity Buffer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={liquidityChartData}
                  margin={{ top: 5, right: 5, bottom: 40, left: 5 }}
                >
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "hsl(220 10% 50%)", fontSize: 10 }}
                    angle={-45}
                    textAnchor="end"
                    axisLine={{ stroke: "hsl(220 14% 18%)" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "hsl(220 10% 50%)", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(220 16% 11%)",
                      border: "1px solid hsl(220 14% 18%)",
                      borderRadius: "8px",
                      color: "hsl(40 20% 90%)",
                      fontSize: 12,
                    }}
                    formatter={(value: number) => [formatAEDFull(value), ""]}
                  />
                  <Bar
                    dataKey="buffer"
                    name="Liquidity Buffer"
                    fill="hsl(43, 74%, 52%)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="monthly" className="space-y-4">
          <TabsList className="bg-secondary/50 flex-wrap h-auto gap-1">
            <TabsTrigger value="monthly">Monthly P&L</TabsTrigger>
            <TabsTrigger value="fullpl">Full Year P&L</TabsTrigger>
            <TabsTrigger value="balance">Balance Sheet</TabsTrigger>
            <TabsTrigger value="kpi">KPI Analysis</TabsTrigger>
            <TabsTrigger value="flows">Client Flows</TabsTrigger>
          </TabsList>

          {/* Monthly P&L (full year) */}
          <TabsContent value="monthly">
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-serif text-foreground">
                  Monthly Profit & Loss (Jan 2025 – Feb 2026)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/50 hover:bg-transparent">
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider sticky left-0 bg-card z-10">Month</TableHead>
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">Income</TableHead>
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">Cost of Sales</TableHead>
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">Gross Profit</TableHead>
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">Other Income</TableHead>
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">Expenses</TableHead>
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right font-bold">Net Earnings</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {plMonths.filter((m) => selectedMonth === "all" || m === selectedMonth).map((month) => {
                        const i = plMonths.indexOf(month);
                        const income = plData.find(r => r.label === "Total Income");
                        const cogs = plData.find(r => r.label === "Total Cost of Sales");
                        const gp = plData.find(r => r.label === "Gross Profit");
                        const otherInc = plData.find(r => r.label === "Total Other Income");
                        const expenses = plData.find(r => r.label === "Total Expenses");
                        const net = plData.find(r => r.label === "Net Earnings");
                        const incV = income?.values[i] || 0;
                        const cogsV = cogs?.values[i] || 0;
                        const gpV = gp?.values[i] || 0;
                        const otherV = otherInc?.values[i] || 0;
                        const expV = expenses?.values[i] || 0;
                        const netV = net?.values[i] || 0;
                        return (
                          <TableRow key={month} className="border-border/30 hover:bg-secondary/30">
                            <TableCell className="text-sm font-medium text-foreground whitespace-nowrap sticky left-0 bg-card z-10">{month}</TableCell>
                            <TableCell className="text-sm tabular-nums text-right text-foreground">{incV > 0 ? formatAEDFull(incV) : "—"}</TableCell>
                            <TableCell className="text-sm tabular-nums text-right text-muted-foreground">{cogsV > 0 ? formatAEDFull(cogsV) : "—"}</TableCell>
                            <TableCell className={`text-sm tabular-nums text-right ${gpV >= 0 ? "text-success" : "text-loss"}`}>{gpV !== 0 ? formatAEDFull(gpV) : "—"}</TableCell>
                            <TableCell className="text-sm tabular-nums text-right text-muted-foreground">{otherV > 0 ? formatAEDFull(otherV) : "—"}</TableCell>
                            <TableCell className="text-sm tabular-nums text-right text-muted-foreground">{expV > 0 ? formatAEDFull(expV) : "—"}</TableCell>
                            <TableCell className={`text-sm tabular-nums text-right font-medium ${netV >= 0 ? "text-success" : "text-loss"}`}>{netV !== 0 ? formatAEDFull(netV) : "—"}</TableCell>
                          </TableRow>
                        );
                      })}
                      <TableRow className="border-border/50 bg-secondary/30 font-semibold">
                        <TableCell className="text-sm text-foreground sticky left-0 bg-secondary/30 z-10">Total</TableCell>
                        <TableCell className="text-sm tabular-nums text-right text-foreground">{formatAEDFull(mkxSummary.fullYearTotalIncome)}</TableCell>
                        <TableCell className="text-sm tabular-nums text-right text-muted-foreground">{formatAEDFull(plData.find(r => r.label === "Total Cost of Sales")?.total || 0)}</TableCell>
                        <TableCell className="text-sm tabular-nums text-right text-success">{formatAEDFull(mkxSummary.fullYearGrossProfit)}</TableCell>
                        <TableCell className="text-sm tabular-nums text-right text-muted-foreground">{formatAEDFull(plData.find(r => r.label === "Total Other Income")?.total || 0)}</TableCell>
                        <TableCell className="text-sm tabular-nums text-right text-muted-foreground">{formatAEDFull(mkxSummary.fullYearTotalExpenses)}</TableCell>
                        <TableCell className="text-sm tabular-nums text-right font-bold text-loss">{formatAEDFull(mkxSummary.fullYearNetEarnings)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Full Year P&L */}
          <TabsContent value="fullpl">
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle className="text-lg font-serif text-foreground">
                      Profit & Loss Statement
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      MKX Virtual Assets Broker & Dealer Services L.L.C — Jan 2025 to Feb 2026
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/50 hover:bg-transparent">
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider min-w-[200px] sticky left-0 bg-card z-10">Account</TableHead>
                        {plMonths.map((m) => (
                          <TableHead key={m} className="text-xs text-muted-foreground uppercase tracking-wider text-right min-w-[100px]">{m}</TableHead>
                        ))}
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right min-w-[110px] font-bold">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {plData.map((row, idx) => {
                        if (row.isHeader) {
                          return (
                            <TableRow key={idx} className="border-border/50 bg-secondary/20 hover:bg-secondary/30">
                              <TableCell colSpan={16} className="text-sm font-bold text-foreground py-2 sticky left-0 bg-secondary/20">
                                {row.label}
                              </TableCell>
                            </TableRow>
                          );
                        }
                        return (
                          <TableRow
                            key={idx}
                            className={`border-border/30 hover:bg-secondary/30 ${row.isTotal ? "bg-secondary/20 font-semibold" : ""}`}
                          >
                            <TableCell className={`text-sm whitespace-nowrap sticky left-0 bg-card z-10 ${row.isTotal ? "font-semibold text-foreground bg-secondary/20" : row.indent ? "pl-8 text-muted-foreground" : "text-foreground"}`}>
                              {row.label}
                            </TableCell>
                            {row.values.length > 0 ? row.values.map((v, i) => (
                              <TableCell
                                key={i}
                                className={`text-xs tabular-nums text-right ${
                                  row.isTotal
                                    ? v < 0 ? "text-loss font-semibold" : "text-foreground font-semibold"
                                    : v < 0 ? "text-loss" : v === 0 ? "text-muted-foreground/50" : "text-foreground"
                                }`}
                              >
                                {formatPLValue(v)}
                              </TableCell>
                            )) : plMonths.map((_, i) => (
                              <TableCell key={i} className="text-xs text-muted-foreground/50 text-right">—</TableCell>
                            ))}
                            <TableCell className={`text-xs tabular-nums text-right font-bold ${row.total < 0 ? "text-loss" : "text-foreground"}`}>
                              {row.total !== 0 ? formatAEDFull(row.total) : "—"}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Balance Sheet */}
          <TabsContent value="balance">
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle className="text-lg font-serif text-foreground">
                      Balance Sheet
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      As of February 28, 2026
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-0.5">
                {balanceSheet.map((item, idx) => {
                  if (item.isSectionHeader) {
                    return (
                      <div
                        key={idx}
                        className={`flex items-center justify-between py-2 px-3 rounded-md bg-secondary/30 mt-2 first:mt-0`}
                        style={{ paddingLeft: `${(item.indent || 0) * 16 + 12}px` }}
                      >
                        <span className="text-sm font-bold text-foreground">{item.label}</span>
                      </div>
                    );
                  }
                  return (
                    <div
                      key={idx}
                      className={`flex items-center justify-between py-1.5 px-3 rounded-md text-sm ${
                        item.isTotal ? "bg-secondary/20 font-semibold border border-border/30" : ""
                      }`}
                      style={{ paddingLeft: `${(item.indent || 0) * 16 + 12}px` }}
                    >
                      <span className={`${item.isTotal ? "text-foreground" : "text-muted-foreground"}`}>
                        {item.label}
                      </span>
                      <span className={`tabular-nums ${
                        item.isTotal ? "text-foreground font-serif" :
                        item.value < 0 ? "text-loss" : "text-foreground"
                      }`}>
                        {item.value !== 0 ? formatAEDFull(item.value) : ""}
                      </span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          {/* KPI Analysis */}
          <TabsContent value="kpi">
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-serif text-foreground">
                  Key Performance Indicators
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/50 hover:bg-transparent">
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider">KPI</TableHead>
                        {kpiData.map((k) => (
                          <TableHead key={k.month} className="text-xs text-muted-foreground uppercase tracking-wider text-right">{k.month}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow className="border-border/30 hover:bg-secondary/30">
                        <TableCell className="text-sm font-medium text-foreground whitespace-nowrap">Gross Margin</TableCell>
                        {kpiData.map((k) => (
                          <TableCell key={k.month} className="text-sm tabular-nums text-right text-success">{k.grossMarginPct.toFixed(1)}%</TableCell>
                        ))}
                      </TableRow>
                      <TableRow className="border-border/30 hover:bg-secondary/30">
                        <TableCell className="text-sm font-medium text-foreground whitespace-nowrap">Net Margin</TableCell>
                        {kpiData.map((k) => (
                          <TableCell key={k.month} className="text-sm tabular-nums text-right text-loss">{k.netMarginPct.toFixed(1)}%</TableCell>
                        ))}
                      </TableRow>
                      <TableRow className="border-border/30 hover:bg-secondary/30">
                        <TableCell className="text-sm font-medium text-foreground whitespace-nowrap">Asset Coverage Ratio</TableCell>
                        {kpiData.map((k) => (
                          <TableCell key={k.month} className="text-sm tabular-nums text-right">
                            <Badge variant={k.assetCoverageRatio >= 1.5 ? "default" : "destructive"} className="text-xs">
                              {k.assetCoverageRatio.toFixed(2)}x
                            </Badge>
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow className="border-border/30 hover:bg-secondary/30">
                        <TableCell className="text-sm font-medium text-foreground whitespace-nowrap">Liquidity Buffer</TableCell>
                        {kpiData.map((k) => (
                          <TableCell key={k.month} className="text-sm tabular-nums text-right text-foreground">{formatAED(k.liquidityBuffer)}</TableCell>
                        ))}
                      </TableRow>
                      <TableRow className="border-border/30 hover:bg-secondary/30">
                        <TableCell className="text-sm font-medium text-foreground whitespace-nowrap">Trading Vol / Deposits</TableCell>
                        {kpiData.map((k) => (
                          <TableCell key={k.month} className="text-sm tabular-nums text-right text-muted-foreground">{k.tradingVolumePerTotalDeposits.toFixed(3)}</TableCell>
                        ))}
                      </TableRow>
                      <TableRow className="border-border/30 hover:bg-secondary/30">
                        <TableCell className="text-sm font-medium text-foreground whitespace-nowrap">Revenue / Trading Vol</TableCell>
                        {kpiData.map((k) => (
                          <TableCell key={k.month} className="text-sm tabular-nums text-right text-muted-foreground">{(k.revenuePerTradingVolume * 100).toFixed(2)}%</TableCell>
                        ))}
                      </TableRow>
                      <TableRow className="border-border/30 hover:bg-secondary/30">
                        <TableCell className="text-sm font-medium text-foreground whitespace-nowrap">Asset Valuation Diff</TableCell>
                        {kpiData.map((k) => (
                          <TableCell key={k.month} className={`text-sm tabular-nums text-right ${k.assetValuationDiff >= 0 ? "text-success" : "text-loss"}`}>
                            {formatAED(k.assetValuationDiff)}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow className="border-border/30 hover:bg-secondary/30">
                        <TableCell className="text-sm font-medium text-foreground whitespace-nowrap">Break-even Trading Vol</TableCell>
                        {kpiData.map((k) => (
                          <TableCell key={k.month} className="text-sm tabular-nums text-right text-muted-foreground">{formatAED(k.breakEvenTradingVolume)}</TableCell>
                        ))}
                      </TableRow>
                      <TableRow className="border-border/30 hover:bg-secondary/30">
                        <TableCell className="text-sm font-medium text-foreground whitespace-nowrap">Net Profit / Trading Vol</TableCell>
                        {kpiData.map((k) => (
                          <TableCell key={k.month} className={`text-sm tabular-nums text-right ${k.netProfitPerTradingVolume >= 0 ? "text-success" : "text-loss"}`}>
                            {(k.netProfitPerTradingVolume * 100).toFixed(2)}%
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Client Flows */}
          <TabsContent value="flows">
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-serif text-foreground">
                  Client Flows & Liabilities
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/50 hover:bg-transparent">
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider">Month</TableHead>
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">Fiat Deposits</TableHead>
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">Fiat Withdrawals</TableHead>
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">Net Fiat Flow</TableHead>
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">VA Deposits</TableHead>
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">VA Withdrawals</TableHead>
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">Net VA Flow</TableHead>
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">Trading Volume</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMonthly.map((row) => {
                        const i = monthlyData.indexOf(row);
                        return (
                        <TableRow key={row.month} className="border-border/30 hover:bg-secondary/30">
                          <TableCell className="text-sm font-medium text-foreground whitespace-nowrap">{row.month}</TableCell>
                          <TableCell className="text-sm tabular-nums text-right text-foreground">{formatAEDFull(row.clientDepositsFiat)}</TableCell>
                          <TableCell className="text-sm tabular-nums text-right text-muted-foreground">{formatAEDFull(row.clientWithdrawalsFiat)}</TableCell>
                          <TableCell className={`text-sm tabular-nums text-right font-medium ${(kpiData[i]?.netFiatFlow ?? (row.clientDepositsFiat - row.clientWithdrawalsFiat)) >= 0 ? "text-success" : "text-loss"}`}>
                            {formatAEDFull(kpiData[i]?.netFiatFlow ?? (row.clientDepositsFiat - row.clientWithdrawalsFiat))}
                          </TableCell>
                          <TableCell className="text-sm tabular-nums text-right text-foreground">{formatAEDFull(row.clientDepositsVA)}</TableCell>
                          <TableCell className="text-sm tabular-nums text-right text-muted-foreground">{formatAEDFull(row.clientWithdrawalsVA)}</TableCell>
                          <TableCell className={`text-sm tabular-nums text-right font-medium ${(kpiData[i]?.netVAFlow ?? (row.clientDepositsVA - row.clientWithdrawalsVA)) >= 0 ? "text-success" : "text-loss"}`}>
                            {formatAEDFull(kpiData[i]?.netVAFlow ?? (row.clientDepositsVA - row.clientWithdrawalsVA))}
                          </TableCell>
                          <TableCell className="text-sm tabular-nums text-right text-foreground">{formatAEDFull(row.tradingVolume)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default MkxDashboard;
