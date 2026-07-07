"use client";

import { useMemo, useState } from "react";
import { Search, CheckCircle2, MapPin } from "lucide-react";
import Link from "next/link";
import { withBase } from "@/lib/utils";

/** Normalise pour comparer sans accent/casse/tirets. */
function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[-'\s]+/g, " ")
    .trim();
}

type Status = "idle" | "ok" | "ko";

/**
 * Vérificateur de secteur — variante PRESTIGE (fond sombre). Même logique que le
 * `SecteurChecker` partagé, mais habillé pour le registre nocturne : champ carré
 * à filet métallique, texte clair, or pour la confirmation. Contraste AA.
 */
export function PrestigeSecteurChecker({
  villes,
  basePath,
  contactHref = "/contact",
}: {
  villes: string[];
  basePath?: string;
  contactHref?: string;
}) {
  const [query, setQuery] = useState("");
  const normVilles = useMemo(() => villes.map(norm), [villes]);

  const q = norm(query);
  const status: Status = useMemo(() => {
    if (q.length < 2) return "idle";
    return normVilles.some((v) => v === q || v.startsWith(q) || q.startsWith(v)) ? "ok" : "ko";
  }, [q, normVilles]);

  return (
    <div className="mt-8">
      <label
        htmlFor="secteur"
        className="mb-3 block text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[var(--px-gold)]"
      >
        Vérifier ma commune
      </label>
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/50" />
        <input
          id="secteur"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Entrez votre commune…"
          autoComplete="off"
          className="h-14 w-full border border-[var(--px-line)] bg-white/[0.04] pl-11 pr-4 text-base text-white outline-none transition-colors placeholder:text-white/45 focus:border-[var(--px-gold)]"
        />
      </div>

      {status === "ok" && (
        <p className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--px-gold)]">
          <CheckCircle2 className="size-4" />
          Oui, nous desservons votre commune.
        </p>
      )}
      {status === "ko" && (
        <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[var(--px-ink-soft)]">
          <MapPin className="size-4 text-white/50" />
          Hors des communes listées ?{" "}
          <Link
            href={withBase(basePath, contactHref)}
            className="font-semibold text-white underline underline-offset-4 hover:text-[var(--px-gold)]"
          >
            Appelez-nous
          </Link>
          , nous desservons tout l’Hérault.
        </p>
      )}
    </div>
  );
}
