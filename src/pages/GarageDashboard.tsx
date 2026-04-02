import { useMemo } from "react";
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

const GarageDashboard = () => {
  const totalSales = useMemo(() => monthlyPL.reduce((s, m) => s + m.sales, 0), []);
  const totalRevenue = useMemo(() => monthlyPL.reduce((s, m) => s + m.totalRevenue, 0), []);
  const totalGrossProfit = useMemo(() => monthlyPL.reduce((s, m) => s + m.grossProfit, 0), []);
  const totalNetProfit = useMemo(() => monthlyPL.reduce((s, m) => s + m.netProfit, 0), []);

  const revenueChartData = useMemo(
    () =>
      monthlyPL.map((m) => ({
        name: m.month,
        revenue: Math.round(m.totalRevenue),
        grossProfit: Math.round(m.grossProfit),
        netProfit: Math.round(m.netProfit),
      })),
    []
  );

  const expenseChartData = useMemo(
    () =>
      monthlyPL.map((m) => ({
        name: m.month,
        payroll: Math.round(m.payroll),
        rent: Math.round(m.rent),
        other: Math.round(m.indirectExpenses - m.payroll - m.rent),
      })),
    []
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
          <Badge variant="secondary" className="text-xs">
            Currency: AED
          </Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Ahmad's Capital Position */}
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

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <SummaryCard
            title="Total Revenue"
            value={formatAED(totalRevenue)}
            subtitle="Nov 24 – Feb 26"
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
            subtitle="Cumulative"
            icon={TrendingDown}
            trend="down"
          />
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
        </div>

        {/* Balance Sheet Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Liabilities */}
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Liabilities & Equity — as of Feb 28, 2026
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">Capital Account</p>
                {[
                  { label: "Manal Mussa", value: balanceSheet.capital.manalMussa },
                  { label: "Mr. Ahmed", value: balanceSheet.capital.mrAhmed },
                  { label: "Mr. Jamal", value: balanceSheet.capital.mrJamal },
                  { label: "Mr. Laavan", value: balanceSheet.capital.mrLaavan },
                ].map((i) => (
                  <div key={i.label} className="flex justify-between text-xs py-0.5">
                    <span className="text-muted-foreground">{i.label}</span>
                    <span className="font-medium text-foreground">{formatAEDFull(i.value)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-xs py-0.5 border-t border-border/50 mt-1 pt-1">
                  <span className="font-bold text-foreground">Total Capital</span>
                  <span className="font-bold text-foreground">{formatAEDFull(balanceSheet.capital.total)}</span>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">Loans</p>
                {[
                  { label: "Manal Mussa Current A/C", value: balanceSheet.loans.manalMussaCurrent },
                  { label: "Mr. Ahmed Current A/C", value: balanceSheet.loans.mrAhmedCurrent },
                  { label: "Sister Co. MK Autos", value: balanceSheet.loans.sisterCompanyMkAutos },
                  { label: "Employee Loan", value: balanceSheet.loans.employeeLoan },
                ].map((i) => (
                  <div key={i.label} className="flex justify-between text-xs py-0.5">
                    <span className="text-muted-foreground">{i.label}</span>
                    <span className="font-medium text-foreground">{formatAEDFull(i.value)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-xs py-0.5 border-t border-border/50 mt-1 pt-1">
                  <span className="font-bold text-foreground">Total Loans</span>
                  <span className="font-bold text-foreground">{formatAEDFull(balanceSheet.loans.total)}</span>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">Current Liabilities</p>
                {[
                  { label: "Accounts Payable", value: balanceSheet.currentLiabilities.accountsPayable },
                  { label: "Employee Salary", value: balanceSheet.currentLiabilities.employeeSalary },
                  { label: "Rent Liability", value: balanceSheet.currentLiabilities.rentLiability },
                  { label: "Duties & Taxes", value: balanceSheet.currentLiabilities.dutiesAndTaxes },
                ].map((i) => (
                  <div key={i.label} className="flex justify-between text-xs py-0.5">
                    <span className="text-muted-foreground">{i.label}</span>
                    <span className="font-medium text-foreground">{formatAEDFull(i.value)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-xs py-0.5 border-t border-border/50 mt-1 pt-1">
                  <span className="font-bold text-foreground">Total Current Liabilities</span>
                  <span className="font-bold text-loss">{formatAEDFull(balanceSheet.currentLiabilities.total)}</span>
                </div>
              </div>

              <div className="flex justify-between text-xs py-1">
                <span className="text-muted-foreground">P&L Account</span>
                <span className="font-bold text-loss">{formatAEDFull(balanceSheet.profitAndLoss)}</span>
              </div>

              <div className="flex justify-between text-sm pt-2 border-t border-border">
                <span className="font-bold text-foreground">Total Liabilities + Equity</span>
                <span className="font-bold text-foreground">{formatAEDFull(balanceSheet.totalLiabilities)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Assets */}
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Assets — as of Feb 28, 2026
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">Fixed Assets</p>
                {[
                  { label: "Goodwill (Ignite Garage)", value: balanceSheet.fixedAssets.goodwill },
                  { label: "Garage Tools", value: balanceSheet.fixedAssets.garageTools },
                  { label: "PPE", value: balanceSheet.fixedAssets.ppe },
                  { label: "Software", value: balanceSheet.fixedAssets.software },
                  { label: "Laptop", value: balanceSheet.fixedAssets.laptop },
                  { label: "Mobile", value: balanceSheet.fixedAssets.mobile },
                ].map((i) => (
                  <div key={i.label} className="flex justify-between text-xs py-0.5">
                    <span className="text-muted-foreground">{i.label}</span>
                    <span className="font-medium text-foreground">{formatAEDFull(i.value)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-xs py-0.5 border-t border-border/50 mt-1 pt-1">
                  <span className="font-bold text-foreground">Total Fixed Assets</span>
                  <span className="font-bold text-foreground">{formatAEDFull(balanceSheet.fixedAssets.total)}</span>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">Current Assets</p>
                {[
                  { label: "Accounts Receivable", value: balanceSheet.currentAssets.accountsReceivable },
                  { label: "Prepaid Rent", value: balanceSheet.currentAssets.prepaidRent },
                  { label: "Bank Accounts", value: balanceSheet.currentAssets.bankAccounts },
                  { label: "Cash-in-Hand", value: balanceSheet.currentAssets.cashInHand },
                ].map((i) => (
                  <div key={i.label} className="flex justify-between text-xs py-0.5">
                    <span className="text-muted-foreground">{i.label}</span>
                    <span className={`font-medium ${i.value < 0 ? "text-loss" : "text-foreground"}`}>
                      {i.value < 0 ? `(${formatAEDFull(Math.abs(i.value))})` : formatAEDFull(i.value)}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between text-xs py-0.5 border-t border-border/50 mt-1 pt-1">
                  <span className="font-bold text-foreground">Total Current Assets</span>
                  <span className="font-bold text-foreground">{formatAEDFull(balanceSheet.currentAssets.total)}</span>
                </div>
              </div>

              <div className="flex justify-between text-sm pt-2 border-t border-border">
                <span className="font-bold text-foreground">Total Assets</span>
                <span className="font-bold text-foreground">{formatAEDFull(balanceSheet.totalAssets)}</span>
              </div>
            </CardContent>
          </Card>
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

        {/* Financial Ratios */}
        {(() => {
          const totalCostOfSales = monthlyPL.reduce((s, m) => s + m.costOfSales, 0);
          const totalIndirectExp = monthlyPL.reduce((s, m) => s + m.indirectExpenses, 0);
          const totalEquity = balanceSheet.capital.total;
          const totalAssets = balanceSheet.totalAssets;
          const grossMargin = (totalGrossProfit / totalRevenue) * 100;
          const netMargin = (totalNetProfit / totalRevenue) * 100;
          const roe = (totalNetProfit / totalEquity) * 100;
          const roa = (totalNetProfit / totalAssets) * 100;
          const costToRevenueRatio = ((totalCostOfSales + totalIndirectExp) / totalRevenue) * 100;
          const operatingExpRatio = (totalIndirectExp / totalRevenue) * 100;
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
                  {monthlyPL.map((m) => (
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
                  <TableRow className="border-t-2 border-border">
                    <TableCell className="text-xs font-bold">TOTAL</TableCell>
                    <TableCell className="text-xs text-right font-bold">{formatAEDFull(monthlyPL.reduce((s, m) => s + m.sales, 0))}</TableCell>
                    <TableCell className="text-xs text-right font-bold">{formatAEDFull(monthlyPL.reduce((s, m) => s + m.directIncome, 0))}</TableCell>
                    <TableCell className="text-xs text-right font-bold">{formatAEDFull(totalRevenue)}</TableCell>
                    <TableCell className="text-xs text-right font-bold text-loss">{formatAEDFull(monthlyPL.reduce((s, m) => s + m.costOfSales, 0))}</TableCell>
                    <TableCell className="text-xs text-right font-bold text-success">{formatAEDFull(totalGrossProfit)}</TableCell>
                    <TableCell className="text-xs text-right font-bold text-loss">{formatAEDFull(monthlyPL.reduce((s, m) => s + m.indirectExpenses, 0))}</TableCell>
                    <TableCell className={`text-xs text-right font-bold ${totalNetProfit >= 0 ? "text-success" : "text-loss"}`}>
                      {formatAEDFull(totalNetProfit)}
                    </TableCell>
                  </TableRow>
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
