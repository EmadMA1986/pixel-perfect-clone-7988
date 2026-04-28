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
  // Default to Inception to Date — every section subscribes to selectedMonth.
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
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

  // === VERIFIED FIGURES (single source of truth) ===
  // Two bases per company:
  //   - entity:  Full Company (100%) — used for Ranking table + Consolidated P&L Matrix
  //   - ahmad:   Ahmad's ownership share — used for KPI cards + Ahmad Position section
  // Adjustments applied: dummy visa-sponsorship income removed (MK Co + Garage),
  // intercompany AED 79,125 (Co ↔ Garage) eliminated, RYA Gold updated to Apr 2026.
  const VERIFIED = {
    rya:            { ahmadPct: 100, investment:   203_200, entityITD:  2_293_945, ahmadITD:  2_293_945, entityMar:   38_286, ahmadMar:   38_286 },
    otc:            { ahmadPct:  50, investment:   515_600, entityITD:  1_505_420, ahmadITD:    752_710, entityMar:  214_924, ahmadMar:  107_462 },
    mkAutosCars:    { ahmadPct: 100, investment: 2_390_000, entityITD:  1_579_855, ahmadITD:  1_579_855, entityMar:  -13_677, ahmadMar:  -13_677 },
    mkAutosCompany: { ahmadPct:  45, investment:   135_000, entityITD:   -169_714, ahmadITD:    -76_371, entityMar:  -30_393, ahmadMar:  -13_677 },
    mkx:            { ahmadPct:  50, investment: 5_788_934, entityITD: -8_126_209, ahmadITD: -4_063_104, entityMar: -333_612, ahmadMar: -166_806 },
    garage:         { ahmadPct:  40, investment:   520_000, entityITD:   -338_134, ahmadITD:   -135_253, entityMar:  -17_855, ahmadMar:   -7_142 },
  } as const;

  // For Ranking Table (entity basis) and aggregate ITD totals shown in that table
  const buildVerifiedSnapshot = (useMar = false) => {
    const mk = (k: keyof typeof VERIFIED) => {
      const v = VERIFIED[k];
      const profit = useMar ? v.entityMar : v.entityITD;
      return {
        investment: v.investment,
        profit,
        netPosition: v.investment + profit,
        roi: (v.entityITD / v.investment) * 100, // ROI always reflects ITD performance
      };
    };
    return {
      rya: mk("rya"),
      otc: mk("otc"),
      mkAutosCars: mk("mkAutosCars"),
      mkAutosCompany: mk("mkAutosCompany"),
      mkx: mk("mkx"),
      garage: mk("garage"),
    };
  };

  const companyData = useMemo(() => {
    if (selectedMonth === "all") return buildVerifiedSnapshot(false);
    if (selectedMonth === "Mar-26") return buildVerifiedSnapshot(true);
    return computeForMonth(selectedMonth);
  }, [selectedMonth]);

  // === All-time (cumulative) per-company snapshot — verified ITD figures ===
  const allTimeData = useMemo(() => buildVerifiedSnapshot(false), []);

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
      share: "100%",
      investment: d.mkAutosCompany.investment, profit: d.mkAutosCompany.profit,
      netPosition: d.mkAutosCompany.netPosition, roi: d.mkAutosCompany.roi,
      color: "hsl(var(--chart-2))", subtitle: "Share Capital & P&L", updatedTo: "Mar 2026",
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
      color: "hsl(var(--chart-4))", updatedTo: "Mar 2026",
    },
  ];

  const totalInvestment = companies.reduce((s, c) => s + c.investment, 0);
  const totalProfit = companies.reduce((s, c) => s + c.profit, 0);
  const totalNetPosition = companies.reduce((s, c) => s + c.netPosition, 0);
  const overallROI = (totalProfit / totalInvestment) * 100;

  // === Ahmad's-share aggregates — DERIVED from companyData (subscribes to selectedMonth) ===
  // Entity P&L for the selected period × Ahmad's ownership % per company.
  // For "all" and "Mar-26" we use the verified static figures; every other month
  // pulls live from each company's monthly data via computeForMonth.
  const ahmadKeys = Object.keys(VERIFIED) as (keyof typeof VERIFIED)[];
  const keyToCompanyKey: Record<keyof typeof VERIFIED, keyof typeof d> = {
    rya: "rya", otc: "otc", mkAutosCars: "mkAutosCars",
    mkAutosCompany: "mkAutosCompany", mkx: "mkx", garage: "garage",
  };
  const ahmadTotalInvestment = ahmadKeys.reduce((s, k) => s + VERIFIED[k].investment, 0);  // 9,552,734 (constant)
  // ITD profit & ROI are constant — anchored to verified ITD figures.
  const ahmadITDProfit = ahmadKeys.reduce((s, k) => s + VERIFIED[k].ahmadITD, 0);          // +351,782
  const ahmadNetPosition = ahmadTotalInvestment + ahmadITDProfit;                          // 9,904,516
  const ahmadWeightedROI = (ahmadITDProfit / ahmadTotalInvestment) * 100;                  // +3.7%
  // Period-scoped Ahmad profit — recomputes on every selectedMonth change.
  const ahmadPeriodProfitByKey = (k: keyof typeof VERIFIED): number => {
    if (selectedMonth === "all") return VERIFIED[k].ahmadITD;
    if (selectedMonth === "Mar-26") return VERIFIED[k].ahmadMar;
    // Derive from live company data: entity period profit × Ahmad share %
    const entityProfit = d[keyToCompanyKey[k]].profit;
    return entityProfit * (VERIFIED[k].ahmadPct / 100);
  };
  const ahmadProfitForPeriod = ahmadKeys.reduce((s, k) => s + ahmadPeriodProfitByKey(k), 0);
  const ahmadNetPositionForPeriod = ahmadTotalInvestment + ahmadProfitForPeriod;
  const ahmadRows = ahmadKeys.map(k => ({
    key: k,
    name: ({ rya: "RYA Gold", otc: "OTC Trading", mkAutosCars: "MK Autos Cars", mkAutosCompany: "MK Autos Company", mkx: "MKX Crypto", garage: "MK Garage" } as const)[k],
    pct: VERIFIED[k].ahmadPct,
    investment: VERIFIED[k].investment,
    entityITD: VERIFIED[k].entityITD,
    ahmadITD: VERIFIED[k].ahmadITD,
    ahmadPeriod: ahmadPeriodProfitByKey(k),
    ahmadROI: (VERIFIED[k].ahmadITD / VERIFIED[k].investment) * 100,
  }));
  const ahmadBest = [...ahmadRows].sort((a, b) => b.ahmadROI - a.ahmadROI)[0];
  const ahmadWorst = [...ahmadRows].sort((a, b) => a.ahmadROI - b.ahmadROI)[0];

  // Previous month totals for MoM
  const prevTotalProfit = pd ? Object.values(pd).reduce((s, v) => s + v.profit, 0) : null;
  const prevTotalNetPosition = pd ? Object.values(pd).reduce((s, v) => s + v.netPosition, 0) : null;
  const prevTotalInvestment = pd ? Object.values(pd).reduce((s, v) => s + v.investment, 0) : null;
  const prevOverallROI = pd && prevTotalInvestment ? (prevTotalProfit! / prevTotalInvestment) * 100 : null;

  // Derived analytics — use cumulative (all-time) ROI/profit so a single bad month
  // doesn't misclassify a long-term winner (e.g., RYA Gold) as a "losing company".
  const cumulative = allTimeData;
  const cumulativeByKey = (k: keyof typeof cumulative) => cumulative[k];
  const bestPerformer = [...companies].sort((a, b) => cumulativeByKey(b.key).roi - cumulativeByKey(a.key).roi)[0];
  const worstPerformer = [...companies].sort((a, b) => cumulativeByKey(a.key).roi - cumulativeByKey(b.key).roi)[0];
  const losingCompanies = companies.filter(c => cumulativeByKey(c.key).profit < 0);
  const profitableCompanies = companies.filter(c => cumulativeByKey(c.key).profit >= 0);
  const largestExposure = [...companies].sort((a, b) => b.investment - a.investment)[0];
  const largestExposurePct = (largestExposure.investment / totalInvestment) * 100;

  // Executive Summary
  const executiveSummary = useMemo(() => {
    // Verified narrative for Mar-26 / ITD
    if (selectedMonth === "all") {
      return "Ahmad's portfolio of 6 companies has total investment AED 9,552,734 with net positive P&L of AED 351,782 (+3.7% ROI). The three profitable companies — RYA Gold (+AED 2,293,945), MK Autos Cars (+AED 1,579,855) and OTC Trading (+AED 752,710) — generated combined profit of AED 4,626,510. This is almost entirely offset by MKX Crypto losses of AED 4,063,104 (Ahmad 50% share of AED 8,126,209). Without MKX, Ahmad net portfolio profit = +AED 4,414,886. Immediate board-level decisions required on MKX (EXIT vs RESTRUCTURE) and MK Garage (capital injection vs wind-down). Every month of MKX inaction costs Ahmad approximately AED 83,403 (50% of AED 166,806 monthly burn).";
    }
    if (selectedMonth === "Mar-26") {
      return "March 2026 portfolio net loss AED 55,554 (Ahmad share). OTC (+AED 107,462) and RYA Gold (+AED 38,286) were the only profitable companies. MKX (-AED 166,806) consumed all gains. Without MKX, March portfolio profit would be +AED 111,252. Ahmad ITD net position +AED 351,782 — without MKX would be +AED 4,414,886.";
    }
    const period = `in ${selectedMonth}`;
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
  // current.roi is overridden with the CUMULATIVE (all-time) ROI so that the merged
  // ranking table, signal logic and loss alerts reflect the long-term investment performance
  // (matching each company's individual dashboard). current.profit/investment remain
  // period-scoped for the Profit/Loss + MoM columns.
  const companySnapshots = useMemo<CompanySnapshot[]>(() => {
    const idx = ALL_MONTHS.indexOf(selectedMonth);
    const end = idx >= 0 ? idx : ALL_MONTHS.length - 1;
    const start = Math.max(0, end - 5);
    const slice = ALL_MONTHS.slice(start, end + 1);
    return companies.map(c => {
      const prev = pd ? pd[c.key] : null;
      const cum = allTimeData[c.key];
      const trend = slice.map(m => ({ month: m, profit: computeForMonth(m)[c.key].profit }));
      return {
        key: c.key,
        name: c.name,
        share: c.share,
        current: { investment: c.investment, profit: c.profit, netPosition: c.netPosition, roi: cum.roi },
        previous: prev ? { investment: prev.investment, profit: prev.profit, netPosition: prev.netPosition, roi: prev.roi } : null,
        trend,
        itdProfit: cum.profit,
        marProfit: c.profit,
      };
    });
  }, [companies, pd, selectedMonth, allTimeData]);

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

        {/* === PERMANENT NOTES BANNER === */}
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-3">
            <div className="flex items-start gap-2">
              <FileText className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div className="text-[11px] text-foreground leading-relaxed space-y-0.5">
                <p>• RYA Gold figures converted at USD/AED 3.673 — <span className="font-semibold">updated to April 2026</span>.</p>
                <p>• MK Autos Co and MK Garage revenue excludes visa-sponsorship pass-through (net profit unaffected).</p>
                <p>• Intercompany balance eliminated: MK Autos Co ↔ MK Garage <span className="font-semibold">AED 79,125</span>.</p>
                <p>• MK Autos Cars: <span className="font-semibold">AED 490,160</span> total owed to Ahmad (AED 445,160 profit + AED 45,000 personal loan); cash withdrawn AED 1,134,695.</p>
                <p>• All figures as at March 2026 except RYA Gold (April 2026).</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 1. KPI Summary Cards — AHMAD'S SHARE ONLY */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary">Portfolio KPI Summary</h2>
            <Badge variant="outline" className="text-[10px] border-primary/40 text-primary">Ahmad's Share Only</Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <Card className="relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
            <CardContent className="p-4 relative">
              <p className="text-[10px] font-medium tracking-wider uppercase text-muted-foreground">Total Investment</p>
              <p className="text-xl font-bold font-serif text-foreground">{fmt(toDisplay(ahmadTotalInvestment))}</p>
              <p className="text-[10px] text-muted-foreground">{ahmadRows.length} entities · Ahmad</p>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
            <CardContent className="p-4 relative">
              <p className="text-[10px] font-medium tracking-wider uppercase text-muted-foreground">
                {selectedMonth === "Mar-26" ? "Ahmad Net P&L (Mar-26)" : "Ahmad Net P&L (ITD)"}
              </p>
              <p className={`text-xl font-bold font-serif ${ahmadProfitForPeriod >= 0 ? "text-success" : "text-loss"}`}>
                {ahmadProfitForPeriod >= 0 ? "+" : ""}{fmt(toDisplay(ahmadProfitForPeriod))}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {ahmadRows.filter(r => (selectedMonth === "Mar-26" ? r.ahmadMar : r.ahmadITD) >= 0).length} profitable · {ahmadRows.filter(r => (selectedMonth === "Mar-26" ? r.ahmadMar : r.ahmadITD) < 0).length} losing
              </p>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
            <CardContent className="p-4 relative">
              <p className="text-[10px] font-medium tracking-wider uppercase text-muted-foreground">Ahmad Net Position</p>
              <p className={`text-xl font-bold font-serif ${ahmadNetPositionForPeriod >= 0 ? "text-success" : "text-loss"}`}>{fmt(toDisplay(ahmadNetPositionForPeriod))}</p>
              <p className="text-[10px] text-muted-foreground">Investment + ITD P&L</p>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
            <CardContent className="p-4 relative">
              <p className="text-[10px] font-medium tracking-wider uppercase text-muted-foreground">Ahmad Weighted ROI</p>
              <p className={`text-xl font-bold font-serif ${ahmadWeightedROI >= 0 ? "text-success" : "text-loss"}`}>
                {ahmadWeightedROI >= 0 ? "+" : ""}{ahmadWeightedROI.toFixed(1)}%
              </p>
              <p className="text-[10px] text-muted-foreground">ITD weighted average</p>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
            <CardContent className="p-4 relative">
              <p className="text-[10px] font-medium tracking-wider uppercase text-muted-foreground flex items-center gap-1"><Trophy className="h-3 w-3 text-success" />Best Performer</p>
              <p className="text-xl font-bold font-serif text-success">+{ahmadBest.ahmadROI.toFixed(1)}%</p>
              <p className="text-[10px] text-muted-foreground">{ahmadBest.name}</p>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
            <CardContent className="p-4 relative">
              <p className="text-[10px] font-medium tracking-wider uppercase text-muted-foreground flex items-center gap-1"><Target className="h-3 w-3 text-loss" />Worst Performer</p>
              <p className="text-xl font-bold font-serif text-loss">{ahmadWorst.ahmadROI.toFixed(1)}%</p>
              <p className="text-[10px] text-muted-foreground">{ahmadWorst.name}</p>
            </CardContent>
          </Card>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        {/* 2-5. Performance Verdict + Critical Alerts, Ranking table, MoM, Trend chart */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary">Company Ranking & Insights</h2>
            <Badge variant="outline" className="text-[10px] border-primary/40 text-primary">Full Company (100%)</Badge>
          </div>
          <PortfolioInsights
            companies={companySnapshots}
            selectedMonth={selectedMonth}
            prevMonthLabel={prevMonthLabel}
            format={fmt}
            toDisplay={toDisplay}
            portfolioTrend={portfolioTrend}
          />
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        {/* 6a. Portfolio Risk Dashboard — Critical / Watch / Healthy */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" /> Portfolio Risk Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* CRITICAL */}
            <div className="rounded-lg border-2 border-loss/40 bg-loss/5 p-3">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-loss" />
                <p className="text-xs font-bold uppercase tracking-wider text-loss">🔴 Critical — Act Immediately</p>
              </div>
              <ul className="text-xs text-foreground space-y-1.5 list-disc list-inside leading-relaxed">
                <li><span className="font-semibold">MKX:</span> -AED 166,806 loss Mar-26 · 10 months runway · VARA 7 risk flags — <span className="font-bold">EXIT</span></li>
                <li><span className="font-semibold">MK Garage:</span> Cash overdraft -AED 69,521 · ITD losses -AED 338,134 exceed share capital AED 300,000 — <span className="font-bold">EXIT</span></li>
                <li><span className="font-semibold">MK Autos Co:</span> Debt 28.1x equity · cash AED 50,989 critically low</li>
                <li><span className="font-semibold">MKX = 60.6% of capital</span> at -70.2% ROI — critical misallocation</li>
              </ul>
            </div>
            {/* WATCH */}
            <div className="rounded-lg border-2 border-yellow-500/40 bg-yellow-500/5 p-3">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <p className="text-xs font-bold uppercase tracking-wider text-yellow-500">⚠️ Watch</p>
              </div>
              <ul className="text-xs text-foreground space-y-1.5 list-disc list-inside leading-relaxed">
                <li><span className="font-semibold">RYA Gold:</span> USD 798,688 inventory unsold | Customer concentration 93.7%</li>
                <li><span className="font-semibold">OTC:</span> Volume declining 6 months | Counterparty concentration 53.4%</li>
                <li><span className="font-semibold">MK Cars:</span> 3 idle vehicles | Revenue declining 6 months</li>
              </ul>
            </div>
            {/* HEALTHY */}
            <div className="rounded-lg border-2 border-success/40 bg-success/5 p-3">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-4 w-4 text-success" />
                <p className="text-xs font-bold uppercase tracking-wider text-success">✅ Healthy</p>
              </div>
              <ul className="text-xs text-foreground space-y-1.5 list-disc list-inside leading-relaxed">
                <li><span className="font-semibold">RYA Gold:</span> +1,129.4% ROI · Strong profit engine (Apr 2026)</li>
                <li><span className="font-semibold">OTC:</span> +146.0% ROI · Profitable consistently</li>
                <li><span className="font-semibold">MK Cars:</span> +66.1% ROI · Fleet value AED 2.93M</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* 6. Risk Flags — Concentration Recommendation + Loss Alerts + Concentration Risk */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" /> Risk Flags
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {/* Concentration Recommendation */}
            <div className={`rounded-md border-2 p-3 flex items-start gap-3 ${largestExposurePct > 50 ? "border-loss/40 bg-loss/5" : largestExposurePct > 35 ? "border-yellow-500/40 bg-yellow-500/5" : "border-success/40 bg-success/5"}`}>
              <Shield className={`h-5 w-5 shrink-0 mt-0.5 ${largestExposurePct > 50 ? "text-loss" : largestExposurePct > 35 ? "text-yellow-500" : "text-success"}`} />
              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-wider mb-0.5">
                  Concentration Recommendation: {largestExposurePct > 50 ? "REDUCE" : largestExposurePct > 35 ? "REBALANCE" : "MAINTAIN"}
                </p>
                <p className="text-sm text-foreground">
                  {largestExposurePct > 50
                    ? `${largestExposure.name} at ${largestExposurePct.toFixed(0)}% of portfolio — divest to <40% to limit single-entity risk.`
                    : largestExposurePct > 35
                    ? `${largestExposure.name} at ${largestExposurePct.toFixed(0)}% — rebalance toward underweighted entities.`
                    : `Top exposure at ${largestExposurePct.toFixed(0)}% — diversification healthy.`}
                </p>
              </div>
            </div>

            {/* Loss Alerts */}
            {losingCompanies.map(c => (
              <div
                key={c.name}
                className="rounded-md border border-loss/30 bg-loss/5 cursor-pointer hover:border-loss/50 transition-colors p-3 flex items-center gap-3"
                onClick={() => navigate(c.route)}
              >
                <AlertTriangle className="h-5 w-5 text-loss shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-loss">{c.name} — Loss Alert</p>
                  <p className="text-xs text-muted-foreground">
                    ROI: {c.roi.toFixed(1)}% · Loss: {fmt(toDisplay(c.profit))} · {((c.investment / totalInvestment) * 100).toFixed(0)}% of portfolio exposure
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-loss" />
              </div>
            ))}
            {losingCompanies.length === 0 && (
              <div className="rounded-md border border-success/30 bg-success/5 p-3 text-xs text-muted-foreground">
                No active loss alerts — all entities profitable on a cumulative basis.
              </div>
            )}

            {/* Concentration Risk */}
            {largestExposurePct > 40 && (
              <div className="rounded-md border border-yellow-500/30 bg-yellow-500/5 p-3 flex items-center gap-3">
                <Shield className="h-5 w-5 text-yellow-500 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">Concentration Risk</p>
                  <p className="text-xs text-muted-foreground">
                    {largestExposure.name} represents {largestExposurePct.toFixed(0)}% of total investment. Consider diversification if above 40%.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="h-[2px] bg-gradient-to-r from-transparent via-primary/70 to-transparent rounded-full" />

        {/* 7. Consolidated P&L Matrix — FULL COMPANY */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary">Consolidated P&L Matrix</h2>
            <Badge variant="outline" className="text-[10px] border-primary/40 text-primary">Full Company (100%)</Badge>
          </div>
          <ConsolidatedPLMatrix allMonths={ALL_MONTHS} selectedMonth={selectedMonth} />
        </div>

        {/* Consolidation notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-primary mb-1">Intercompany Elimination</p>
            <p className="text-xs text-foreground leading-relaxed">
              MK Autos Company owes MK Garage <span className="font-semibold">AED 79,125</span>. This intercompany balance has been eliminated from both company balances in the consolidated portfolio view.
            </p>
          </div>
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-primary mb-1">Dummy Income Note</p>
            <p className="text-xs text-foreground leading-relaxed">
              MK Autos Company and MK Garage revenue figures exclude visa-sponsorship pass-through entries (matching offsets in payroll). Net profit unaffected in both companies.
            </p>
          </div>
        </div>


        <div className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        {/* 8. AHMAD'S INVESTMENT POSITION — Ahmad Share Only */}
        <Card className="border-primary/30 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" /> Ahmad's Direct Investment Position — All Companies
              </CardTitle>
              <Badge variant="outline" className="text-[10px] border-primary/40 text-primary">Ahmad's Share Only</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Company</TableHead>
                  <TableHead className="text-xs text-center">Ahmad %</TableHead>
                  <TableHead className="text-xs text-right">Investment</TableHead>
                  <TableHead className="text-xs text-right">Company Total P&L</TableHead>
                  <TableHead className="text-xs text-right">Ahmad P&L Share</TableHead>
                  <TableHead className="text-xs text-right">Ahmad ROI</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ahmadRows.map(r => {
                  const exitRow = r.key === "mkx" || r.key === "garage";
                  const winRow = r.ahmadITD > 0;
                  const rowBg = exitRow ? "bg-loss/5" : winRow ? "bg-success/5" : "";
                  return (
                    <TableRow key={r.key} className={rowBg}>
                      <TableCell className="text-sm font-semibold text-foreground">{r.name}</TableCell>
                      <TableCell className="text-center text-xs text-muted-foreground">{r.pct}%</TableCell>
                      <TableCell className="text-right text-sm tabular-nums">{fmt(toDisplay(r.investment))}</TableCell>
                      <TableCell className={`text-right text-sm tabular-nums ${r.entityITD >= 0 ? "text-success" : "text-loss"}`}>
                        {r.entityITD >= 0 ? "+" : ""}{fmt(toDisplay(r.entityITD))}
                      </TableCell>
                      <TableCell className={`text-right text-sm font-semibold tabular-nums ${r.ahmadITD >= 0 ? "text-success" : "text-loss"}`}>
                        {r.ahmadITD >= 0 ? "+" : ""}{fmt(toDisplay(r.ahmadITD))}
                      </TableCell>
                      <TableCell className={`text-right text-sm font-bold tabular-nums ${r.ahmadROI >= 0 ? "text-success" : "text-loss"}`}>
                        {r.ahmadROI >= 0 ? "+" : ""}{r.ahmadROI.toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  );
                })}
                <TableRow className="border-t-2 border-primary/40 bg-primary/5 font-bold">
                  <TableCell className="text-sm font-bold">TOTAL</TableCell>
                  <TableCell />
                  <TableCell className="text-right text-sm font-bold tabular-nums">{fmt(toDisplay(ahmadTotalInvestment))}</TableCell>
                  <TableCell className={`text-right text-sm font-bold tabular-nums ${ahmadRows.reduce((s, r) => s + r.entityITD, 0) >= 0 ? "text-success" : "text-loss"}`}>
                    {(() => { const t = ahmadRows.reduce((s, r) => s + r.entityITD, 0); return `${t >= 0 ? "+" : ""}${fmt(toDisplay(t))}`; })()}
                  </TableCell>
                  <TableCell className={`text-right text-sm font-bold tabular-nums ${ahmadITDProfit >= 0 ? "text-success" : "text-loss"}`}>
                    {ahmadITDProfit >= 0 ? "+" : ""}{fmt(toDisplay(ahmadITDProfit))}
                  </TableCell>
                  <TableCell className={`text-right text-sm font-bold tabular-nums ${ahmadWeightedROI >= 0 ? "text-success" : "text-loss"}`}>
                    {ahmadWeightedROI >= 0 ? "+" : ""}{ahmadWeightedROI.toFixed(1)}%
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Sub-notes per company */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
          <div className="rounded-md border border-border/50 bg-card/60 p-2.5">
            <p className="text-[10px] font-bold uppercase text-primary mb-0.5">MK Autos Cars</p>
            <p className="text-foreground/90">Total owed to Ahmad: <span className="font-semibold">AED 490,160</span> (AED 445,160 uncollected profit + AED 45,000 personal loan) · Cash withdrawn AED 1,134,695.</p>
          </div>
          <div className="rounded-md border border-border/50 bg-card/60 p-2.5">
            <p className="text-[10px] font-bold uppercase text-primary mb-0.5">OTC Trading</p>
            <p className="text-foreground/90">Total company profit AED 1,505,420 · Ahmad 50%: AED 752,710 · Maria 50%: AED 752,710.</p>
          </div>
          <div className="rounded-md border border-border/50 bg-card/60 p-2.5">
            <p className="text-[10px] font-bold uppercase text-primary mb-0.5">MK Autos Company</p>
            <p className="text-foreground/90">Total capital AED 300,000 · Ahmad 45% (AED 135,000) · Total company P&L -AED 169,714 · Ahmad share -AED 76,371.</p>
          </div>
          <div className="rounded-md border border-border/50 bg-card/60 p-2.5">
            <p className="text-[10px] font-bold uppercase text-primary mb-0.5">MK Garage</p>
            <p className="text-foreground/90">Total company P&L -AED 338,134 · Ahmad 40% share -AED 135,253 · Ahmad total exposure: AED 520,000 (capital AED 120,000 + loan AED 400,000).</p>
          </div>
        </div>

        {/* Three insight cards: Winners / Loss Exposure / Net Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Card className="border-success/40 bg-success/5">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-bold text-success flex items-center gap-2"><Trophy className="h-4 w-4" /> Ahmad's Winners</CardTitle></CardHeader>
            <CardContent className="text-xs space-y-1">
              <p>RYA Gold: <span className="font-semibold text-success">+AED 2,293,945</span> <span className="text-muted-foreground">(Apr 2026)</span></p>
              <p>MK Autos Cars: <span className="font-semibold text-success">+AED 1,579,855</span> <span className="text-muted-foreground">(AED 490,160 owed)</span></p>
              <p>OTC Trading: <span className="font-semibold text-success">+AED 752,710</span></p>
              <p className="pt-1 border-t border-success/30 mt-1.5"><span className="font-bold">Combined positive: +AED 4,626,510</span></p>
            </CardContent>
          </Card>
          <Card className="border-loss/40 bg-loss/5">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-bold text-loss flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Ahmad's Loss Exposure</CardTitle></CardHeader>
            <CardContent className="text-xs space-y-1">
              <p>MKX Crypto: <span className="font-semibold text-loss">-AED 4,063,104</span></p>
              <p>MK Garage: <span className="font-semibold text-loss">-AED 135,253</span></p>
              <p>MK Autos Company: <span className="font-semibold text-loss">-AED 76,371</span></p>
              <p className="pt-1 border-t border-loss/30 mt-1.5"><span className="font-bold">Combined negative: -AED 4,274,728</span></p>
            </CardContent>
          </Card>
          <Card className="border-primary/40 bg-primary/5">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-bold text-primary flex items-center gap-2"><Target className="h-4 w-4" /> Net Summary</CardTitle></CardHeader>
            <CardContent className="text-xs space-y-1">
              <p>Ahmad Net P&L: <span className="font-bold text-success">+AED 351,782 ✅</span></p>
              <p>Without MKX: <span className="font-bold text-success">+AED 4,414,886</span></p>
              <p>MKX has cost Ahmad: <span className="font-bold text-loss">AED 4,063,104</span></p>
              <p className="pt-1 border-t border-primary/30 mt-1.5 text-yellow-500 font-semibold">⚠ Portfolio marginally positive — MKX is the only drag</p>
            </CardContent>
          </Card>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        {/* 9. WEEKLY ACTION ITEMS (always visible) */}
        <Card className="border-primary/40 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              ⚡ Weekly Action Items — What Needs Attention This Week
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-lg border-2 border-loss/40 bg-loss/5 p-3">
              <p className="text-xs font-bold uppercase tracking-wider text-loss mb-2">🔴 Urgent — Act This Week</p>
              <ul className="text-xs text-foreground space-y-1.5 list-disc list-inside leading-relaxed">
                <li><span className="font-semibold">MKX:</span> Present EXIT vs RESTRUCTURE to board — every week costs Ahmad AED 41,750</li>
                <li><span className="font-semibold">MK Garage:</span> Chase AR AED 206,831 to clear overdraft -AED 69,521</li>
                <li><span className="font-semibold">MK Autos Co:</span> Chase AR AED 436,323 — solve cash crisis AED 50,989</li>
                <li><span className="font-semibold">MK Cars:</span> Activate Lamborghini + Patrol — idle depreciation AED 26,417/mo</li>
                <li><span className="font-semibold">RYA Gold:</span> Contact UNIP HK — USD 798,688 inventory idle</li>
              </ul>
            </div>
            <div className="rounded-lg border-2 border-yellow-500/40 bg-yellow-500/5 p-3">
              <p className="text-xs font-bold uppercase tracking-wider text-yellow-500 mb-2">🟡 This Month</p>
              <ul className="text-xs text-foreground space-y-1.5 list-disc list-inside leading-relaxed">
                <li><span className="font-semibold">OTC:</span> Investigate volume drop Jan 72.9M → Mar 36.6M</li>
                <li><span className="font-semibold">MK Cars:</span> List GLE53 + C200 — save AED 14,350/mo depreciation</li>
                <li><span className="font-semibold">MK Garage:</span> Assess wind-down vs capital injection</li>
                <li><span className="font-semibold">RYA Gold:</span> Add 2 new customers — reduce 93.7% concentration</li>
                <li><span className="font-semibold">MKX:</span> Engage compliance on 7 VARA risk flags</li>
              </ul>
            </div>
            <div className="rounded-lg border-2 border-success/40 bg-success/5 p-3">
              <p className="text-xs font-bold uppercase tracking-wider text-success mb-2">🟢 Monitor Weekly</p>
              <ul className="text-xs text-foreground space-y-1.5 list-disc list-inside leading-relaxed">
                <li><span className="font-semibold">OTC:</span> Spread above 0.300% target ✓ · watch volume recovery</li>
                <li><span className="font-semibold">RYA:</span> Gold price trend vs USD 798,688 book value</li>
                <li><span className="font-semibold">MKX:</span> Asset coverage ratio — must stay above 1.00x</li>
                <li><span className="font-semibold">Portfolio:</span> Plan MKX exit to unlock +AED 4,414,886 net position</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        {/* 10. Executive Summary */}
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent backdrop-blur-sm">
          <CardContent className="p-4 flex items-start gap-3">
            <FileText className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">Executive Summary</p>
              <p className="text-sm text-foreground leading-relaxed">{executiveSummary}</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CombinedDashboard;
