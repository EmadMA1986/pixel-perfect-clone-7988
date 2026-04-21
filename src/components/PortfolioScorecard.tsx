import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";
import { ClipboardList } from "lucide-react";

export interface ScorecardRow {
  name: string;
  investment: number; // display currency
  profit: number; // display currency
  roi: number; // percent
  trend: number[]; // last 6 months profit values (display currency)
}

interface Props {
  rows: ScorecardRow[];
  totals: { investment: number; profit: number; roi: number };
  format: (v: number) => string;
}

type Signal = "HOLD" | "EXIT" | "WATCH";

const getSignal = (roi: number): Signal => {
  if (roi >= 5) return "HOLD";
  if (roi < 0) return "EXIT";
  return "WATCH";
};

const Sparkline = ({ data, color }: { data: number[]; color: string }) => {
  if (!data || data.length === 0) return <span className="text-xs text-muted-foreground">—</span>;
  const chartData = data.map((v, i) => ({ i, v }));
  return (
    <div className="h-8 w-24 ml-auto">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
          <YAxis hide domain={["dataMin", "dataMax"]} />
          <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.75} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const PortfolioScorecard = ({ rows, totals, format }: Props) => {
  const sorted = [...rows].sort((a, b) => b.roi - a.roi);
  const totalInvestment = totals.investment || 1;

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-primary" />
          Portfolio Scorecard
        </CardTitle>
        <p className="text-xs text-muted-foreground">Ranked by ROI · 6-month profit trend per company</p>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-sm">Company</TableHead>
              <TableHead className="text-sm text-right">Investment</TableHead>
              <TableHead className="text-sm text-right">Profit/Loss</TableHead>
              <TableHead className="text-sm text-right">ROI %</TableHead>
              <TableHead className="text-sm text-right">% of Portfolio</TableHead>
              <TableHead className="text-sm text-center">Signal</TableHead>
              <TableHead className="text-sm text-right">6-Month Trend</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((r) => {
              const signal = getSignal(r.roi);
              const share = (r.investment / totalInvestment) * 100;
              const sparkColor =
                signal === "HOLD"
                  ? "hsl(var(--success))"
                  : signal === "EXIT"
                  ? "hsl(var(--loss))"
                  : "hsl(var(--primary))";
              const badgeClass =
                signal === "HOLD"
                  ? "bg-success/15 text-success border-success/40 hover:bg-success/20"
                  : signal === "EXIT"
                  ? "bg-loss/15 text-loss border-loss/40 hover:bg-loss/20"
                  : "bg-primary/15 text-primary border-primary/40 hover:bg-primary/20";
              return (
                <TableRow key={r.name}>
                  <TableCell className="font-medium text-base text-foreground whitespace-nowrap">{r.name}</TableCell>
                  <TableCell className="text-right text-base tabular-nums text-foreground">
                    {format(r.investment)}
                  </TableCell>
                  <TableCell
                    className={`text-right text-base tabular-nums ${r.profit >= 0 ? "text-success" : "text-loss"}`}
                  >
                    {format(r.profit)}
                  </TableCell>
                  <TableCell
                    className={`text-right text-base font-semibold tabular-nums ${r.roi >= 0 ? "text-success" : "text-loss"}`}
                  >
                    {r.roi >= 0 ? "+" : ""}
                    {r.roi.toFixed(1)}%
                  </TableCell>
                  <TableCell className="text-right text-base tabular-nums text-muted-foreground">
                    {share.toFixed(1)}%
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className={`text-[11px] font-semibold ${badgeClass}`}>
                      {signal}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Sparkline data={r.trend} color={sparkColor} />
                  </TableCell>
                </TableRow>
              );
            })}
            {/* Total row */}
            <TableRow className="border-t-2 border-primary/40 bg-primary/5 font-bold">
              <TableCell className="text-base font-bold text-foreground">Total</TableCell>
              <TableCell className="text-right text-base font-bold tabular-nums text-foreground">
                {format(totals.investment)}
              </TableCell>
              <TableCell
                className={`text-right text-base font-bold tabular-nums ${totals.profit >= 0 ? "text-success" : "text-loss"}`}
              >
                {format(totals.profit)}
              </TableCell>
              <TableCell
                className={`text-right text-base font-bold tabular-nums ${totals.roi >= 0 ? "text-success" : "text-loss"}`}
              >
                {totals.roi >= 0 ? "+" : ""}
                {totals.roi.toFixed(1)}%
              </TableCell>
              <TableCell className="text-right text-base font-bold tabular-nums text-foreground">100.0%</TableCell>
              <TableCell />
              <TableCell />
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default PortfolioScorecard;
