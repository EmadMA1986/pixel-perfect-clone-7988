import { useMemo } from "react";
import { Link } from "react-router-dom";
import { TrendingUp, TrendingDown, DollarSign, Wallet, Users, AlertTriangle, Building, ArrowLeft } from "lucide-react";
import SummaryCard from "@/components/SummaryCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend } from "recharts";
import { otcSummary, monthlyPL, expenseBreakdown, partnerCapital, capitalDeposits, capitalWithdrawals, scamLosses, formatAED } from "@/data/otcData";

const OtcDashboard = () => {
  const totalGrossProfit = monthlyPL.reduce((s, m) => s + m.grossProfit, 0);
  const totalNetProfit = monthlyPL.reduce((s, m) => s + m.netProfit, 0);
  const profitableMonths = monthlyPL.filter((m) => m.netProfit > 0).length;

  const chartData = useMemo(
    () =>
      monthlyPL.map((m) => ({
        name: m.month.replace("Jan-Dec 2024", "2024"),
        gross: Math.round(m.grossProfit),
        expenses: Math.round(m.cashExpenses),
        scam: Math.round(m.scam),
        net: Math.round(m.netProfit),
      })),
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
              <h1 className="text-xl font-serif font-bold text-foreground tracking-tight">OTC Business</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Financial Dashboard</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">Currency: AED</Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <SummaryCard title="Net Profit (YTD)" value={formatAED(otcSummary.netProfitYTD)} subtitle={`${profitableMonths}/${monthlyPL.length} profitable months`} icon={TrendingUp} trend="up" />
          <SummaryCard title="Gross Profit" value={formatAED(otcSummary.grossProfitYTD)} subtitle="Total YTD" icon={DollarSign} />
          <SummaryCard title="Cash Expenses" value={formatAED(otcSummary.cashExpensesYTD)} subtitle="Total YTD" icon={Wallet} />
          <SummaryCard title="Scam Loss" value={formatAED(otcSummary.scamYTD)} subtitle="Robbery + Scam" icon={AlertTriangle} trend="down" />
          <SummaryCard title="Net Capital" value={formatAED(otcSummary.netCapital)} subtitle={`Initial: ${formatAED(otcSummary.initialCapital)}`} icon={Users} />
          <SummaryCard title="Cash Position" value={formatAED(otcSummary.cashPosition)} subtitle="Current balance" icon={DollarSign} />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly P&L Bar Chart */}
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-serif text-foreground">Monthly Gross Profit vs Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 40, left: 5 }}>
                  <XAxis dataKey="name" tick={{ fill: "hsl(220 10% 50%)", fontSize: 9 }} angle={-45} textAnchor="end" axisLine={{ stroke: "hsl(220 14% 18%)" }} tickLine={false} />
                  <YAxis tick={{ fill: "hsl(220 10% 50%)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(220 16% 11%)", border: "1px solid hsl(220 14% 18%)", borderRadius: "8px", color: "hsl(40 20% 90%)", fontSize: 12 }} formatter={(value: number) => [formatAED(value), ""]} />
                  <Bar dataKey="gross" name="Gross Profit" fill="hsl(43, 74%, 52%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" name="Expenses" fill="hsl(200, 50%, 45%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Net Profit Trend */}
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-serif text-foreground">Net Profit Trend</CardTitle>
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

        {/* Tabs */}
        <Tabs defaultValue="monthly" className="space-y-4">
          <TabsList className="bg-secondary/50">
            <TabsTrigger value="monthly">Monthly P&L</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="capital">Partners</TabsTrigger>
          </TabsList>

          {/* Monthly P&L Table */}
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
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">Gross Profit</TableHead>
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">Expenses</TableHead>
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">Scam</TableHead>
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">Net Profit</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {monthlyPL.map((row) => (
                        <TableRow key={row.month} className="border-border/30 hover:bg-secondary/30">
                          <TableCell className="text-sm font-medium text-foreground">{row.month}</TableCell>
                          <TableCell className="text-sm tabular-nums text-right text-foreground">{formatAED(row.grossProfit)}</TableCell>
                          <TableCell className="text-sm tabular-nums text-right text-muted-foreground">{formatAED(row.cashExpenses)}</TableCell>
                          <TableCell className="text-sm tabular-nums text-right text-loss">{row.scam > 0 ? formatAED(row.scam) : "—"}</TableCell>
                          <TableCell className={`text-sm tabular-nums text-right font-medium ${row.netProfit >= 0 ? "text-success" : "text-loss"}`}>{formatAED(row.netProfit)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="border-border/50 bg-secondary/30 font-semibold">
                        <TableCell className="text-sm text-foreground">Total</TableCell>
                        <TableCell className="text-sm tabular-nums text-right text-foreground">{formatAED(totalGrossProfit)}</TableCell>
                        <TableCell className="text-sm tabular-nums text-right text-muted-foreground">{formatAED(monthlyPL.reduce((s, m) => s + m.cashExpenses, 0))}</TableCell>
                        <TableCell className="text-sm tabular-nums text-right text-loss">{formatAED(monthlyPL.reduce((s, m) => s + m.scam, 0))}</TableCell>
                        <TableCell className={`text-sm tabular-nums text-right font-bold ${totalNetProfit >= 0 ? "text-success" : "text-loss"}`}>{formatAED(totalNetProfit)}</TableCell>
                      </TableRow>
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
              {/* Partner Summary Cards */}
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
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
                      <div className="p-3 rounded-lg bg-secondary/30">
                        <p className="text-muted-foreground mb-1">Total Funding</p>
                        <p className="tabular-nums font-bold text-foreground">{formatAED(p.funding)}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-secondary/30">
                        <p className="text-muted-foreground mb-1">Total Withdrawal</p>
                        <p className="tabular-nums font-bold text-loss">{formatAED(p.withdrawal)}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-secondary/30">
                        <p className="text-muted-foreground mb-1">Net Capital</p>
                        <p className={`tabular-nums font-bold ${p.net >= 0 ? "text-success" : "text-loss"}`}>{formatAED(p.net)}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-secondary/30">
                        <p className="text-muted-foreground mb-1">Scam Loss</p>
                        <p className="tabular-nums font-bold text-loss">{formatAED(p.scamLoss)}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-secondary/30">
                        <p className="text-muted-foreground mb-1">Expenses Share</p>
                        <p className="tabular-nums font-bold text-muted-foreground">{formatAED(p.expenses)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Deposits Table */}
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-serif text-foreground">Capital Deposits</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border/50 hover:bg-transparent">
                          <TableHead className="text-xs text-muted-foreground uppercase tracking-wider">Date</TableHead>
                          <TableHead className="text-xs text-muted-foreground uppercase tracking-wider">Description</TableHead>
                          <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">Maria (USDT)</TableHead>
                          <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">Ahmad (USDT)</TableHead>
                          <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">Maria (AED)</TableHead>
                          <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">Ahmad (AED)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {capitalDeposits.map((row, i) => (
                          <TableRow key={i} className="border-border/30 hover:bg-secondary/30">
                            <TableCell className="text-sm text-foreground">{row.date}</TableCell>
                            <TableCell className="text-sm font-medium text-foreground">{row.description}</TableCell>
                            <TableCell className="text-sm tabular-nums text-right text-foreground">{row.mariaUSDT ? `$${row.mariaUSDT.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "—"}</TableCell>
                            <TableCell className="text-sm tabular-nums text-right text-foreground">{row.ahmadUSDT ? `$${row.ahmadUSDT.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "—"}</TableCell>
                            <TableCell className="text-sm tabular-nums text-right text-foreground">{row.mariaAED ? formatAED(row.mariaAED) : "—"}</TableCell>
                            <TableCell className="text-sm tabular-nums text-right text-foreground">{row.ahmadAED ? formatAED(row.ahmadAED) : "—"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Withdrawals Table */}
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-serif text-foreground">Capital Withdrawals</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border/50 hover:bg-transparent">
                          <TableHead className="text-xs text-muted-foreground uppercase tracking-wider">Date</TableHead>
                          <TableHead className="text-xs text-muted-foreground uppercase tracking-wider">Description</TableHead>
                          <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">Maria (USDT)</TableHead>
                          <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">Ahmad (USDT)</TableHead>
                          <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">Maria (AED)</TableHead>
                          <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">Ahmad (AED)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {capitalWithdrawals.map((row, i) => (
                          <TableRow key={i} className="border-border/30 hover:bg-secondary/30">
                            <TableCell className="text-sm text-foreground">{row.date}</TableCell>
                            <TableCell className="text-sm font-medium text-foreground">{row.description}</TableCell>
                            <TableCell className="text-sm tabular-nums text-right text-loss">{row.mariaUSDT ? `$${row.mariaUSDT.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "—"}</TableCell>
                            <TableCell className="text-sm tabular-nums text-right text-loss">{row.ahmadUSDT ? `$${row.ahmadUSDT.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "—"}</TableCell>
                            <TableCell className="text-sm tabular-nums text-right text-loss">{row.mariaAED ? formatAED(row.mariaAED) : "—"}</TableCell>
                            <TableCell className="text-sm tabular-nums text-right text-loss">{row.ahmadAED ? formatAED(row.ahmadAED) : "—"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Scam Losses Table */}
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-serif text-foreground">Scam Losses</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border/50 hover:bg-transparent">
                          <TableHead className="text-xs text-muted-foreground uppercase tracking-wider">Date</TableHead>
                          <TableHead className="text-xs text-muted-foreground uppercase tracking-wider">Description</TableHead>
                          <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">Maria (AED)</TableHead>
                          <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">Ahmad (AED)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {scamLosses.map((row, i) => (
                          <TableRow key={i} className="border-border/30 hover:bg-secondary/30">
                            <TableCell className="text-sm text-foreground">{row.date}</TableCell>
                            <TableCell className="text-sm font-medium text-foreground">{row.description}</TableCell>
                            <TableCell className="text-sm tabular-nums text-right text-loss">{row.mariaAED ? formatAED(row.mariaAED) : "—"}</TableCell>
                            <TableCell className="text-sm tabular-nums text-right text-loss">{row.ahmadAED ? formatAED(row.ahmadAED) : "—"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Combined Summary */}
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
                        <p className="text-muted-foreground">Scam Loss</p>
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
