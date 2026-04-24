import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Gem, TrendingUp, TrendingDown, DollarSign, Wallet, AlertTriangle,
  Building, Car, Activity, Wrench, Briefcase, FileDown, ChevronDown, ChevronUp,
  AlertCircle, Eye, Target, Zap, Coins, User,
} from "lucide-react";
import { generateRyaPdf } from "@/utils/generateRyaPdf";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  LabelList, Cell, Line, ComposedChart,
} from "recharts";
import {
  sales, expenses, salesDiscounts, profitLoss, monthlyProfit,
  supplierPurchaseAgg, goldInventory, ahmadPosition,
  AED_TO_USD_RATE, formatNumber,
} from "@/data/goldData";

const MONTHS = ["Oct-25", "Nov-25", "Dec-25", "Jan-26", "Feb-26", "Mar-26", "Apr-26"] as const;
type MonthKey = typeof MONTHS[number] | "ITD";

// Parse "M/D/YY" -> {y, m}
const parseMD = (s: string) => {
  const [m, , y] = s.split("/").map(Number);
  return { y: y < 50 ? 2000 + y : 1900 + y, m };
};
const monthOf = (s: string): string => {
  const { y, m } = parseMD(s);
  const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${names[m - 1]}-${String(y).slice(-2)}`;
};
// Order index for "Oct-25" etc. Higher = later.
const monthIdx = (mk: string) => {
  const [name, yy] = mk.split("-");
  const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return parseInt(yy) * 12 + names.indexOf(name);
};

const RyaDashboard = () => {
  const [execOpen, setExecOpen] = useState(true);
  const [customerFilter, setCustomerFilter] = useState<string>("all");
  const [period, setPeriod] = useState<MonthKey>("ITD");
  const [currency, setCurrency] = useState<"USD" | "AED">("USD");

  // Currency-aware formatter
  const cx = (v: number) => currency === "AED" ? v * AED_TO_USD_RATE : v;
  const sym = currency === "AED" ? "AED " : "$";
  const fmt = (v: number) => {
    const val = cx(v);
    const sign = val < 0 ? "-" : "";
    return `${sign}${sym}${Math.abs(val).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };
  const fmtK = (v: number) => `${sym}${(cx(v) / 1000).toFixed(0)}K`;
  const pct = (v: number) => `${v.toFixed(1)}%`;

  // Selected period boundary
  const selectedMonth = period === "ITD" ? "Apr-26" : period;
  const selectedIdx = MONTHS.indexOf(selectedMonth as typeof MONTHS[number]);
  const selectedMP = monthlyProfit.find((m) => m.month === selectedMonth)!;
  const previousMP = selectedIdx > 0 ? monthlyProfit.find((m) => m.month === MONTHS[selectedIdx - 1])! : null;

  // Data filters: a transaction is in-scope if its month <= selectedMonth (cumulative)
  // OR exactly == selectedMonth (single-month) depending on context.
  const isInOrBeforeSelected = (date: string) =>
    monthIdx(monthOf(date)) <= monthIdx(selectedMonth);
  const isInSelectedMonth = (date: string) =>
    monthOf(date) === selectedMonth;

  // ============ Cumulative-to-selected (P&L, ITD KPIs) ============
  const cumSales = useMemo(() => sales.filter((s) => isInOrBeforeSelected(s.date)), [period]);
  const cumExpenses = useMemo(() => expenses.filter((e) => isInOrBeforeSelected(e.date)), [period]);
  const cumDiscounts = useMemo(() => salesDiscounts.filter((d) => isInOrBeforeSelected(d.date)), [period]);

  const cumRevenue = cumSales.reduce((s, t) => s + t.amountUSD, 0);
  const cumCost = cumSales.reduce((s, t) => s + t.costUSD, 0);
  const cumGrossProfit = cumSales.reduce((s, t) => s + t.profitUSD, 0);
  const cumDiscount = cumDiscounts.reduce((s, d) => s + d.amount, 0);
  const cumNetSales = cumRevenue - cumDiscount;

  const expByCat = (list: typeof expenses) => list.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});
  const cumExpByCat = expByCat(cumExpenses);
  const cumHedge = cumExpByCat["Hedge Expenses"] || 0;
  const cumMeltingLoss = cumExpByCat["Melting Loss"] || 0;
  const cumAdmin = Object.entries(cumExpByCat)
    .filter(([k]) => !["Hedge Expenses", "Melting Loss"].includes(k))
    .reduce((s, [, v]) => s + v, 0);

  // For ITD (or Apr-26 = current period boundary) show the verified P&L totals; for earlier months use computed cumulative
  const useITD = period === "ITD" || period === "Apr-26";
  const pNetSales = useITD ? profitLoss.netSales : cumNetSales;
  const pGrossProfit = useITD ? profitLoss.grossProfit : (cumGrossProfit - cumDiscount - cumHedge - cumMeltingLoss);
  const pHedge = useITD ? profitLoss.hedgeExpenses : cumHedge;
  const pMelting = useITD ? profitLoss.meltingLoss : cumMeltingLoss;
  const pCostOfSales = useITD ? profitLoss.costOfSales : cumCost;
  const pSalesDiscount = useITD ? profitLoss.salesDiscount : cumDiscount;
  const pSales = useITD ? profitLoss.sales : cumRevenue;
  const pAdmin = useITD ? profitLoss.totalAdminExpenses : cumAdmin;
  const pOpProfit = pGrossProfit - pAdmin;
  const pNetProfit = useITD ? profitLoss.netProfit : (pOpProfit + profitLoss.fxGain - profitLoss.fxLoss);
  const grossMargin = pNetSales > 0 ? pGrossProfit / pNetSales : 0;
  const netMargin = pNetSales > 0 ? pNetProfit / pNetSales : 0;

  // ============ Single-month slices ============
  const monthSales = useMemo(() => sales.filter((s) => isInSelectedMonth(s.date)), [period]);
  const monthExpenses = useMemo(() => expenses.filter((e) => isInSelectedMonth(e.date)), [period]);
  const monthExpByCat = expByCat(monthExpenses);

  // ============ Period verdict ============
  const profitDeltaPct = previousMP && previousMP.profit !== 0 ? ((selectedMP.profit - previousMP.profit) / previousMP.profit) * 100 : 0;
  const verdict =
    !previousMP ? "BASELINE" :
    profitDeltaPct < -20 ? "DECLINING" :
    profitDeltaPct < 0 ? "WATCH" :
    profitDeltaPct > 20 ? "STRONG" : "STABLE";

  // ============ Customer profit (selected month or ITD) ============
  const customerProfitData = useMemo(() => {
    const src = period === "ITD" ? sales : monthSales;
    const grouped = src.reduce<Record<string, number>>((acc, s) => {
      acc[s.customer] = (acc[s.customer] || 0) + s.profitUSD;
      return acc;
    }, {});
    const total = Object.values(grouped).reduce((s, v) => s + v, 0);
    return Object.entries(grouped)
      .map(([name, profit]) => ({ name, profit, share: total > 0 ? (profit / total) * 100 : 0 }))
      .sort((a, b) => b.profit - a.profit);
  }, [period, monthSales]);

  const top2Share = customerProfitData.slice(0, 2).reduce((s, c) => s + c.share, 0);

  // ============ Closing inventory at end of selected month ============
  // Approximation: cumulative bought - cumulative sold (g) up to selected month.
  // Using monthlyProfit gross flows isn't perfect; use sales qty actually sold cumulatively
  // and goldInventory totals scaled proportionally for ITD; for month boundary fall back
  // to known March endpoint when ITD or Mar-26.
  const closingInventoryG = useMemo(() => {
    if (period === "ITD" || selectedMonth === "Apr-26") return goldInventory.balanceGrams;
    // estimate: opening 0 + cumulative purchased - cumulative sold across months up to & inc selected
    const cumSoldG = monthlyProfit
      .filter((m) => monthIdx(m.month) <= monthIdx(selectedMonth))
      .reduce((s, m) => s + m.qtySold, 0);
    // Approx purchased per month not stored — use total purchased * (cumSoldG / total sold)
    // This is approximate but gives a sensible monthly-scoped value.
    const ratio = cumSoldG / goldInventory.totalSoldGrams;
    const cumBoughtG = goldInventory.totalPurchasedGrams * ratio;
    return Math.max(0, cumBoughtG - cumSoldG);
  }, [period, selectedMonth]);

  // ============ Sales tx log filters ============
  const customers = useMemo(() => [...new Set(sales.map((s) => s.customer))].sort(), []);
  const filteredSales = useMemo(() => {
    let arr = period === "ITD" ? sales : monthSales;
    if (customerFilter !== "all") arr = arr.filter((s) => s.customer === customerFilter);
    return arr.slice().reverse();
  }, [period, monthSales, customerFilter]);
  const totalRevenueLog = filteredSales.reduce((s, t) => s + t.amountUSD, 0);
  const totalProfitLog = filteredSales.reduce((s, t) => s + t.profitUSD, 0);
  const totalQtyLog = filteredSales.reduce((s, t) => s + t.qtyGrams, 0);

  // Avg sell rate selected vs prior
  const prevMonth = previousMP?.month;
  const prevSales = sales.filter((s) => prevMonth && monthOf(s.date) === prevMonth);
  const avgRate = (arr: typeof sales) => {
    const q = arr.reduce((s, t) => s + t.qtyGrams, 0);
    return q > 0 ? arr.reduce((s, t) => s + t.amountUSD, 0) / q : 0;
  };
  const selectedAvgRate = avgRate(monthSales);
  const previousAvgRate = avgRate(prevSales);

  // Trend chart highlighting
  const trendColor = (m: string) => m === selectedMonth ? "hsl(43 74% 52%)" : "hsl(43 30% 35%)";

  // Expense breakdown (selected month vs ITD)
  const expenseBreakdownRaw = useMemo(() => {
    const src = period === "ITD" ? null : monthExpByCat;
    if (!src) {
      return [
        { name: "Hedge Expenses", value: profitLoss.hedgeExpenses, flag: true },
        { name: "Transport", value: profitLoss.transport },
        { name: "Other Expenses", value: profitLoss.otherExp },
        { name: "Bonus", value: profitLoss.bonus },
        { name: "Bengali Conversion", value: profitLoss.bengaliConversion },
        { name: "JLN Shop Setup", value: profitLoss.jlnShopSetup },
        { name: "Labor", value: profitLoss.labor },
        { name: "Hotel", value: profitLoss.hotel },
        { name: "Tax+Bonus", value: profitLoss.taxBonus },
      ];
    }
    return Object.entries(src)
      .map(([name, value]) => ({ name, value, flag: name === "Hedge Expenses" }))
      .sort((a, b) => b.value - a.value);
  }, [period, monthExpByCat]);
  const expenseBreakdown = expenseBreakdownRaw.filter((e) => e.value > 0);
  const totalOpex = expenseBreakdown.reduce((s, e) => s + e.value, 0);

  // Ahmad position — when filtered to a month other than ITD/Mar-26, scale net profit to cumulative
  const cumNetProfitForPosition = useITD ? ahmadPosition.netProfit : pNetProfit;
  const positionGoldUSD = useITD || selectedMonth === "Apr-26" ? ahmadPosition.goldInventoryUSD : closingInventoryG * goldInventory.costPerGram;
  const positionAR = ahmadPosition.arAlMasa;
  const positionBrokerZhou = ahmadPosition.brokerZhouReceivable;
  const positionBrokerPY = ahmadPosition.brokerPYPayable;
  const cashEquityClosing = cumNetProfitForPosition - ahmadPosition.openingBalance - ahmadPosition.withdrawals;
  const grossPosition = cashEquityClosing + positionGoldUSD + positionAR + positionBrokerZhou;
  const netPositionAfterPY = grossPosition + positionBrokerPY;

  // Supplier breakdown — hide zero
  const visibleSuppliers = supplierPurchaseAgg.filter((s) => s.grams > 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-gold-dark flex items-center justify-center">
              <Gem className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-serif font-bold text-foreground tracking-tight">RYA Gold</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Trading Dashboard · Ahmad 100% Owner</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Link to="/otc"><Button variant="outline" size="sm" className="text-xs gap-1.5"><Building className="h-3.5 w-3.5" />OTC</Button></Link>
            <Link to="/mk-autos"><Button variant="outline" size="sm" className="text-xs gap-1.5"><Car className="h-3.5 w-3.5" />MK Autos</Button></Link>
            <Link to="/mkx"><Button variant="outline" size="sm" className="text-xs gap-1.5"><Activity className="h-3.5 w-3.5" />MKX</Button></Link>
            <Link to="/garage"><Button variant="outline" size="sm" className="text-xs gap-1.5"><Wrench className="h-3.5 w-3.5" />Garage</Button></Link>
            <Link to="/portfolio"><Button variant="outline" size="sm" className="text-xs gap-1.5"><Briefcase className="h-3.5 w-3.5" />Portfolio</Button></Link>

            {/* Period selector */}
            <Select value={period} onValueChange={(v) => setPeriod(v as MonthKey)}>
              <SelectTrigger className="w-[170px] h-8 text-xs border-primary/40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ITD">Inception to Date</SelectItem>
                {MONTHS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>

            {/* Currency selector */}
            <Select value={currency} onValueChange={(v) => setCurrency(v as "USD" | "AED")}>
              <SelectTrigger className="w-[90px] h-8 text-xs border-primary/40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="AED">AED</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={generateRyaPdf}><FileDown className="h-3.5 w-3.5" />PDF</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">

        {/* Period / Currency badge */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] border-primary/40 text-primary">
            View: {period === "ITD" ? "Inception to Date" : selectedMonth} · {currency}
          </Badge>
          {currency === "AED" && (
            <span className="text-[10px] text-muted-foreground">All values × {AED_TO_USD_RATE} (USD→AED)</span>
          )}
        </div>

        {/* SECTION 1 — Verdict Banner */}
        <Card className={`border-2 ${verdict === "DECLINING" ? "border-destructive bg-destructive/5" : verdict === "STRONG" ? "border-success bg-success/5" : "border-primary bg-primary/5"}`}>
          <CardContent className="p-5 flex items-center gap-4">
            <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${verdict === "DECLINING" ? "bg-destructive/15" : "bg-primary/15"}`}>
              {verdict === "DECLINING" ? <TrendingDown className="h-6 w-6 text-destructive" /> : <TrendingUp className="h-6 w-6 text-primary" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <Badge variant={verdict === "DECLINING" ? "destructive" : "default"} className="text-sm px-3 py-1 font-bold">{verdict}</Badge>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  {previousMP ? `${selectedMonth} vs ${previousMP.month}` : selectedMonth}
                </span>
              </div>
              <h2 className="text-lg font-serif font-bold text-foreground">
                Net profit {fmt(selectedMP.profit)}
                {previousMP && <> vs {previousMP.month} {fmt(previousMP.profit)} ({pct(profitDeltaPct)})</>}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedMonth} sales of {formatNumber(selectedMP.qtySold, 0)}g across {monthSales.length} transaction{monthSales.length === 1 ? "" : "s"}
                {closingInventoryG > 1000 && ` — ${formatNumber(closingInventoryG, 0)}g inventory still on hand.`}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* SECTION 2 — 4 Intelligence Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { icon: TrendingDown, title: "Performance", value: verdict, sub: previousMP ? `vs ${previousMP.month}` : "Baseline", tone: verdict === "DECLINING" ? "destructive" : verdict === "STRONG" ? "success" : "primary" },
            { icon: AlertCircle, title: "Main Issue", value: `${monthSales.length} sale${monthSales.length === 1 ? "" : "s"} in ${selectedMonth}`, sub: `${formatNumber(selectedMP.qtySold, 0)}g sold`, tone: monthSales.length <= 1 ? "destructive" : "amber" },
            { icon: Eye, title: "Main Driver", value: customerProfitData[0]?.name || "—", sub: customerProfitData[0] ? `${customerProfitData[0].share.toFixed(1)}% of period profit` : "No sales", tone: "amber" },
            { icon: Target, title: "Action", value: closingInventoryG > 1000 ? "Convert inventory" : "Maintain pace", sub: `${formatNumber(closingInventoryG, 0)}g sitting unsold`, tone: "primary" },
          ].map((c, i) => {
            const Icon = c.icon;
            const tone = c.tone === "destructive" ? "border-destructive/40 bg-destructive/5"
              : c.tone === "amber" ? "border-amber-500/40 bg-amber-500/5"
              : c.tone === "success" ? "border-success/40 bg-success/5"
              : "border-primary/40 bg-primary/5";
            const iconCol = c.tone === "destructive" ? "text-destructive"
              : c.tone === "amber" ? "text-amber-500"
              : c.tone === "success" ? "text-success" : "text-primary";
            return (
              <Card key={i} className={`border ${tone}`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`h-4 w-4 ${iconCol}`} />
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{c.title}</p>
                  </div>
                  <p className="text-base font-bold text-foreground">{c.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{c.sub}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* SECTION 3 — Critical Alerts */}
        <Card className="border-destructive/40 bg-destructive/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-serif flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" /> Critical Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            {[
              previousMP ? { tone: "red", text: `${selectedMonth} profit ${fmt(selectedMP.profit)} — ${profitDeltaPct < 0 ? "dropped" : "grew"} ${pct(Math.abs(profitDeltaPct))} from ${previousMP.month} ${fmt(previousMP.profit)}` } : null,
              { tone: "red", text: `Gold inventory ${formatNumber(closingInventoryG, 0)}g (${fmt(positionGoldUSD)} book value) — largest asset sitting unsold` },
              { tone: "red", text: `Customer concentration: Top 2 = ${top2Share.toFixed(1)}% of period profit` },
              { tone: "amber", text: `Broker PY payable: ${fmt(266259)} — must be settled from future sales` },
              { tone: "amber", text: `Hedge expenses ${fmt(pHedge)} = ${pHedge > 0 && totalOpex > 0 ? ((pHedge / (pHedge + pAdmin)) * 100).toFixed(1) : "0"}% of all operating costs` },
              { tone: "amber", text: `Ahmad withdrawals ${fmt(20000)} — monitor cash position` },
            ].filter(Boolean).map((a: any, i) => (
              <div key={i} className={`flex items-start gap-2 p-2 rounded ${a.tone === "red" ? "bg-destructive/10" : "bg-amber-500/10"}`}>
                <span>{a.tone === "red" ? "🔴" : "⚠️"}</span>
                <span className="text-foreground">{a.text}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* SECTION 4 — Monthly Executive Summary (collapsible) */}
        {previousMP && (
          <Card className="border-border/50">
            <CardHeader className="pb-3 cursor-pointer" onClick={() => setExecOpen(!execOpen)}>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-serif flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" /> Monthly Executive Summary — {selectedMonth} vs {previousMP.month}
                </CardTitle>
                {execOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </CardHeader>
            {execOpen && (
              <CardContent className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Metric</TableHead>
                      <TableHead className="text-xs text-right">{previousMP.month}</TableHead>
                      <TableHead className="text-xs text-right">{selectedMonth}</TableHead>
                      <TableHead className="text-xs text-right">Change</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { label: "Sales", a: previousMP.sales, b: selectedMP.sales, fmtFn: fmt, higherIsGood: true },
                      { label: "Net Profit", a: previousMP.profit, b: selectedMP.profit, fmtFn: fmt, higherIsGood: true },
                      { label: "Gold Sold (g)", a: previousMP.qtySold, b: selectedMP.qtySold, fmtFn: (v: number) => `${formatNumber(v, 0)}g`, higherIsGood: true },
                      { label: "Avg Sell Rate USD/g", a: previousAvgRate, b: selectedAvgRate, fmtFn: (v: number) => `$${v.toFixed(2)}/g`, higherIsGood: true },
                    ].map((r) => {
                      const delta = r.a !== 0 ? ((r.b - r.a) / r.a) * 100 : 0;
                      const arrow = r.b > r.a ? "▲" : "▼";
                      const good = r.higherIsGood ? r.b >= r.a : r.b <= r.a;
                      return (
                        <TableRow key={r.label}>
                          <TableCell className="text-xs font-medium">{r.label}</TableCell>
                          <TableCell className="text-xs text-right font-mono">{r.fmtFn(r.a)}</TableCell>
                          <TableCell className="text-xs text-right font-mono">{r.fmtFn(r.b)}</TableCell>
                          <TableCell className={`text-xs text-right font-mono ${good ? "text-success" : "text-destructive"}`}>
                            {arrow} {Math.abs(delta).toFixed(1)}% {good ? "🟢" : "🔴"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 rounded border border-success/30 bg-success/5">
                    <p className="text-xs font-bold text-success mb-1">✅ Improved</p>
                    <p className="text-[11px] text-foreground">Sell rate {selectedAvgRate > previousAvgRate ? "rising" : "stable"} · supplier diversification</p>
                  </div>
                  <div className="p-3 rounded border border-destructive/30 bg-destructive/5">
                    <p className="text-xs font-bold text-destructive mb-1">🔴 Deteriorated</p>
                    <p className="text-[11px] text-foreground">{profitDeltaPct < 0 ? `Profit ${profitDeltaPct.toFixed(1)}%` : "Volume risk"} · concentration {top2Share.toFixed(0)}%</p>
                  </div>
                  <div className="p-3 rounded border border-amber-500/30 bg-amber-500/5">
                    <p className="text-xs font-bold text-amber-500 mb-1">⚠️ Watch</p>
                    <p className="text-[11px] text-foreground">{formatNumber(closingInventoryG, 0)}g inventory · Broker PY {fmt(266259)} payable</p>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        )}

        {/* SECTION 5 — KPI Cards */}
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
            Trading Performance · {period === "ITD" ? "Inception to Date" : selectedMonth}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {period === "ITD" ? (
              <>
                <KpiCard label="Total Net Sales" value={fmt(profitLoss.netSales)} icon={DollarSign} />
                <KpiCard label="Gross Profit" value={fmt(profitLoss.grossProfit)} sub={`${pct(profitLoss.grossMargin * 100)} margin`} icon={TrendingUp} />
                <KpiCard label="Net Profit" value={fmt(profitLoss.netProfit)} sub={`${pct(profitLoss.netMargin * 100)} margin`} icon={Coins} tone="success" />
                <KpiCard label="Gold Bought" value={`${formatNumber(goldInventory.totalPurchasedGrams, 0)}g`} icon={Gem} />
                <KpiCard label="Gold Sold" value={`${formatNumber(goldInventory.totalSoldGrams, 0)}g`} icon={Zap} />
              </>
            ) : (
              <>
                <KpiCard label={`${selectedMonth} Sales`} value={fmt(selectedMP.sales)} icon={DollarSign} />
                <KpiCard label="Gross/Net Profit" value={fmt(selectedMP.profit)} icon={TrendingUp} tone={selectedMP.profit > 0 ? "success" : "destructive"} />
                <KpiCard label="Gold Sold" value={`${formatNumber(selectedMP.qtySold, 0)}g`} icon={Zap} />
                <KpiCard label="Avg Sell Rate" value={selectedAvgRate > 0 ? `$${selectedAvgRate.toFixed(2)}/g` : "—"} icon={Coins} />
                <KpiCard label="# Transactions" value={String(monthSales.length)} icon={Activity} />
              </>
            )}
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
            Position {period === "ITD" ? "(Latest)" : `as at ${selectedMonth} end`}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <KpiCard label="Gold Inventory" value={`${formatNumber(closingInventoryG, 0)}g`} sub={`Book ${fmt(positionGoldUSD)}`} icon={Gem} tone="amber" />
            <KpiCard label="Cash Equity" value={fmt(cashEquityClosing)} icon={Wallet} />
            <KpiCard label="Broker PY Payable" value={`-${fmt(266259)}`} icon={AlertCircle} tone="destructive" />
            <KpiCard label="Hedge Expenses" value={fmt(pHedge)} icon={AlertTriangle} />
            <KpiCard label="Ahmad Withdrawals" value={fmt(20000)} icon={User} />
          </div>
        </div>

        {/* SECTION 6 — Monthly Profit Trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-serif">Monthly Profit Trend</CardTitle>
            <p className="text-[11px] text-muted-foreground">Selected month highlighted in gold · Jan-26 peak driven by UNIP HK 5,744g + Moti 4,000g</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={monthlyProfit.map((m) => ({ ...m, profit: cx(m.profit) }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickFormatter={(v) => `${sym}${(v / 1000).toFixed(0)}K`} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", fontSize: 12 }} formatter={(v: number) => `${sym}${v.toLocaleString()}`} />
                <Bar dataKey="profit" radius={[6, 6, 0, 0]}>
                  {monthlyProfit.map((m, i) => <Cell key={i} fill={trendColor(m.month)} />)}
                  <LabelList dataKey="profit" position="top" formatter={(v: number) => `${sym}${(v / 1000).toFixed(0)}K`} fill="hsl(var(--foreground))" fontSize={10} />
                </Bar>
                <Line type="monotone" dataKey="profit" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* SECTION 7 — Customer Profit Analysis */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-serif">
              Profit by Customer — {period === "ITD" ? "Inception to Date" : selectedMonth}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {customerProfitData.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-8 text-center">No sales in {selectedMonth}</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={customerProfitData.map((c) => ({ ...c, profit: cx(c.profit) }))} layout="vertical" margin={{ left: 60, right: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickFormatter={(v) => `${sym}${(v / 1000).toFixed(0)}K`} />
                  <YAxis dataKey="name" type="category" tick={{ fill: "hsl(var(--foreground))", fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", fontSize: 12 }} formatter={(v: number) => `${sym}${v.toLocaleString()}`} />
                  <Bar dataKey="profit" fill="hsl(43 74% 52%)" radius={[0, 4, 4, 0]}>
                    <LabelList dataKey="share" position="right" formatter={(v: number) => `${v.toFixed(1)}%`} fill="hsl(var(--foreground))" fontSize={11} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
            {top2Share > 70 && customerProfitData.length >= 2 && (
              <div className="mt-3 p-4 bg-destructive/15 border-2 border-destructive/50 rounded-lg flex items-start gap-3">
                <span className="text-xl">🔴</span>
                <div>
                  <p className="text-sm font-bold text-destructive">Critical Concentration Risk</p>
                  <p className="text-sm text-foreground mt-1">
                    Top 2 customers ({customerProfitData[0]?.name} + {customerProfitData[1]?.name}) generate <strong>{top2Share.toFixed(1)}%</strong> of all profit.
                    Diversify customer base immediately.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* SECTION 8 — Gold Inventory Position */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-serif">
              Gold Inventory Status {period !== "ITD" && `· at ${selectedMonth} end`}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Stat label="Closing Inventory" value={`${formatNumber(closingInventoryG, 2)}g`} />
              <Stat label="Book Value" value={fmt(positionGoldUSD)} />
              <Stat label="Avg Cost" value={`$${goldInventory.costPerGram.toFixed(2)}/g`} />
              <Stat label="Melting Loss (ITD)" value={`${formatNumber(goldInventory.totalMeltingLossGrams, 2)}g`} tone="destructive" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Gold Flow Summary (ITD)</p>
                <Table>
                  <TableBody>
                    <TableRow><TableCell className="text-xs">Total Purchased</TableCell><TableCell className="text-xs text-right font-mono">{formatNumber(goldInventory.totalPurchasedGrams, 2)}g</TableCell></TableRow>
                    <TableRow><TableCell className="text-xs">Total Sold</TableCell><TableCell className="text-xs text-right font-mono">{formatNumber(goldInventory.totalSoldGrams, 2)}g</TableCell></TableRow>
                    <TableRow><TableCell className="text-xs">Melting Losses</TableCell><TableCell className="text-xs text-right font-mono text-destructive">{formatNumber(goldInventory.totalMeltingLossGrams, 2)}g</TableCell></TableRow>
                    <TableRow className="bg-primary/5"><TableCell className="text-xs font-bold">Closing Balance ✅</TableCell><TableCell className="text-xs text-right font-mono font-bold text-primary">{formatNumber(goldInventory.balanceGrams, 2)}g</TableCell></TableRow>
                  </TableBody>
                </Table>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Supplier Breakdown</p>
                <Table>
                  <TableBody>
                    {visibleSuppliers.map((s) => (
                      <TableRow key={s.name}>
                        <TableCell className="text-xs font-medium">{s.name}</TableCell>
                        <TableCell className="text-xs text-right font-mono">~{formatNumber(s.grams, 0)}g</TableCell>
                        <TableCell className="text-[10px] text-muted-foreground">{s.note}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <p className="text-[11px] text-muted-foreground mt-2 italic">Supplier shifted from ELIZEU/LOUCS to HDRSP in recent months.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SECTION 9 — P&L Statement */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-serif">
              Profit & Loss — {period === "ITD" ? "Inception to Date" : `Inception to ${selectedMonth}`} ({currency})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                <PLRow label="Sales" amount={pSales} fmt={fmt} />
                <PLRow label="Less: Sales Discount" amount={-pSalesDiscount} fmt={fmt} />
                <PLRow label="Net Sales" amount={pNetSales} bold fmt={fmt} />
                <PLRow label="Cost of Sales" amount={-pCostOfSales} fmt={fmt} />
                <PLRow label="Melting Loss" amount={-pMelting} fmt={fmt} />
                <PLRow label="Hedge Expenses" amount={-pHedge} fmt={fmt} />
                <PLRow label={`GROSS PROFIT (${pct(grossMargin * 100)})`} amount={pGrossProfit} bold highlight fmt={fmt} />
                <PLRow label="Total G&A" amount={-pAdmin} bold fmt={fmt} />
                <PLRow label="OPERATING PROFIT" amount={pOpProfit} bold highlight fmt={fmt} />
                {useITD && <PLRow label="FX Gain" amount={profitLoss.fxGain} fmt={fmt} />}
                {useITD && <PLRow label="FX Loss" amount={-profitLoss.fxLoss} fmt={fmt} />}
                <PLRow label={`NET PROFIT (${pct(netMargin * 100)})`} amount={pNetProfit} bold highlight fmt={fmt} />
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* SECTION 10 — Expense Breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-serif">
              Operating Expense Breakdown — {period === "ITD" ? "Inception to Date" : selectedMonth} ({currency})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {expenseBreakdown.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-8 text-center">No expenses recorded in {selectedMonth}</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={expenseBreakdown.map((e) => ({ ...e, value: cx(e.value) }))} layout="vertical" margin={{ left: 100, right: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickFormatter={(v) => `${sym}${(v / 1000).toFixed(0)}K`} />
                  <YAxis dataKey="name" type="category" tick={{ fill: "hsl(var(--foreground))", fontSize: 10 }} width={100} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", fontSize: 12 }} formatter={(v: number) => `${sym}${v.toLocaleString()}`} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {expenseBreakdown.map((e, i) => (
                      <Cell key={i} fill={e.flag ? "hsl(var(--destructive))" : "hsl(43 74% 52%)"} />
                    ))}
                    <LabelList dataKey="value" position="right" formatter={(v: number) => `${((v / cx(totalOpex)) * 100).toFixed(1)}%`} fill="hsl(var(--foreground))" fontSize={10} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* SECTION 11 — Ahmad Investment Position */}
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-serif flex items-center gap-2">
              <User className="h-4 w-4 text-primary" /> Ahmad Investment Position — RYA Gold (100% Owner)
              {period !== "ITD" && <span className="text-xs text-muted-foreground font-sans font-normal">· at {selectedMonth} end</span>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2">Part A — Cash Equity</p>
                <Table>
                  <TableBody>
                    <TableRow><TableCell className="text-xs">Opening Balance</TableCell><TableCell className="text-xs text-right font-mono text-success">+{fmt(ahmadPosition.openingBalance)}</TableCell></TableRow>
                    <TableRow><TableCell className="text-xs">Net Profit ({period === "ITD" ? "ITD" : `to ${selectedMonth}`})</TableCell><TableCell className="text-xs text-right font-mono text-success">+{fmt(cumNetProfitForPosition)}</TableCell></TableRow>
                    <TableRow><TableCell className="text-xs">Less Ahmad Withdrawals</TableCell><TableCell className="text-xs text-right font-mono text-destructive">-{fmt(ahmadPosition.withdrawals)}</TableCell></TableRow>
                    <TableRow className="bg-primary/10"><TableCell className="text-xs font-bold">Cash Flow Closing</TableCell><TableCell className="text-xs text-right font-mono font-bold text-primary">{fmt(cashEquityClosing)}</TableCell></TableRow>
                  </TableBody>
                </Table>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2">Part B — Net Profit Deployment</p>
                <Table>
                  <TableBody>
                    <TableRow><TableCell className="text-xs">Opening reinvested</TableCell><TableCell className="text-xs text-right font-mono">{fmt(ahmadPosition.openingBalance)}</TableCell></TableRow>
                    <TableRow><TableCell className="text-xs">Shareholder Withdrawals</TableCell><TableCell className="text-xs text-right font-mono">{fmt(ahmadPosition.withdrawals)}</TableCell></TableRow>
                    <TableRow><TableCell className="text-xs">Gold Inventory</TableCell><TableCell className="text-xs text-right font-mono">{fmt(positionGoldUSD)}</TableCell></TableRow>
                    <TableRow><TableCell className="text-xs">AR — AL MASA</TableCell><TableCell className="text-xs text-right font-mono">{fmt(positionAR)}</TableCell></TableRow>
                    <TableRow><TableCell className="text-xs">Broker Zhou receivable</TableCell><TableCell className="text-xs text-right font-mono">{fmt(positionBrokerZhou)}</TableCell></TableRow>
                    <TableRow><TableCell className="text-xs">Less Broker PY payable</TableCell><TableCell className="text-xs text-right font-mono text-destructive">{fmt(positionBrokerPY)}</TableCell></TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-border/30">
              <Stat label="Cash Equity" value={fmt(cashEquityClosing)} />
              <Stat label="Gold Inventory" value={fmt(positionGoldUSD)} />
              <Stat label="Net Receivables (Zhou + AL MASA)" value={fmt(positionAR + positionBrokerZhou)} />
              <Stat label="Total Gross Position" value={fmt(grossPosition)} tone="primary" />
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded text-xs text-foreground">
              <p><strong>Total Gross Position before settling Broker PY payable:</strong> {fmt(grossPosition)}</p>
              <p className="mt-1">
                <strong className="text-primary">Net Position after Broker PY:</strong>{" "}
                {fmt(grossPosition)} − {fmt(266259)} = <strong className="text-primary">{fmt(netPositionAfterPY)}</strong>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* SECTION 12 — Sales Transaction Log */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-sm font-serif">
                Sales Transaction Log — {period === "ITD" ? "All Time" : selectedMonth}
              </CardTitle>
              <Select value={customerFilter} onValueChange={setCustomerFilter}>
                <SelectTrigger className="w-[180px] h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Customers</SelectItem>
                  {customers.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Date</TableHead>
                    <TableHead className="text-xs">Customer</TableHead>
                    <TableHead className="text-xs text-right">Qty (g)</TableHead>
                    <TableHead className="text-xs text-right">Rate {sym}/g</TableHead>
                    <TableHead className="text-xs text-right">Revenue</TableHead>
                    <TableHead className="text-xs text-right">Cost</TableHead>
                    <TableHead className="text-xs text-right">Profit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-xs text-muted-foreground italic text-center py-6">No transactions in {selectedMonth}</TableCell></TableRow>
                  ) : filteredSales.map((s) => (
                    <TableRow key={s.transId}>
                      <TableCell className="text-xs">{s.date}</TableCell>
                      <TableCell className="text-xs font-medium">{s.customer}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{formatNumber(s.qtyGrams, 2)}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{sym}{cx(s.rateUSD).toFixed(2)}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{fmt(s.amountUSD)}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{fmt(s.costUSD)}</TableCell>
                      <TableCell className="text-xs text-right font-mono text-success font-semibold">{fmt(s.profitUSD)}</TableCell>
                    </TableRow>
                  ))}
                  {filteredSales.length > 0 && (
                    <TableRow className="bg-primary/10 border-t-2 border-primary/30">
                      <TableCell colSpan={2} className="text-xs font-bold">TOTAL ({filteredSales.length} transactions)</TableCell>
                      <TableCell className="text-xs text-right font-mono font-bold">{formatNumber(totalQtyLog, 2)}</TableCell>
                      <TableCell />
                      <TableCell className="text-xs text-right font-mono font-bold">{fmt(totalRevenueLog)}</TableCell>
                      <TableCell />
                      <TableCell className="text-xs text-right font-mono font-bold text-success">{fmt(totalProfitLog)}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

// === Sub-components ===
const KpiCard = ({ label, value, sub, icon: Icon, tone }: { label: string; value: string; sub?: string; icon: any; tone?: string }) => {
  const ring = tone === "destructive" ? "border-destructive/40" : tone === "amber" ? "border-amber-500/40" : tone === "success" ? "border-success/40" : "border-border/50";
  const valCol = tone === "destructive" ? "text-destructive" : tone === "amber" ? "text-amber-500" : tone === "success" ? "text-success" : "text-foreground";
  return (
    <Card className={`border ${ring}`}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</p>
          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <p className={`text-base font-bold font-serif ${valCol}`}>{value}</p>
        {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
      </CardContent>
    </Card>
  );
};

const Stat = ({ label, value, tone }: { label: string; value: string; tone?: string }) => {
  const col = tone === "primary" ? "text-primary" : tone === "destructive" ? "text-destructive" : "text-foreground";
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</p>
      <p className={`text-base font-bold font-serif ${col}`}>{value}</p>
    </div>
  );
};

const PLRow = ({ label, amount, bold, highlight, fmt }: { label: string; amount: number; bold?: boolean; highlight?: boolean; fmt: (v: number) => string }) => {
  const negative = amount < 0;
  return (
    <TableRow className={highlight ? "bg-primary/10" : ""}>
      <TableCell className={`text-xs ${bold ? "font-bold" : ""}`}>{label}</TableCell>
      <TableCell className={`text-xs text-right font-mono ${bold ? "font-bold" : ""} ${negative ? "text-destructive" : highlight ? "text-primary" : "text-foreground"}`}>
        {negative ? `(${fmt(Math.abs(amount))})` : fmt(amount)}
      </TableCell>
    </TableRow>
  );
};

export default RyaDashboard;
