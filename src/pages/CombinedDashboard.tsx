import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Briefcase, TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3, Building2, Car, Bitcoin, Wrench, ArrowRight, Gem, AlertTriangle, Shield, Trophy, Target } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart as RechartsPie, Pie, Legend } from "recharts";
import MonthFilter from "@/components/MonthFilter";

// Import data from all companies
import { partnerCapital, otcSummary, monthlyPL as otcMonthlyPL } from "@/data/otcData";
import { ahmadCapital as mkAutosAhmad, mkAutosSummary, balanceSheet as mkAutosBS, monthlyIncome as mkAutosMonthlyIncome } from "@/data/mkAutosData";
import { mkxSummary, balanceSheet as mkxBS, monthlyData as mkxMonthlyData, ahmadCapitalByMonth as mkxAhmadCapital } from "@/data/mkxData";
import { monthlyPL as garagePL, balanceSheet as garageBS, ahmadGarage } from "@/data/garageData";
import { goldCapital, profitLoss as ryaPL, AED_TO_USD_RATE, sales as goldSales, expenses as goldExpenses, salesDiscounts as goldDiscounts } from "@/data/goldData";

const formatAED = (v: number) =>
  `AED ${Math.abs(v).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const formatUSD = (v: number) =>
  `$${Math.abs(v).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const formatAEDShort = (v: number) => {
  const abs = Math.abs(v);
  const formatted = abs >= 1_000_000 ? `${(abs / 1_000_000).toFixed(2)}M` : abs >= 1_000 ? `${(abs / 1_000).toFixed(1)}K` : abs.toFixed(0);
  return `${v < 0 ? "-" : ""}AED ${formatted}`;
};

const formatUSDShort = (v: number) => {
  const abs = Math.abs(v);
  const formatted = abs >= 1_000_000 ? `${(abs / 1_000_000).toFixed(2)}M` : abs >= 1_000 ? `${(abs / 1_000).toFixed(1)}K` : abs.toFixed(0);
  return `${v < 0 ? "-" : ""}$${formatted}`;
};

// Normalize month strings to "MMM-YY" format for comparison
const normalizeMonth = (m: string): string => {
  // "Jan 2025" -> "Jan-25", "Jan-25" -> "Jan-25", "Jan 25" -> "Jan-25", "Nov 24" -> "Nov-24"
  // "Jan-26" -> "Jan-26", "Feb-26" -> "Feb-26"
  const match4 = m.match(/^(\w{3})\s*(\d{4})$/); // "Jan 2025"
  if (match4) return `${match4[1]}-${match4[2].slice(2)}`;
  const match2 = m.match(/^(\w{3})\s+(\d{2})$/); // "Jan 25" or "Nov 24"
  if (match2) return `${match2[1]}-${match2[2]}`;
  const matchDash = m.match(/^(\w{3})-(\d{2})$/); // "Jan-25"
  if (matchDash) return `${matchDash[1]}-${matchDash[2]}`;
  return m;
};

// Build a sorted list of all unique months across all companies
const buildAllMonths = (): string[] => {
  const set = new Set<string>();
  otcMonthlyPL.forEach(r => {
    if (!r.month.includes("Dec 2024")) set.add(normalizeMonth(r.month));
  });
  garagePL.forEach(r => set.add(normalizeMonth(r.month)));
  mkxMonthlyData.forEach(r => set.add(normalizeMonth(r.month)));
  mkAutosMonthlyIncome.forEach(r => set.add(normalizeMonth(r.month)));
  // Gold trades by month
  goldSales.forEach(s => {
    const d = new Date(s.date);
    if (!isNaN(d.getTime())) {
      const label = `${d.toLocaleString("en-US", { month: "short" })}-${String(d.getFullYear()).slice(2)}`;
      set.add(label);
    }
  });

  const monthOrder = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return Array.from(set).sort((a, b) => {
    const [mA, yA] = a.split("-");
    const [mB, yB] = b.split("-");
    const yearDiff = parseInt(yA) - parseInt(yB);
    if (yearDiff !== 0) return yearDiff;
    return monthOrder.indexOf(mA) - monthOrder.indexOf(mB);
  });
};

const ALL_MONTHS = buildAllMonths();

const CombinedDashboard = () => {
  const [currency, setCurrency] = useState<"AED" | "USD">("AED");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const toDisplay = (aedValue: number) => currency === "AED" ? aedValue : aedValue / AED_TO_USD_RATE;
  const fmt = (v: number) => currency === "AED" ? formatAEDShort(v) : formatUSDShort(v);
  const fmtFull = (v: number) => currency === "AED" ? formatAED(v) : formatUSD(v);
  const navigate = useNavigate();

  // === Compute per-company profit for selected month ===
  const companyData = useMemo(() => {
    const isAll = selectedMonth === "all";
    const norm = isAll ? "" : selectedMonth;

    // RYA Gold - aggregate by month from sales/expenses
    let ryaProfitUSD: number;
    let ryaInvestmentUSD = Math.abs(goldCapital.initialCapital);
    let ryaNetPositionUSD: number;
    if (isAll) {
      ryaProfitUSD = ryaPL.netProfit;
      ryaNetPositionUSD = goldCapital.totalCurrentPosition;
    } else {
      // Parse month for comparison
      const salesInMonth = goldSales.filter(s => {
        const d = new Date(s.date);
        if (isNaN(d.getTime())) return false;
        const label = `${d.toLocaleString("en-US", { month: "short" })}-${String(d.getFullYear()).slice(2)}`;
        return label === norm;
      });
      const expInMonth = goldExpenses.filter(e => {
        const d = new Date(e.date);
        if (isNaN(d.getTime())) return false;
        const label = `${d.toLocaleString("en-US", { month: "short" })}-${String(d.getFullYear()).slice(2)}`;
        return label === norm;
      });
      const discInMonth = goldDiscounts.filter(e => {
        const d = new Date(e.date);
        if (isNaN(d.getTime())) return false;
        const label = `${d.toLocaleString("en-US", { month: "short" })}-${String(d.getFullYear()).slice(2)}`;
        return label === norm;
      });
      const salesProfit = salesInMonth.reduce((s, t) => s + t.profitUSD, 0);
      const expTotal = expInMonth.reduce((s, t) => s + t.amount, 0);
      const discTotal = discInMonth.reduce((s, t) => s + t.amount, 0);
      ryaProfitUSD = salesProfit - expTotal - discTotal;
      ryaNetPositionUSD = ryaInvestmentUSD + ryaProfitUSD; // simplified for monthly
    }
    const ryaInvestment = ryaInvestmentUSD * AED_TO_USD_RATE;
    const ryaProfit = ryaProfitUSD * AED_TO_USD_RATE;
    const ryaNetPosition = (isAll ? ryaNetPositionUSD : ryaInvestmentUSD + ryaProfitUSD) * AED_TO_USD_RATE;
    const ryaROI = (ryaProfitUSD / ryaInvestmentUSD) * 100;

    // OTC Trading (50/50)
    let otcProfitShare: number;
    if (isAll) {
      otcProfitShare = partnerCapital.ahmad.profitShare;
    } else {
      const row = otcMonthlyPL.find(r => normalizeMonth(r.month) === norm);
      otcProfitShare = row ? row.netProfit * 0.5 : 0;
    }
    const otcInvestment = partnerCapital.ahmad.net;
    const otcNetPosition = isAll ? partnerCapital.ahmad.netPosition : otcInvestment + otcProfitShare;
    const otcROI = (otcProfitShare / otcInvestment) * 100;

    // MK Autos Company (45% share) - no monthly P&L available, show cumulative
    const mkAutosShareInvestment = mkAutosAhmad.shareCapital;
    const mkAutosCompanyPL = mkAutosBS.profitLoss.total;
    const mkAutosShareProfit = mkAutosCompanyPL * (mkAutosAhmad.sharePercentage / 100);
    const mkAutosSharePosition = mkAutosShareInvestment + mkAutosShareProfit;
    const mkAutosShareROI = (mkAutosShareProfit / mkAutosShareInvestment) * 100;

    // MK Autos Cars (100%) - monthly income available
    let mkAutosCarsProfit: number;
    if (isAll) {
      mkAutosCarsProfit = mkAutosSummary.netProfit;
    } else {
      const row = mkAutosMonthlyIncome.find(r => normalizeMonth(r.month) === norm);
      mkAutosCarsProfit = row ? row.total : 0; // monthly income (no expense breakdown)
    }
    const mkAutosCarsInvestment = mkAutosSummary.totalNBV;
    const mkAutosCarsPosition = isAll ? mkAutosAhmad.positionAgainstCars : mkAutosCarsInvestment + mkAutosCarsProfit;
    const mkAutosCarsROI = isAll ? mkAutosSummary.overallROI : (mkAutosCarsProfit / mkAutosCarsInvestment) * 100;

    // MKX Crypto (50%)
    const mkxShareCapital = 5788933.98;
    let mkxTotalPL: number;
    if (isAll) {
      const mkxRetainedEarnings = -7261014.27;
      const mkxNetIncome = -865195.22;
      mkxTotalPL = (mkxRetainedEarnings + mkxNetIncome) * 0.5;
    } else {
      const row = mkxMonthlyData.find(r => normalizeMonth(r.month) === norm);
      mkxTotalPL = row ? row.netProfit * 0.5 : 0;
    }
    const mkxNetPosition = mkxShareCapital + mkxTotalPL;
    const mkxROI = (mkxTotalPL / mkxShareCapital) * 100;

    // MK Garage (40%)
    const garageInvestment = ahmadGarage.shareCapital;
    let garageProfitShare: number;
    if (isAll) {
      garageProfitShare = garagePL.reduce((s, m) => s + m.netProfit, 0) * (ahmadGarage.sharePercent / 100);
    } else {
      const row = garagePL.find(r => normalizeMonth(r.month) === norm);
      garageProfitShare = row ? row.netProfit * (ahmadGarage.sharePercent / 100) : 0;
    }
    const garageNetPosition = garageInvestment + garageProfitShare;
    const garageROI = (garageProfitShare / garageInvestment) * 100;

    return {
      rya: { investment: ryaInvestment, profit: ryaProfit, netPosition: ryaNetPosition, roi: ryaROI },
      otc: { investment: otcInvestment, profit: otcProfitShare, netPosition: otcNetPosition, roi: otcROI },
      mkAutosCompany: { investment: mkAutosShareInvestment, profit: mkAutosShareProfit, netPosition: mkAutosSharePosition, roi: mkAutosShareROI },
      mkAutosCars: { investment: mkAutosCarsInvestment, profit: mkAutosCarsProfit, netPosition: mkAutosCarsPosition, roi: mkAutosCarsROI },
      mkx: { investment: mkxShareCapital, profit: mkxTotalPL, netPosition: mkxNetPosition, roi: mkxROI },
      garage: { investment: garageInvestment, profit: garageProfitShare, netPosition: garageNetPosition, roi: garageROI },
    };
  }, [selectedMonth]);

  const d = companyData;

  const companies = [
    {
      name: "RYA Gold", icon: Gem, route: "/", share: "100%",
      investment: d.rya.investment, profit: d.rya.profit, netPosition: d.rya.netPosition, roi: d.rya.roi,
      color: "hsl(43, 74%, 52%)", subtitle: "Gold trading", updatedTo: "Mar 2026",
    },
    {
      name: "OTC Trading", icon: DollarSign, route: "/otc", share: "50%",
      investment: d.otc.investment, profit: d.otc.profit, netPosition: d.otc.netPosition, roi: d.otc.roi,
      color: "hsl(var(--chart-1))", updatedTo: "Mar 2026",
    },
    {
      name: "MK Autos (Company)", icon: Building2, route: "/mk-autos-company",
      share: `${mkAutosAhmad.sharePercentage}%`,
      investment: d.mkAutosCompany.investment, profit: d.mkAutosCompany.profit,
      netPosition: d.mkAutosCompany.netPosition, roi: d.mkAutosCompany.roi,
      color: "hsl(var(--chart-2))", subtitle: "Share Capital & P&L", updatedTo: "Feb 2026",
    },
    {
      name: "MK Autos (Cars)", icon: Car, route: "/mk-autos", share: "100%",
      investment: d.mkAutosCars.investment, profit: d.mkAutosCars.profit,
      netPosition: d.mkAutosCars.netPosition, roi: d.mkAutosCars.roi,
      color: "hsl(var(--chart-5))", subtitle: "Fleet rental income", updatedTo: "Mar 2026",
    },
    {
      name: "MKX Crypto", icon: Bitcoin, route: "/mkx", share: "50%",
      investment: d.mkx.investment, profit: d.mkx.profit,
      netPosition: d.mkx.netPosition, roi: d.mkx.roi,
      color: "hsl(var(--chart-3))", updatedTo: "Mar 2026",
    },
    {
      name: "MK Garage", icon: Wrench, route: "/garage", share: "40%",
      investment: d.garage.investment, profit: d.garage.profit,
      netPosition: d.garage.netPosition, roi: d.garage.roi,
      color: "hsl(var(--chart-4))", updatedTo: "Feb 2026",
    },
  ];

  const totalInvestment = companies.reduce((s, c) => s + c.investment, 0);
  const totalProfit = companies.reduce((s, c) => s + c.profit, 0);
  const totalNetPosition = companies.reduce((s, c) => s + c.netPosition, 0);
  const overallROI = (totalProfit / totalInvestment) * 100;

  // Derived analytics
  const bestPerformer = [...companies].sort((a, b) => b.roi - a.roi)[0];
  const worstPerformer = [...companies].sort((a, b) => a.roi - b.roi)[0];
  const losingCompanies = companies.filter(c => c.profit < 0);
  const profitableCompanies = companies.filter(c => c.profit >= 0);
  const largestExposure = [...companies].sort((a, b) => b.investment - a.investment)[0];
  const largestExposurePct = (largestExposure.investment / totalInvestment) * 100;

  const roiChartData = companies.map(c => ({
    name: c.name,
    roi: parseFloat(c.roi.toFixed(1)),
    color: c.color,
  }));

  const investmentPieData = companies.map(c => ({
    name: c.name,
    value: toDisplay(c.investment),
    color: c.color,
  }));

  const profitChartData = companies.map(c => ({
    name: c.name,
    profit: toDisplay(c.profit),
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
            <MonthFilter months={ALL_MONTHS} value={selectedMonth} onChange={setSelectedMonth} />
            {selectedMonth !== "all" && (
              <Badge variant="outline" className="text-[10px]">Showing: {selectedMonth}</Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Currency Toggle */}
            <div className="flex items-center border border-border rounded-lg overflow-hidden mr-2">
              <button
                onClick={() => setCurrency("AED")}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${currency === "AED" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"}`}
              >AED</button>
              <button
                onClick={() => setCurrency("USD")}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${currency === "USD" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"}`}
              >USD</button>
            </div>
            <nav className="flex items-center gap-1">
              <Link to="/"><Button variant="outline" size="sm" className="text-xs gap-1.5"><Gem className="h-3.5 w-3.5" />RYA</Button></Link>
              <Link to="/otc"><Button variant="outline" size="sm" className="text-xs gap-1.5"><DollarSign className="h-3.5 w-3.5" />OTC</Button></Link>
              <Link to="/mk-autos"><Button variant="outline" size="sm" className="text-xs gap-1.5"><Car className="h-3.5 w-3.5" />Cars</Button></Link>
              <Link to="/mk-autos-company"><Button variant="outline" size="sm" className="text-xs gap-1.5"><Building2 className="h-3.5 w-3.5" />Company</Button></Link>
              <Link to="/mkx"><Button variant="outline" size="sm" className="text-xs gap-1.5"><Bitcoin className="h-3.5 w-3.5" />MKX</Button></Link>
              <Link to="/garage"><Button variant="outline" size="sm" className="text-xs gap-1.5"><Wrench className="h-3.5 w-3.5" />MK Garage</Button></Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">

        {/* Portfolio Health Alerts */}
        {(losingCompanies.length > 0 || largestExposurePct > 40) && (
          <div className="space-y-2">
            {losingCompanies.map(c => (
              <Card key={c.name} className="border-loss/30 bg-loss/5 cursor-pointer hover:border-loss/50 transition-colors" onClick={() => navigate(c.route)}>
                <CardContent className="p-3 flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-loss shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-loss">{c.name} — Loss Alert</p>
                    <p className="text-xs text-muted-foreground">
                      ROI: {c.roi.toFixed(1)}% · Loss: {fmt(toDisplay(c.profit))} · {((c.investment / totalInvestment) * 100).toFixed(0)}% of portfolio exposure
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-loss" />
                </CardContent>
              </Card>
            ))}
            {largestExposurePct > 40 && (
              <Card className="border-yellow-500/30 bg-yellow-500/5">
                <CardContent className="p-3 flex items-center gap-3">
                  <Shield className="h-5 w-5 text-yellow-500 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">Concentration Risk</p>
                    <p className="text-xs text-muted-foreground">
                      {largestExposure.name} represents {largestExposurePct.toFixed(0)}% of total investment. Consider diversification if above 40%.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Overall Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <Card className="relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
            <CardContent className="p-4 relative">
              <p className="text-[10px] font-medium tracking-wider uppercase text-muted-foreground">Total Investment</p>
              <p className="text-xl font-bold font-serif text-foreground">{fmt(toDisplay(totalInvestment))}</p>
              <p className="text-[10px] text-muted-foreground">{companies.length} entities</p>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
            <CardContent className="p-4 relative">
              <p className="text-[10px] font-medium tracking-wider uppercase text-muted-foreground">
                {selectedMonth !== "all" ? "Monthly P/L" : "Total Profit/Loss"}
              </p>
              <p className={`text-xl font-bold font-serif ${totalProfit >= 0 ? "text-success" : "text-loss"}`}>{fmt(toDisplay(totalProfit))}</p>
              <p className="text-[10px] text-muted-foreground">{profitableCompanies.length} profitable · {losingCompanies.length} losing</p>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
            <CardContent className="p-4 relative">
              <p className="text-[10px] font-medium tracking-wider uppercase text-muted-foreground">Net Position</p>
              <p className={`text-xl font-bold font-serif ${totalNetPosition >= 0 ? "text-success" : "text-loss"}`}>{fmt(toDisplay(totalNetPosition))}</p>
              <p className="text-[10px] text-muted-foreground">Current portfolio value</p>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
            <CardContent className="p-4 relative">
              <p className="text-[10px] font-medium tracking-wider uppercase text-muted-foreground">
                {selectedMonth !== "all" ? "Monthly ROI" : "Overall ROI"}
              </p>
              <p className={`text-xl font-bold font-serif ${overallROI >= 0 ? "text-success" : "text-loss"}`}>{overallROI.toFixed(1)}%</p>
              <p className="text-[10px] text-muted-foreground">Weighted average</p>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
            <CardContent className="p-4 relative">
              <p className="text-[10px] font-medium tracking-wider uppercase text-muted-foreground flex items-center gap-1"><Trophy className="h-3 w-3 text-success" />Best Performer</p>
              <p className="text-xl font-bold font-serif text-success">{bestPerformer.roi.toFixed(1)}%</p>
              <p className="text-[10px] text-muted-foreground">{bestPerformer.name}</p>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
            <CardContent className="p-4 relative">
              <p className="text-[10px] font-medium tracking-wider uppercase text-muted-foreground flex items-center gap-1"><Target className="h-3 w-3 text-loss" />Worst Performer</p>
              <p className="text-xl font-bold font-serif text-loss">{worstPerformer.roi.toFixed(1)}%</p>
              <p className="text-[10px] text-muted-foreground">{worstPerformer.name}</p>
            </CardContent>
          </Card>
        </div>

        {/* Company Cards with ROI */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
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
                        {(c as any).subtitle && <p className="text-[10px] text-muted-foreground/70">{(c as any).subtitle}</p>}
                        <p className="text-[10px] text-muted-foreground/60">Updated to: {c.updatedTo}</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Investment</span>
                      <span className="font-medium text-foreground">{fmt(toDisplay(c.investment))}</span>
                    </div>
                    <div className={`flex justify-between items-center text-xs rounded-md px-2 py-1.5 -mx-2 ${c.profit >= 0 ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
                      <span className={`font-semibold ${c.profit >= 0 ? "text-success" : "text-loss"}`}>
                        {selectedMonth !== "all" ? "Monthly P/L" : "Profit/Loss"}
                      </span>
                      <span className={`text-sm font-bold ${c.profit >= 0 ? "text-success" : "text-loss"}`}>{fmt(toDisplay(c.profit))}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Net Position</span>
                      <span className={`font-medium ${c.netPosition >= 0 ? "text-success" : "text-loss"}`}>{fmt(toDisplay(c.netPosition))}</span>
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
              <CardTitle className="text-base font-semibold text-foreground">
                ROI Comparison {selectedMonth !== "all" && `(${selectedMonth})`}
              </CardTitle>
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
                    <Tooltip formatter={(v: number) => [currency === "AED" ? formatAED(v) : formatUSD(v), "Investment"]} contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profit/Loss by Company */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground">
              Ahmad's {selectedMonth !== "all" ? "Monthly" : ""} Profit/Loss by Company
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={profitChartData} margin={{ left: 20, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => fmt(v)} />
                  <Tooltip formatter={(v: number) => [currency === "AED" ? formatAED(v) : formatUSD(v), "Profit/Loss"]} contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
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
            <CardTitle className="text-base font-semibold text-foreground">
              Ahmad's Capital Position — {selectedMonth !== "all" ? `${selectedMonth} Breakdown` : "Detailed Breakdown"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Company</TableHead>
                  <TableHead className="text-xs text-right">Ownership</TableHead>
                  <TableHead className="text-xs text-right">Investment</TableHead>
                  <TableHead className="text-xs text-right">{selectedMonth !== "all" ? "Monthly P/L" : "Profit/Loss Share"}</TableHead>
                  <TableHead className="text-xs text-right">Net Position</TableHead>
                  <TableHead className="text-xs text-right">ROI</TableHead>
                  <TableHead className="text-xs text-right">% of Portfolio</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.map((c) => (
                  <TableRow key={c.name} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(c.route)}>
                    <TableCell className="font-medium text-sm">{c.name}</TableCell>
                    <TableCell className="text-right text-sm">{c.share}</TableCell>
                    <TableCell className="text-right text-sm">{fmtFull(toDisplay(c.investment))}</TableCell>
                    <TableCell className={`text-right text-sm font-medium ${c.profit >= 0 ? "text-success" : "text-loss"}`}>
                      {c.profit >= 0 ? "" : "-"}{fmtFull(toDisplay(Math.abs(c.profit)))}
                    </TableCell>
                    <TableCell className={`text-right text-sm font-medium ${c.netPosition >= 0 ? "text-success" : "text-loss"}`}>
                      {c.netPosition >= 0 ? "" : "-"}{fmtFull(toDisplay(Math.abs(c.netPosition)))}
                    </TableCell>
                    <TableCell className={`text-right text-sm font-bold ${c.roi >= 0 ? "text-success" : "text-loss"}`}>
                      {c.roi.toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {((c.investment / totalInvestment) * 100).toFixed(1)}%
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="border-t-2 border-primary/30 bg-muted/30">
                  <TableCell className="font-bold text-sm">Total Portfolio</TableCell>
                  <TableCell className="text-right text-sm">—</TableCell>
                  <TableCell className="text-right text-sm font-bold">{fmtFull(toDisplay(totalInvestment))}</TableCell>
                  <TableCell className={`text-right text-sm font-bold ${totalProfit >= 0 ? "text-success" : "text-loss"}`}>
                    {totalProfit >= 0 ? "" : "-"}{fmtFull(toDisplay(Math.abs(totalProfit)))}
                  </TableCell>
                  <TableCell className={`text-right text-sm font-bold ${totalNetPosition >= 0 ? "text-success" : "text-loss"}`}>
                    {totalNetPosition >= 0 ? "" : "-"}{fmtFull(toDisplay(Math.abs(totalNetPosition)))}
                  </TableCell>
                  <TableCell className={`text-right text-sm font-bold ${overallROI >= 0 ? "text-success" : "text-loss"}`}>
                    {overallROI.toFixed(1)}%
                  </TableCell>
                  <TableCell className="text-right text-sm font-bold">100%</TableCell>
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
