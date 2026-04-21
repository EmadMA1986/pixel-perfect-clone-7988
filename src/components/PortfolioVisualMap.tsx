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
          <div className="h-[320px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 30, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="ROI"
                  unit="%"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  label={{ value: "ROI %", position: "insideBottom", offset: -10, fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="P/L"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(v) => format(v)}
                  width={70}
                />
                <ZAxis type="number" dataKey="z" range={[80, 800]} />
                <ReferenceLine x={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" />
                <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 11,
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
                    <Cell key={i} fill={entry.fill} fillOpacity={0.7} stroke={entry.fill} />
                  ))}
                  <LabelList
                    dataKey="short"
                    position="top"
                    style={{ fontSize: 10, fill: "hsl(var(--foreground))", fontWeight: 600 }}
                  />
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
            {/* Quadrant labels overlay */}
            <div className="pointer-events-none absolute inset-0 text-[9px] font-semibold uppercase tracking-wider">
              <span className="absolute top-2 right-2 text-success/70">★ Star</span>
              <span className="absolute top-2 left-12 text-muted-foreground">Overinvested</span>
              <span className="absolute bottom-8 right-2 text-primary/70">Recovering</span>
              <span className="absolute bottom-8 left-12 text-loss/70">Exit Zone</span>
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
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 20, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(v) => `${v}%`}
                />
                <YAxis
                  type="category"
                  dataKey="short"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  width={90}
                />
                <ReferenceLine x={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 11,
                  }}
                  formatter={(value: any, _name: string, item: any) => {
                    const inv = item?.payload?.investment;
                    return [`${value}% · ${format(inv)}`, item?.payload?.name];
                  }}
                />
                <Bar dataKey="roi" radius={[0, 4, 4, 0]}>
                  {barData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                  <LabelList
                    dataKey="label"
                    position="right"
                    style={{ fontSize: 9, fill: "hsl(var(--foreground))" }}
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
          <div className="h-[320px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={2}
                  label={({ payload }) => `${payload.short} ${payload.pct.toFixed(0)}%`}
                  labelLine={false}
                  style={{ fontSize: 10 }}
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
                    fontSize: 11,
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
              <p className="text-lg font-bold font-serif text-foreground">{format(totalInvestment)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PortfolioVisualMap;
