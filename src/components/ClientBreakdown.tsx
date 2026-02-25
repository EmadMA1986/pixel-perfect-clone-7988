import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { sales, formatCurrency, formatNumber } from "@/data/goldData";

const ClientBreakdown = () => {
  const grouped = sales.reduce<Record<string, { qty: number; revenue: number; cost: number; profit: number; count: number }>>((acc, s) => {
    if (!acc[s.customer]) acc[s.customer] = { qty: 0, revenue: 0, cost: 0, profit: 0, count: 0 };
    acc[s.customer].qty += s.qtyGrams;
    acc[s.customer].revenue += s.amountUSD;
    acc[s.customer].cost += s.costUSD;
    acc[s.customer].profit += s.profitUSD;
    acc[s.customer].count += 1;
    return acc;
  }, {});

  const data = Object.entries(grouped)
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.revenue - a.revenue);

  const totalRevenue = data.reduce((s, d) => s + d.revenue, 0);

  return (
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
                <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">Profit</TableHead>
                <TableHead className="text-xs text-muted-foreground uppercase tracking-wider text-right">Margin</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.name} className="border-border/30 hover:bg-secondary/30">
                  <TableCell className="text-sm font-medium text-foreground">{row.name}</TableCell>
                  <TableCell className="text-sm tabular-nums text-right text-muted-foreground">{row.count}</TableCell>
                  <TableCell className="text-sm tabular-nums text-right text-foreground">{formatNumber(row.qty, 2)}</TableCell>
                  <TableCell className="text-sm tabular-nums text-right text-foreground">{formatCurrency(row.revenue)}</TableCell>
                  <TableCell className="text-sm tabular-nums text-right text-success font-medium">{formatCurrency(row.profit)}</TableCell>
                  <TableCell className="text-sm tabular-nums text-right text-muted-foreground">
                    {((row.profit / row.revenue) * 100).toFixed(1)}%
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="border-border/50 bg-secondary/30 font-semibold">
                <TableCell className="text-sm text-foreground">Total</TableCell>
                <TableCell className="text-sm tabular-nums text-right text-foreground">{sales.length}</TableCell>
                <TableCell className="text-sm tabular-nums text-right text-foreground">{formatNumber(data.reduce((s, d) => s + d.qty, 0), 2)}</TableCell>
                <TableCell className="text-sm tabular-nums text-right text-foreground">{formatCurrency(totalRevenue)}</TableCell>
                <TableCell className="text-sm tabular-nums text-right text-success">{formatCurrency(data.reduce((s, d) => s + d.profit, 0))}</TableCell>
                <TableCell className="text-sm tabular-nums text-right text-muted-foreground">
                  {((data.reduce((s, d) => s + d.profit, 0) / totalRevenue) * 100).toFixed(1)}%
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientBreakdown;
