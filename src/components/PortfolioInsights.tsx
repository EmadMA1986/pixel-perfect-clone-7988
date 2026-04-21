import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Sparkles,
  Trophy,
  Shield,
  Target,
  Rocket,
  Wrench,
  XCircle,
  CheckCircle2,
} from "lucide-react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
} from "recharts";

export interface CompanyMonthMetrics {
  investment: number;
  profit: number;
  netPosition: number;
  roi: number;
}

export interface CompanySnapshot {
  key: string;
  name: string;
  share: string;
  current: CompanyMonthMetrics;
  previous?: CompanyMonthMetrics | null;
  trend: { month: string; profit: number }[]; // last N months
}

interface Props {
  companies: CompanySnapshot[];
  selectedMonth: string; // "all" or "MMM-YY"
  prevMonthLabel?: string | null;
  format: (v: number) => string;
  toDisplay: (v: number) => number;
  portfolioTrend: { month: string; revenue: number; profit: number; roi: number }[];
}

const pctChange = (cur: number, prev: number | undefined | null) => {
  if (prev === undefined || prev === null) return null;
  if (prev === 0) return cur === 0 ? 0 : 100;
  return ((cur - prev) / Math.abs(prev)) * 100;
};

const Delta = ({ cur, prev, isPct = false }: { cur: number; prev?: number | null; isPct?: boolean }) => {
  if (prev === undefined || prev === null) return <span className="text-[10px] text-muted-foreground">—</span>;
  const p = pctChange(cur, prev);
  if (p === null) return null;
  const dir = p > 0.5 ? "up" : p < -0.5 ? "down" : "flat";
  const Icon = dir === "up" ? ArrowUpRight : dir === "down" ? ArrowDownRight : Minus;
  const color = dir === "up" ? "text-success" : dir === "down" ? "text-loss" : "text-muted-foreground";
  return (
    <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold ${color}`}>
      <Icon className="h-3 w-3" />
      {Math.abs(p).toFixed(1)}%
    </span>
  );
};

const PortfolioInsights = ({
  companies,
  selectedMonth,
  prevMonthLabel,
  format,
  toDisplay,
  portfolioTrend,
}: Props) => {
  // === Aggregate totals ===
  const totals = useMemo(() => {
    const inv = companies.reduce((s, c) => s + c.current.investment, 0);
    const profit = companies.reduce((s, c) => s + c.current.profit, 0);
    const netPos = companies.reduce((s, c) => s + c.current.netPosition, 0);
    const prevProfit = companies.every(c => c.previous)
      ? companies.reduce((s, c) => s + (c.previous?.profit ?? 0), 0)
      : null;
    const prevInv = companies.every(c => c.previous)
      ? companies.reduce((s, c) => s + (c.previous?.investment ?? 0), 0)
      : null;
    return {
      investment: inv,
      profit,
      netPosition: netPos,
      roi: inv ? (profit / inv) * 100 : 0,
      prevProfit,
      prevROI: prevProfit !== null && prevInv ? (prevProfit / prevInv) * 100 : null,
    };
  }, [companies]);

  // === Performance verdict ===
  const verdict = useMemo<{ status: "improving" | "stable" | "declining"; reason: string }>(() => {
    const p = pctChange(totals.profit, totals.prevProfit);
    if (p === null) {
      return {
        status: totals.profit >= 0 ? "stable" : "declining",
        reason: totals.profit >= 0 ? "Portfolio profitable; no MoM baseline." : "Portfolio in loss; no MoM baseline.",
      };
    }
    if (p > 10) return { status: "improving", reason: `Net profit up ${p.toFixed(1)}% MoM.` };
    if (p < -10) return { status: "declining", reason: `Net profit down ${Math.abs(p).toFixed(1)}% MoM.` };
    return { status: "stable", reason: `Net profit change ${p.toFixed(1)}% MoM — within ±10%.` };
  }, [totals]);

  // === Ranked companies (by ROI desc) ===
  const ranked = useMemo(() => {
    return [...companies].sort((a, b) => b.current.roi - a.current.roi);
  }, [companies]);

  // === Investment signals ===
  const signal = (c: CompanySnapshot): { label: "SCALE" | "HOLD" | "FIX" | "EXIT"; reason: string; color: string; Icon: any } => {
    const growth = pctChange(c.current.profit, c.previous?.profit);
    if (c.current.roi < -15 || (c.current.profit < 0 && (growth ?? 0) < -20)) {
      return { label: "EXIT", reason: "Sustained losses & deteriorating trend", color: "text-loss border-loss/40 bg-loss/10", Icon: XCircle };
    }
    if (c.current.profit < 0) {
      return { label: "FIX", reason: "Currently loss-making — turnaround needed", color: "text-yellow-500 border-yellow-500/40 bg-yellow-500/10", Icon: Wrench };
    }
    if (c.current.roi > 10 && (growth ?? 0) > 5) {
      return { label: "SCALE", reason: "Strong ROI with positive momentum", color: "text-success border-success/40 bg-success/10", Icon: Rocket };
    }
    return { label: "HOLD", reason: "Stable performance — maintain", color: "text-primary border-primary/40 bg-primary/10", Icon: CheckCircle2 };
  };

  // === Drivers (movers) ===
  const movers = useMemo(() => {
    const arr = companies
      .filter(c => c.previous)
      .map(c => ({ name: c.name, delta: c.current.profit - (c.previous?.profit ?? 0), cur: c.current.profit }))
      .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
    return { gainers: arr.filter(m => m.delta > 0).slice(0, 2), losers: arr.filter(m => m.delta < 0).slice(0, 2) };
  }, [companies]);

  // === Concentration risk ===
  const concentration = useMemo(() => {
    const sorted = [...companies].sort((a, b) => b.current.investment - a.current.investment);
    const top = sorted[0];
    const pct = totals.investment ? (top.current.investment / totals.investment) * 100 : 0;
    let action: "REDUCE" | "REBALANCE" | "MAINTAIN";
    let reason: string;
    if (pct > 50) {
      action = "REDUCE";
      reason = `${top.name} at ${pct.toFixed(0)}% of portfolio — divest to <40% to limit single-entity risk.`;
    } else if (pct > 35) {
      action = "REBALANCE";
      reason = `${top.name} at ${pct.toFixed(0)}% — rebalance toward underweighted entities.`;
    } else {
      action = "MAINTAIN";
      reason = `Top exposure at ${pct.toFixed(0)}% — diversification healthy.`;
    }
    return { top, pct, action, reason };
  }, [companies, totals.investment]);

  // === Alerts ===
  const alerts = useMemo(() => {
    const out: { severity: "high" | "med"; msg: string }[] = [];
    if (totals.prevProfit !== null && totals.profit < totals.prevProfit && pctChange(totals.profit, totals.prevProfit)! < -15) {
      out.push({ severity: "high", msg: `Portfolio profit declined ${Math.abs(pctChange(totals.profit, totals.prevProfit)!).toFixed(1)}% vs ${prevMonthLabel}.` });
    }
    companies.forEach(c => {
      const g = pctChange(c.current.profit, c.previous?.profit);
      if (g !== null && g < -25 && c.current.profit < (c.previous?.profit ?? 0)) {
        out.push({ severity: "high", msg: `${c.name}: profit dropped ${Math.abs(g).toFixed(0)}% MoM.` });
      }
      if (c.current.profit < 0 && c.current.roi < -10) {
        out.push({ severity: "med", msg: `${c.name}: loss-making at ${c.current.roi.toFixed(1)}% ROI.` });
      }
    });
    if (concentration.action === "REDUCE") {
      out.push({ severity: "high", msg: concentration.reason });
    }
    return out.slice(0, 5);
  }, [companies, totals, prevMonthLabel, concentration]);

  // === AI-style 2-line summaries per company ===
  const companySummary = (c: CompanySnapshot): { line1: string; action: string } => {
    const g = pctChange(c.current.profit, c.previous?.profit);
    const dir = g === null ? "no prior data" : g > 0 ? `up ${g.toFixed(0)}%` : `down ${Math.abs(g).toFixed(0)}%`;
    const status = c.current.profit >= 0 ? "profitable" : "loss-making";
    const line1 = `${status} at ${format(toDisplay(c.current.profit))} (${c.current.roi.toFixed(1)}% ROI), ${dir} MoM.`;
    const sig = signal(c);
    const actionMap: Record<typeof sig.label, string> = {
      SCALE: "Increase capital allocation to capture upside.",
      HOLD: "Maintain — monitor monthly.",
      FIX: "Cut costs and review revenue mix urgently.",
      EXIT: "Plan orderly wind-down to free capital.",
    };
    return { line1, action: actionMap[sig.label] };
  };

  const verdictColor =
    verdict.status === "improving"
      ? "border-success/40 bg-success/10 text-success"
      : verdict.status === "declining"
      ? "border-loss/40 bg-loss/10 text-loss"
      : "border-yellow-500/40 bg-yellow-500/10 text-yellow-500";

  return (
    <div className="space-y-6">
      {/* === Performance Verdict + Critical Alerts (grouped) === */}
      <div className="grid gap-3 md:grid-cols-2">
        <Card className={`border-2 ${verdictColor}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              {verdict.status === "improving" ? <TrendingUp className="h-4 w-4" /> : verdict.status === "declining" ? <TrendingDown className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
              <p className="text-[10px] font-bold uppercase tracking-wider">Performance Verdict</p>
            </div>
            <p className="text-2xl font-bold font-serif uppercase">{verdict.status}</p>
            <p className="text-xs opacity-80 mt-1">{verdict.reason}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-[10px] uppercase text-muted-foreground">Main Driver</p>
                <p className="font-semibold text-foreground">{movers.gainers[0]?.name ?? ranked[0]?.name ?? "—"}</p>
                <p className="text-success text-[10px]">
                  {movers.gainers[0] ? `+${format(toDisplay(movers.gainers[0].delta))} vs ${prevMonthLabel}` : `Top ROI: ${ranked[0]?.current.roi.toFixed(1)}%`}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-muted-foreground">Main Issue</p>
                <p className="font-semibold text-foreground">{movers.losers[0]?.name ?? ranked[ranked.length - 1]?.name ?? "—"}</p>
                <p className="text-loss text-[10px]">
                  {movers.losers[0] ? `${format(toDisplay(movers.losers[0].delta))} vs ${prevMonthLabel}` : `Lowest ROI: ${ranked[ranked.length - 1]?.current.roi.toFixed(1)}%`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-loss/40 bg-loss/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-loss flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> Critical Alerts ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {alerts.length > 0 ? alerts.map((a, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <span className={`mt-0.5 inline-block h-1.5 w-1.5 rounded-full shrink-0 ${a.severity === "high" ? "bg-loss" : "bg-yellow-500"}`} />
                <span className="text-foreground">{a.msg}</span>
              </div>
            )) : (
              <p className="text-xs text-muted-foreground">No critical alerts.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* MoM + Trend rendered AFTER ranking table below */}

      {/* === 5. RANKED + AI INSIGHTS + SIGNALS + SCORECARD === */}
      <Card className="border-border/50 bg-card/80">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
            <Trophy className="h-4 w-4 text-primary" /> Company Ranking, AI Insights & Investment Signals
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs w-12">Rank</TableHead>
                <TableHead className="text-xs">Company</TableHead>
                <TableHead className="text-xs text-right">Investment</TableHead>
                <TableHead className="text-xs text-right">Profit/Loss</TableHead>
                <TableHead className="text-xs text-right">ROI %</TableHead>
                <TableHead className="text-xs text-right">vs Last Month</TableHead>
                <TableHead className="text-xs text-right">% of Portfolio</TableHead>
                <TableHead className="text-xs">AI Insight</TableHead>
                <TableHead className="text-xs text-center w-24">Signal</TableHead>
                <TableHead className="text-xs text-right w-28">6M Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ranked.map((c, i) => {
                const sig = signal(c);
                const sum = companySummary(c);
                const Icon = sig.Icon;
                const share = totals.investment ? (c.current.investment / totals.investment) * 100 : 0;
                const sparkData = c.trend.map((t, idx) => ({ i: idx, v: toDisplay(t.profit) }));
                const sparkColor =
                  sig.label === "SCALE" || sig.label === "HOLD"
                    ? "hsl(var(--success))"
                    : sig.label === "EXIT"
                    ? "hsl(var(--loss))"
                    : "hsl(var(--primary))";
                return (
                  <TableRow key={c.key} className="h-20 align-top">
                    <TableCell className="text-sm font-bold">#{i + 1}</TableCell>
                    <TableCell>
                      <div className="text-sm font-semibold text-foreground">{c.name}</div>
                      <div className="text-[10px] text-muted-foreground">{c.share} ownership</div>
                    </TableCell>
                    <TableCell className="text-right text-sm tabular-nums text-foreground">
                      {format(toDisplay(c.current.investment))}
                    </TableCell>
                    <TableCell className={`text-right text-sm tabular-nums ${c.current.profit >= 0 ? "text-success" : "text-loss"}`}>
                      {format(toDisplay(c.current.profit))}
                    </TableCell>
                    <TableCell className={`text-right text-sm font-bold tabular-nums ${c.current.roi >= 0 ? "text-success" : "text-loss"}`}>
                      {c.current.roi >= 0 ? "+" : ""}{c.current.roi.toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-right">
                      <Delta cur={c.current.profit} prev={c.previous?.profit} />
                    </TableCell>
                    <TableCell className="text-right text-sm tabular-nums text-muted-foreground">
                      {share.toFixed(1)}%
                    </TableCell>
                    <TableCell className="max-w-xs py-3">
                      <p className="text-xs text-foreground leading-relaxed whitespace-normal">{sum.line1}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed whitespace-normal mt-1">→ {sum.action}</p>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={`gap-1 font-bold ${sig.color}`}>
                        <Icon className="h-3 w-3" />
                        {sig.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="h-8 w-24 ml-auto">
                        {sparkData.length > 1 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={sparkData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
                              <YAxis hide domain={["dataMin", "dataMax"]} />
                              <Line type="monotone" dataKey="v" stroke={sparkColor} strokeWidth={1.75} dot={false} isAnimationActive={false} />
                            </LineChart>
                          </ResponsiveContainer>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {/* Totals row */}
              <TableRow className="border-t-2 border-primary/40 bg-primary/5 font-bold">
                <TableCell />
                <TableCell className="text-sm font-bold text-foreground">Total</TableCell>
                <TableCell className="text-right text-sm font-bold tabular-nums text-foreground">
                  {format(toDisplay(totals.investment))}
                </TableCell>
                <TableCell className={`text-right text-sm font-bold tabular-nums ${totals.profit >= 0 ? "text-success" : "text-loss"}`}>
                  {format(toDisplay(totals.profit))}
                </TableCell>
                <TableCell className={`text-right text-sm font-bold tabular-nums ${totals.roi >= 0 ? "text-success" : "text-loss"}`}>
                  {totals.roi >= 0 ? "+" : ""}{totals.roi.toFixed(1)}%
                </TableCell>
                <TableCell className="text-right">
                  <Delta cur={totals.profit} prev={totals.prevProfit} />
                </TableCell>
                <TableCell className="text-right text-sm font-bold tabular-nums text-foreground">100.0%</TableCell>
                <TableCell />
                <TableCell />
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* === PORTFOLIO MoM COMPARISON === */}
      {totals.prevProfit !== null && (
        <Card className="border-border/50 bg-card/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-foreground">
              Portfolio Month-over-Month — {prevMonthLabel} → {selectedMonth}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="rounded-md border border-border/50 p-3">
                <p className="text-[10px] uppercase text-muted-foreground">Net Profit</p>
                <p className={`text-lg font-bold ${totals.profit >= 0 ? "text-success" : "text-loss"}`}>{format(toDisplay(totals.profit))}</p>
                <Delta cur={totals.profit} prev={totals.prevProfit} />
              </div>
              <div className="rounded-md border border-border/50 p-3">
                <p className="text-[10px] uppercase text-muted-foreground">Portfolio ROI</p>
                <p className={`text-lg font-bold ${totals.roi >= 0 ? "text-success" : "text-loss"}`}>{totals.roi.toFixed(1)}%</p>
                <Delta cur={totals.roi} prev={totals.prevROI} isPct />
              </div>
              <div className="rounded-md border border-border/50 p-3">
                <p className="text-[10px] uppercase text-muted-foreground">Top Gainer</p>
                <p className="text-sm font-bold text-success">{movers.gainers[0]?.name ?? "—"}</p>
                <p className="text-[10px] text-muted-foreground">{movers.gainers[0] ? `+${format(toDisplay(movers.gainers[0].delta))}` : ""}</p>
              </div>
              <div className="rounded-md border border-border/50 p-3">
                <p className="text-[10px] uppercase text-muted-foreground">Top Decliner</p>
                <p className="text-sm font-bold text-loss">{movers.losers[0]?.name ?? "—"}</p>
                <p className="text-[10px] text-muted-foreground">{movers.losers[0] ? format(toDisplay(movers.losers[0].delta)) : ""}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* === TREND CHART === */}
      {portfolioTrend.length > 1 && (
        <Card className="border-border/50 bg-card/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-foreground">Portfolio Trend — Profit & ROI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={portfolioTrend} margin={{ left: 10, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => format(toDisplay(v))} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `${v.toFixed(0)}%`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", fontSize: 12 }}
                    formatter={(v: number, name: string) => name === "ROI" ? [`${v.toFixed(1)}%`, name] : [format(toDisplay(v)), name]}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar yAxisId="left" dataKey="revenue" name="Revenue" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="left" dataKey="profit" name="Profit" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="roi" name="ROI" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PortfolioInsights;
