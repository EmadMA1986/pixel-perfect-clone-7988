import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import NavLink from "@/components/NavLink";
import { Briefcase, TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3, Building2, Car, Bitcoin, Wrench, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart as RechartsPie, Pie, Legend } from "recharts";

// Import data from all companies
import { partnerCapital, otcSummary } from "@/data/otcData";
import { ahmadCapital as mkAutosAhmad, mkAutosSummary, balanceSheet as mkAutosBS } from "@/data/mkAutosData";
import { mkxSummary, balanceSheet as mkxBS } from "@/data/mkxData";
import { monthlyPL as garagePL, balanceSheet as garageBS, ahmadGarage } from "@/data/garageData";

const formatAED = (v: number) =>
  `AED ${Math.abs(v).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const formatAEDShort = (v: number) => {
  const abs = Math.abs(v);
  const formatted = abs >= 1_000_000 ? `${(abs / 1_000_000).toFixed(2)}M` : abs >= 1_000 ? `${(abs / 1_000).toFixed(1)}K` : abs.toFixed(0);
  return `${v < 0 ? "-" : ""}AED ${formatted}`;
};

const CombinedDashboard = () => {
  const navigate = useNavigate();

  // === Ahmad's positions across all 4 companies ===

  // 1. OTC Trading (50/50 with Maria)
  const otcInvestment = partnerCapital.ahmad.funding; // 2,020,187
  const otcProfitShare = partnerCapital.ahmad.profitShare; // 1,368,913
  const otcNetPosition = partnerCapital.ahmad.netPosition; // 1,130,579
  const otcROI = (otcProfitShare / otcInvestment) * 100;

  // 2. MK Autos (22%)
  const mkAutosInvestment = mkAutosAhmad.totalCarsInvestment * (mkAutosAhmad.sharePercentage / 100); // 22% of 4.3M
  const mkAutosProfit = mkAutosAhmad.totalCarsProfit * (mkAutosAhmad.sharePercentage / 100);
  const mkAutosPosition = mkAutosAhmad.positionAgainstCars * (mkAutosAhmad.sharePercentage / 100);
  const mkAutosROI = (mkAutosProfit / mkAutosInvestment) * 100;

  // 3. MKX Crypto (50%)
  const mkxShareCapital = 5329871.48;
  const mkxCryptoInjection = 1688442;
  const mkxTotalInvestment = mkxShareCapital + mkxCryptoInjection;
  const mkxTotalLoss = mkxSummary.fullYearNetEarnings; // -4,603,995
  const mkxLossShare = mkxTotalLoss * 0.5;
  const mkxRetainedEarnings = -7261014.27;
  const mkxNetIncome = -698389.49;
  const mkxTotalPL = (mkxRetainedEarnings + mkxNetIncome) * 0.5;
  const mkxNetPosition = mkxShareCapital + mkxTotalPL;
  const mkxROI = (mkxTotalPL / mkxShareCapital) * 100;

  // 4. MK Garage (40%)
  const garageInvestment = ahmadGarage.shareCapital; // 520,000
  const garageTotalNetProfit = garagePL.reduce((s, m) => s + m.netProfit, 0);
  const garageProfitShare = garageTotalNetProfit * (ahmadGarage.sharePercent / 100);
  const garageNetPosition = garageInvestment + garageProfitShare;
  const garageROI = (garageProfitShare / garageInvestment) * 100;

  // Combined totals
  const totalInvestment = otcInvestment + mkAutosInvestment + mkxShareCapital + garageInvestment;
  const totalProfit = otcProfitShare + mkAutosProfit + mkxTotalPL + garageProfitShare;
  const totalNetPosition = otcNetPosition + mkAutosPosition + mkxNetPosition + garageNetPosition;
  const overallROI = (totalProfit / totalInvestment) * 100;

  const companies = [
    {
      name: "OTC Trading",
      icon: DollarSign,
      route: "/otc",
      share: "50%",
      investment: otcInvestment,
      profit: otcProfitShare,
      netPosition: otcNetPosition,
      roi: otcROI,
      color: "hsl(var(--chart-1))",
    },
    {
      name: "MK Autos",
      icon: Car,
      route: "/mk-autos",
      share: "22%",
      investment: mkAutosInvestment,
      profit: mkAutosProfit,
      netPosition: mkAutosPosition,
      roi: mkAutosROI,
      color: "hsl(var(--chart-2))",
    },
    {
      name: "MKX Crypto",
      icon: Bitcoin,
      route: "/mkx",
      share: "50%",
      investment: mkxShareCapital,
      profit: mkxTotalPL,
      netPosition: mkxNetPosition,
      roi: mkxROI,
      color: "hsl(var(--chart-3))",
    },
    {
      name: "MK Garage",
      icon: Wrench,
      route: "/garage",
      share: "40%",
      investment: garageInvestment,
      profit: garageProfitShare,
      netPosition: garageNetPosition,
      roi: garageROI,
      color: "hsl(var(--chart-4))",
    },
  ];

  const roiChartData = companies.map(c => ({
    name: c.name,
    roi: parseFloat(c.roi.toFixed(1)),
    color: c.color,
  }));

  const investmentPieData = companies.map(c => ({
    name: c.name,
    value: c.investment,
    color: c.color,
  }));

  const profitChartData = companies.map(c => ({
    name: c.name,
    profit: c.profit,
    color: c.color,
  }));

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Briefcase className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-xl font-bold font-serif text-foreground">Ahmad's Investment Portfolio</h1>
              <p className="text-xs text-muted-foreground">Combined view across all companies</p>
            </div>
          </div>
          <nav className="flex items-center gap-1">
            <NavLink to="/" icon={BarChart3} label="RYA Gold" />
            <NavLink to="/otc" icon={DollarSign} label="OTC" />
            <NavLink to="/mk-autos" icon={Car} label="MK Autos" />
            <NavLink to="/mkx" icon={Bitcoin} label="MKX" />
            <NavLink to="/garage" icon={Wrench} label="MK Garage" />
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Overall Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
            <CardContent className="p-5 relative">
              <p className="text-xs font-medium tracking-wider uppercase text-muted-foreground">Total Investment</p>
              <p className="text-2xl font-bold font-serif text-foreground">{formatAEDShort(totalInvestment)}</p>
              <p className="text-xs text-muted-foreground">Across 4 companies</p>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
            <CardContent className="p-5 relative">
              <p className="text-xs font-medium tracking-wider uppercase text-muted-foreground">Total Profit/Loss</p>
              <p className={`text-2xl font-bold font-serif ${totalProfit >= 0 ? "text-success" : "text-loss"}`}>{formatAEDShort(totalProfit)}</p>
              <p className="text-xs text-muted-foreground">Ahmad's share of P&L</p>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
            <CardContent className="p-5 relative">
              <p className="text-xs font-medium tracking-wider uppercase text-muted-foreground">Net Position</p>
              <p className={`text-2xl font-bold font-serif ${totalNetPosition >= 0 ? "text-success" : "text-loss"}`}>{formatAEDShort(totalNetPosition)}</p>
              <p className="text-xs text-muted-foreground">Current portfolio value</p>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
            <CardContent className="p-5 relative">
              <p className="text-xs font-medium tracking-wider uppercase text-muted-foreground">Overall ROI</p>
              <p className={`text-2xl font-bold font-serif ${overallROI >= 0 ? "text-success" : "text-loss"}`}>{overallROI.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground">Weighted average return</p>
            </CardContent>
          </Card>
        </div>

        {/* Company Cards with ROI */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {companies.map((c) => {
            const Icon = c.icon;
            return (
              <Card
                key={c.name}
                className="relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => navigate(c.route)}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                <CardContent className="p-5 relative space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: `${c.color}20` }}>
                        <Icon className="h-4 w-4" style={{ color: c.color }} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.share} ownership</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Investment</span>
                      <span className="font-medium text-foreground">{formatAEDShort(c.investment)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Profit/Loss</span>
                      <span className={`font-medium ${c.profit >= 0 ? "text-success" : "text-loss"}`}>{formatAEDShort(c.profit)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Net Position</span>
                      <span className={`font-medium ${c.netPosition >= 0 ? "text-success" : "text-loss"}`}>{formatAEDShort(c.netPosition)}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border/50">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">ROI</span>
                      <div className="flex items-center gap-1">
                        {c.roi >= 0 ? <TrendingUp className="h-3 w-3 text-success" /> : <TrendingDown className="h-3 w-3 text-loss" />}
                        <span className={`text-lg font-bold font-serif ${c.roi >= 0 ? "text-success" : "text-loss"}`}>
                          {c.roi.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* ROI Comparison */}
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-foreground">ROI Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={roiChartData} layout="vertical" margin={{ left: 80, right: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `${v}%`} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={75} />
                    <Tooltip formatter={(v: number) => [`${v.toFixed(1)}%`, "ROI"]} contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                    <Bar dataKey="roi" radius={[0, 4, 4, 0]}>
                      {roiChartData.map((entry, i) => (
                        <Cell key={i} fill={entry.roi >= 0 ? "hsl(var(--success))" : "hsl(var(--loss))"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Investment Allocation Pie */}
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-foreground">Investment Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie
                      data={investmentPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {investmentPieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => [formatAED(v), "Investment"]} contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profit/Loss by Company */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground">Ahmad's Profit/Loss by Company</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={profitChartData} margin={{ left: 20, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => formatAEDShort(v)} />
                  <Tooltip formatter={(v: number) => [formatAED(v), "Profit/Loss"]} contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="profit" radius={[4, 4, 0, 0]}>
                    {profitChartData.map((entry, i) => (
                      <Cell key={i} fill={entry.profit >= 0 ? "hsl(var(--success))" : "hsl(var(--loss))"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Table */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground">Ahmad's Capital Position — Detailed Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Company</TableHead>
                  <TableHead className="text-xs text-right">Ownership</TableHead>
                  <TableHead className="text-xs text-right">Investment</TableHead>
                  <TableHead className="text-xs text-right">Profit/Loss Share</TableHead>
                  <TableHead className="text-xs text-right">Net Position</TableHead>
                  <TableHead className="text-xs text-right">ROI</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.map((c) => (
                  <TableRow key={c.name} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(c.route)}>
                    <TableCell className="font-medium text-sm">{c.name}</TableCell>
                    <TableCell className="text-right text-sm">{c.share}</TableCell>
                    <TableCell className="text-right text-sm">{formatAED(c.investment)}</TableCell>
                    <TableCell className={`text-right text-sm font-medium ${c.profit >= 0 ? "text-success" : "text-loss"}`}>
                      {c.profit >= 0 ? "" : "-"}{formatAED(Math.abs(c.profit))}
                    </TableCell>
                    <TableCell className={`text-right text-sm font-medium ${c.netPosition >= 0 ? "text-success" : "text-loss"}`}>
                      {c.netPosition >= 0 ? "" : "-"}{formatAED(Math.abs(c.netPosition))}
                    </TableCell>
                    <TableCell className={`text-right text-sm font-bold ${c.roi >= 0 ? "text-success" : "text-loss"}`}>
                      {c.roi.toFixed(1)}%
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="border-t-2 border-primary/30 bg-muted/30">
                  <TableCell className="font-bold text-sm">Total Portfolio</TableCell>
                  <TableCell className="text-right text-sm">—</TableCell>
                  <TableCell className="text-right text-sm font-bold">{formatAED(totalInvestment)}</TableCell>
                  <TableCell className={`text-right text-sm font-bold ${totalProfit >= 0 ? "text-success" : "text-loss"}`}>
                    {totalProfit >= 0 ? "" : "-"}{formatAED(Math.abs(totalProfit))}
                  </TableCell>
                  <TableCell className={`text-right text-sm font-bold ${totalNetPosition >= 0 ? "text-success" : "text-loss"}`}>
                    {totalNetPosition >= 0 ? "" : "-"}{formatAED(Math.abs(totalNetPosition))}
                  </TableCell>
                  <TableCell className={`text-right text-sm font-bold ${overallROI >= 0 ? "text-success" : "text-loss"}`}>
                    {overallROI.toFixed(1)}%
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CombinedDashboard;
