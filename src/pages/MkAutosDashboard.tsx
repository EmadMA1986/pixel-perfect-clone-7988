import { useMemo } from "react";
import { Link } from "react-router-dom";
import { TrendingUp, DollarSign, Wallet, Car, ArrowLeft, BarChart3, Percent, User, Building2, Landmark, Users } from "lucide-react";
import SummaryCard from "@/components/SummaryCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from "recharts";
import { mkAutosSummary, vehicles, monthlyIncome, formatAED, ahmadCapital, balanceSheet } from "@/data/mkAutosData";

const MkAutosDashboard = () => {
  const incomeChartData = useMemo(
    () => monthlyIncome.filter((m) => m.total > 0).map((m) => ({ name: m.month, total: Math.round(m.total) })),
    []
  );

  const vehicleProfitData = useMemo(
    () => vehicles.filter((v) => v.totalProfit > 1500).map((v) => ({ name: v.name.split(" -")[0].split(" 20")[0], value: Math.round(v.totalProfit) })),
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
    "hsl(170, 50%, 45%)",
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
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
              <Car className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-serif font-bold text-foreground tracking-tight">MK Autos</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Rental Business Dashboard</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">Currency: AED</Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Ahmad's Capital Position Bar */}
        <Card className="border-border/50 bg-gradient-to-r from-emerald-500/10 to-emerald-700/5 backdrop-blur-sm">
          <CardContent className="p-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs font-medium tracking-wider uppercase text-muted-foreground">Ahmad's Initial Investment</p>
                <p className="text-2xl font-bold font-serif text-foreground">{formatAED(ahmadCapital.totalCarsInvestment)}</p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Net Profit</p>
              <p className="text-xl font-bold font-serif text-success">{formatAED(ahmadCapital.totalCarsProfit)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Cash Withdrawal</p>
              <p className="text-xl font-bold font-serif text-loss">{formatAED(ahmadCapital.cashWithdrawal)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">ROI / ROI on NBV</p>
              <p className="text-xl font-bold font-serif text-foreground">{mkAutosSummary.overallROI}% / {mkAutosSummary.overallROINBV}%</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Ahmad's Net Position</p>
              <p className="text-xl font-bold font-serif text-success">{formatAED(ahmadCapital.positionAgainstCars)}</p>
              <p className="text-[10px] text-muted-foreground">MK Autos owes Ahmad</p>
            </div>
          </CardContent>
        </Card>

        {/* Line 1: Ahmad's Car Investment Details */}
        <div>
          <p className="text-xs font-medium tracking-wider uppercase text-muted-foreground mb-2">Ahmad's Car Investment</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <SummaryCard title="Maintenance" value={formatAED(ahmadCapital.carsMaintenance)} subtitle="Cars upkeep" icon={DollarSign} />
            <SummaryCard title="Depreciation" value={formatAED(mkAutosSummary.totalDepreciation)} subtitle="Total depreciation" icon={TrendingUp} trend="down" />
            <SummaryCard title="NBV" value={formatAED(mkAutosSummary.totalNBV)} subtitle="Net book value" icon={Car} />
            
            <SummaryCard title="Share Capital" value={formatAED(ahmadCapital.shareCapital)} subtitle={`${ahmadCapital.sharePercentage}% share`} icon={User} />
            <SummaryCard title="Avg Monthly" value={formatAED(mkAutosSummary.avgMonthlyIncome)} subtitle="Monthly income" icon={BarChart3} />
          </div>
        </div>

        {/* Line 2: MK Autos Balance Sheet Numbers */}
        <div>
          <p className="text-xs font-medium tracking-wider uppercase text-muted-foreground mb-2">MK Autos — As at 28-Feb-26</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-8 gap-3">
            <SummaryCard title="Capital Account" value={formatAED(balanceSheet.capitalAccount)} subtitle="Ahmad + Jamal + Moez" icon={Users} />
            <SummaryCard title="Accounts Receivable" value={formatAED(288565.72)} subtitle="Outstanding" icon={DollarSign} />
            <SummaryCard title="Cash-in-Hand" value={formatAED(26277.50)} subtitle="Petty cash" icon={Wallet} />
            <SummaryCard title="Bank Accounts" value={formatAED(136474.44)} subtitle="Bank balance" icon={Landmark} />
            <SummaryCard title="Current Liabilities" value={formatAED(balanceSheet.currentLiabilities.total)} subtitle="Payables & dues" icon={TrendingUp} />
            <SummaryCard title="Profit & Loss" value={formatAED(Math.abs(balanceSheet.profitLoss.total))} subtitle={balanceSheet.profitLoss.total < 0 ? "Net loss" : "Net profit"} icon={BarChart3} trend={balanceSheet.profitLoss.total >= 0 ? "up" : "down"} />
            <SummaryCard title="Banks Loans" value={formatAED(971068.98 + 842719.32 + 1120731.74)} subtitle="ADIB + Emirates Islamic" icon={Building2} />
            <SummaryCard title="Investors Balance" value={formatAED(419421.19 + 130441.97 + 32653.34 + 7114.85 + 20908.07 + 7793.89 + -1170 + 20154.48 + 45000 + 12239.71)} subtitle="All investors" icon={User} />
          </div>
        </div>

        {/* Financial Ratios */}
        {/* Financial Ratios */}
        <div>
          <p className="text-xs font-medium tracking-wider uppercase text-muted-foreground mb-2">Financial Ratios</p>
          <div className="grid grid-cols-2 gap-3">
            <SummaryCard
              title="Current Ratio"
              value={`${(536881 / balanceSheet.currentLiabilities.total).toFixed(2)}x`}
              subtitle={536881 / balanceSheet.currentLiabilities.total >= 2 ? "✅ Healthy" : 536881 / balanceSheet.currentLiabilities.total >= 1 ? "⚠ Adequate" : "⚠ Risky — below 1x"}
              icon={BarChart3}
              trend={536881 / balanceSheet.currentLiabilities.total >= 1 ? "up" : "down"}
            />
            <Card className="relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
              <CardContent className="p-5 relative">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 w-full">
                    <p className="text-xs font-medium tracking-wider uppercase text-muted-foreground">Debt-to-Equity</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-bold font-serif text-foreground">
                        {(balanceSheet.loans.total / balanceSheet.capitalAccount).toFixed(2)}x
                      </p>
                      <span className={`text-xs font-medium ${balanceSheet.loans.total / balanceSheet.capitalAccount > 5 ? "text-loss" : "text-success"}`}>
                        {balanceSheet.loans.total / balanceSheet.capitalAccount > 10 ? "⚠ Very High Risk" : balanceSheet.loans.total / balanceSheet.capitalAccount > 5 ? "⚠ High Risk" : balanceSheet.loans.total / balanceSheet.capitalAccount > 2 ? "Moderate" : "Healthy"}
                      </span>
                    </div>
                    <div className="flex gap-4 pt-1 border-t border-border/30">
                      <div>
                        <p className="text-[10px] text-muted-foreground">Bank Loans</p>
                        <p className="text-sm font-semibold font-serif text-foreground">
                          {((971068.98 + 842719.32 + 1120731.74) / balanceSheet.capitalAccount).toFixed(2)}x
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground">Investors</p>
                        <p className="text-sm font-semibold font-serif text-foreground">
                          {((419421.19 + 130441.97 + 32653.34 + 7114.85 + 20908.07 + 7793.89 + -1170 + 20154.48 + 45000 + 12239.71) / balanceSheet.capitalAccount).toFixed(2)}x
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Percent className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Vehicle Performance Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Income vs Depreciation per Vehicle */}
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Income vs Depreciation by Vehicle</CardTitle>
              <p className="text-[10px] text-muted-foreground">Monthly avg income vs monthly depreciation cost</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={vehicles.filter(v => v.initialInvestment > 0).map(v => ({
                  name: v.name.split(" -")[0].split(" 20")[0],
                  income: Math.round(v.avgMonthlyProfit),
                  depreciation: v.monthsOfProfit > 0 ? Math.round(v.totalDepreciation / v.monthsOfProfit) : 0,
                }))} layout="vertical" margin={{ left: 70, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} width={65} />
                  <Tooltip formatter={(v: number) => [formatAED(v), ""]} />
                  <Bar dataKey="income" name="Monthly Income" fill="hsl(142, 71%, 45%)" radius={[0, 2, 2, 0]} />
                  <Bar dataKey="depreciation" name="Monthly Depr." fill="hsl(0, 60%, 50%)" radius={[0, 2, 2, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Vehicle Scorecard */}
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Vehicle Performance Scorecard</CardTitle>
              <p className="text-[10px] text-muted-foreground">Ranked by Real ROI (income after depreciation)</p>
            </CardHeader>
            <CardContent className="space-y-2">
              {vehicles.filter(v => v.initialInvestment > 0).sort((a, b) => b.realROI - a.realROI).map(v => (
                <div key={v.name} className="flex items-center justify-between text-xs p-2 rounded-lg bg-muted/20 border border-border/20">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${v.realROI >= 0 ? "bg-success" : "bg-loss"}`} />
                    <span className="font-medium text-foreground">{v.name.split(" -")[0].split(" 20")[0]}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-[10px] text-muted-foreground">Real ROI</p>
                      <p className={`font-bold ${v.realROI >= 0 ? "text-success" : "text-loss"}`}>{v.realROI}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-muted-foreground">Avg/Mo</p>
                      <p className="font-medium text-foreground">{formatAED(v.avgMonthlyProfit)}</p>
                    </div>
                    <Badge variant={v.realROI >= 0 ? "default" : "destructive"} className="text-[10px]">
                      {v.realROI >= 5 ? "⭐ Keep" : v.realROI >= 0 ? "Hold" : v.realROI >= -10 ? "Watch" : "Consider Sell"}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Income Trend */}
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-serif text-foreground">Monthly Rental Income</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={incomeChartData} margin={{ top: 5, right: 5, bottom: 40, left: 5 }}>
                  <XAxis dataKey="name" tick={{ fill: "hsl(220 10% 50%)", fontSize: 9 }} angle={-45} textAnchor="end" axisLine={{ stroke: "hsl(220 14% 18%)" }} tickLine={false} />
                  <YAxis tick={{ fill: "hsl(220 10% 50%)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(220 16% 11%)", border: "1px solid hsl(220 14% 18%)", borderRadius: "8px", color: "hsl(40 20% 90%)", fontSize: 12 }} formatter={(value: number) => [formatAED(value), ""]} />
                  <Bar dataKey="total" name="Income" fill="hsl(160, 50%, 40%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Profit by Vehicle Pie */}
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-serif text-foreground">Profit by Vehicle</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col lg:flex-row items-center gap-4">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={vehicleProfitData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value" stroke="none">
                      {vehicleProfitData.map((_, i) => (
                        <Cell key={i} fill={pieColors[i % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "hsl(220 16% 11%)", border: "1px solid hsl(220 14% 18%)", borderRadius: "8px", color: "hsl(40 20% 90%)", fontSize: 12 }} formatter={(value: number) => [formatAED(value), ""]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 w-full lg:w-auto">
                  {vehicleProfitData.map((item, i) => (
                    <div key={item.name} className="flex items-center gap-2 text-xs">
                      <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: pieColors[i % pieColors.length] }} />
                      <span className="text-muted-foreground whitespace-nowrap">{item.name}</span>
                      <span className="ml-auto tabular-nums font-medium text-foreground">{formatAED(item.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="fleet" className="space-y-4">
          <TabsList className="bg-secondary/50">
            <TabsTrigger value="fleet">Vehicle Fleet</TabsTrigger>
            <TabsTrigger value="monthly">Monthly Income</TabsTrigger>
            <TabsTrigger value="scorecard">Performance Scorecard</TabsTrigger>
          </TabsList>

          {/* Fleet Overview */}
          <TabsContent value="fleet">
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-serif text-foreground">Vehicle Fleet Overview</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/50 hover:bg-transparent">
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider">Vehicle</TableHead>
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">Investment</TableHead>
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">Maintenance</TableHead>
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">Depreciation</TableHead>
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">NBV</TableHead>
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">Income</TableHead>
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">Net Profit</TableHead>
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">Real Profit</TableHead>
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">Cash ROI</TableHead>
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">Real ROI</TableHead>
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">Sale Value</TableHead>
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">Final ROI</TableHead>
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">Avg/Month</TableHead>
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-center">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vehicles.map((v) => {
                        const rec = v.initialInvestment > 0 ? (v.realROI >= 5 ? "Keep" : v.realROI >= 0 ? "Hold" : v.realROI >= -10 ? "Watch" : "Sell") : null;
                        const recColor = rec === "Keep" ? "default" : rec === "Hold" ? "secondary" : rec === "Watch" ? "outline" : "destructive";
                        const recIcon = rec === "Keep" ? "⭐" : rec === "Hold" ? "✋" : rec === "Watch" ? "👁" : "🔻";
                        return (
                          <TableRow key={v.name} className="border-border/30 hover:bg-secondary/30">
                            <TableCell className="text-sm font-medium text-foreground">{v.name}</TableCell>
                            <TableCell className="text-sm tabular-nums text-right text-foreground">{v.initialInvestment ? formatAED(v.initialInvestment) : "-"}</TableCell>
                            <TableCell className="text-sm tabular-nums text-right text-muted-foreground">{v.maintenanceExpenses ? formatAED(v.maintenanceExpenses) : "-"}</TableCell>
                            <TableCell className="text-sm tabular-nums text-right text-muted-foreground">{v.totalDepreciation ? formatAED(v.totalDepreciation) : "-"}</TableCell>
                            <TableCell className="text-sm tabular-nums text-right text-foreground">{v.nbv ? formatAED(v.nbv) : "-"}</TableCell>
                            <TableCell className="text-sm tabular-nums text-right font-medium text-success">{v.totalProfit ? formatAED(v.totalProfit) : "-"}</TableCell>
                            <TableCell className={`text-sm tabular-nums text-right font-medium ${v.netProfit >= 0 ? "text-success" : "text-destructive"}`}>{formatAED(v.netProfit)}</TableCell>
                            <TableCell className={`text-sm tabular-nums text-right ${v.realProfit >= 0 ? "text-success" : "text-destructive"}`}>{formatAED(v.realProfit)}</TableCell>
                            <TableCell className="text-sm tabular-nums text-right">
                              {v.roiOnInvestment ? <Badge variant="secondary" className="text-xs">{v.roiOnInvestment}%</Badge> : "-"}
                            </TableCell>
                            <TableCell className={`text-sm tabular-nums text-right ${v.realROI >= 0 ? "text-success" : "text-destructive"}`}>
                              {v.realROI ? `${v.realROI}%` : "-"}
                            </TableCell>
                            <TableCell className="text-sm tabular-nums text-right text-foreground">{v.saleValue ? formatAED(v.saleValue) : "-"}</TableCell>
                            <TableCell className={`text-sm tabular-nums text-right ${v.finalROI >= 0 ? "text-success" : "text-destructive"}`}>
                              {v.finalROI ? `${v.finalROI}%` : "-"}
                            </TableCell>
                            <TableCell className="text-sm tabular-nums text-right text-foreground">{v.avgMonthlyProfit ? formatAED(v.avgMonthlyProfit) : "-"}</TableCell>
                            <TableCell className="text-center">
                              {rec ? (
                                <Badge variant={recColor as any} className="text-xs">
                                  {recIcon} {rec}
                                </Badge>
                              ) : "-"}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      <TableRow className="border-border/50 bg-secondary/30 font-semibold">
                        <TableCell className="text-sm text-foreground">Total</TableCell>
                        <TableCell className="text-sm tabular-nums text-right text-foreground">{formatAED(mkAutosSummary.totalInitialInvestment)}</TableCell>
                        <TableCell className="text-sm tabular-nums text-right text-muted-foreground">{formatAED(mkAutosSummary.totalMaintenanceExpenses)}</TableCell>
                        <TableCell className="text-sm tabular-nums text-right text-muted-foreground">{formatAED(mkAutosSummary.totalDepreciation)}</TableCell>
                        <TableCell className="text-sm tabular-nums text-right text-foreground">{formatAED(mkAutosSummary.totalNBV)}</TableCell>
                        <TableCell className="text-sm tabular-nums text-right font-bold text-success">{formatAED(mkAutosSummary.totalGrossProfit)}</TableCell>
                        <TableCell className="text-sm tabular-nums text-right font-bold text-success">{formatAED(mkAutosSummary.netProfit)}</TableCell>
                        <TableCell className="text-sm tabular-nums text-right text-destructive">{formatAED(-355470.15)}</TableCell>
                        <TableCell className="text-sm tabular-nums text-right">
                          <Badge variant="secondary" className="text-xs">{mkAutosSummary.overallROI}%</Badge>
                        </TableCell>
                        <TableCell className="text-sm tabular-nums text-right text-destructive">{mkAutosSummary.realROI}%</TableCell>
                        <TableCell className="text-sm tabular-nums text-right text-foreground">{formatAED(mkAutosSummary.totalSaleValue)}</TableCell>
                        <TableCell className={`text-sm tabular-nums text-right ${mkAutosSummary.finalROI >= 0 ? "text-success" : "text-destructive"}`}>{mkAutosSummary.finalROI}%</TableCell>
                        <TableCell className="text-sm tabular-nums text-right text-foreground">{formatAED(mkAutosSummary.avgMonthlyIncome)}</TableCell>
                        <TableCell />
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Monthly Income */}
          <TabsContent value="monthly">
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-serif text-foreground">Monthly Income by Vehicle</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/50 hover:bg-transparent">
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider">Month</TableHead>
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">G63</TableHead>
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">Lambo</TableHead>
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">Corvette</TableHead>
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">Cadillac</TableHead>
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">Patrol</TableHead>
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">BMW</TableHead>
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">GLE 53</TableHead>
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">C 200</TableHead>
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right font-bold">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {monthlyIncome.map((row) => (
                        <TableRow key={row.month} className="border-border/30 hover:bg-secondary/30">
                          <TableCell className="text-sm font-medium text-foreground whitespace-nowrap">{row.month}</TableCell>
                          <TableCell className="text-sm tabular-nums text-right text-muted-foreground">{row.g63 > 0 ? formatAED(row.g63) : "—"}</TableCell>
                          <TableCell className="text-sm tabular-nums text-right text-muted-foreground">{row.lamborghini > 0 ? formatAED(row.lamborghini) : "—"}</TableCell>
                          <TableCell className="text-sm tabular-nums text-right text-muted-foreground">{row.corvette > 0 ? formatAED(row.corvette) : "—"}</TableCell>
                          <TableCell className="text-sm tabular-nums text-right text-muted-foreground">{row.cadillac > 0 ? formatAED(row.cadillac) : "—"}</TableCell>
                          <TableCell className="text-sm tabular-nums text-right text-muted-foreground">{row.patrol > 0 ? formatAED(row.patrol) : "—"}</TableCell>
                          <TableCell className="text-sm tabular-nums text-right text-muted-foreground">{row.bmw440i > 0 ? formatAED(row.bmw440i) : "—"}</TableCell>
                          <TableCell className="text-sm tabular-nums text-right text-muted-foreground">{row.gle53 > 0 ? formatAED(row.gle53) : "—"}</TableCell>
                          <TableCell className="text-sm tabular-nums text-right text-muted-foreground">{row.c200 > 0 ? formatAED(row.c200) : "—"}</TableCell>
                          <TableCell className="text-sm tabular-nums text-right font-medium text-success">{row.total > 0 ? formatAED(row.total) : "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Balance Sheet Summary */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-serif text-foreground">MK Autos Balance Sheet</CardTitle>
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
              {balanceSheet.currentAssets.items.filter(i => i.amount !== 0).map((item) => (
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
      </main>
    </div>
  );
};

export default MkAutosDashboard;
