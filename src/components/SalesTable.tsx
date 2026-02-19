import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { sales, formatCurrency, formatNumber } from "@/data/goldData";

const SalesTable = () => {
  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-serif text-foreground">Sales Transactions</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
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
              {sales.map((sale) => (
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
  );
};

export default SalesTable;
