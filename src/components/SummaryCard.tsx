import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface SummaryCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
}

const SummaryCard = ({ title, value, subtitle, icon: Icon, trend }: SummaryCardProps) => {
  return (
    <Card className="relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
      <CardContent className="p-5 relative">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium tracking-wider uppercase text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold font-serif text-foreground">{value}</p>
            {subtitle && (
              <p className={`text-xs font-medium ${
                trend === "up" ? "text-success" : trend === "down" ? "text-loss" : "text-muted-foreground"
              }`}>
                {subtitle}
              </p>
            )}
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SummaryCard;
