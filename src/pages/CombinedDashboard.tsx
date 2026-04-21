import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Briefcase, TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3, Building2, Car, Bitcoin, Wrench, ArrowRight, Gem, AlertTriangle, Shield, Trophy, Target, ArrowUpRight, ArrowDownRight, Minus, FileText } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart as RechartsPie, Pie, Legend } from "recharts";
import MonthFilter from "@/components/MonthFilter";
import PortfolioInsights, { CompanySnapshot } from "@/components/PortfolioInsights";
import ConsolidatedPLMatrix from "@/components/ConsolidatedPLMatrix";

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
  const [selectedMonth, setSelectedMonth] = useState(ALL_MONTHS[ALL_MONTHS.length - 1] ?? "all");
  const toDisplay = (aedValue: number) => currency === "AED" ? aedValue : aedValue / AED_TO_USD_RATE;
  const fmt = (v: number) => currency === "AED" ? formatAEDShort(v) : formatUSDShort(v);
  const fmtFull = (v: number) => currency === "AED" ? formatAED(v) : formatUSD(v);
  const navigate = useNavigate();

  // === Helper to compute per-company data for any month ===
  const computeForMonth = (month: string) => {
    const isAll = month === "all";
    const norm = isAll ? "" : month;

    // RYA Gold
    let ryaProfitUSD: number;
    let ryaInvestmentUSD = Math.abs(goldCapital.initialCapital);
    let ryaNetPositionUSD: number;
    if (isAll) {
      ryaProfitUSD = ryaPL.netProfit;
      ryaNetPositionUSD = goldCapital.totalCurrentPosition;
    } else {
      const salesInMonth = goldSales.filter(s => {
        const d = new Date(s.date);
        if (isNaN(d.getTime())) return false;
        return `${d.toLocaleString("en-US", { month: "short" })}-${String(d.getFullYear()).slice(2)}` === norm;
      });
      const expInMonth = goldExpenses.filter(e => {
        const d = new Date(e.date);
        if (isNaN(d.getTime())) return false;
        return `${d.toLocaleString("en-US", { month: "short" })}-${String(d.getFullYear()).slice(2)}` === norm;
      });
      const discInMonth = goldDiscounts.filter(e => {
        const d = new Date(e.date);
        if (isNaN(d.getTime())) return false;
        return `${d.toLocaleString("en-US", { month: "short" })}-${String(d.getFullYear()).slice(2)}` === norm;
      });
      ryaProfitUSD = salesInMonth.reduce((s, t) => s + t.profitUSD, 0) - expInMonth.reduce((s, t) => s + t.amount, 0) - discInMonth.reduce((s, t) => s + t.amount, 0);
      ryaNetPositionUSD = ryaInvestmentUSD + ryaProfitUSD;
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

    // MK Autos Company (45%)
    const mkAutosShareInvestment = mkAutosAhmad.shareCapital;
    const mkAutosCompanyPL = mkAutosBS.profitLoss.total;
    const mkAutosShareProfit = mkAutosCompanyPL * (mkAutosAhmad.sharePercentage / 100);
    const mkAutosSharePosition = mkAutosShareInvestment + mkAutosShareProfit;
    const mkAutosShareROI = (mkAutosShareProfit / mkAutosShareInvestment) * 100;

    // MK Autos Cars (100%)
    let mkAutosCarsProfit: number;
    if (isAll) {
      mkAutosCarsProfit = mkAutosSummary.netProfit;
    } else {
      const row = mkAutosMonthlyIncome.find(r => normalizeMonth(r.month) === norm);
      mkAutosCarsProfit = row ? row.total : 0;
    }
    const mkAutosCarsInvestment = mkAutosSummary.totalNBV;
    const mkAutosCarsPosition = isAll ? mkAutosAhmad.positionAgainstCars : mkAutosCarsInvestment + mkAutosCarsProfit;
    const mkAutosCarsROI = isAll ? mkAutosSummary.overallROI : (mkAutosCarsProfit / mkAutosCarsInvestment) * 100;

    // MKX Crypto (50%)
    const mkxShareCapital = isAll ? 5788933.98 : (mkxAhmadCapital[norm] ?? 5329871.48);
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
  };

  const companyData = useMemo(() => computeForMonth(selectedMonth), [selectedMonth]);

  // === Compute previous month data for MoM comparison ===
  const prevMonthData = useMemo(() => {
    if (selectedMonth === "all") return null;
    const idx = ALL_MONTHS.indexOf(selectedMonth);
    if (idx <= 0) return null;
    return computeForMonth(ALL_MONTHS[idx - 1]);
  }, [selectedMonth]);

  const d = companyData;
  const pd = prevMonthData; // previous month data or null

  // MoM trend helper
  const getTrend = (current: number, previous: number | undefined) => {
    if (previous === undefined || previous === null) return null;
    const delta = current - previous;
    const pct = previous !== 0 ? (delta / Math.abs(previous)) * 100 : 0;
    return { delta, pct, direction: delta > 0 ? "up" as const : delta < 0 ? "down" as const : "neutral" as const };
  };

  const TrendBadge = ({ current, previous, isCurrency = true }: { current: number; previous?: number; isCurrency?: boolean }) => {
    if (previous === undefined || selectedMonth === "all") return null;
    const trend = getTrend(current, previous);
    if (!trend) return null;
    const color = trend.direction === "up" ? "text-success" : trend.direction === "down" ? "text-loss" : "text-muted-foreground";
    const Icon = trend.direction === "up" ? ArrowUpRight : trend.direction === "down" ? ArrowDownRight : Minus;
    return (
      <span className={`inline-flex items-center gap-0.5 text-[10px] font-medium ${color}`}>
        <Icon className="h-3 w-3" />
        {isCurrency ? fmt(toDisplay(Math.abs(trend.delta))) : `${Math.abs(trend.pct).toFixed(1)}%`}
      </span>
    );
  };
  const companies = [
    {
      name: "RYA Gold", icon: Gem, route: "/", share: "100%", key: "rya" as const,
      investment: d.rya.investment, profit: d.rya.profit, netPosition: d.rya.netPosition, roi: d.rya.roi,
      color: "hsl(43, 74%, 52%)", subtitle: "Gold trading", updatedTo: "Mar 2026",
    },
    {
      name: "OTC Trading", icon: DollarSign, route: "/otc", share: "50%", key: "otc" as const,
      investment: d.otc.investment, profit: d.otc.profit, netPosition: d.otc.netPosition, roi: d.otc.roi,
      color: "hsl(var(--chart-1))", updatedTo: "Mar 2026",
    },
    {
      name: "MK Autos (Company)", icon: Building2, route: "/mk-autos-company", key: "mkAutosCompany" as const,
      share: `${mkAutosAhmad.sharePercentage}%`,
      investment: d.mkAutosCompany.investment, profit: d.mkAutosCompany.profit,
      netPosition: d.mkAutosCompany.netPosition, roi: d.mkAutosCompany.roi,
      color: "hsl(var(--chart-2))", subtitle: "Share Capital & P&L", updatedTo: "Feb 2026",
    },
    {
      name: "MK Autos (Cars)", icon: Car, route: "/mk-autos", share: "100%", key: "mkAutosCars" as const,
      investment: d.mkAutosCars.investment, profit: d.mkAutosCars.profit,
      netPosition: d.mkAutosCars.netPosition, roi: d.mkAutosCars.roi,
      color: "hsl(var(--chart-5))", subtitle: "Fleet rental income", updatedTo: "Mar 2026",
    },
    {
      name: "MKX Crypto", icon: Bitcoin, route: "/mkx", share: "50%", key: "mkx" as const,
      investment: d.mkx.investment, profit: d.mkx.profit,
      netPosition: d.mkx.netPosition, roi: d.mkx.roi,
      color: "hsl(var(--chart-3))", updatedTo: "Mar 2026",
    },
    {
      name: "MK Garage", icon: Wrench, route: "/garage", share: "40%", key: "garage" as const,
      investment: d.garage.investment, profit: d.garage.profit,
      netPosition: d.garage.netPosition, roi: d.garage.roi,
      color: "hsl(var(--chart-4))", updatedTo: "Feb 2026",
    },
  ];

  const totalInvestment = companies.reduce((s, c) => s + c.investment, 0);
  const totalProfit = companies.reduce((s, c) => s + c.profit, 0);
  const totalNetPosition = companies.reduce((s, c) => s + c.netPosition, 0);
  const overallROI = (totalProfit / totalInvestment) * 100;

  // Previous month totals for MoM
  const prevTotalProfit = pd ? Object.values(pd).reduce((s, v) => s + v.profit, 0) : null;
  const prevTotalNetPosition = pd ? Object.values(pd).reduce((s, v) => s + v.netPosition, 0) : null;
  const prevTotalInvestment = pd ? Object.values(pd).reduce((s, v) => s + v.investment, 0) : null;
  const prevOverallROI = pd && prevTotalInvestment ? (prevTotalProfit! / prevTotalInvestment) * 100 : null;

  // Derived analytics
  const bestPerformer = [...companies].sort((a, b) => b.roi - a.roi)[0];
  const worstPerformer = [...companies].sort((a, b) => a.roi - b.roi)[0];
  const losingCompanies = companies.filter(c => c.profit < 0);
  const profitableCompanies = companies.filter(c => c.profit >= 0);
  const largestExposure = [...companies].sort((a, b) => b.investment - a.investment)[0];
  const largestExposurePct = (largestExposure.investment / totalInvestment) * 100;

  // Executive Summary
  const executiveSummary = useMemo(() => {
    const period = selectedMonth === "all" ? "across all time" : `in ${selectedMonth}`;
    const profitLine = totalProfit >= 0
      ? `Portfolio generated ${fmt(toDisplay(totalProfit))} net profit ${period}`
      : `Portfolio recorded a net loss of ${fmt(toDisplay(Math.abs(totalProfit)))} ${period}`;
    
    const drivers = [...companies].sort((a, b) => Math.abs(b.profit) - Math.abs(a.profit)).slice(0, 2);
    const driverLine = drivers.map(d => `${d.name} (${d.profit >= 0 ? "+" : ""}${fmt(toDisplay(d.profit))})`).join(" and ");
    
    const momLine = prevTotalProfit !== null
      ? totalProfit > prevTotalProfit!
        ? ` Performance improved vs previous month by ${fmt(toDisplay(Math.abs(totalProfit - prevTotalProfit!)))}.`
        : totalProfit < prevTotalProfit!
        ? ` Performance declined vs previous month by ${fmt(toDisplay(Math.abs(totalProfit - prevTotalProfit!)))}.`
        : ""
      : "";

    return `${profitLine}, driven by ${driverLine}.${momLine}`;
  }, [companies, totalProfit, selectedMonth, prevTotalProfit, currency]);

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

  // === Build per-company snapshots with previous-month metrics for the insights component ===
  const companySnapshots = useMemo<CompanySnapshot[]>(() => {
    return companies.map(c => {
      const prev = pd ? pd[c.key] : null;
      return {
        key: c.key,
        name: c.name,
        share: c.share,
        current: { investment: c.investment, profit: c.profit, netPosition: c.netPosition, roi: c.roi },
        previous: prev ? { investment: prev.investment, profit: prev.profit, netPosition: prev.netPosition, roi: prev.roi } : null,
        trend: [],
      };
    });
  }, [companies, pd]);

  // === Portfolio trend across last 6 months (revenue proxy = sum of profits + investment turnover; here we use profits aggregated) ===
  const portfolioTrend = useMemo(() => {
    const idx = ALL_MONTHS.indexOf(selectedMonth);
    const end = idx >= 0 ? idx : ALL_MONTHS.length - 1;
    const start = Math.max(0, end - 5);
    const slice = ALL_MONTHS.slice(start, end + 1);
    return slice.map(m => {
      const data = computeForMonth(m);
      const profit = Object.values(data).reduce((s, v) => s + v.profit, 0);
      const investment = Object.values(data).reduce((s, v) => s + v.investment, 0);
      // Use abs profit as a proxy for "revenue activity" since true revenue isn't aggregated here
      const revenue = Object.values(data).reduce((s, v) => s + Math.max(v.profit, 0), 0);
      const roi = investment ? (profit / investment) * 100 : 0;
      return { month: m, revenue, profit, roi };
    });
  }, [selectedMonth]);

  const prevMonthLabel = useMemo(() => {
    if (selectedMonth === "all") return null;
    const idx = ALL_MONTHS.indexOf(selectedMonth);
    return idx > 0 ? ALL_MONTHS[idx - 1] : null;
  }, [selectedMonth]);


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

        {/* Executive Portfolio Insights */}
        <PortfolioInsights
          companies={companySnapshots}
          selectedMonth={selectedMonth}
          prevMonthLabel={prevMonthLabel}
          format={fmt}
          toDisplay={toDisplay}
          portfolioTrend={portfolioTrend}
        />

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

        {/* Executive Summary */}
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent backdrop-blur-sm">
          <CardContent className="p-4 flex items-start gap-3">
            <FileText className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">Executive Summary</p>
              <p className="text-sm text-foreground leading-relaxed">{executiveSummary}</p>
            </div>
          </CardContent>
        </Card>

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
              <div className="flex items-center gap-1">
                <p className="text-[10px] text-muted-foreground">{profitableCompanies.length} profitable · {losingCompanies.length} losing</p>
                <TrendBadge current={totalProfit} previous={prevTotalProfit ?? undefined} />
              </div>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
            <CardContent className="p-4 relative">
              <p className="text-[10px] font-medium tracking-wider uppercase text-muted-foreground">Net Position</p>
              <p className={`text-xl font-bold font-serif ${totalNetPosition >= 0 ? "text-success" : "text-loss"}`}>{fmt(toDisplay(totalNetPosition))}</p>
              <div className="flex items-center gap-1">
                <p className="text-[10px] text-muted-foreground">Current portfolio value</p>
                <TrendBadge current={totalNetPosition} previous={prevTotalNetPosition ?? undefined} />
              </div>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
            <CardContent className="p-4 relative">
              <p className="text-[10px] font-medium tracking-wider uppercase text-muted-foreground">
                {selectedMonth !== "all" ? "Monthly ROI" : "Overall ROI"}
              </p>
              <p className={`text-xl font-bold font-serif ${overallROI >= 0 ? "text-success" : "text-loss"}`}>{overallROI.toFixed(1)}%</p>
              <div className="flex items-center gap-1">
                <p className="text-[10px] text-muted-foreground">Weighted average</p>
                {prevOverallROI !== null && <TrendBadge current={overallROI} previous={prevOverallROI} isCurrency={false} />}
              </div>
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
            const prevCompany = pd ? pd[c.key] : null;
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
                      <div className="flex items-center gap-1">
                        <span className={`text-sm font-bold ${c.profit >= 0 ? "text-success" : "text-loss"}`}>{fmt(toDisplay(c.profit))}</span>
                        <TrendBadge current={c.profit} previous={prevCompany?.profit} />
                      </div>
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

        {/* Consolidated P&L Matrix */}
        <ConsolidatedPLMatrix allMonths={ALL_MONTHS} selectedMonth={selectedMonth} />
      </main>
    </div>
  );
};

export default CombinedDashboard;
