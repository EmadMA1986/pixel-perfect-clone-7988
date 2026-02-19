import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { profitLoss, formatCurrency } from "@/data/goldData";

const ProfitLossCard = () => {
  const items = [
    { label: "Sales Revenue", value: profitLoss.sales, indent: false },
    { label: "Sales Discount", value: -profitLoss.salesDiscount, indent: true },
    { label: "Cost of Sales", value: -profitLoss.costOfSales, indent: true },
    { label: "Melting Loss", value: -profitLoss.meltingLoss, indent: true },
    { label: "Hedge Expenses", value: -profitLoss.hedgeExpenses, indent: true },
    { label: "Gross Profit", value: profitLoss.grossProfit, indent: false, highlight: true },
    { label: "Transport", value: -profitLoss.transport, indent: true },
    { label: "Labor", value: -profitLoss.labor, indent: true },
    { label: "Hotel", value: -profitLoss.hotel, indent: true },
    { label: "Bonus", value: -profitLoss.bonus, indent: true },
    { label: "Tax + Bonus", value: -profitLoss.taxBonus, indent: true },
    { label: "Other Expenses", value: -profitLoss.otherExp, indent: true },
    { label: "Operating Profit", value: profitLoss.operatingProfit, indent: false, highlight: true },
    { label: "Fx Gain", value: profitLoss.fxGain, indent: true },
    { label: "Fx Loss", value: -profitLoss.fxLoss, indent: true },
    { label: "Net Profit", value: profitLoss.netProfit, indent: false, highlight: true, gold: true },
  ];

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-serif text-foreground">Profit & Loss</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1.5">
        {items.map((item, i) => (
          <div
            key={i}
            className={`flex items-center justify-between py-1.5 px-2 rounded-md text-sm ${
              item.highlight ? "bg-secondary/50 font-semibold" : ""
            } ${item.gold ? "bg-primary/10 border border-primary/20" : ""} ${
              item.indent ? "pl-6" : ""
            }`}
          >
            <span className={`${item.highlight ? "text-foreground" : "text-muted-foreground"} ${item.gold ? "text-primary font-serif text-base" : ""}`}>
              {item.label}
            </span>
            <span className={`tabular-nums ${
              item.gold ? "text-primary font-serif text-base" : 
              item.value >= 0 ? "text-foreground" : "text-loss"
            }`}>
              {formatCurrency(Math.abs(item.value))}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ProfitLossCard;
