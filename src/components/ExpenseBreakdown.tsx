import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { expenses, formatCurrency } from "@/data/goldData";

const ExpenseBreakdown = () => {
  const grouped = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  const data = Object.entries(grouped)
    .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
    .sort((a, b) => b.value - a.value);

  const colors = [
    "hsl(43, 74%, 52%)",
    "hsl(43, 60%, 40%)",
    "hsl(200, 50%, 45%)",
    "hsl(160, 50%, 40%)",
    "hsl(280, 40%, 50%)",
    "hsl(20, 60%, 50%)",
    "hsl(43, 40%, 30%)",
    "hsl(0, 50%, 50%)",
  ];

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-serif text-foreground">Expense Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row items-center gap-4">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={colors[i % colors.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(220 16% 11%)",
                  border: "1px solid hsl(220 14% 18%)",
                  borderRadius: "8px",
                  color: "hsl(40 20% 90%)",
                  fontSize: 12,
                }}
                formatter={(value: number) => [formatCurrency(value), ""]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 w-full lg:w-auto">
            {data.map((item, i) => (
              <div key={item.name} className="flex items-center gap-2 text-xs">
                <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: colors[i % colors.length] }} />
                <span className="text-muted-foreground whitespace-nowrap">{item.name}</span>
                <span className="ml-auto tabular-nums text-foreground font-medium">{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExpenseBreakdown;
