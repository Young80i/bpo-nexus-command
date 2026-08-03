import * as React from "react";
import { Card } from "@/components/ui/card";

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  status?: string;
  tone?: string;
  className?: string;
}

const MetricCard = React.forwardRef<HTMLDivElement, MetricCardProps>(
  ({ title, value, description, status, tone = "text-primary", className, ...props }, ref) => {
    return (
      <Card 
        ref={ref} 
        className={`surface-card lift p-4 ${className || ""}`} 
        {...props}
      >
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-xs font-medium text-muted-foreground">{title}</p>
          <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${tone} text-primary-foreground`}>
            {/* Icon placeholder - can be customized via tone prop */}
          </div>
        </div>
        <p className="mt-3 font-display text-2xl font-bold tracking-tight">{value}</p>
        {description && (
          <p className="mt-1 truncate text-[0.72rem] text-muted-foreground">{description}</p>
        )}
        {status && (
          <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[0.7rem] font-semibold ${
            status === "Ready" ? "bg-success/12 text-success" :
            status === "In Progress" ? "bg-primary/12 text-primary" :
            status === "High" ? "bg-destructive/12 text-destructive" :
            status === "Medium" ? "bg-warning/15 text-warning" :
            "bg-muted/10 text-muted-foreground"
          }`}>
            {status}
          </span>
        )}
      </Card>
    );
  }
);

MetricCard.displayName = "MetricCard";

export { MetricCard };