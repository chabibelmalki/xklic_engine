import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const button = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none whitespace-nowrap",
  {
    variants: {
      variant: {
        primary:
          "bg-brand-600 text-brand-contrast shadow-lg shadow-brand-600/25 hover:bg-brand-700 hover:shadow-xl hover:shadow-brand-600/30 hover:-translate-y-0.5",
        accent:
          "bg-accent-500 text-accent-contrast shadow-lg shadow-accent-500/25 hover:bg-accent-600 hover:-translate-y-0.5",
        outline:
          "border-2 border-brand-200 text-brand-800 bg-surface hover:border-brand-300 hover:bg-brand-50",
        ghost: "text-brand-800 hover:bg-brand-50",
        white:
          "bg-white text-brand-800 shadow-lg hover:bg-brand-50 hover:-translate-y-0.5",
        whatsapp:
          "bg-[#25D366] text-white shadow-lg shadow-green-600/25 hover:bg-[#1ebe5b] hover:-translate-y-0.5",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-6 text-sm",
        lg: "h-14 px-8 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export type ButtonProps = VariantProps<typeof button> &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "color"> &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color"> & {
    href?: string;
  };

export function Button({ variant, size, className, href, ...rest }: ButtonProps) {
  const classes = cn(button({ variant, size }), className);

  if (href) {
    const isExternal = /^(https?:|tel:|mailto:|#)/.test(href);
    if (isExternal) {
      const externalProps = href.startsWith("http")
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {};
      return <a href={href} className={classes} {...externalProps} {...rest} />;
    }
    return <Link href={href} className={classes} {...rest} />;
  }
  return <button className={classes} {...rest} />;
}
