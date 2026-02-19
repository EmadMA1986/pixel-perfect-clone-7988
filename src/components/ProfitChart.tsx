import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { sales } from "@/data/goldData";

const ProfitChart = () => {
  const data = sales.map((s) => ({
    name: s.date,
    profit: Math.round(s.profitUSD),
    customer: s.customer,
  }));

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-serif text-foreground">Profit by Sale</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 5, right: 5, bottom: 20, left: 5 }}>
            <XAxis
              dataKey="name"
              tick={{ fill: "hsl(220 10% 50%)", fontSize: 10 }}
              angle={-45}
              textAnchor="end"
              axisLine={{ stroke: "hsl(220 14% 18%)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "hsl(220 10% 50%)", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(220 16% 11%)",
                border: "1px solid hsl(220 14% 18%)",
                borderRadius: "8px",
                color: "hsl(40 20% 90%)",
                fontSize: 12,
              }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, "Profit"]}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Bar dataKey="profit" radius={[4, 4, 0, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={`hsl(43 74% ${42 + (i % 4) * 5}%)`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ProfitChart;
