import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  ArrowLeft,
  BarChart3,
  FileText,
  Building2,
  Wrench,
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
} from "recharts";
import {
  monthlyPL,
  balanceSheet,
  ahmadGarage,
  formatAED,
  formatAEDFull,
} from "@/data/garageData";
import ExecutiveSummary, { ExecMonthInput } from "@/components/ExecutiveSummary";

const GarageDashboard = () => {
  const [selectedMonth, setSelectedMonth] = useState("all");

  const months = useMemo(() => monthlyPL.map((m) => m.month), []);

  const filteredPL = useMemo(
    () => selectedMonth === "all" ? monthlyPL : monthlyPL.filter((m) => m.month === selectedMonth),
    [selectedMonth]
  );

  const isFiltered = selectedMonth !== "all";
  const periodLabel = isFiltered ? selectedMonth : "Nov 24 – Feb 26";

  const totalSales = filteredPL.reduce((s, m) => s + m.sales, 0);
  const totalRevenue = filteredPL.reduce((s, m) => s + m.totalRevenue, 0);
  const totalGrossProfit = filteredPL.reduce((s, m) => s + m.grossProfit, 0);
  const totalNetProfit = filteredPL.reduce((s, m) => s + m.netProfit, 0);

  const revenueChartData = useMemo(
    () =>
      filteredPL.map((m) => ({
        name: m.month,
        revenue: Math.round(m.totalRevenue),
        grossProfit: Math.round(m.grossProfit),
        netProfit: Math.round(m.netProfit),
      })),
    [filteredPL]
  );

  const expenseChartData = useMemo(
    () =>
      filteredPL.map((m) => ({
        name: m.month,
        payroll: Math.round(m.payroll),
        rent: Math.round(m.rent),
        other: Math.round(m.indirectExpenses - m.payroll - m.rent),
      })),
    [filteredPL]
  );

  const ahmadShareOfLoss = balanceSheet.profitAndLoss * (ahmadGarage.sharePercent / 100);
  const ahmadNetPosition = ahmadGarage.shareCapital + ahmadShareOfLoss;

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
            <Badge variant="secondary" className="text-xs">
              Currency: AED
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* === Executive Summary === */}
        <ExecutiveSummary
          businessName="MK Auto Garage"
          format={formatAED}
          currentMonth={selectedMonth === "all" ? undefined : selectedMonth}
          history={monthlyPL.map<ExecMonthInput>((m) => ({
            month: m.month,
            revenue: m.totalRevenue,
            costs: m.costOfSales + m.indirectExpenses,
            grossProfit: m.grossProfit,
            netProfit: m.netProfit,
          }))}
          reasons={{
            revenueUp: "Higher service jobs & parts sales",
            revenueDown: "Fewer jobs / lower workshop activity",
            costsContext: "Parts (COGS) + payroll, rent & overhead",
          }}
        />

        {/* Ahmad's Capital Position */}
        {!isFiltered && (
          <Card className="border-border/50 bg-gradient-to-r from-orange-500/10 to-orange-700/5 backdrop-blur-sm">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-medium tracking-wider uppercase text-muted-foreground">
                    Ahmad's Capital Position (40%)
                  </p>
                  <p className="text-2xl font-bold font-serif text-foreground">
                    {formatAEDFull(ahmadGarage.shareCapital)}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <p className="text-xs text-muted-foreground">Total Company Capital</p>
                  <p className="text-lg font-bold font-serif text-foreground">
                    {formatAEDFull(ahmadGarage.totalCapital)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Ahmad's Share (40%)</p>
                  <p className="text-lg font-bold font-serif text-foreground">
                    {formatAEDFull(ahmadGarage.shareCapital)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">P&L Share (40%)</p>
                  <p className={`text-lg font-bold font-serif ${ahmadShareOfLoss < 0 ? "text-loss" : "text-success"}`}>
                    {formatAEDFull(ahmadShareOfLoss)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Net Position</p>
                  <p className={`text-lg font-bold font-serif ${ahmadNetPosition >= 0 ? "text-success" : "text-loss"}`}>
                    {formatAEDFull(ahmadNetPosition)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <SummaryCard
            title="Total Revenue"
            value={formatAED(totalRevenue)}
            subtitle={periodLabel}
            icon={DollarSign}
          />
          <SummaryCard
            title="Total Sales"
            value={formatAED(totalSales)}
            subtitle="Service + Parts"
            icon={BarChart3}
          />
          <SummaryCard
            title="Gross Profit"
            value={formatAED(totalGrossProfit)}
            subtitle={`Margin: ${((totalGrossProfit / totalRevenue) * 100).toFixed(1)}%`}
            icon={TrendingUp}
            trend="up"
          />
          <SummaryCard
            title="Net Profit"
            value={formatAED(totalNetProfit)}
            subtitle={isFiltered ? selectedMonth : "Cumulative"}
            icon={TrendingDown}
            trend="down"
          />
          {!isFiltered && (
            <>
              <SummaryCard
                title="Fixed Assets"
                value={formatAED(balanceSheet.fixedAssets.total)}
                subtitle="incl. Goodwill 600K"
                icon={Building2}
              />
              <SummaryCard
                title="Current Assets"
                value={formatAED(balanceSheet.currentAssets.total)}
                subtitle={`AR: ${formatAED(balanceSheet.currentAssets.accountsReceivable)}`}
                icon={FileText}
              />
            </>
          )}
        </div>


        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Revenue & Profit Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(v: number) => formatAEDFull(v)} />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} name="Revenue" />
                  <Bar dataKey="grossProfit" fill="hsl(142, 71%, 45%)" radius={[2, 2, 0, 0]} name="Gross Profit" />
                  <Bar dataKey="netProfit" fill="hsl(0, 84%, 60%)" radius={[2, 2, 0, 0]} name="Net Profit" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Expense Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={expenseChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(v: number) => formatAEDFull(v)} />
                  <Bar dataKey="payroll" stackId="a" fill="hsl(var(--primary))" name="Payroll" />
                  <Bar dataKey="rent" stackId="a" fill="hsl(200, 50%, 45%)" name="Rent" />
                  <Bar dataKey="other" stackId="a" fill="hsl(43, 74%, 52%)" name="Other" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Operational KPIs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Break-Even Analysis */}
          {(() => {
            const avgRent = monthlyPL.reduce((s, m) => s + m.rent, 0) / monthlyPL.length;
            const avgPayroll = monthlyPL.reduce((s, m) => s + m.payroll, 0) / monthlyPL.length;
            const avgFixedCosts = avgRent + avgPayroll;
            const avgGrossMargin = monthlyPL.reduce((s, m) => s + (m.totalRevenue > 0 ? m.grossProfit / m.totalRevenue : 0), 0) / monthlyPL.length;
            const breakEvenRevenue = avgGrossMargin > 0 ? avgFixedCosts / avgGrossMargin : 0;
            const avgRevenue = monthlyPL.reduce((s, m) => s + m.totalRevenue, 0) / monthlyPL.length;
            const gapPct = ((avgRevenue - breakEvenRevenue) / breakEvenRevenue) * 100;
            return (
              <Card className={`border-border/50 backdrop-blur-sm ${gapPct < 0 ? "bg-loss/5 border-loss/20" : "bg-success/5 border-success/20"}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Break-Even Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Monthly Break-Even Revenue</p>
                    <p className="text-2xl font-bold font-serif text-foreground">{formatAEDFull(breakEvenRevenue)}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded bg-muted/30">
                      <p className="text-muted-foreground">Avg Fixed Costs</p>
                      <p className="font-bold text-foreground">{formatAEDFull(avgFixedCosts)}</p>
                      <p className="text-[10px] text-muted-foreground">Payroll + Rent</p>
                    </div>
                    <div className="p-2 rounded bg-muted/30">
                      <p className="text-muted-foreground">Avg Revenue</p>
                      <p className="font-bold text-foreground">{formatAEDFull(avgRevenue)}</p>
                      <p className={`text-[10px] font-medium ${gapPct >= 0 ? "text-success" : "text-loss"}`}>
                        {gapPct >= 0 ? `${gapPct.toFixed(0)}% above break-even` : `${Math.abs(gapPct).toFixed(0)}% below break-even`}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })()}

          {/* Payroll-to-Revenue Ratio */}
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Payroll-to-Revenue Ratio</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={monthlyPL.map(m => ({
                  name: m.month,
                  ratio: m.totalRevenue > 0 ? parseFloat(((m.payroll / m.totalRevenue) * 100).toFixed(1)) : 0,
                }))} margin={{ top: 5, right: 10, bottom: 30, left: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} angle={-45} textAnchor="end" />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `${v}%`} />
                  <Tooltip formatter={(v: number) => [`${v}%`, "Payroll/Revenue"]} />
                  <Line type="monotone" dataKey="ratio" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
              <p className="text-[10px] text-muted-foreground mt-1">
                Avg: {((monthlyPL.reduce((s, m) => s + m.payroll, 0) / monthlyPL.reduce((s, m) => s + m.totalRevenue, 0)) * 100).toFixed(1)}% — Target: below 40%
              </p>
            </CardContent>
          </Card>

          {/* Gross Margin Trend */}
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Gross Margin Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={monthlyPL.map(m => ({
                  name: m.month,
                  margin: m.totalRevenue > 0 ? parseFloat(((m.grossProfit / m.totalRevenue) * 100).toFixed(1)) : 0,
                }))} margin={{ top: 5, right: 10, bottom: 30, left: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} angle={-45} textAnchor="end" />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `${v}%`} />
                  <Tooltip formatter={(v: number) => [`${v}%`, "Gross Margin"]} />
                  <Line type="monotone" dataKey="margin" stroke="hsl(142, 71%, 45%)" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
              <p className="text-[10px] text-muted-foreground mt-1">
                Avg: {((monthlyPL.reduce((s, m) => s + m.grossProfit, 0) / monthlyPL.reduce((s, m) => s + m.totalRevenue, 0)) * 100).toFixed(1)}% gross margin
              </p>
            </CardContent>
          </Card>
        </div>

        {!isFiltered && (() => {
          const allTotalRevenue = monthlyPL.reduce((s, m) => s + m.totalRevenue, 0);
          const allTotalGrossProfit = monthlyPL.reduce((s, m) => s + m.grossProfit, 0);
          const allTotalNetProfit = monthlyPL.reduce((s, m) => s + m.netProfit, 0);
          const totalCostOfSales = monthlyPL.reduce((s, m) => s + m.costOfSales, 0);
          const totalIndirectExp = monthlyPL.reduce((s, m) => s + m.indirectExpenses, 0);
          const totalEquity = balanceSheet.capital.total;
          const totalAssets = balanceSheet.totalAssets;
          const grossMargin = (allTotalGrossProfit / allTotalRevenue) * 100;
          const netMargin = (allTotalNetProfit / allTotalRevenue) * 100;
          const roe = (allTotalNetProfit / totalEquity) * 100;
          const roa = (allTotalNetProfit / totalAssets) * 100;
          const costToRevenueRatio = ((totalCostOfSales + totalIndirectExp) / allTotalRevenue) * 100;
          const operatingExpRatio = (totalIndirectExp / allTotalRevenue) * 100;
          const currentRatio = balanceSheet.currentAssets.total / balanceSheet.currentLiabilities.total;

          const ratioItems = [
            { label: "Gross Profit Margin", value: `${grossMargin.toFixed(1)}%`, desc: "Gross Profit / Revenue", healthy: grossMargin > 30 },
            { label: "Net Profit Margin", value: `${netMargin.toFixed(1)}%`, desc: "Net Profit / Revenue", healthy: netMargin > 0 },
            { label: "Return on Equity (ROE)", value: `${roe.toFixed(1)}%`, desc: "Net Profit / Total Equity", healthy: roe > 0 },
            { label: "Return on Assets (ROA)", value: `${roa.toFixed(1)}%`, desc: "Net Profit / Total Assets", healthy: roa > 0 },
            { label: "Cost-to-Revenue Ratio", value: `${costToRevenueRatio.toFixed(1)}%`, desc: "(COGS + Expenses) / Revenue", healthy: costToRevenueRatio < 100 },
            { label: "Operating Expense Ratio", value: `${operatingExpRatio.toFixed(1)}%`, desc: "Indirect Exp / Revenue", healthy: operatingExpRatio < 40 },
            { label: "Current Ratio", value: `${currentRatio.toFixed(2)}x`, desc: "Current Assets / Current Liabilities", healthy: currentRatio >= 1 },
          ];

          return (
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">ROI & Profitability Ratios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {ratioItems.map((r) => (
                    <div key={r.label} className="p-3 rounded-lg bg-muted/30 border border-border/30 space-y-1">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{r.label}</p>
                      <p className={`text-xl font-bold font-serif ${r.healthy ? "text-success" : "text-loss"}`}>{r.value}</p>
                      <p className="text-[10px] text-muted-foreground">{r.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })()}

        {/* Monthly P&L Table */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Monthly Profit & Loss</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Month</TableHead>
                    <TableHead className="text-xs text-right">Sales</TableHead>
                    <TableHead className="text-xs text-right">Direct Income</TableHead>
                    <TableHead className="text-xs text-right">Total Revenue</TableHead>
                    <TableHead className="text-xs text-right">Cost of Sales</TableHead>
                    <TableHead className="text-xs text-right">Gross Profit</TableHead>
                    <TableHead className="text-xs text-right">Indirect Exp.</TableHead>
                    <TableHead className="text-xs text-right">Net Profit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPL.map((m) => (
                    <TableRow key={m.month}>
                      <TableCell className="text-xs font-medium">{m.month}</TableCell>
                      <TableCell className="text-xs text-right">{formatAEDFull(m.sales)}</TableCell>
                      <TableCell className="text-xs text-right">{m.directIncome > 0 ? formatAEDFull(m.directIncome) : "—"}</TableCell>
                      <TableCell className="text-xs text-right">{formatAEDFull(m.totalRevenue)}</TableCell>
                      <TableCell className="text-xs text-right text-loss">{formatAEDFull(m.costOfSales)}</TableCell>
                      <TableCell className="text-xs text-right text-success">{formatAEDFull(m.grossProfit)}</TableCell>
                      <TableCell className="text-xs text-right text-loss">{formatAEDFull(m.indirectExpenses)}</TableCell>
                      <TableCell className={`text-xs text-right font-bold ${m.netProfit >= 0 ? "text-success" : "text-loss"}`}>
                        {formatAEDFull(m.netProfit)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredPL.length > 1 && (
                    <TableRow className="border-t-2 border-border">
                      <TableCell className="text-xs font-bold">TOTAL</TableCell>
                      <TableCell className="text-xs text-right font-bold">{formatAEDFull(totalSales)}</TableCell>
                      <TableCell className="text-xs text-right font-bold">{formatAEDFull(filteredPL.reduce((s, m) => s + m.directIncome, 0))}</TableCell>
                      <TableCell className="text-xs text-right font-bold">{formatAEDFull(totalRevenue)}</TableCell>
                      <TableCell className="text-xs text-right font-bold text-loss">{formatAEDFull(filteredPL.reduce((s, m) => s + m.costOfSales, 0))}</TableCell>
                      <TableCell className="text-xs text-right font-bold text-success">{formatAEDFull(totalGrossProfit)}</TableCell>
                      <TableCell className="text-xs text-right font-bold text-loss">{formatAEDFull(filteredPL.reduce((s, m) => s + m.indirectExpenses, 0))}</TableCell>
                      <TableCell className={`text-xs text-right font-bold ${totalNetProfit >= 0 ? "text-success" : "text-loss"}`}>
                        {formatAEDFull(totalNetProfit)}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default GarageDashboard;
