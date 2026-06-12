"use client";

import { useRouter, usePathname } from "next/navigation";

/**
 * Barre de switch DEV uniquement : un dropdown listant tous les slugs d'exemple
 * pour passer d'un site à l'autre instantanément. Rendue seulement par les
 * routes /preview (jamais en prod).
 */
export function DevSwitcher({
  slugs,
  current,
}: {
  slugs: string[];
  current: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  // Conserve la sous-page (ex. /mentions-legales) en changeant de slug.
  const subPath = pathname.replace(`/preview/${current}`, "") || "";

  return (
    <div className="sticky top-0 z-50 flex items-center gap-3 border-b border-neutral-700 bg-neutral-900 px-4 py-2 text-sm text-neutral-100">
      <span className="font-mono text-xs uppercase tracking-wide text-neutral-400">dev · preview</span>
      <label className="flex items-center gap-2">
        <span className="text-neutral-400">site</span>
        <select
          value={current}
          onChange={(e) => router.push(`/preview/${e.target.value}${subPath}`)}
          className="rounded-md border border-neutral-600 bg-neutral-800 px-2 py-1 font-mono text-neutral-100 outline-none focus:border-neutral-400"
        >
          {slugs.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
      <a
        href={subPath ? `/preview/${current}` : `/preview/${current}/mentions-legales`}
        className="ml-auto text-xs text-neutral-400 underline hover:text-neutral-100"
      >
        {subPath ? "← accueil" : "mentions légales →"}
      </a>
    </div>
  );
}
