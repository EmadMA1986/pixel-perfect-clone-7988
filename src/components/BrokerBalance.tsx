import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { brokerBalances, formatCurrency } from "@/data/goldData";

const BrokerBalance = () => {
  const brokers = [
    { name: "Broker PY", usd: brokerBalances.brokerPY.usd, aed: brokerBalances.brokerPY.aed },
    { name: "Broker ZHOU", usd: brokerBalances.brokerZHOU.usd, aed: brokerBalances.brokerZHOU.aed },
  ];

  const totalUSD = brokers.reduce((s, b) => s + b.usd, 0);
  const totalAED = brokers.reduce((s, b) => s + b.aed, 0);

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-serif text-foreground">Broker Balances</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {brokers.map((b) => (
          <div key={b.name} className="flex items-center justify-between py-2 px-3 rounded-md bg-secondary/30">
            <span className="text-sm font-medium text-foreground">{b.name}</span>
            <div className="text-right">
              <p className="text-sm tabular-nums font-semibold text-foreground">{formatCurrency(b.usd)}</p>
              {b.aed > 0 && (
                <p className="text-xs tabular-nums text-muted-foreground">{formatCurrency(b.aed, "AED")}</p>
              )}
            </div>
          </div>
        ))}
        <div className="flex items-center justify-between py-2 px-3 rounded-md bg-primary/10 border border-primary/20">
          <span className="text-sm font-serif font-semibold text-primary">Total</span>
          <div className="text-right">
            <p className="text-sm tabular-nums font-bold text-primary">{formatCurrency(totalUSD)}</p>
            {totalAED > 0 && (
              <p className="text-xs tabular-nums text-primary/70">{formatCurrency(totalAED, "AED")}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BrokerBalance;
