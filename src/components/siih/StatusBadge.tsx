import { cn } from "@/lib/utils";

const TONES: Record<string, string> = {
  verified: "border-success/50 bg-success/10 text-success",
  active: "border-primary/50 bg-primary/10 text-primary",
  submitted: "border-primary/50 bg-primary/10 text-primary",
  pending: "border-warning/50 bg-warning/10 text-warning",
  payment_pending: "border-warning/50 bg-warning/10 text-warning",
  under_review: "border-warning/50 bg-warning/10 text-warning",
  payment_verification: "border-warning/50 bg-warning/10 text-warning",
  rejected: "border-destructive/50 bg-destructive/10 text-destructive",
  cancelled: "border-destructive/50 bg-destructive/10 text-destructive",
  suspended: "border-destructive/50 bg-destructive/10 text-destructive",
  draft: "border-border bg-muted/40 text-muted-foreground",
  closed: "border-border bg-muted/40 text-muted-foreground",
  archived: "border-border bg-muted/40 text-muted-foreground",
  scheduled: "border-cyan/50 bg-cyan/10 text-cyan",
  urgent: "border-destructive/60 bg-destructive/15 text-destructive",
  important: "border-warning/60 bg-warning/15 text-warning",
  normal: "border-border bg-muted/40 text-muted-foreground",
};

export function StatusBadge({ status, className }: { status?: string | null; className?: string }) {
  const key = (status ?? "draft").toLowerCase();
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wider uppercase",
        TONES[key] ?? TONES["draft"],
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {key.replace(/_/g, " ")}
    </span>
  );
}
