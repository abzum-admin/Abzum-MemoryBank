import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  accent?: boolean;
  className?: string;
}

export function StatCard({
  label,
  value,
  icon,
  trend,
  trendUp,
  accent,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-elevated p-5 shadow-card transition-all duration-200 hover:border-border-strong hover:shadow-lg",
        accent && "border-accent/20 bg-accent-muted/20",
        className
      )}
    >
      {/* Background glow for accent cards */}
      {accent && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/8 to-transparent" />
      )}

      <div className="flex items-start justify-between">
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg",
            accent
              ? "bg-accent/20 text-accent"
              : "bg-surface text-text-secondary"
          )}
        >
          {icon}
        </div>

        {trend && (
          <span
            className={cn(
              "text-xs font-medium",
              trendUp ? "text-status-success" : "text-status-error"
            )}
          >
            {trendUp ? "↑" : "↓"} {trend}
          </span>
        )}
      </div>

      <div className="mt-4">
        <p className="text-2xl font-semibold tabular-nums text-text-primary">{value}</p>
        <p className="mt-0.5 text-xs text-text-muted">{label}</p>
      </div>
    </div>
  );
}
