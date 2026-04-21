import { useMemo } from "react";
import {
  TrendingUp, TrendingDown, AlertTriangle, Target, Zap, Activity, Minus, ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from "recharts";

export interface ExecMonthInput {
  month: string;
  revenue: number;
  costs: number;
  grossProfit: number;
  netProfit: number;
}

interface Props {
  /** Ordered chronologically; the LAST entry is treated as the current period. */
  history: ExecMonthInput[];
  /** Used to derive single-period anchor (e.g. selected month). Falls back to last entry. */
  currentMonth?: string;
  /** Currency formatter, e.g. formatAED. */
  format: (v: number) => string;
  /** Business name for header label. */
  businessName: string;
  /** Domain-specific reason hints for MoM table. */
  reasons?: {
    revenueUp?: string;
    revenueDown?: string;
    costsContext?: string;
  };
  /** Custom issue detectors layered on defaults. */
  extraIssues?: (cur: ExecMonthInput, prev?: ExecMonthInput) => string[];
}

const ExecutiveSummary = ({
  history, currentMonth, format, businessName, reasons, extraIssues,
}: Props) => {
  const exec = useMemo(() => {
    if (!history.length) return null;
    const idx = currentMonth
      ? Math.max(0, history.findIndex((m) => m.month === currentMonth))
      : history.length - 1;
    const cur = history[idx];
    const prev = idx > 0 ? history[idx - 1] : undefined;

    const pct = (a: number, b: number) => (b === 0 ? 0 : ((a - b) / Math.abs(b)) * 100);
    const revPct = prev ? pct(cur.revenue, prev.revenue) : 0;
    const costPct = prev ? pct(cur.costs, prev.costs) : 0;
    const npPct = prev ? pct(cur.netProfit, prev.netProfit) : 0;
    const gpMargin = cur.revenue ? (cur.grossProfit / cur.revenue) * 100 : 0;
    const npMargin = cur.revenue ? (cur.netProfit / cur.revenue) * 100 : 0;

    let verdict: "improving" | "stable" | "declining";
    if (prev && cur.netProfit > prev.netProfit && cur.netProfit >= 0) verdict = "improving";
    else if (prev && Math.abs(npPct) < 10) verdict = "stable";
    else if (!prev) verdict = cur.netProfit >= 0 ? "stable" : "declining";
    else verdict = "declining";

    let mainDriver = "";
    if (prev) {
      const revDelta = cur.revenue - prev.revenue;
      const costDelta = cur.costs - prev.costs;
      if (Math.abs(revDelta) > Math.abs(costDelta)) {
        mainDriver = revDelta >= 0
          ? `Revenue up ${format(revDelta)} (+${revPct.toFixed(1)}%)`
          : `Revenue down ${format(Math.abs(revDelta))} (${revPct.toFixed(1)}%)`;
      } else {
        mainDriver = costDelta >= 0
          ? `Costs up ${format(costDelta)} (+${costPct.toFixed(1)}%)`
          : `Costs cut ${format(Math.abs(costDelta))} (${costPct.toFixed(1)}%)`;
      }
    } else {
      mainDriver = "No prior month to compare";
    }

    const issues: string[] = [];
    if (cur.netProfit < 0) issues.push("Operating at a net loss");
    if (cur.costs > cur.revenue) issues.push("Total costs exceed revenue");
    if (prev && cur.revenue < prev.revenue * 0.85) issues.push("Sharp revenue decline >15%");
    if (gpMargin < 20 && cur.revenue > 0) issues.push(`Thin gross margin (${gpMargin.toFixed(0)}%)`);
    if (extraIssues) issues.push(...extraIssues(cur, prev));
    const mainIssue = issues[0] ?? "No critical issue detected";

    let action = "Maintain current operations and monitor next month closely.";
    if (cur.netProfit < 0 && cur.costs > cur.revenue)
      action = "URGENT: Costs exceed revenue — cut overheads immediately.";
    else if (cur.netProfit < 0)
      action = "Reduce indirect expenses to restore profitability.";
    else if (revPct < -10)
      action = "Reactivate top revenue channels — investigate decline.";
    else if (costPct > 15)
      action = "Audit cost spike and freeze non-essential spending.";
    else if (verdict === "improving")
      action = "Reinvest surplus into highest-ROI activities to scale.";

    const trendData = history.slice(Math.max(0, idx - 5), idx + 1).map((m) => ({
      month: m.month,
      Revenue: Math.round(m.revenue),
      Costs: Math.round(m.costs),
      "Net Profit": Math.round(m.netProfit),
    }));

    return { cur, prev, revPct, costPct, npPct, gpMargin, npMargin,
      verdict, mainDriver, mainIssue, issues, action, trendData };
  }, [history, currentMonth, format, extraIssues]);

  if (!exec) return null;

  const verdictStyle = exec.verdict === "improving"
    ? { bg: "bg-success/10", border: "border-success/40", text: "text-success", label: "IMPROVING", Icon: TrendingUp }
    : exec.verdict === "declining"
    ? { bg: "bg-loss/10", border: "border-loss/40", text: "text-loss", label: "DECLINING", Icon: TrendingDown }
    : { bg: "bg-muted/40", border: "border-border", text: "text-muted-foreground", label: "STABLE", Icon: Minus };

  return (
    <section className="space-y-5">
      {/* === 1. VERDICT BANNER === */}
      <Card className={`border-2 ${verdictStyle.border} ${verdictStyle.bg} backdrop-blur-sm`}>
        <CardContent className="p-5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className={`flex h-14 w-14 items-center justify-center rounded-full ${verdictStyle.bg} border-2 ${verdictStyle.border}`}>
                <verdictStyle.Icon className={`h-7 w-7 ${verdictStyle.text}`} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                  {businessName} — Performance Verdict — {exec.cur.month}
                </p>
                <p className={`text-3xl font-serif font-bold ${verdictStyle.text} tracking-wide`}>{verdictStyle.label}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Net Profit MoM</p>
              <p className={`text-2xl font-bold tabular-nums ${exec.npPct >= 0 ? "text-success" : "text-loss"}`}>
                {exec.npPct >= 0 ? "▲" : "▼"} {Math.abs(exec.npPct).toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground tabular-nums">{format(exec.cur.netProfit)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* === 2. KEY MESSAGES === */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="border-border/50 bg-card/80">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Activity className="h-3.5 w-3.5" />
              <p className="text-[10px] uppercase tracking-wider">Performance</p>
            </div>
            <p className={`text-lg font-bold ${verdictStyle.text}`}>{verdictStyle.label}</p>
            <p className="text-xs text-muted-foreground">vs {exec.prev?.month ?? "—"}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/80">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <AlertTriangle className="h-3.5 w-3.5" />
              <p className="text-[10px] uppercase tracking-wider">Main Issue</p>
            </div>
            <p className={`text-sm font-semibold leading-snug ${exec.issues.length ? "text-loss" : "text-success"}`}>
              {exec.mainIssue}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/80">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Zap className="h-3.5 w-3.5" />
              <p className="text-[10px] uppercase tracking-wider">Main Driver</p>
            </div>
            <p className="text-sm font-semibold text-foreground leading-snug">{exec.mainDriver}</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-primary/40 bg-primary/5">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center gap-2 text-primary">
              <Target className="h-3.5 w-3.5" />
              <p className="text-[10px] uppercase tracking-wider font-semibold">Action</p>
            </div>
            <p className="text-sm font-semibold text-foreground leading-snug">{exec.action}</p>
          </CardContent>
        </Card>
      </div>

      {/* === 3. CRITICAL ISSUES === */}
      {exec.issues.length > 0 && (
        <Alert className="border-loss/50 bg-loss/5">
          <AlertTriangle className="h-4 w-4 !text-loss" />
          <AlertTitle className="text-loss font-semibold">Critical Issues Detected ({exec.issues.length})</AlertTitle>
          <AlertDescription>
            <ul className="mt-2 space-y-1 text-sm text-foreground">
              {exec.issues.map((i) => (
                <li key={i} className="flex items-start gap-2">
                  <ChevronRight className="h-3.5 w-3.5 mt-0.5 text-loss shrink-0" />
                  <span>{i}</span>
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* === 4. DECISION KPIs === */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="border-border/50 bg-card/80">
          <CardContent className="p-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Revenue</p>
            <p className="text-xl font-bold tabular-nums text-foreground mt-1">{format(exec.cur.revenue)}</p>
            <p className={`text-xs font-medium mt-1 ${exec.revPct >= 0 ? "text-success" : "text-loss"}`}>
              {exec.revPct >= 0 ? "▲" : "▼"} {Math.abs(exec.revPct).toFixed(1)}% MoM
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/80">
          <CardContent className="p-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total Costs</p>
            <p className="text-xl font-bold tabular-nums text-foreground mt-1">{format(exec.cur.costs)}</p>
            <p className={`text-xs font-medium mt-1 ${exec.costPct <= 0 ? "text-success" : "text-loss"}`}>
              {exec.costPct >= 0 ? "▲" : "▼"} {Math.abs(exec.costPct).toFixed(1)}% MoM
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/80">
          <CardContent className="p-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Net Profit</p>
            <p className={`text-xl font-bold tabular-nums mt-1 ${exec.cur.netProfit >= 0 ? "text-success" : "text-loss"}`}>
              {format(exec.cur.netProfit)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Margin: {exec.npMargin.toFixed(1)}%</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/80">
          <CardContent className="p-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Gross Margin</p>
            <p className="text-xl font-bold tabular-nums text-foreground mt-1">{exec.gpMargin.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground mt-1">{format(exec.cur.grossProfit)} GP</p>
          </CardContent>
        </Card>
      </div>

      {/* === 5. TREND === */}
      {exec.trendData.length > 1 && (
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-serif text-foreground">6-Month Trend — Revenue, Costs & Net Profit</CardTitle>
            <p className="text-[10px] text-muted-foreground tracking-wider uppercase">Visual decision context</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={exec.trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <YAxis
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(v: number) => format(v)}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Revenue" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Costs" fill="hsl(var(--muted-foreground))" radius={[3, 3, 0, 0]} opacity={0.6} />
                <Line type="monotone" dataKey="Net Profit" stroke="hsl(var(--success))" strokeWidth={2.5} dot={{ r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* === 6. MoM COMPARISON === */}
      {exec.prev && (
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-serif text-foreground">
              Month-over-Month: {exec.cur.month} vs {exec.prev.month}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 text-[10px] uppercase tracking-wider text-muted-foreground">
                    <th className="text-left py-2">Metric</th>
                    <th className="text-right py-2">{exec.prev.month}</th>
                    <th className="text-right py-2">{exec.cur.month}</th>
                    <th className="text-right py-2">Change</th>
                    <th className="text-left py-2 pl-4">Reason</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {[
                    { label: "Revenue", prev: exec.prev.revenue, cur: exec.cur.revenue, pct: exec.revPct, inverse: false,
                      reason: exec.revPct >= 0
                        ? (reasons?.revenueUp ?? "Higher activity / volume")
                        : (reasons?.revenueDown ?? "Lower activity / volume") },
                    { label: "Total Costs", prev: exec.prev.costs, cur: exec.cur.costs, pct: exec.costPct, inverse: true,
                      reason: reasons?.costsContext ?? "Direct + indirect expenses" },
                    { label: "Gross Profit", prev: exec.prev.grossProfit, cur: exec.cur.grossProfit,
                      pct: exec.prev.grossProfit ? ((exec.cur.grossProfit - exec.prev.grossProfit) / Math.abs(exec.prev.grossProfit)) * 100 : 0,
                      inverse: false, reason: "Revenue minus direct costs" },
                    { label: "Net Profit", prev: exec.prev.netProfit, cur: exec.cur.netProfit, pct: exec.npPct, inverse: false,
                      reason: "Bottom-line outcome after all costs" },
                  ].map((row) => {
                    const positive = row.inverse ? row.pct <= 0 : row.pct >= 0;
                    return (
                      <tr key={row.label} className="border-b border-border/30">
                        <td className="py-2 font-medium text-foreground">{row.label}</td>
                        <td className="text-right tabular-nums text-muted-foreground">{format(row.prev)}</td>
                        <td className="text-right tabular-nums text-foreground font-medium">{format(row.cur)}</td>
                        <td className={`text-right tabular-nums font-semibold ${positive ? "text-success" : "text-loss"}`}>
                          {row.pct >= 0 ? "▲" : "▼"} {Math.abs(row.pct).toFixed(1)}%
                        </td>
                        <td className="pl-4 text-muted-foreground">{row.reason}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  );
};

export default ExecutiveSummary;
