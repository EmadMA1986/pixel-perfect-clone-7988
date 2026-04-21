import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  LabelList,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { Sparkles, BarChart3, PieChart as PieIcon } from "lucide-react";

export interface VisualCompany {
  name: string;
  short: string;
  investment: number; // AED display
  profit: number; // AED display
  roi: number; // percent
}

interface Props {
  companies: VisualCompany[];
  totalInvestment: number;
  format: (v: number) => string; // formatter for AED-display values
}

const POSITIVE = "hsl(var(--success))";
const NEGATIVE = "hsl(var(--loss))";

const PortfolioVisualMap = ({ companies, totalInvestment, format }: Props) => {
  // ---- Bubble (scatter) data ----
  const bubbleData = companies.map(c => ({
    name: c.name,
    short: c.short,
    x: parseFloat(c.roi.toFixed(2)),
    y: c.profit,
    z: Math.max(Math.abs(c.investment), 1),
    fill: c.roi >= 0 ? POSITIVE : NEGATIVE,
  }));

  // ---- Bar chart (sorted by ROI desc) ----
  const barData = [...companies]
    .sort((a, b) => b.roi - a.roi)
    .map(c => ({
      name: c.name,
      short: c.short,
      roi: parseFloat(c.roi.toFixed(2)),
      investment: c.investment,
      label: `${c.short} · ${c.roi >= 0 ? "+" : ""}${c.roi.toFixed(1)}% · ${format(c.investment)}`,
      fill: c.roi >= 0 ? POSITIVE : NEGATIVE,
    }));

  // ---- Donut chart ----
  const totalAbs = companies.reduce((s, c) => s + Math.abs(c.investment), 0);
  const donutData = companies.map(c => ({
    name: c.name,
    short: c.short,
    value: Math.abs(c.investment),
    pct: totalAbs > 0 ? (Math.abs(c.investment) / totalAbs) * 100 : 0,
    fill: c.roi >= 0 ? POSITIVE : NEGATIVE,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* LEFT — Bubble Chart */}
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Capital Efficiency Map
          </CardTitle>
          <p className="text-[10px] text-muted-foreground">
            ROI vs Profit/Loss · bubble = investment
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-[440px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 30, right: 30, bottom: 40, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="ROI"
                  unit="%"
                  domain={["dataMin - 5", "dataMax + 5"]}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  label={{ value: "ROI %", position: "insideBottom", offset: -10, fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="P/L"
                  domain={["dataMin", "dataMax"]}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(v) => format(v)}
                  width={75}
                />
                <ZAxis type="number" dataKey="z" range={[400, 2400]} />
                <ReferenceLine x={0} stroke="hsl(var(--primary))" strokeDasharray="4 4" strokeOpacity={0.6} />
                <ReferenceLine y={0} stroke="hsl(var(--primary))" strokeDasharray="4 4" strokeOpacity={0.6} />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(value: any, name: string) => {
                    if (name === "P/L") return [format(value), "P/L"];
                    if (name === "ROI") return [`${value}%`, "ROI"];
                    if (name === "Investment") return [format(value), "Investment"];
                    return [value, name];
                  }}
                  labelFormatter={() => ""}
                />
                <Scatter data={bubbleData}>
                  {bubbleData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} fillOpacity={0.55} stroke={entry.fill} strokeWidth={2} />
                  ))}
                  <LabelList
                    dataKey="short"
                    position="top"
                    offset={12}
                    content={(props: any) => {
                      const { x, y, value } = props;
                      if (x == null || y == null) return null;
                      const text = String(value ?? "");
                      const w = Math.max(36, text.length * 6.5);
                      return (
                        <g>
                          <rect
                            x={x - w / 2}
                            y={y - 22}
                            width={w}
                            height={16}
                            rx={4}
                            fill="hsl(var(--background))"
                            fillOpacity={0.92}
                            stroke="hsl(var(--border))"
                          />
                          <text
                            x={x}
                            y={y - 10}
                            textAnchor="middle"
                            fontSize={11}
                            fontWeight={600}
                            fill="hsl(var(--foreground))"
                          >
                            {text}
                          </text>
                        </g>
                      );
                    }}
                  />
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
            {/* Quadrant labels overlay */}
            <div className="pointer-events-none absolute inset-0 text-[11px] font-semibold uppercase tracking-wider">
              <span className="absolute top-3 right-4 px-2 py-0.5 rounded bg-success/15 text-success border border-success/30">⭐ Star</span>
              <span className="absolute top-3 left-20 px-2 py-0.5 rounded bg-muted/40 text-muted-foreground border border-border">Overinvested</span>
              <span className="absolute bottom-12 right-4 px-2 py-0.5 rounded bg-primary/15 text-primary border border-primary/30">Recovering</span>
              <span className="absolute bottom-12 left-20 px-2 py-0.5 rounded bg-loss/15 text-loss border border-loss/30">🚨 Exit Zone</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* MIDDLE — Horizontal Bar Chart */}
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            ROI Ranking
          </CardTitle>
          <p className="text-[10px] text-muted-foreground">Highest to lowest return on invested capital</p>
        </CardHeader>
        <CardContent>
          <div className="h-[440px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical" margin={{ top: 10, right: 130, bottom: 25, left: 30 }} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(v) => `${v}%`}
                />
                <YAxis
                  type="category"
                  dataKey="short"
                  tick={{ fontSize: 12, fill: "hsl(var(--foreground))", fontWeight: 600 }}
                  width={110}
                />
                <ReferenceLine x={0} stroke="hsl(var(--primary))" strokeDasharray="6 4" strokeWidth={2} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(value: any, _name: string, item: any) => {
                    const inv = item?.payload?.investment;
                    return [`${value}% · ${format(inv)}`, item?.payload?.name];
                  }}
                />
                <Bar dataKey="roi" radius={[0, 4, 4, 0]} barSize={28}>
                  {barData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                  <LabelList
                    dataKey="label"
                    position="right"
                    style={{ fontSize: 10, fill: "hsl(var(--foreground))", fontWeight: 500 }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* RIGHT — Donut Chart */}
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <PieIcon className="h-4 w-4 text-primary" />
            Capital Allocation
          </CardTitle>
          <p className="text-[10px] text-muted-foreground">Total invested = {format(totalInvestment)}</p>
        </CardHeader>
        <CardContent>
          <div className="h-[440px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                <Pie
                  data={donutData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={85}
                  outerRadius={140}
                  paddingAngle={2}
                  label={({ payload }) => `${payload.short} ${payload.pct.toFixed(0)}%`}
                  labelLine={{ stroke: "hsl(var(--muted-foreground))", strokeWidth: 1 }}
                  style={{ fontSize: 11, fontWeight: 600, fill: "hsl(var(--foreground))" }}
                >
                  {donutData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} fillOpacity={0.85} stroke="hsl(var(--card))" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(value: any, _name: string, item: any) => [
                    `${format(value)} · ${item?.payload?.pct.toFixed(1)}%`,
                    item?.payload?.name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total</p>
              <p className="text-2xl font-extrabold font-serif text-primary">{format(totalInvestment)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PortfolioVisualMap;
