import { useState, type ReactNode } from "react";
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export type MetricKind = "currency" | "number" | "percent" | "ratio" | "decimal";
// Direction = which way is "good" for this metric
export type GoodDirection = "up" | "down";
// Compare = how to express the delta
export type DeltaMode = "percent" | "absolute";

export interface ExecMetricRow {
  label: string;
  current: number | null;
  previous: number | null;
  kind: MetricKind;
  goodDirection: GoodDirection;
  deltaMode?: DeltaMode; // default: "percent"
  unit?: string; // e.g. "USDT", "days"
  decimals?: number; // override default decimals
}

export interface MonthlyExecutiveSummaryProps {
  currentLabel: string;
  previousLabel: string | null;
  rows: ExecMetricRow[];
  narrative: ReactNode;
  improved: string[];
  deteriorated: string[];
  watch: string[];
}

const fmtValue = (v: number | null, kind: MetricKind, unit?: string, decimals?: number): string => {
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  const d = decimals ?? (kind === "percent" ? 2 : kind === "ratio" || kind === "decimal" ? 2 : 0);
  switch (kind) {
    case "currency": {
      const prefix = v < 0 ? "-AED " : "AED ";
      return `${prefix}${Math.abs(v).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d })}`;
    }
    case "percent":
      return `${v.toFixed(d)}%`;
    case "ratio":
      return `${v.toFixed(d)}x`;
    case "number":
      return `${Math.round(v).toLocaleString("en-US")}${unit ? ` ${unit}` : ""}`;
    case "decimal":
    default:
      return `${v.toFixed(d)}${unit ? ` ${unit}` : ""}`;
  }
};

const computeDelta = (row: ExecMetricRow): { text: string; isGood: boolean | null; raw: number | null } => {
  if (row.current === null || row.previous === null) return { text: "—", isGood: null, raw: null };
  const mode = row.deltaMode ?? "percent";
  if (mode === "absolute") {
    const diff = row.current - row.previous;
    const sign = diff > 0 ? "+" : "";
    const text = `${sign}${diff.toFixed(row.kind === "percent" ? 2 : 0)}${row.unit && row.kind === "number" ? ` ${row.unit}` : row.kind === "percent" ? " pp" : ""}`;
    if (diff === 0) return { text: "—", isGood: null, raw: 0 };
    const isGood = row.goodDirection === "up" ? diff > 0 : diff < 0;
    return { text, isGood, raw: diff };
  }
  if (row.previous === 0) return { text: "n/a", isGood: null, raw: null };
  const pct = ((row.current - row.previous) / Math.abs(row.previous)) * 100;
  const sign = pct > 0 ? "+" : "";
  const text = `${sign}${pct.toFixed(1)}%`;
  if (pct === 0) return { text: "0.0%", isGood: null, raw: 0 };
  const isGood = row.goodDirection === "up" ? pct > 0 : pct < 0;
  return { text, isGood, raw: pct };
};

const MonthlyExecutiveSummary = ({
  currentLabel,
  previousLabel,
  rows,
  narrative,
  improved,
  deteriorated,
  watch,
}: MonthlyExecutiveSummaryProps) => {
  const [open, setOpen] = useState(true);

  if (!previousLabel) {
    return null;
  }

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-serif font-semibold uppercase tracking-wider text-foreground">
            Monthly Executive Summary — {currentLabel} vs {previousLabel}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Collapse summary" : "Expand summary"}
            className="h-8 px-2 text-xs"
          >
            {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            <span className="ml-1">{open ? "Collapse" : "Expand"}</span>
          </Button>
        </div>

        {open && (
          <>
            {/* Comparison Table */}
            <div className="rounded-lg border border-border/40 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="text-[10px] uppercase tracking-wider">Metric</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-right">{previousLabel}</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-right">{currentLabel}</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-right">Change</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-center">Signal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row, i) => {
                    const delta = computeDelta(row);
                    const deltaClass =
                      delta.isGood === true
                        ? "text-success"
                        : delta.isGood === false
                        ? "text-loss"
                        : "text-muted-foreground";
                    const signal =
                      delta.isGood === true ? "🟢" : delta.isGood === false ? "🔴" : "—";
                    return (
                      <TableRow key={i} className="hover:bg-muted/20">
                        <TableCell className="text-xs font-medium text-foreground">{row.label}</TableCell>
                        <TableCell className="text-xs text-right tabular-nums text-muted-foreground">
                          {fmtValue(row.previous, row.kind, row.unit, row.decimals)}
                        </TableCell>
                        <TableCell className="text-xs text-right tabular-nums text-foreground">
                          {fmtValue(row.current, row.kind, row.unit, row.decimals)}
                        </TableCell>
                        <TableCell className={`text-xs text-right tabular-nums font-semibold ${deltaClass}`}>
                          {delta.text}
                        </TableCell>
                        <TableCell className="text-center text-sm">{signal}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Narrative */}
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
              <p className="text-xs leading-relaxed text-muted-foreground">{narrative}</p>
            </div>

            {/* Signal cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-lg border border-border/40 border-l-4 border-l-success bg-card/60 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-success" />
                  <p className="text-xs font-semibold uppercase tracking-wider text-success">
                    Improved vs Last Month
                  </p>
                </div>
                {improved.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">No improvements recorded.</p>
                ) : (
                  <ul className="text-xs text-foreground space-y-1 list-disc list-inside">
                    {improved.map((t, i) => <li key={i}>{t}</li>)}
                  </ul>
                )}
              </div>
              <div className="rounded-lg border border-border/40 border-l-4 border-l-loss bg-card/60 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="h-4 w-4 text-loss" />
                  <p className="text-xs font-semibold uppercase tracking-wider text-loss">
                    Deteriorated vs Last Month
                  </p>
                </div>
                {deteriorated.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">No deteriorations recorded.</p>
                ) : (
                  <ul className="text-xs text-foreground space-y-1 list-disc list-inside">
                    {deteriorated.map((t, i) => <li key={i}>{t}</li>)}
                  </ul>
                )}
              </div>
              <div className="rounded-lg border border-border/40 border-l-4 border-l-amber-500 bg-card/60 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <p className="text-xs font-semibold uppercase tracking-wider text-amber-500">
                    Watch Next Month
                  </p>
                </div>
                {watch.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">No flagged risks.</p>
                ) : (
                  <ul className="text-xs text-foreground space-y-1 list-disc list-inside">
                    {watch.map((t, i) => <li key={i}>{t}</li>)}
                  </ul>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default MonthlyExecutiveSummary;
