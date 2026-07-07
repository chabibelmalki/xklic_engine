import { cn } from "@/lib/utils";

export function Container({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-[var(--content-max)] px-5 sm:px-8", className)}>
      {children}
    </div>
  );
}
