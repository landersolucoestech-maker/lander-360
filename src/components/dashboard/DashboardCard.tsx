import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn, capPercentage } from "@/lib/utils";

interface DashboardCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function DashboardCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
}: DashboardCardProps) {
  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-lg border-border/50 hover:border-primary/20 group",
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-4 pb-2">
        <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground line-clamp-1">
          {title}
        </CardTitle>
        {Icon && (
          <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
        )}
      </CardHeader>
      <CardContent className="p-3 sm:p-4 pt-0">
        <div className="text-lg sm:text-2xl font-bold text-foreground">
          {value}
        </div>
        {(description || trend) && (
          <div className="flex items-center justify-between mt-1 sm:mt-2 gap-1">
            {description && (
              <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1">
                {description}
              </p>
            )}
            {trend && (
              <p className={cn(
                "text-[10px] sm:text-xs font-medium flex-shrink-0",
                trend.isPositive ? "text-success" : "text-destructive"
              )}>
                {trend.isPositive ? "+" : ""}{capPercentage(trend.value)}%
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}