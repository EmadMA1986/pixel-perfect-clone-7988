import { useMemo } from "react";
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
  ArrowUpDown,
} from "lucide-react";
import SummaryCard from "@/components/SummaryCard";
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
} from "@/data/mkxData";

const MkxDashboard = () => {
  const revenueChartData = useMemo(
    () =>
      monthlyData.map((m) => ({
        name: m.month,
        revenue: Math.round(m.revenue),
        grossProfit: Math.round(m.grossProfit),
        expenses: Math.round(m.totalExpenses),
      })),
    []
  );

  const profitChartData = useMemo(
    () =>
      monthlyData.map((m) => ({
        name: m.month,
        netProfit: Math.round(m.netProfit),
      })),
    []
  );

  const volumeChartData = useMemo(
    () =>
      monthlyData.map((m) => ({
        name: m.month,
        volume: Math.round(m.tradingVolume),
      })),
    []
  );

  const liquidityChartData = useMemo(
    () =>
      kpiData.map((k) => ({
        name: k.month,
        buffer: Math.round(k.liquidityBuffer),
        coverage: k.assetCoverageRatio,
      })),
    []
  );

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
                Crypto Exchange Dashboard
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">
            Currency: AED
          </Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <SummaryCard
            title="Total Revenue"
            value={formatAED(mkxSummary.totalRevenue)}
            subtitle={`Avg ${formatAED(mkxSummary.avgRevenue)}/mo`}
            icon={DollarSign}
          />
          <SummaryCard
            title="Total Gross Profit"
            value={formatAED(mkxSummary.totalGrossProfit)}
            subtitle={`Avg ${formatAED(mkxSummary.avgGrossProfit)}/mo`}
            icon={TrendingUp}
            trend="up"
          />
          <SummaryCard
            title="Total Net Profit"
            value={formatAED(mkxSummary.totalNetProfit)}
            subtitle={`Avg ${formatAED(mkxSummary.avgNetProfit)}/mo`}
            icon={TrendingDown}
            trend="down"
          />
          <SummaryCard
            title="Total Expenses"
            value={formatAED(mkxSummary.totalExpenses)}
            subtitle="All months"
            icon={Wallet}
          />
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
          <TabsList className="bg-secondary/50">
            <TabsTrigger value="monthly">Monthly P&L</TabsTrigger>
            <TabsTrigger value="kpi">KPI Analysis</TabsTrigger>
            <TabsTrigger value="flows">Client Flows</TabsTrigger>
          </TabsList>

          {/* Monthly P&L */}
          <TabsContent value="monthly">
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-serif text-foreground">
                  Monthly Profit & Loss
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/50 hover:bg-transparent">
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider">
                          Month
                        </TableHead>
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">
                          Revenue
                        </TableHead>
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">
                          Gas Fees
                        </TableHead>
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">
                          Gross Profit
                        </TableHead>
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">
                          Expenses
                        </TableHead>
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">
                          Other Income
                        </TableHead>
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right font-bold">
                          Net Profit
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {monthlyData.map((row) => (
                        <TableRow
                          key={row.month}
                          className="border-border/30 hover:bg-secondary/30"
                        >
                          <TableCell className="text-sm font-medium text-foreground whitespace-nowrap">
                            {row.month}
                          </TableCell>
                          <TableCell className="text-sm tabular-nums text-right text-foreground">
                            {formatAEDFull(row.revenue)}
                          </TableCell>
                          <TableCell className="text-sm tabular-nums text-right text-muted-foreground">
                            {formatAEDFull(row.gasFees)}
                          </TableCell>
                          <TableCell className="text-sm tabular-nums text-right text-success">
                            {formatAEDFull(row.grossProfit)}
                          </TableCell>
                          <TableCell className="text-sm tabular-nums text-right text-muted-foreground">
                            {formatAEDFull(row.totalExpenses)}
                          </TableCell>
                          <TableCell className="text-sm tabular-nums text-right text-muted-foreground">
                            {row.otherIncome > 0
                              ? formatAEDFull(row.otherIncome)
                              : "—"}
                          </TableCell>
                          <TableCell className="text-sm tabular-nums text-right font-medium text-loss">
                            {formatAEDFull(row.netProfit)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="border-border/50 bg-secondary/30 font-semibold">
                        <TableCell className="text-sm text-foreground">
                          Total
                        </TableCell>
                        <TableCell className="text-sm tabular-nums text-right text-foreground">
                          {formatAEDFull(mkxSummary.totalRevenue)}
                        </TableCell>
                        <TableCell className="text-sm tabular-nums text-right text-muted-foreground">
                          {formatAEDFull(
                            monthlyData.reduce((s, m) => s + m.gasFees, 0)
                          )}
                        </TableCell>
                        <TableCell className="text-sm tabular-nums text-right text-success">
                          {formatAEDFull(mkxSummary.totalGrossProfit)}
                        </TableCell>
                        <TableCell className="text-sm tabular-nums text-right text-muted-foreground">
                          {formatAEDFull(mkxSummary.totalExpenses)}
                        </TableCell>
                        <TableCell className="text-sm tabular-nums text-right text-muted-foreground">
                          {formatAEDFull(
                            monthlyData.reduce((s, m) => s + m.otherIncome, 0)
                          )}
                        </TableCell>
                        <TableCell className="text-sm tabular-nums text-right font-bold text-loss">
                          {formatAEDFull(mkxSummary.totalNetProfit)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
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
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider">
                          KPI
                        </TableHead>
                        {kpiData.map((k) => (
                          <TableHead
                            key={k.month}
                            className="text-xs text-muted-foreground uppercase tracking-wider text-right"
                          >
                            {k.month}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow className="border-border/30 hover:bg-secondary/30">
                        <TableCell className="text-sm font-medium text-foreground whitespace-nowrap">
                          Gross Margin
                        </TableCell>
                        {kpiData.map((k) => (
                          <TableCell
                            key={k.month}
                            className="text-sm tabular-nums text-right text-success"
                          >
                            {k.grossMarginPct.toFixed(1)}%
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow className="border-border/30 hover:bg-secondary/30">
                        <TableCell className="text-sm font-medium text-foreground whitespace-nowrap">
                          Net Margin
                        </TableCell>
                        {kpiData.map((k) => (
                          <TableCell
                            key={k.month}
                            className="text-sm tabular-nums text-right text-loss"
                          >
                            {k.netMarginPct.toFixed(1)}%
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow className="border-border/30 hover:bg-secondary/30">
                        <TableCell className="text-sm font-medium text-foreground whitespace-nowrap">
                          Asset Coverage Ratio
                        </TableCell>
                        {kpiData.map((k) => (
                          <TableCell
                            key={k.month}
                            className="text-sm tabular-nums text-right"
                          >
                            <Badge
                              variant={
                                k.assetCoverageRatio >= 1.5
                                  ? "default"
                                  : "destructive"
                              }
                              className="text-xs"
                            >
                              {k.assetCoverageRatio.toFixed(2)}x
                            </Badge>
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow className="border-border/30 hover:bg-secondary/30">
                        <TableCell className="text-sm font-medium text-foreground whitespace-nowrap">
                          Liquidity Buffer
                        </TableCell>
                        {kpiData.map((k) => (
                          <TableCell
                            key={k.month}
                            className="text-sm tabular-nums text-right text-foreground"
                          >
                            {formatAED(k.liquidityBuffer)}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow className="border-border/30 hover:bg-secondary/30">
                        <TableCell className="text-sm font-medium text-foreground whitespace-nowrap">
                          Trading Vol / Deposits
                        </TableCell>
                        {kpiData.map((k) => (
                          <TableCell
                            key={k.month}
                            className="text-sm tabular-nums text-right text-muted-foreground"
                          >
                            {k.tradingVolumePerTotalDeposits.toFixed(3)}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow className="border-border/30 hover:bg-secondary/30">
                        <TableCell className="text-sm font-medium text-foreground whitespace-nowrap">
                          Revenue / Trading Vol
                        </TableCell>
                        {kpiData.map((k) => (
                          <TableCell
                            key={k.month}
                            className="text-sm tabular-nums text-right text-muted-foreground"
                          >
                            {(k.revenuePerTradingVolume * 100).toFixed(2)}%
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow className="border-border/30 hover:bg-secondary/30">
                        <TableCell className="text-sm font-medium text-foreground whitespace-nowrap">
                          Asset Valuation Diff
                        </TableCell>
                        {kpiData.map((k) => (
                          <TableCell
                            key={k.month}
                            className={`text-sm tabular-nums text-right ${k.assetValuationDiff >= 0 ? "text-success" : "text-loss"}`}
                          >
                            {formatAED(k.assetValuationDiff)}
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
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider">
                          Month
                        </TableHead>
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">
                          Fiat Deposits
                        </TableHead>
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">
                          Fiat Withdrawals
                        </TableHead>
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">
                          Net Fiat Flow
                        </TableHead>
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">
                          VA Deposits
                        </TableHead>
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">
                          VA Withdrawals
                        </TableHead>
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">
                          Net VA Flow
                        </TableHead>
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">
                          Trading Volume
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {monthlyData.map((row, i) => (
                        <TableRow
                          key={row.month}
                          className="border-border/30 hover:bg-secondary/30"
                        >
                          <TableCell className="text-sm font-medium text-foreground whitespace-nowrap">
                            {row.month}
                          </TableCell>
                          <TableCell className="text-sm tabular-nums text-right text-foreground">
                            {formatAEDFull(row.clientDepositsFiat)}
                          </TableCell>
                          <TableCell className="text-sm tabular-nums text-right text-muted-foreground">
                            {formatAEDFull(row.clientWithdrawalsFiat)}
                          </TableCell>
                          <TableCell
                            className={`text-sm tabular-nums text-right font-medium ${kpiData[i].netFiatFlow >= 0 ? "text-success" : "text-loss"}`}
                          >
                            {formatAEDFull(kpiData[i].netFiatFlow)}
                          </TableCell>
                          <TableCell className="text-sm tabular-nums text-right text-foreground">
                            {formatAEDFull(row.clientDepositsVA)}
                          </TableCell>
                          <TableCell className="text-sm tabular-nums text-right text-muted-foreground">
                            {formatAEDFull(row.clientWithdrawalsVA)}
                          </TableCell>
                          <TableCell
                            className={`text-sm tabular-nums text-right font-medium ${kpiData[i].netVAFlow >= 0 ? "text-success" : "text-loss"}`}
                          >
                            {formatAEDFull(kpiData[i].netVAFlow)}
                          </TableCell>
                          <TableCell className="text-sm tabular-nums text-right text-foreground">
                            {formatAEDFull(row.tradingVolume)}
                          </TableCell>
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
