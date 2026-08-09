import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  value,
  label,
  icon: Icon,
  className,
}: {
  value: string | number;
  label: string;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "glass group relative overflow-hidden rounded-xl p-5 transition-all",
        "hover:-translate-y-0.5",
        className,
      )}
      style={{ transitionDuration: "240ms" }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-60"
        style={{ background: "var(--gradient-brand)" }}
      />
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-display text-3xl font-bold text-foreground tabular-nums">{value}</div>
          <div className="mt-1 text-xs tracking-[0.18em] text-muted-foreground uppercase">{label}</div>
        </div>
        {Icon ? <Icon className="h-5 w-5 text-primary" aria-hidden="true" /> : null}
      </div>
    </div>
  );
}
