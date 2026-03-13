import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Gem, TrendingUp, DollarSign, Wallet, Scale, Filter, CalendarIcon, Building, Car, Activity, User } from "lucide-react";
import { format, isValid } from "date-fns";
import SummaryCard from "@/components/SummaryCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/utils";
import {
  goldPurchases,
  sales,
  expenses,
  salesDiscounts,
  profitLoss,
  brokerBalances,
  goldInventory,
  customerBalances,
  supplierBalances,
  AED_TO_USD_RATE,
  formatCurrency,
  formatNumber,
} from "@/data/goldData";

const parseDate = (dateStr: string): Date | null => {
  // Format: M/D/YY
  const parts = dateStr.split("/");
  if (parts.length !== 3) return null;
  const [m, d, y] = parts.map(Number);
  const fullYear = y < 50 ? 2000 + y : 1900 + y;
  const date = new Date(fullYear, m - 1, d);
  return isValid(date) ? date : null;
};

const RyaDashboard = () => {
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [partyFilter, setPartyFilter] = useState<string>("all");
  const [customerFilter, setCustomerFilter] = useState<string>("all");

  // Get unique parties and customers
  const parties = useMemo(() => [...new Set(goldPurchases.map((p) => p.party))].sort(), []);
  const customers = useMemo(() => [...new Set(sales.map((s) => s.customer))].sort(), []);

  const isInDateRange = (dateStr: string) => {
    if (!dateFrom && !dateTo) return true;
    const d = parseDate(dateStr);
    if (!d) return true;
    if (dateFrom && d < dateFrom) return false;
    if (dateTo && d > dateTo) return false;
    return true;
  };

  // Filtered data
  const filteredPurchases = useMemo(
    () =>
      goldPurchases.filter(
        (p) => isInDateRange(p.date) && (partyFilter === "all" || p.party === partyFilter)
      ),
    [dateFrom, dateTo, partyFilter]
  );

  const filteredSales = useMemo(
    () =>
      sales.filter(
        (s) => isInDateRange(s.date) && (customerFilter === "all" || s.customer === customerFilter)
      ),
    [dateFrom, dateTo, customerFilter]
  );

  const filteredExpenses = useMemo(
    () => expenses.filter((e) => isInDateRange(e.date)),
    [dateFrom, dateTo]
  );

  const filteredDiscounts = useMemo(
    () => salesDiscounts.filter((d) => isInDateRange(d.date)),
    [dateFrom, dateTo]
  );

  // Computed metrics from filtered data
  const totalRevenue = filteredSales.reduce((s, p) => s + p.amountUSD, 0);
  const totalCost = filteredSales.reduce((s, p) => s + p.costUSD, 0);
  const totalProfit = filteredSales.reduce((s, p) => s + p.profitUSD, 0);
  const totalPurchaseQty = filteredPurchases.reduce((s, p) => s + p.qtyPure, 0);
  const totalPurchaseAmount = filteredPurchases.reduce((s, p) => s + p.amountUSD, 0);
  const totalExpenses = filteredExpenses.reduce((s, e) => s + e.amount, 0);
  const totalDiscounts = filteredDiscounts.reduce((s, d) => s + d.amount, 0);
  const totalSalesQty = filteredSales.reduce((s, p) => s + p.qtyGrams, 0);

  // Client breakdown
  const clientData = useMemo(() => {
    const grouped = filteredSales.reduce<Record<string, { qty: number; revenue: number; cost: number; profit: number; count: number }>>((acc, s) => {
      if (!acc[s.customer]) acc[s.customer] = { qty: 0, revenue: 0, cost: 0, profit: 0, count: 0 };
      acc[s.customer].qty += s.qtyGrams;
      acc[s.customer].revenue += s.amountUSD;
      acc[s.customer].cost += s.costUSD;
      acc[s.customer].profit += s.profitUSD;
      acc[s.customer].count += 1;
      return acc;
    }, {});
    return Object.entries(grouped)
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [filteredSales]);

  // Expense breakdown
  const expenseData = useMemo(() => {
    const grouped = filteredExpenses.reduce<Record<string, number>>((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {});
    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
      .sort((a, b) => b.value - a.value);
  }, [filteredExpenses]);

  // Supplier breakdown
  const supplierData = useMemo(() => {
    const grouped = filteredPurchases.reduce<Record<string, { qty: number; amount: number; count: number }>>((acc, p) => {
      if (!acc[p.party]) acc[p.party] = { qty: 0, amount: 0, count: 0 };
      acc[p.party].qty += p.qtyPure;
      acc[p.party].amount += p.amountUSD;
      acc[p.party].count += 1;
      return acc;
    }, {});
    return Object.entries(grouped)
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredPurchases]);

  const pieColors = [
    "hsl(43, 74%, 52%)",
    "hsl(43, 60%, 40%)",
    "hsl(200, 50%, 45%)",
    "hsl(160, 50%, 40%)",
    "hsl(280, 40%, 50%)",
    "hsl(20, 60%, 50%)",
    "hsl(43, 40%, 30%)",
    "hsl(0, 50%, 50%)",
  ];

  const clearFilters = () => {
    setDateFrom(undefined);
    setDateTo(undefined);
    setPartyFilter("all");
    setCustomerFilter("all");
  };


   const hasFilters = dateFrom || dateTo || partyFilter !== "all" || customerFilter !== "all";
   const isClientView = customerFilter !== "all";

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
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Advanced Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/otc">
              <Button variant="outline" size="sm" className="text-xs gap-1.5">
                <Building className="h-3.5 w-3.5" />
                OTC
              </Button>
            </Link>
            <Link to="/mk-autos">
              <Button variant="outline" size="sm" className="text-xs gap-1.5">
                <Car className="h-3.5 w-3.5" />
                MK Autos
              </Button>
            </Link>
            <Link to="/mkx">
              <Button variant="outline" size="sm" className="text-xs gap-1.5">
                <Activity className="h-3.5 w-3.5" />
                MKX
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground hidden sm:block">Last updated: Mar 11, 2026</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Filters Bar */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Filter className="h-4 w-4" />
                Filters
              </div>

              {/* Date From */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className={cn("text-xs gap-1.5", !dateFrom && "text-muted-foreground")}>
                    <CalendarIcon className="h-3.5 w-3.5" />
                    {dateFrom ? format(dateFrom, "MMM d, yyyy") : "From date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus className={cn("p-3 pointer-events-auto")} />
                </PopoverContent>
              </Popover>

              {/* Date To */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className={cn("text-xs gap-1.5", !dateTo && "text-muted-foreground")}>
                    <CalendarIcon className="h-3.5 w-3.5" />
                    {dateTo ? format(dateTo, "MMM d, yyyy") : "To date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus className={cn("p-3 pointer-events-auto")} />
                </PopoverContent>
              </Popover>

              {/* Supplier Filter */}
              <Select value={partyFilter} onValueChange={setPartyFilter}>
                <SelectTrigger className="w-[140px] h-8 text-xs">
                  <SelectValue placeholder="Supplier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Suppliers</SelectItem>
                  {parties.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Customer Filter */}
              <Select value={customerFilter} onValueChange={setCustomerFilter}>
                <SelectTrigger className="w-[140px] h-8 text-xs">
                  <SelectValue placeholder="Customer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Customers</SelectItem>
                  {customers.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {hasFilters && (
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={clearFilters}>
                  Clear all
                </Button>
              )}

              {hasFilters && (
                <Badge variant="secondary" className="text-[10px]">
                  {filteredSales.length} sales · {filteredPurchases.length} purchases
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        {isClientView ? (
          <>
            <div className="mb-2">
              <Badge variant="outline" className="text-sm px-3 py-1 border-primary/50 text-primary">
                Viewing: {customerFilter}
              </Badge>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <SummaryCard title="Client Profit" value={formatCurrency(totalProfit)} subtitle={`Margin ${totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0}%`} icon={TrendingUp} trend="up" />
              <SummaryCard title="Revenue" value={formatCurrency(totalRevenue)} subtitle={`${filteredSales.length} sales`} icon={DollarSign} />
              <SummaryCard title="Gold Sold" value={`${formatNumber(totalSalesQty, 2)}g`} subtitle={`Avg $${totalSalesQty > 0 ? formatNumber(totalRevenue / totalSalesQty, 2) : 0}/g`} icon={Scale} />
              <SummaryCard title="Cost of Sales" value={formatCurrency(totalCost)} subtitle={`Avg $${totalSalesQty > 0 ? formatNumber(totalCost / totalSalesQty, 2) : 0}/g`} icon={Wallet} />
            </div>
          </>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <SummaryCard title="Net Profit" value={formatCurrency(profitLoss.netProfit)} subtitle={`Operating margin ${((profitLoss.operatingProfit / profitLoss.sales) * 100).toFixed(1)}%`} icon={TrendingUp} trend="up" />
            <SummaryCard title="Revenue" value={formatCurrency(totalRevenue)} subtitle={`${filteredSales.length} sales`} icon={DollarSign} />
            <SummaryCard title="Purchases" value={formatCurrency(totalPurchaseAmount)} subtitle={`${formatNumber(totalPurchaseQty, 0)}g from ${filteredPurchases.length} buys`} icon={Gem} />
            <SummaryCard title="Gold Sold" value={`${formatNumber(totalSalesQty, 2)}g`} subtitle={`Avg $${totalSalesQty > 0 ? formatNumber(totalRevenue / totalSalesQty, 2) : 0}/g`} icon={Scale} />
            <SummaryCard title="Expenses" value={formatCurrency(totalExpenses)} subtitle={`${filteredExpenses.length} items`} icon={Wallet} />
            <SummaryCard title="Discounts" value={formatCurrency(totalDiscounts)} subtitle={`${filteredDiscounts.length} items`} icon={DollarSign} />
          </div>
        )}

        {/* Charts Row */}
        <div className={`grid grid-cols-1 ${isClientView ? "" : "lg:grid-cols-2"} gap-6`}>
          {/* Profit by Sale */}
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-serif text-foreground">
                {isClientView ? `${customerFilter} — Profit by Sale` : "Profit by Sale"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={filteredSales.map((s) => ({ name: s.date, profit: Math.round(s.profitUSD), customer: s.customer }))} margin={{ top: 5, right: 5, bottom: 20, left: 5 }}>
                  <XAxis dataKey="name" tick={{ fill: "hsl(220 10% 50%)", fontSize: 10 }} angle={-45} textAnchor="end" axisLine={{ stroke: "hsl(220 14% 18%)" }} tickLine={false} />
                  <YAxis tick={{ fill: "hsl(220 10% 50%)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(220 16% 11%)", border: "1px solid hsl(220 14% 18%)", borderRadius: "8px", color: "hsl(40 20% 90%)", fontSize: 12 }} formatter={(value: number) => [`$${value.toLocaleString()}`, "Profit"]} labelFormatter={(label) => `Date: ${label}`} />
                  <Bar dataKey="profit" radius={[4, 4, 0, 0]}>
                    {filteredSales.map((_, i) => (
                      <Cell key={i} fill={`hsl(43 74% ${42 + (i % 4) * 5}%)`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Expense Breakdown Pie - hidden in client view */}
          {!isClientView && (
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-serif text-foreground">Expense Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col lg:flex-row items-center gap-4">
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={expenseData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value" stroke="none">
                        {expenseData.map((_, i) => (
                          <Cell key={i} fill={pieColors[i % pieColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: "hsl(220 16% 11%)", border: "1px solid hsl(220 14% 18%)", borderRadius: "8px", color: "hsl(40 20% 90%)", fontSize: 12 }} formatter={(value: number) => [formatCurrency(value), ""]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 w-full lg:w-auto">
                    {expenseData.map((item, i) => (
                      <div key={item.name} className="flex items-center gap-2 text-xs">
                        <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: pieColors[i % pieColors.length] }} />
                        <span className="text-muted-foreground whitespace-nowrap">{item.name}</span>
                        {item.name === "Melting Loss" && (
                          <span className="text-muted-foreground tabular-nums">(40.138g)</span>
                        )}
                        <span className="ml-auto tabular-nums text-foreground font-medium">{formatCurrency(item.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Tabs: Clients / Suppliers / Brokers */}
        <Tabs defaultValue="balances" className="space-y-4">
          <TabsList className="bg-secondary/50">
            <TabsTrigger value="balances">Balances</TabsTrigger>
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
            <TabsTrigger value="brokers">Brokers</TabsTrigger>
          </TabsList>

          {/* Customer & Supplier Balances */}
          <TabsContent value="balances">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-serif text-foreground">Customer Balances (USD)</CardTitle>
                  <p className="text-xs text-muted-foreground">AED converted at rate {AED_TO_USD_RATE} • (Cr) = Credit (client owes us)</p>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border/50 hover:bg-transparent">
                          <TableHead className="text-xs text-muted-foreground uppercase tracking-wider">Customer</TableHead>
                          <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">AED Balance</TableHead>
                          <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">USD Balance</TableHead>
                          <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">Total (USD)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {customerBalances.map((c) => (
                          <TableRow key={c.name} className="border-border/30 hover:bg-secondary/30">
                            <TableCell className="text-sm font-medium text-foreground">{c.name}</TableCell>
                            <TableCell className={`text-sm tabular-nums text-right ${c.balanceAED > 0 ? "text-muted-foreground" : c.balanceAED < 0 ? "text-destructive" : ""}`}>
                              {c.balanceAED !== 0 ? `AED ${formatNumber(Math.abs(c.balanceAED))}${c.balanceAED < 0 ? " (Cr)" : ""}` : "—"}
                            </TableCell>
                            <TableCell className="text-sm tabular-nums text-right text-foreground">
                              {c.balanceUSD > 0 ? formatCurrency(c.balanceUSD) : "—"}
                            </TableCell>
                            <TableCell className={`text-sm tabular-nums text-right font-medium ${c.totalUSD > 0 ? "text-success" : c.totalUSD < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                              {c.totalUSD !== 0 ? formatCurrency(c.totalUSD) : "$0.00"}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="border-border/50 bg-secondary/30 font-semibold">
                          <TableCell className="text-sm text-foreground">Total Outstanding</TableCell>
                          <TableCell className="text-sm tabular-nums text-right text-muted-foreground">
                            AED {formatNumber(customerBalances.reduce((s, c) => s + c.balanceAED, 0))}
                          </TableCell>
                          <TableCell className="text-sm tabular-nums text-right text-foreground">
                            {formatCurrency(customerBalances.reduce((s, c) => s + c.balanceUSD, 0))}
                          </TableCell>
                          <TableCell className={`text-sm tabular-nums text-right font-bold ${customerBalances.reduce((s, c) => s + c.totalUSD, 0) >= 0 ? "text-success" : "text-destructive"}`}>
                            {formatCurrency(customerBalances.reduce((s, c) => s + c.totalUSD, 0))}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-serif text-foreground">Supplier Balances (USD)</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border/50 hover:bg-transparent">
                          <TableHead className="text-xs text-muted-foreground uppercase tracking-wider">Supplier</TableHead>
                          <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">AED Balance</TableHead>
                          <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">USD Balance</TableHead>
                          <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">Total (USD)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {supplierBalances.map((s) => (
                          <TableRow key={s.name} className="border-border/30 hover:bg-secondary/30">
                            <TableCell className="text-sm font-medium text-foreground">{s.name}</TableCell>
                            <TableCell className="text-sm tabular-nums text-right text-muted-foreground">—</TableCell>
                            <TableCell className="text-sm tabular-nums text-right text-foreground">$0.00</TableCell>
                            <TableCell className="text-sm tabular-nums text-right text-muted-foreground">$0.00</TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="border-border/50 bg-secondary/30 font-semibold">
                          <TableCell className="text-sm text-foreground">Total</TableCell>
                          <TableCell className="text-sm tabular-nums text-right text-muted-foreground">—</TableCell>
                          <TableCell className="text-sm tabular-nums text-right text-foreground">$0.00</TableCell>
                          <TableCell className="text-sm tabular-nums text-right text-muted-foreground">$0.00</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="clients">
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-serif text-foreground">Client Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/50 hover:bg-transparent">
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider">Client</TableHead>
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">Deals</TableHead>
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">Qty (g)</TableHead>
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">Revenue</TableHead>
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">Cost</TableHead>
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">Profit</TableHead>
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">Margin</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clientData.map((row) => (
                        <TableRow key={row.name} className="border-border/30 hover:bg-secondary/30">
                          <TableCell className="text-sm font-medium text-foreground">{row.name}</TableCell>
                          <TableCell className="text-sm tabular-nums text-right text-muted-foreground">{row.count}</TableCell>
                          <TableCell className="text-sm tabular-nums text-right text-foreground">{formatNumber(row.qty, 2)}</TableCell>
                          <TableCell className="text-sm tabular-nums text-right text-foreground">{formatCurrency(row.revenue)}</TableCell>
                          <TableCell className="text-sm tabular-nums text-right text-muted-foreground">{formatCurrency(row.cost)}</TableCell>
                          <TableCell className="text-sm tabular-nums text-right text-success font-medium">{formatCurrency(row.profit)}</TableCell>
                          <TableCell className="text-sm tabular-nums text-right text-muted-foreground">{row.revenue > 0 ? ((row.profit / row.revenue) * 100).toFixed(1) : 0}%</TableCell>
                        </TableRow>
                      ))}
                      {clientData.length > 0 && (
                        <TableRow className="border-border/50 bg-secondary/30 font-semibold">
                          <TableCell className="text-sm text-foreground">Total</TableCell>
                          <TableCell className="text-sm tabular-nums text-right text-foreground">{clientData.reduce((s, d) => s + d.count, 0)}</TableCell>
                          <TableCell className="text-sm tabular-nums text-right text-foreground">{formatNumber(clientData.reduce((s, d) => s + d.qty, 0), 2)}</TableCell>
                          <TableCell className="text-sm tabular-nums text-right text-foreground">{formatCurrency(totalRevenue)}</TableCell>
                          <TableCell className="text-sm tabular-nums text-right text-muted-foreground">{formatCurrency(totalCost)}</TableCell>
                          <TableCell className="text-sm tabular-nums text-right text-success">{formatCurrency(totalProfit)}</TableCell>
                          <TableCell className="text-sm tabular-nums text-right text-muted-foreground">{totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0}%</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="suppliers">
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-serif text-foreground">Supplier Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/50 hover:bg-transparent">
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider">Supplier</TableHead>
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">Purchases</TableHead>
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">Pure Qty (g)</TableHead>
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">Amount (USD)</TableHead>
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">Avg Rate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {supplierData.map((row) => (
                        <TableRow key={row.name} className="border-border/30 hover:bg-secondary/30">
                          <TableCell className="text-sm font-medium text-foreground">{row.name}</TableCell>
                          <TableCell className="text-sm tabular-nums text-right text-muted-foreground">{row.count}</TableCell>
                          <TableCell className="text-sm tabular-nums text-right text-foreground">{formatNumber(row.qty, 2)}</TableCell>
                          <TableCell className="text-sm tabular-nums text-right text-foreground">{formatCurrency(row.amount)}</TableCell>
                          <TableCell className="text-sm tabular-nums text-right text-muted-foreground">${row.qty > 0 ? formatNumber(row.amount / row.qty, 2) : 0}/g</TableCell>
                        </TableRow>
                      ))}
                      {supplierData.length > 0 && (
                        <TableRow className="border-border/50 bg-secondary/30 font-semibold">
                          <TableCell className="text-sm text-foreground">Total</TableCell>
                          <TableCell className="text-sm tabular-nums text-right text-foreground">{supplierData.reduce((s, d) => s + d.count, 0)}</TableCell>
                          <TableCell className="text-sm tabular-nums text-right text-foreground">{formatNumber(totalPurchaseQty, 2)}</TableCell>
                          <TableCell className="text-sm tabular-nums text-right text-foreground">{formatCurrency(totalPurchaseAmount)}</TableCell>
                          <TableCell className="text-sm tabular-nums text-right text-muted-foreground">${totalPurchaseQty > 0 ? formatNumber(totalPurchaseAmount / totalPurchaseQty, 2) : 0}/g</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="brokers">
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-serif text-foreground">Broker Balances</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: "Broker PY", usd: brokerBalances.brokerPY.usd, aed: brokerBalances.brokerPY.aed },
                  { name: "Broker ZHOU", usd: brokerBalances.brokerZHOU.usd, aed: brokerBalances.brokerZHOU.aed },
                ].map((b) => (
                  <div key={b.name} className="flex items-center justify-between py-3 px-4 rounded-lg bg-secondary/30">
                    <span className="text-sm font-medium text-foreground">{b.name}</span>
                    <div className="text-right">
                      <p className="text-sm tabular-nums font-semibold text-foreground">{formatCurrency(b.usd)}</p>
                      {b.aed > 0 && <p className="text-xs tabular-nums text-muted-foreground">{formatCurrency(b.aed, "AED")}</p>}
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-primary/10 border border-primary/20">
                  <span className="text-sm font-serif font-semibold text-primary">Total</span>
                  <p className="text-sm tabular-nums font-bold text-primary">{formatCurrency(brokerBalances.brokerPY.usd + brokerBalances.brokerZHOU.usd)}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Sales Table & P&L */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* P&L */}
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-serif text-foreground">Profit & Loss</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {[
                { label: "Sales Revenue", value: profitLoss.sales, indent: false },
                { label: "Sales Discount", value: -profitLoss.salesDiscount, indent: true },
                { label: "Cost of Sales", value: -profitLoss.costOfSales, indent: true },
                { label: "Melting Loss", value: -profitLoss.meltingLoss, indent: true },
                { label: "Hedge Expenses", value: -profitLoss.hedgeExpenses, indent: true },
                { label: "Gross Profit", value: profitLoss.grossProfit, indent: false, highlight: true },
                { label: "Transport", value: -profitLoss.transport, indent: true },
                { label: "Labor", value: -profitLoss.labor, indent: true },
                { label: "Hotel", value: -profitLoss.hotel, indent: true },
                { label: "Bonus", value: -profitLoss.bonus, indent: true },
                { label: "Tax + Bonus", value: -profitLoss.taxBonus, indent: true },
                { label: "Other Expenses", value: -profitLoss.otherExp, indent: true },
                { label: "Operating Profit", value: profitLoss.operatingProfit, indent: false, highlight: true },
                { label: "Fx Gain", value: profitLoss.fxGain, indent: true },
                { label: "Fx Loss", value: -profitLoss.fxLoss, indent: true },
                { label: "Net Profit", value: profitLoss.netProfit, indent: false, highlight: true, gold: true },
              ].map((item, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between py-1.5 px-2 rounded-md text-sm ${item.highlight ? "bg-secondary/50 font-semibold" : ""} ${item.gold ? "bg-primary/10 border border-primary/20" : ""} ${item.indent ? "pl-6" : ""}`}
                >
                  <span className={`${item.highlight ? "text-foreground" : "text-muted-foreground"} ${item.gold ? "text-primary font-serif text-base" : ""}`}>{item.label}</span>
                  <span className={`tabular-nums ${item.gold ? "text-primary font-serif text-base" : item.value >= 0 ? "text-foreground" : "text-loss"}`}>{formatCurrency(Math.abs(item.value))}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Sales Table */}
          <div className="lg:col-span-2">
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-serif text-foreground">
                  Sales Transactions
                  <span className="text-xs font-sans text-muted-foreground ml-2">({filteredSales.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/50 hover:bg-transparent sticky top-0 bg-card">
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider">Date</TableHead>
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider">Customer</TableHead>
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">Qty (g)</TableHead>
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">Rate $/g</TableHead>
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">Amount</TableHead>
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">Cost</TableHead>
                        <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">Profit</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSales.map((sale) => (
                        <TableRow key={sale.transId} className="border-border/30 hover:bg-secondary/30">
                          <TableCell className="text-sm text-muted-foreground">{sale.date}</TableCell>
                          <TableCell className="text-sm font-medium text-foreground">{sale.customer}</TableCell>
                          <TableCell className="text-sm tabular-nums text-right text-foreground">{formatNumber(sale.qtyGrams, 2)}</TableCell>
                          <TableCell className="text-sm tabular-nums text-right text-muted-foreground">{formatNumber(sale.rateUSD, 3)}</TableCell>
                          <TableCell className="text-sm tabular-nums text-right text-foreground">{formatCurrency(sale.amountUSD)}</TableCell>
                          <TableCell className="text-sm tabular-nums text-right text-muted-foreground">{formatCurrency(sale.costUSD)}</TableCell>
                          <TableCell className="text-sm tabular-nums text-right text-success font-medium">{formatCurrency(sale.profitUSD)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Gold Inventory */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-serif text-foreground">Gold Inventory Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-secondary/30 text-center">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Balance</p>
                <p className="text-2xl font-serif font-bold text-foreground">{formatNumber(goldInventory.balanceGrams, 3)}g</p>
              </div>
              <div className="p-4 rounded-lg bg-secondary/30 text-center">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Cost of Remaining</p>
                <p className="text-2xl font-serif font-bold text-foreground">{formatCurrency(goldInventory.costOfRemainingUSD)}</p>
              </div>
              <div className="p-4 rounded-lg bg-secondary/30 text-center">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Avg Cost/g</p>
                <p className="text-2xl font-serif font-bold text-primary">${formatNumber(goldInventory.costOfRemainingUSD / goldInventory.balanceGrams, 2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default RyaDashboard;
