import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUp, ArrowDown, Minus, Layers } from "lucide-react";

import { monthlyPL as otcMonthlyPL, otcSummary } from "@/data/otcData";
import { monthlyIncome as mkAutosMonthly, mkAutosSummary } from "@/data/mkAutosData";
import { monthlyPL as mkAutosCompanyPL, balanceSheet as mkAutosBS } from "@/data/mkAutosData";
import { monthlyData as mkxMonthly, mkxSummary } from "@/data/mkxData";
import { monthlyPL as garagePL, balanceSheet as garageBS } from "@/data/garageData";
import {
  sales as goldSales,
  expenses as goldExpenses,
  salesDiscounts as goldDiscounts,
  goldCapital,
  AED_TO_USD_RATE,
} from "@/data/goldData";

type Period = "MTD" | "YTD" | "ALL";

interface PLRow {
  revenue: number;
  cogs: number;
  grossProfit: number;
  indirect: number;
  netProfit: number;
  investment: number;
}

const monthOrder = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const normalizeMonth = (m: string): string => {
  const m4 = m.match(/^(\w{3})\s*(\d{4})$/);
  if (m4) return `${m4[1]}-${m4[2].slice(2)}`;
  const m2 = m.match(/^(\w{3})\s+(\d{2})$/);
  if (m2) return `${m2[1]}-${m2[2]}`;
  const md = m.match(/^(\w{3})-(\d{2})$/);
  if (md) return `${md[1]}-${md[2]}`;
  return m;
};

const compareMonth = (a: string, b: string) => {
  const [mA, yA] = a.split("-");
  const [mB, yB] = b.split("-");
  const yd = parseInt(yA) - parseInt(yB);
  if (yd !== 0) return yd;
  return monthOrder.indexOf(mA) - monthOrder.indexOf(mB);
};

// === Per-company per-month P&L extractors (returns 0s if no data) ===

const otcForMonth = (m: string): PLRow => {
  const row = otcMonthlyPL.find(r => normalizeMonth(r.month) === m);
  if (!row) return zero();
  // OTC has no revenue/COGS split: gross profit acts as both
  return {
    revenue: row.grossProfit,
    cogs: 0,
    grossProfit: row.grossProfit,
    indirect: row.cashExpenses + row.scam,
    netProfit: row.netProfit,
    investment: otcSummary.initialCapital,
  };
};

const carsForMonth = (m: string): PLRow => {
  const row = mkAutosMonthly.find(r => normalizeMonth(r.month) === m);
  if (!row) return zero();
  // Rental income = revenue, no COGS line per month, treat as = revenue (GP=NP)
  return {
    revenue: row.total,
    cogs: 0,
    grossProfit: row.total,
    indirect: 0,
    netProfit: row.total,
    investment: mkAutosSummary.totalInitialInvestment,
  };
};

const mkxForMonth = (m: string): PLRow => {
  const row = mkxMonthly.find(r => normalizeMonth(r.month) === m);
  if (!row) return zero();
  return {
    revenue: row.revenue,
    cogs: row.gasFees,
    grossProfit: row.grossProfit,
    indirect: row.totalExpenses,
    netProfit: row.netProfit,
    investment: 11577867.96, // MKX total paid-up capital (Ahmad+Maria)
  };
};

const garageForMonth = (m: string): PLRow => {
  const row = garagePL.find(r => normalizeMonth(r.month) === m);
  if (!row) return zero();
  return {
    revenue: row.totalRevenue,
    cogs: row.costOfSales,
    grossProfit: row.grossProfit,
    indirect: row.indirectExpenses,
    netProfit: row.netProfit,
    investment: garageBS.capital.total,
  };
};

const mkAutosCompanyForMonth = (m: string): PLRow => {
  const row = mkAutosCompanyPL.find(r => normalizeMonth(r.month) === m);
  if (!row) return zero();
  return {
    revenue: row.directIncome,
    cogs: row.costOfSales,
    grossProfit: row.grossProfit,
    indirect: row.indirectExpenses + row.otherExpense,
    netProfit: row.netProfit,
    investment: mkAutosBS.capitalAccount,
  };
};

const ryaForMonth = (m: string): PLRow => {
  // Aggregate sales/expenses/discounts in AED for the month
  const inMonth = (date: string) => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return false;
    return `${d.toLocaleString("en-US", { month: "short" })}-${String(d.getFullYear()).slice(2)}` === m;
  };
  const salesM = goldSales.filter(s => inMonth(s.date));
  const expM = goldExpenses.filter(e => inMonth(e.date));
  const discM = goldDiscounts.filter(e => inMonth(e.date));
  if (salesM.length === 0 && expM.length === 0 && discM.length === 0) return zero();

  const revenueUSD = salesM.reduce((s, t) => s + t.amountUSD, 0);
  const cogsUSD = salesM.reduce((s, t) => s + t.costUSD, 0);
  const discountUSD = discM.reduce((s, t) => s + t.amount, 0);
  const expenseUSD = expM.reduce((s, t) => s + t.amount, 0);
  const grossProfitUSD = revenueUSD - cogsUSD - discountUSD;
  const netUSD = grossProfitUSD - expenseUSD;
  return {
    revenue: revenueUSD * AED_TO_USD_RATE,
    cogs: (cogsUSD + discountUSD) * AED_TO_USD_RATE,
    grossProfit: grossProfitUSD * AED_TO_USD_RATE,
    indirect: expenseUSD * AED_TO_USD_RATE,
    netProfit: netUSD * AED_TO_USD_RATE,
    investment: Math.abs(goldCapital.initialCapital) * AED_TO_USD_RATE,
  };
};

const zero = (): PLRow => ({ revenue: 0, cogs: 0, grossProfit: 0, indirect: 0, netProfit: 0, investment: 0 });

const sumRows = (rows: PLRow[]): PLRow => rows.reduce((acc, r) => ({
  revenue: acc.revenue + r.revenue,
  cogs: acc.cogs + r.cogs,
  grossProfit: acc.grossProfit + r.grossProfit,
  indirect: acc.indirect + r.indirect,
  netProfit: acc.netProfit + r.netProfit,
  investment: Math.max(acc.investment, r.investment), // investment is a stock, not flow
}), zero());

interface CompanyDef {
  key: string;
  label: string;
  forMonth: (m: string) => PLRow;
}

// Full Company (100%) basis — no ownership share applied.
const COMPANIES: CompanyDef[] = [
  { key: "otc", label: "OTC", forMonth: otcForMonth },
  { key: "cars", label: "MK Autos (Cars)", forMonth: carsForMonth },
  { key: "mkx", label: "MKX", forMonth: mkxForMonth },
  { key: "garage", label: "MK Garage", forMonth: garageForMonth },
  { key: "company", label: "MK Autos (Company)", forMonth: mkAutosCompanyForMonth },
  { key: "rya", label: "RYA Gold", forMonth: ryaForMonth },
];

// === VERIFIED Full-Company overrides (single source of truth) ===
// Mar-26 monthly figures and ITD totals provided by Group Finance Control.
// Used to override computed values when (a) MTD on Mar-26, or (b) ITD/All Time view.
// If a non-Mar/non-ITD period is requested, computed values flow through unchanged.
// Cars: GP back-solved at verified GM% 82.8% (Rev 26,415 → GP 21,872 → COGS 4,543).
//        Indirect = GP - Net = 21,872 - (-13,677) = 35,549.
const VERIFIED_MAR_26_FULL: Record<string, Partial<PLRow>> = {
  otc:     { revenue:  198_691, netProfit:  107_462 },
  cars:    { revenue:   26_415, cogs: 4_543, grossProfit: 21_872, indirect: 35_549, netProfit: -13_677 },
  company: { revenue:  246_433, netProfit:  -13_677 },
  mkx:     { revenue:   71_450, netProfit: -166_806 },
  garage:  { revenue:   61_995, netProfit:   -7_142 },
  rya:     { revenue:  248_025, netProfit:   38_286 },
};

// Per-(month, company) metrics that should display "—" instead of a computed value.
// Used when source data classification is in dispute and management has not yet reconciled.
const FLAGGED_MAR_26: Record<string, Set<string>> = {
  garage: new Set(["cogs", "grossProfit", "grossMargin", "indirect"]),
};

const VERIFIED_ITD_FULL: Record<string, Partial<PLRow>> = {
  otc:     { netProfit:  1_505_420 },
  cars:    { netProfit:  1_579_855 },
  company: { netProfit:   -169_714 },
  mkx:     { netProfit: -8_126_209 },
  garage:  { netProfit:   -338_134 },
  rya:     { netProfit:  2_293_945 },
};

const applyOverride = (computed: PLRow, override: Partial<PLRow>): PLRow => ({
  ...computed,
  ...override,
});

const formatAED = (v: number) => {
  const sign = v < 0 ? "-" : "";
  const abs = Math.abs(v);
  const formatted = abs >= 1_000_000
    ? `${(abs / 1_000_000).toFixed(2)}M`
    : abs >= 1_000
    ? `${(abs / 1_000).toFixed(1)}K`
    : abs.toFixed(0);
  return `${sign}AED ${formatted}`;
};

const formatPct = (v: number) => `${v >= 0 ? "" : "-"}${Math.abs(v).toFixed(1)}%`;

interface Props {
  allMonths: string[];
  selectedMonth: string;
}

const ConsolidatedPLMatrix = ({ allMonths, selectedMonth }: Props) => {
  const [period, setPeriod] = useState<Period>("MTD");

  // Determine the set of months to aggregate
  const { currentMonths, prevMonths } = useMemo(() => {
    const sorted = [...allMonths].sort(compareMonth);
    const anchor = selectedMonth !== "all" && sorted.includes(selectedMonth)
      ? selectedMonth
      : sorted[sorted.length - 1];
    const idx = sorted.indexOf(anchor);

    if (period === "MTD") {
      return {
        currentMonths: [anchor],
        prevMonths: idx > 0 ? [sorted[idx - 1]] : [],
      };
    }
    if (period === "ALL") {
      // All time = every month, prev period = none (no comparison)
      return {
        currentMonths: sorted,
        prevMonths: [],
      };
    }
    // YTD: same number of months in current year vs same months in prior year
    // e.g. Apr-26 selected → Jan-26..Apr-26 vs Jan-25..Apr-25 (apples-to-apples)
    const [anchorM, anchorYear] = anchor.split("-");
    const ytd = sorted.filter(m => {
      const [, y] = m.split("-");
      return y === anchorYear && compareMonth(m, anchor) <= 0;
    });
    const prevYearLabel = String(parseInt(anchorYear) - 1).padStart(2, "0");
    const prevAnchor = `${anchorM}-${prevYearLabel}`;
    const prev = sorted.filter(m => {
      const [, y] = m.split("-");
      return y === prevYearLabel && compareMonth(m, prevAnchor) <= 0;
    });
    return { currentMonths: ytd, prevMonths: prev };
  }, [period, selectedMonth, allMonths]);

  // Compute matrix data. In MTD mode, if a company has no data for the anchor month
  // (e.g., its books are not yet closed), fall back to the most recent prior month
  // that DOES have data — so the column never shows a misleading all-zeros row.
  const isRowEmpty = (r: PLRow) =>
    r.revenue === 0 && r.cogs === 0 && r.grossProfit === 0 && r.indirect === 0 && r.netProfit === 0;
  const sortedAll = useMemo(() => [...allMonths].sort(compareMonth), [allMonths]);

  const resolveCurrent = (c: CompanyDef): PLRow => {
    if (period !== "MTD") return sumRows(currentMonths.map(c.forMonth));
    const anchor = currentMonths[0];
    if (!anchor) return sumRows([]);
    const direct = c.forMonth(anchor);
    if (!isRowEmpty(direct)) return direct;
    // walk back through prior months until we find data
    const idx = sortedAll.indexOf(anchor);
    for (let i = idx - 1; i >= 0; i--) {
      const candidate = c.forMonth(sortedAll[i]);
      if (!isRowEmpty(candidate)) return candidate;
    }
    return direct;
  };

  const data = useMemo(() => {
    const anchor = currentMonths[0];
    return COMPANIES.map(c => {
      const rawCurrent = period === "MTD" ? c.forMonth(anchor ?? "") : sumRows(currentMonths.map(c.forMonth));
      let current = resolveCurrent(c);
      // Apply verified Full-Company overrides where applicable
      if (period === "MTD" && anchor === "Mar-26" && VERIFIED_MAR_26_FULL[c.key]) {
        current = applyOverride(current, VERIFIED_MAR_26_FULL[c.key]);
      } else if (period === "ALL" && VERIFIED_ITD_FULL[c.key]) {
        current = applyOverride(current, VERIFIED_ITD_FULL[c.key]);
      }
      return {
        ...c,
        current,
        previous: sumRows(prevMonths.map(c.forMonth)),
        // Track whether the company has ANY data in the selected period — used to render '—' for empty cells
        hasData: !isRowEmpty(rawCurrent) || (period === "MTD" && anchor === "Mar-26" && !!VERIFIED_MAR_26_FULL[c.key]) || (period === "ALL" && !!VERIFIED_ITD_FULL[c.key]),
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMonths, prevMonths, period, sortedAll]);

  const totals = useMemo(() => ({
    current: sumRows(data.map(d => d.current)),
    previous: sumRows(data.map(d => d.previous)),
  }), [data]);

  const totalPortfolioInvestment = useMemo(
    () => data.reduce((s, d) => s + d.current.investment, 0),
    [data]
  );

  const getRowValues = (metric: keyof PLRow | "grossMargin" | "netMargin" | "roi" | "capitalShare"): { values: number[]; total: number; prev: number[]; prevTotal: number; isPct: boolean } => {
    const calc = (row: PLRow): number => {
      switch (metric) {
        case "grossMargin":
          return row.revenue !== 0 ? (row.grossProfit / row.revenue) * 100 : 0;
        case "netMargin":
          return row.revenue !== 0 ? (row.netProfit / row.revenue) * 100 : 0;
        case "roi":
          return row.investment !== 0 ? (row.netProfit / row.investment) * 100 : 0;
        case "capitalShare":
          return totalPortfolioInvestment !== 0 ? (row.investment / totalPortfolioInvestment) * 100 : 0;
        default:
          return row[metric];
      }
    };
    return {
      values: data.map(d => calc(d.current)),
      total: calc(totals.current),
      prev: data.map(d => calc(d.previous)),
      prevTotal: calc(totals.previous),
      isPct: metric === "grossMargin" || metric === "netMargin" || metric === "roi" || metric === "capitalShare",
    };
  };

  const ROWS: { key: any; label: string; positiveIsBetter: boolean }[] = [
    { key: "revenue", label: "Revenue", positiveIsBetter: true },
    { key: "cogs", label: "Cost of Sales", positiveIsBetter: false },
    { key: "grossProfit", label: "Gross Profit", positiveIsBetter: true },
    { key: "grossMargin", label: "Gross Margin %", positiveIsBetter: true },
    { key: "indirect", label: "Indirect Expenses", positiveIsBetter: false },
    { key: "netProfit", label: "Net Profit", positiveIsBetter: true },
    { key: "netMargin", label: "Net Margin %", positiveIsBetter: true },
    { key: "roi", label: "ROI", positiveIsBetter: true },
    { key: "capitalShare", label: "% of Portfolio Capital", positiveIsBetter: true },
  ];

  const Trend = ({ curr, prev, positiveIsBetter }: { curr: number; prev: number; positiveIsBetter: boolean }) => {
    if (prev === 0 && curr === 0) return null;
    if (prevMonths.length === 0) return null;
    const delta = curr - prev;
    if (Math.abs(delta) < 0.01) return <Minus className="h-3 w-3 text-muted-foreground inline" />;
    const up = delta > 0;
    const good = positiveIsBetter ? up : !up;
    const Icon = up ? ArrowUp : ArrowDown;
    return <Icon className={`h-3 w-3 inline ${good ? "text-success" : "text-loss"}`} />;
  };

  const periodLabel: Record<Period, string> = {
    MTD: "Month-to-Date",
    YTD: "Year-to-Date",
    ALL: "All Time",
  };

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3 flex flex-row items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" />
          <div>
            <CardTitle className="text-base font-semibold text-foreground">Consolidated P&L Matrix</CardTitle>
            <p className="text-xs text-muted-foreground">
              {periodLabel[period]} · {currentMonths.length > 0
                ? currentMonths.length === 1
                  ? currentMonths[0]
                  : `${currentMonths[0]} → ${currentMonths[currentMonths.length - 1]}`
                : "—"}
              {prevMonths.length > 0 && ` · vs ${prevMonths.length === 1 ? prevMonths[0] : `${prevMonths[0]} → ${prevMonths[prevMonths.length - 1]}`}`}
            </p>
          </div>
        </div>
        <div className="flex items-center border border-border rounded-lg overflow-hidden">
          {(["MTD", "YTD", "ALL"] as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                period === p ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {p === "ALL" ? "All Time" : p}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-sm sticky left-0 bg-card z-10">Metric</TableHead>
              {COMPANIES.map(c => (
                <TableHead key={c.key} className="text-sm text-right whitespace-nowrap">{c.label}</TableHead>
              ))}
              <TableHead className="text-sm text-right whitespace-nowrap font-bold border-l-2 border-primary/40 bg-primary/5">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ROWS.map(row => {
              const { values, total, prev, prevTotal, isPct } = getRowValues(row.key);
              // Identify best/worst (exclude 0 values to avoid highlighting empty cells)
              const nonZero = values.filter(v => v !== 0);
              const best = nonZero.length > 0
                ? row.positiveIsBetter ? Math.max(...nonZero) : Math.min(...nonZero)
                : null;
              const worst = nonZero.length > 0
                ? row.positiveIsBetter ? Math.min(...nonZero) : Math.max(...nonZero)
                : null;

              return (
                <TableRow key={row.label}>
                  <TableCell className="font-medium text-base sticky left-0 bg-card z-10 whitespace-nowrap">
                    {row.label}
                  </TableCell>
                  {values.map((v, i) => {
                    const companyHasData = data[i].hasData;
                    const isBest = best !== null && v === best && nonZero.length > 1 && companyHasData;
                    const isWorst = worst !== null && v === worst && nonZero.length > 1 && best !== worst && companyHasData;
                    const colorClass = !companyHasData ? "text-muted-foreground/60" : v === 0 ? "text-muted-foreground" : v >= 0 ? "text-success" : "text-loss";
                    const borderClass = isBest
                      ? "ring-2 ring-inset ring-primary"
                      : isWorst
                      ? "ring-2 ring-inset ring-loss"
                      : "";
                    return (
                      <TableCell
                        key={i}
                        className={`text-right text-base tabular-nums ${colorClass} ${borderClass}`}
                      >
                        <span className="inline-flex items-center gap-1 justify-end">
                          {!companyHasData ? "—" : isPct ? formatPct(v) : formatAED(v)}
                          {companyHasData && <Trend curr={v} prev={prev[i]} positiveIsBetter={row.positiveIsBetter} />}
                        </span>
                      </TableCell>
                    );
                  })}
                  <TableCell className={`text-right text-base font-bold tabular-nums border-l-2 border-primary/40 bg-primary/5 ${total === 0 ? "text-muted-foreground" : total >= 0 ? "text-success" : "text-loss"}`}>
                    <span className="inline-flex items-center gap-1 justify-end">
                      {isPct ? formatPct(total) : formatAED(total)}
                      <Trend curr={total} prev={prevTotal} positiveIsBetter={row.positiveIsBetter} />
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <p className="text-xs text-muted-foreground mt-3">
          All figures shown on <span className="text-foreground font-medium">Full Company (100%) basis</span> — the businesses, not Ahmad's ownership share.
          Best value bordered in gold · Worst in red · Trend arrows compare vs prior {period === "MTD" ? "month" : period === "YTD" ? "same period last year" : "period"}.
          Cells showing "—" indicate no data for the selected period. OTC and Cars report rental/trading P&L without separate Revenue/COGS split.
          {period === "MTD" && currentMonths[0] === "Mar-26" && " · Mar-26 Net Profit cells use verified Group Finance figures."}
          {period === "ALL" && " · ITD Net Profit cells use verified Group Finance figures (RYA updated to Apr 2026)."}
        </p>
      </CardContent>
    </Card>
  );
};

export default ConsolidatedPLMatrix;
