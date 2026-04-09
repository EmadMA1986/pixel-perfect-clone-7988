import { Link } from "react-router-dom";
import { TrendingUp, DollarSign, Wallet, Building2, ArrowLeft, BarChart3, Percent, User, Landmark, Users } from "lucide-react";
import SummaryCard from "@/components/SummaryCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatAED, balanceSheet } from "@/data/mkAutosData";

const MkAutosCompanyDashboard = () => {
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
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-serif font-bold text-foreground tracking-tight">MK Autos — Company</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Balance Sheet & Financial Overview</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/mk-autos">
              <Button variant="outline" size="sm" className="text-xs">← Cars Dashboard</Button>
            </Link>
            <Badge variant="secondary" className="text-xs">Currency: AED</Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Summary Cards */}
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

        {/* Balance Sheet */}
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

export default MkAutosCompanyDashboard;
