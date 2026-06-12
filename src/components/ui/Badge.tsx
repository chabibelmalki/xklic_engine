import { cn } from "@/lib/utils";

export function Badge({
  children,
  className,
  variant = "brand",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "brand" | "accent" | "neutral";
}) {
  const variants = {
    brand: "bg-brand-50 text-brand-700 ring-brand-200",
    accent: "bg-accent-50 text-accent-600 ring-accent-500/30",
    neutral: "bg-surface-2 text-muted ring-border",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
