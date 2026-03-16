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
        {/* Ahmad's Capital Position */}
        <Card className="border-border/50 bg-gradient-to-r from-emerald-500/10 to-emerald-700/5 backdrop-blur-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs font-medium tracking-wider uppercase text-muted-foreground">Ahmad's Capital Position</p>
                <p className="text-[10px] text-muted-foreground">Partner Share: {ahmadCapital.sharePercentage}%</p>
              </div>
            </div>

            {/* Line 1: Share Capital */}
            <div className="flex flex-wrap items-center gap-6 mb-3 pb-3 border-b border-border/30">
              <div>
                <p className="text-xs text-muted-foreground">Share Capital</p>
                <p className="text-lg font-bold font-serif text-foreground">{formatAED(ahmadCapital.shareCapital)}</p>
              </div>
              <span className="text-muted-foreground text-lg">−</span>
              <div>
                <p className="text-xs text-muted-foreground">Loss Incurred</p>
                <p className="text-lg font-bold font-serif text-loss">{formatAED(Math.abs(ahmadCapital.lossIncurred))}</p>
              </div>
              <span className="text-muted-foreground text-lg">=</span>
              <div>
                <p className="text-xs text-muted-foreground font-semibold">Net Share Position</p>
                <p className="text-lg font-bold font-serif text-foreground">{formatAED(ahmadCapital.shareCapital + ahmadCapital.lossIncurred)}</p>
              </div>
            </div>

            {/* Line 2: Cars Position */}
            <div className="flex flex-wrap items-center gap-6">
              <div>
                <p className="text-xs text-muted-foreground">Total Cars Profit</p>
                <p className="text-lg font-bold font-serif text-success">{formatAED(ahmadCapital.totalCarsProfit)}</p>
              </div>
              <span className="text-muted-foreground text-lg">−</span>
              <div>
                <p className="text-xs text-muted-foreground">Cash Withdrawal</p>
                <p className="text-lg font-bold font-serif text-loss">{formatAED(ahmadCapital.cashWithdrawal)}</p>
              </div>
              <span className="text-muted-foreground text-lg">−</span>
              <div>
                <p className="text-xs text-muted-foreground">Cars Maintenance</p>
                <p className="text-lg font-bold font-serif text-loss">{formatAED(ahmadCapital.carsMaintenance)}</p>
              </div>
              <span className="text-muted-foreground text-lg">+</span>
              <div>
                <p className="text-xs text-muted-foreground">Loan</p>
                <p className="text-lg font-bold font-serif text-foreground">{formatAED(ahmadCapital.loan)}</p>
              </div>
              <span className="text-muted-foreground text-lg">=</span>
              <div>
                <p className="text-xs text-muted-foreground font-semibold">To Collect</p>
                <p className="text-xl font-bold font-serif text-success">{formatAED(ahmadCapital.positionAgainstCars)}</p>
                <p className="text-[10px] text-muted-foreground">From company</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <SummaryCard title="Initial Investment" value={formatAED(mkAutosSummary.totalInitialInvestment)} subtitle="Total cars cost" icon={Car} />
          <SummaryCard title="Net Book Value" value={formatAED(mkAutosSummary.totalNBV)} subtitle="Present value" icon={Wallet} />
          <SummaryCard title="Accounts Receivable" value={formatAED(288565.72)} subtitle="AR + Cases" icon={DollarSign} />
          <SummaryCard title="Bank Balance" value={formatAED(136474.44)} subtitle="Bank accounts" icon={Landmark} />
          <SummaryCard title="MK Garage (Sister Co.)" value={formatAED(85563.48)} subtitle="Inter-company" icon={Building2} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <SummaryCard title="ROI on Investment" value={`${mkAutosSummary.overallROI}%`} subtitle="On initial cost" icon={Percent} trend="up" />
          <SummaryCard title="ROI on NBV" value={`${mkAutosSummary.overallROINBV}%`} subtitle="On net book value" icon={BarChart3} trend="up" />
          <SummaryCard title="Maintenance" value={formatAED(mkAutosSummary.totalMaintenanceExpenses)} subtitle="Total maintenance" icon={DollarSign} />
          <SummaryCard title="Depreciation" value={formatAED(mkAutosSummary.totalDepreciation)} subtitle="Total depreciation" icon={TrendingUp} />
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
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">Total Profit</TableHead>
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">ROI %</TableHead>
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">Avg/Month</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vehicles.filter((v) => v.initialInvestment > 0).map((v) => (
                        <TableRow key={v.name} className="border-border/30 hover:bg-secondary/30">
                          <TableCell className="text-sm font-medium text-foreground">{v.name}</TableCell>
                          <TableCell className="text-sm tabular-nums text-right text-foreground">{formatAED(v.initialInvestment)}</TableCell>
                          <TableCell className="text-sm tabular-nums text-right text-muted-foreground">{formatAED(v.maintenanceExpenses)}</TableCell>
                          <TableCell className="text-sm tabular-nums text-right text-muted-foreground">{formatAED(v.totalDepreciation)}</TableCell>
                          <TableCell className="text-sm tabular-nums text-right text-foreground">{formatAED(v.nbv)}</TableCell>
                          <TableCell className="text-sm tabular-nums text-right font-medium text-success">{formatAED(v.totalProfit)}</TableCell>
                          <TableCell className="text-sm tabular-nums text-right">
                            <Badge variant="secondary" className="text-xs">{v.roiOnInvestment}%</Badge>
                          </TableCell>
                          <TableCell className="text-sm tabular-nums text-right text-foreground">{formatAED(v.avgMonthlyProfit)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="border-border/50 bg-secondary/30 font-semibold">
                        <TableCell className="text-sm text-foreground">Total</TableCell>
                        <TableCell className="text-sm tabular-nums text-right text-foreground">{formatAED(mkAutosSummary.totalInitialInvestment)}</TableCell>
                        <TableCell className="text-sm tabular-nums text-right text-muted-foreground">{formatAED(mkAutosSummary.totalMaintenanceExpenses)}</TableCell>
                        <TableCell className="text-sm tabular-nums text-right text-muted-foreground">{formatAED(mkAutosSummary.totalDepreciation)}</TableCell>
                        <TableCell className="text-sm tabular-nums text-right text-foreground">{formatAED(mkAutosSummary.totalNBV)}</TableCell>
                        <TableCell className="text-sm tabular-nums text-right font-bold text-success">{formatAED(mkAutosSummary.totalGrossProfit)}</TableCell>
                        <TableCell className="text-sm tabular-nums text-right">
                          <Badge variant="secondary" className="text-xs">{mkAutosSummary.overallROI}%</Badge>
                        </TableCell>
                        <TableCell className="text-sm tabular-nums text-right text-foreground">{formatAED(mkAutosSummary.avgMonthlyIncome)}</TableCell>
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
      </main>
    </div>
  );
};

export default MkAutosDashboard;
