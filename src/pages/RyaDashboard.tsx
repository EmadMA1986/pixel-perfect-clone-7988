import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Gem, TrendingUp, TrendingDown, DollarSign, Wallet, AlertTriangle,
  Building, Car, Activity, Wrench, Briefcase, FileDown, ChevronDown, ChevronUp,
  AlertCircle, CheckCircle2, Eye, Target, Zap, Coins, User,
} from "lucide-react";
import { generateRyaPdf } from "@/utils/generateRyaPdf";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  LabelList, ReferenceLine, Cell, LineChart, Line, ComposedChart,
} from "recharts";
import {
  sales, profitLoss, monthlyProfit, customerProfitAgg,
  supplierPurchaseAgg, goldInventory, ahmadPosition,
  AED_TO_USD_RATE, formatCurrency, formatNumber,
} from "@/data/goldData";

const fmt = (v: number) => formatCurrency(v, "USD");
const pct = (v: number) => `${v.toFixed(1)}%`;

const RyaDashboard = () => {
  const [execOpen, setExecOpen] = useState(true);
  const [customerFilter, setCustomerFilter] = useState<string>("all");

  // Selected month = latest with real activity (Mar-26)
  const selectedIdx = monthlyProfit.findIndex((m) => m.month === "Mar-26");
  const selected = monthlyProfit[selectedIdx];
  const previous = monthlyProfit[selectedIdx - 1];

  const profitDeltaPct = ((selected.profit - previous.profit) / previous.profit) * 100;
  const salesDeltaPct = ((selected.sales - previous.sales) / previous.sales) * 100;
  const qtyDeltaPct = ((selected.qtySold - previous.qtySold) / previous.qtySold) * 100;

  const verdict =
    profitDeltaPct < -20 ? "DECLINING" :
    profitDeltaPct < 0 ? "WATCH" :
    profitDeltaPct > 20 ? "STRONG" : "STABLE";

  const verdictColor = verdict === "DECLINING" ? "destructive" :
    verdict === "WATCH" ? "amber" : "success";

  // Customer profit pct for analysis
  const totalCustProfit = customerProfitAgg.reduce((s, c) => s + c.profit, 0);

  // Filter sales by customer for tx log
  const customers = useMemo(() => [...new Set(sales.map((s) => s.customer))].sort(), []);
  const filteredSales = useMemo(
    () => (customerFilter === "all" ? sales : sales.filter((s) => s.customer === customerFilter)).slice().reverse(),
    [customerFilter]
  );
  const totalRevenueLog = filteredSales.reduce((s, t) => s + t.amountUSD, 0);
  const totalProfitLog = filteredSales.reduce((s, t) => s + t.profitUSD, 0);
  const totalQtyLog = filteredSales.reduce((s, t) => s + t.qtyGrams, 0);

  // Avg sell rate Feb vs Mar
  const febSales = sales.filter((s) => s.date.endsWith("/26") && s.date.startsWith("2/"));
  const marSales = sales.filter((s) => s.date.startsWith("3/"));
  const avgRate = (arr: typeof sales) =>
    arr.reduce((s, t) => s + t.amountUSD, 0) / arr.reduce((s, t) => s + t.qtyGrams, 0);
  const febAvgRate = avgRate(febSales);
  const marAvgRate = avgRate(marSales);

  // Bar coloring for trend
  const trendColor = (m: string) =>
    m === selected.month ? "hsl(43 74% 52%)" : "hsl(43 30% 35%)";

  // Expense breakdown (from profitLoss admin + hedge)
  const expenseBreakdown = [
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
  const totalOpex = expenseBreakdown.reduce((s, e) => s + e.value, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-gold-dark flex items-center justify-center">
              <Gem className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-serif font-bold text-foreground tracking-tight">RYA Gold</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Trading Dashboard · Ahmad 100% Owner</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/otc"><Button variant="outline" size="sm" className="text-xs gap-1.5"><Building className="h-3.5 w-3.5" />OTC</Button></Link>
            <Link to="/mk-autos"><Button variant="outline" size="sm" className="text-xs gap-1.5"><Car className="h-3.5 w-3.5" />MK Autos</Button></Link>
            <Link to="/mkx"><Button variant="outline" size="sm" className="text-xs gap-1.5"><Activity className="h-3.5 w-3.5" />MKX</Button></Link>
            <Link to="/garage"><Button variant="outline" size="sm" className="text-xs gap-1.5"><Wrench className="h-3.5 w-3.5" />Garage</Button></Link>
            <Link to="/portfolio"><Button variant="outline" size="sm" className="text-xs gap-1.5"><Briefcase className="h-3.5 w-3.5" />Portfolio</Button></Link>
            <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={generateRyaPdf}><FileDown className="h-3.5 w-3.5" />PDF</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">

        {/* SECTION 1 — Verdict Banner */}
        <Card className={`border-2 ${verdict === "DECLINING" ? "border-destructive bg-destructive/5" : "border-primary bg-primary/5"}`}>
          <CardContent className="p-5 flex items-center gap-4">
            <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${verdict === "DECLINING" ? "bg-destructive/15" : "bg-primary/15"}`}>
              {verdict === "DECLINING" ? <TrendingDown className="h-6 w-6 text-destructive" /> : <TrendingUp className="h-6 w-6 text-primary" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <Badge variant={verdict === "DECLINING" ? "destructive" : "default"} className="text-sm px-3 py-1 font-bold">{verdict}</Badge>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">March 2026 vs February 2026</span>
              </div>
              <h2 className="text-lg font-serif font-bold text-foreground">
                Net profit {fmt(selected.profit)} vs Feb {fmt(previous.profit)} ({pct(profitDeltaPct)})
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Near-zero sales in March — only {formatNumber(selected.qtySold, 0)}g sold. UNIP HK absent. Activate large customer sales urgently — {formatNumber(goldInventory.balanceGrams, 0)}g worth {fmt(goldInventory.costOfRemainingUSD)} sitting unsold.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* SECTION 2 — 4 Intelligence Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { icon: TrendingDown, title: "Performance", value: "DECLINING", sub: "vs Feb-26", tone: "destructive" },
            { icon: AlertCircle, title: "Main Issue", value: "Only 1 sale in March", sub: "412g to Moti", tone: "destructive" },
            { icon: Eye, title: "Main Driver", value: "UNIP HK absent", sub: "36.7% of all profit · zero activity", tone: "amber" },
            { icon: Target, title: "Action", value: "Activate UNIP HK", sub: "Convert 5,907g inventory urgently", tone: "primary" },
          ].map((c, i) => {
            const Icon = c.icon;
            const tone = c.tone === "destructive" ? "border-destructive/40 bg-destructive/5"
              : c.tone === "amber" ? "border-amber-500/40 bg-amber-500/5"
              : "border-primary/40 bg-primary/5";
            const iconCol = c.tone === "destructive" ? "text-destructive"
              : c.tone === "amber" ? "text-amber-500" : "text-primary";
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
              { tone: "red", text: `March profit ${fmt(selected.profit)} — dropped ${pct(Math.abs(profitDeltaPct))} from February ${fmt(previous.profit)}` },
              { tone: "red", text: `Gold inventory ${formatNumber(goldInventory.balanceGrams, 0)}g (${fmt(goldInventory.costOfRemainingUSD)} book value) — largest asset sitting unsold` },
              { tone: "red", text: `Customer concentration: Top 2 (Moti + UNIP HK) = 93.7% of all profit` },
              { tone: "amber", text: `Broker PY payable: ${fmt(266259)} — must be settled from future sales` },
              { tone: "amber", text: `Hedge expenses ${fmt(profitLoss.hedgeExpenses)} = 64.5% of all operating costs` },
              { tone: "amber", text: `Ahmad withdrawals ${fmt(20000)} — monitor cash position` },
            ].map((a, i) => (
              <div key={i} className={`flex items-start gap-2 p-2 rounded ${a.tone === "red" ? "bg-destructive/10" : "bg-amber-500/10"}`}>
                <span>{a.tone === "red" ? "🔴" : "⚠️"}</span>
                <span className="text-foreground">{a.text}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* SECTION 4 — Monthly Executive Summary (collapsible) */}
        <Card className="border-border/50">
          <CardHeader className="pb-3 cursor-pointer" onClick={() => setExecOpen(!execOpen)}>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-serif flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" /> Monthly Executive Summary — {selected.month} vs {previous.month}
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
                    <TableHead className="text-xs text-right">Feb-26</TableHead>
                    <TableHead className="text-xs text-right">Mar-26</TableHead>
                    <TableHead className="text-xs text-right">Change</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { label: "Sales", a: previous.sales, b: selected.sales, fmtFn: fmt, bad: true },
                    { label: "Gross / Net Profit", a: previous.profit, b: selected.profit, fmtFn: fmt, bad: true },
                    { label: "Gold Sold (g)", a: previous.qtySold, b: selected.qtySold, fmtFn: (v: number) => `${formatNumber(v, 0)}g`, bad: true },
                    { label: "Gold Inventory (g)", a: 548, b: goldInventory.balanceGrams, fmtFn: (v: number) => `${formatNumber(v, 0)}g`, bad: true, building: true },
                    { label: "Avg Sell Rate USD/g", a: febAvgRate, b: marAvgRate, fmtFn: (v: number) => `$${v.toFixed(2)}/g`, bad: false },
                  ].map((r) => {
                    const delta = ((r.b - r.a) / r.a) * 100;
                    const arrow = r.b > r.a ? "▲" : "▼";
                    const isGood = r.bad ? r.b > r.a && r.building === undefined ? false : !r.bad ? true : r.b > r.a : r.b > r.a;
                    const goodColor = !r.bad && r.b > r.a;
                    return (
                      <TableRow key={r.label}>
                        <TableCell className="text-xs font-medium">{r.label}</TableCell>
                        <TableCell className="text-xs text-right font-mono">{r.fmtFn(r.a)}</TableCell>
                        <TableCell className="text-xs text-right font-mono">{r.fmtFn(r.b)}</TableCell>
                        <TableCell className={`text-xs text-right font-mono ${goodColor ? "text-success" : "text-destructive"}`}>
                          {arrow} {Math.abs(delta).toFixed(1)}% {goodColor ? "🟢" : "🔴"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              <div className="p-3 bg-muted/30 rounded text-xs text-foreground leading-relaxed">
                <strong>March 2026 narrative:</strong> March 2026 recorded only one sale — 412g to Moti at $163.8/g generating $10,418 profit.
                February had 3 large sales totalling 10,394g and $294,195 profit. Meanwhile 7,350g was purchased in March building inventory to
                5,907g worth $798,688 at book value. Urgent action needed to activate large customer sales.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 rounded border border-success/30 bg-success/5">
                  <p className="text-xs font-bold text-success mb-1">✅ Improved</p>
                  <p className="text-[11px] text-foreground">Gold sell rate $164/g · New supplier HDRSP onboarded</p>
                </div>
                <div className="p-3 rounded border border-destructive/30 bg-destructive/5">
                  <p className="text-xs font-bold text-destructive mb-1">🔴 Deteriorated</p>
                  <p className="text-[11px] text-foreground">Sales -96% · Profit -96.5% · Inventory building · No UNIP HK sale</p>
                </div>
                <div className="p-3 rounded border border-amber-500/30 bg-amber-500/5">
                  <p className="text-xs font-bold text-amber-500 mb-1">⚠️ Watch</p>
                  <p className="text-[11px] text-foreground">5,907g = $798,688 book value · Broker PY $266K payable · Concentration 93.7%</p>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* SECTION 5 — KPI Cards */}
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">Trading Performance · Inception to Date</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <KpiCard label="Total Net Sales" value={fmt(profitLoss.netSales)} icon={DollarSign} />
            <KpiCard label="Gross Profit" value={fmt(profitLoss.grossProfit)} sub={`${pct(profitLoss.grossMargin * 100)} margin`} icon={TrendingUp} />
            <KpiCard label="Net Profit" value={fmt(profitLoss.netProfit)} sub={`${pct(profitLoss.netMargin * 100)} margin`} icon={Coins} tone="success" />
            <KpiCard label="Gold Bought" value={`${formatNumber(goldInventory.totalPurchasedGrams, 0)}g`} icon={Gem} />
            <KpiCard label="Gold Sold" value={`${formatNumber(goldInventory.totalSoldGrams, 0)}g`} icon={Zap} />
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">Current Position</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <KpiCard label="Gold Inventory" value={`${formatNumber(goldInventory.balanceGrams, 0)}g`} sub={`Book ${fmt(goldInventory.costOfRemainingUSD)}`} icon={Gem} tone="amber" />
            <KpiCard label="Cash Equity" value={fmt(ahmadPosition.cashEquityClosing)} icon={Wallet} />
            <KpiCard label="Broker PY Payable" value={`-${fmt(266259)}`} icon={AlertCircle} tone="destructive" />
            <KpiCard label="Hedge Expenses" value={fmt(profitLoss.hedgeExpenses)} sub="3.33% of sales" icon={AlertTriangle} />
            <KpiCard label="Ahmad Withdrawals" value={fmt(20000)} icon={User} />
          </div>
        </div>

        {/* SECTION 6 — Monthly Profit Trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-serif">Monthly Profit Trend</CardTitle>
            <p className="text-[11px] text-muted-foreground">Jan-26 peak driven by large UNIP HK sale 5,744g + Moti 4,000g</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={monthlyProfit}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", fontSize: 12 }} formatter={(v: number) => fmt(v)} />
                <Bar dataKey="profit" radius={[6, 6, 0, 0]}>
                  {monthlyProfit.map((m, i) => (
                    <Cell key={i} fill={trendColor(m.month)} />
                  ))}
                  <LabelList dataKey="profit" position="top" formatter={(v: number) => `$${(v / 1000).toFixed(0)}K`} fill="hsl(var(--foreground))" fontSize={10} />
                </Bar>
                <Line type="monotone" dataKey="profit" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* SECTION 7 — Customer Profit Analysis */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-serif">Profit by Customer — Inception to Date</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={customerProfitAgg} layout="vertical" margin={{ left: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                <YAxis dataKey="name" type="category" tick={{ fill: "hsl(var(--foreground))", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", fontSize: 12 }} formatter={(v: number) => fmt(v)} />
                <Bar dataKey="profit" fill="hsl(43 74% 52%)" radius={[0, 4, 4, 0]}>
                  <LabelList dataKey="share" position="right" formatter={(v: number) => `${v.toFixed(1)}%`} fill="hsl(var(--foreground))" fontSize={10} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-3 p-3 bg-destructive/10 border border-destructive/30 rounded text-xs text-foreground">
              🔴 <strong>Moti + UNIP HK = 93.7% of all profit</strong> — critical concentration risk. Diversify customer base.
            </div>
          </CardContent>
        </Card>

        {/* SECTION 8 — Gold Inventory Position */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-serif">Gold Inventory Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Stat label="Current Inventory" value={`${formatNumber(goldInventory.balanceGrams, 2)}g`} />
              <Stat label="Book Value" value={fmt(goldInventory.costOfRemainingUSD)} />
              <Stat label="Book Value (AED)" value={`AED ${formatNumber(goldInventory.bookValueAED, 0)}`} />
              <Stat label="Average Cost" value={`$${goldInventory.costPerGram.toFixed(2)}/g`} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Gold Flow Summary</p>
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
                    {supplierPurchaseAgg.map((s) => (
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
            <CardTitle className="text-sm font-serif">Profit & Loss — Inception to Date (USD)</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                <PLRow label="Sales" amount={profitLoss.sales} />
                <PLRow label="Less: Sales Discount" amount={-profitLoss.salesDiscount} />
                <PLRow label="Net Sales" amount={profitLoss.netSales} bold />
                <PLRow label="Cost of Sales" amount={-profitLoss.costOfSales} />
                <PLRow label="Melting Loss" amount={-profitLoss.meltingLoss} />
                <PLRow label="Hedge Expenses" amount={-profitLoss.hedgeExpenses} />
                <PLRow label={`GROSS PROFIT (${pct(profitLoss.grossMargin * 100)})`} amount={profitLoss.grossProfit} bold highlight />
                <PLRow label="Transport" amount={-profitLoss.transport} />
                <PLRow label="Labor" amount={-profitLoss.labor} />
                <PLRow label="Hotel" amount={-profitLoss.hotel} />
                <PLRow label="Bonus" amount={-profitLoss.bonus} />
                <PLRow label="Tax+Bonus" amount={-profitLoss.taxBonus} />
                <PLRow label="Bengali Conversion" amount={-profitLoss.bengaliConversion} />
                <PLRow label="JLN Shop Setup" amount={-profitLoss.jlnShopSetup} />
                <PLRow label="Other Expenses" amount={-profitLoss.otherExp} />
                <PLRow label="Total G&A" amount={-profitLoss.totalAdminExpenses} bold />
                <PLRow label="OPERATING PROFIT" amount={profitLoss.operatingProfit} bold highlight />
                <PLRow label="FX Gain" amount={profitLoss.fxGain} />
                <PLRow label="FX Loss" amount={-profitLoss.fxLoss} />
                <PLRow label={`NET PROFIT (${pct(profitLoss.netMargin * 100)})`} amount={profitLoss.netProfit} bold highlight />
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* SECTION 10 — Expense Breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-serif">Operating Expense Breakdown (USD)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={expenseBreakdown} layout="vertical" margin={{ left: 100 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                <YAxis dataKey="name" type="category" tick={{ fill: "hsl(var(--foreground))", fontSize: 10 }} width={100} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", fontSize: 12 }} formatter={(v: number) => fmt(v)} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {expenseBreakdown.map((e, i) => (
                    <Cell key={i} fill={e.flag ? "hsl(var(--destructive))" : "hsl(43 74% 52%)"} />
                  ))}
                  <LabelList dataKey="value" position="right" formatter={(v: number) => `${((v / totalOpex) * 100).toFixed(1)}%`} fill="hsl(var(--foreground))" fontSize={10} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="text-[11px] text-muted-foreground mt-2 italic">
              Hedge expenses represent <strong className="text-destructive">64.5% of all operating costs</strong> and 3.33% of net sales — the primary cost control lever.
            </p>
          </CardContent>
        </Card>

        {/* SECTION 11 — Ahmad Investment Position */}
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-serif flex items-center gap-2">
              <User className="h-4 w-4 text-primary" /> Ahmad Investment Position — RYA Gold (100% Owner)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Part A */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2">Part A — Cash Equity</p>
                <Table>
                  <TableBody>
                    <TableRow><TableCell className="text-xs">Opening Balance (initial capital)</TableCell><TableCell className="text-xs text-right font-mono text-success">+{fmt(ahmadPosition.openingBalance)}</TableCell></TableRow>
                    <TableRow><TableCell className="text-xs">Net Profit (inception to date)</TableCell><TableCell className="text-xs text-right font-mono text-success">+{fmt(ahmadPosition.netProfit)}</TableCell></TableRow>
                    <TableRow><TableCell className="text-xs">Less Ahmad Withdrawals</TableCell><TableCell className="text-xs text-right font-mono text-destructive">-{fmt(ahmadPosition.withdrawals)}</TableCell></TableRow>
                    <TableRow className="bg-primary/10"><TableCell className="text-xs font-bold">Cash Flow Closing Balance</TableCell><TableCell className="text-xs text-right font-mono font-bold text-primary">{fmt(ahmadPosition.cashEquityClosing)}</TableCell></TableRow>
                  </TableBody>
                </Table>
              </div>
              {/* Part B */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2">Part B — Net Profit Deployment</p>
                <Table>
                  <TableBody>
                    <TableRow><TableCell className="text-xs">Opening reinvested</TableCell><TableCell className="text-xs text-right font-mono">{fmt(ahmadPosition.openingBalance)}</TableCell></TableRow>
                    <TableRow><TableCell className="text-xs">Shareholder Withdrawals</TableCell><TableCell className="text-xs text-right font-mono">{fmt(ahmadPosition.withdrawals)}</TableCell></TableRow>
                    <TableRow><TableCell className="text-xs">Gold Inventory (5,907g book)</TableCell><TableCell className="text-xs text-right font-mono">{fmt(ahmadPosition.goldInventoryUSD)}</TableCell></TableRow>
                    <TableRow><TableCell className="text-xs">AR — AL MASA</TableCell><TableCell className="text-xs text-right font-mono">{fmt(ahmadPosition.arAlMasa)}</TableCell></TableRow>
                    <TableRow><TableCell className="text-xs">Broker Zhou receivable</TableCell><TableCell className="text-xs text-right font-mono">{fmt(ahmadPosition.brokerZhouReceivable)}</TableCell></TableRow>
                    <TableRow><TableCell className="text-xs">Less Broker PY payable</TableCell><TableCell className="text-xs text-right font-mono text-destructive">{fmt(ahmadPosition.brokerPYPayable)}</TableCell></TableRow>
                    <TableRow className="bg-primary/10"><TableCell className="text-xs font-bold">Total = Net Profit ✅</TableCell><TableCell className="text-xs text-right font-mono font-bold text-primary">{fmt(ahmadPosition.netProfit)}</TableCell></TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="p-3 bg-muted/30 rounded text-xs text-foreground">
              <strong>Note:</strong> Part B shows how net profit of ${formatNumber(ahmadPosition.netProfit, 0)} is deployed. Gold inventory at book value ${formatNumber(ahmadPosition.goldInventoryUSD, 0)} is the largest component. Broker PY payable of $266,259 must be settled from future sales.
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-border/30">
              <Stat label="Cash Equity" value={fmt(ahmadPosition.cashEquityClosing)} />
              <Stat label="Gold Inventory" value={fmt(ahmadPosition.goldInventoryUSD)} />
              <Stat label="Net Receivables" value={fmt(ahmadPosition.netReceivables)} tone={ahmadPosition.netReceivables < 0 ? "destructive" : "default"} />
              <Stat label="Total Net Position" value={fmt(ahmadPosition.totalNetPosition)} tone="primary" />
            </div>
          </CardContent>
        </Card>

        {/* SECTION 12 — Sales Transaction Log */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-sm font-serif">Sales Transaction Log</CardTitle>
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
                    <TableHead className="text-xs text-right">Rate $/g</TableHead>
                    <TableHead className="text-xs text-right">Revenue</TableHead>
                    <TableHead className="text-xs text-right">Cost</TableHead>
                    <TableHead className="text-xs text-right">Profit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.map((s) => (
                    <TableRow key={s.transId}>
                      <TableCell className="text-xs">{s.date}</TableCell>
                      <TableCell className="text-xs font-medium">{s.customer}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{formatNumber(s.qtyGrams, 2)}</TableCell>
                      <TableCell className="text-xs text-right font-mono">${s.rateUSD.toFixed(2)}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{fmt(s.amountUSD)}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{fmt(s.costUSD)}</TableCell>
                      <TableCell className="text-xs text-right font-mono text-success font-semibold">{fmt(s.profitUSD)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-primary/10 border-t-2 border-primary/30">
                    <TableCell colSpan={2} className="text-xs font-bold">TOTAL ({filteredSales.length} transactions)</TableCell>
                    <TableCell className="text-xs text-right font-mono font-bold">{formatNumber(totalQtyLog, 2)}</TableCell>
                    <TableCell />
                    <TableCell className="text-xs text-right font-mono font-bold">{fmt(totalRevenueLog)}</TableCell>
                    <TableCell />
                    <TableCell className="text-xs text-right font-mono font-bold text-success">{fmt(totalProfitLog)}</TableCell>
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

const PLRow = ({ label, amount, bold, highlight }: { label: string; amount: number; bold?: boolean; highlight?: boolean }) => {
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
