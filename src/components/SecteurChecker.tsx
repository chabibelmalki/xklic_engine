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
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[-'\s]+/g, " ")
    .trim();
}

type Status = "idle" | "ok" | "ko";

/**
 * Vérificateur de secteur côté client : l'utilisateur tape sa ville, on confirme
 * instantanément si elle fait partie des communes desservies, sinon on l'invite
 * à nous contacter. Remplace l'ancien lien mort « Vérifier mon secteur ».
 */
export function SecteurChecker({
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
    <div className="mt-6">
      <label htmlFor="secteur" className="mb-2 block text-sm font-medium text-ink-soft">
        Vérifier mon secteur
      </label>
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <input
          id="secteur"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Entrez votre ville…"
          autoComplete="off"
          className="h-12 w-full rounded-full border border-border bg-surface pl-10 pr-4 text-sm text-ink shadow-sm outline-none transition-colors placeholder:text-muted focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
        />
      </div>

      {status === "ok" && (
        <p className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-brand-700">
          <CheckCircle2 className="size-4" />
          Oui, nous intervenons dans votre secteur&nbsp;!
        </p>
      )}
      {status === "ko" && (
        <p className="mt-3 flex items-center gap-2 text-sm text-ink-soft">
          <MapPin className="size-4 text-muted" />
          Hors zone affichée ?{" "}
          <Link
            href={withBase(basePath, contactHref)}
            className="font-semibold text-brand-700 underline-offset-2 hover:underline"
          >
            Écrivez-nous
          </Link>
          , on étudie au cas par cas.
        </p>
      )}
    </div>
  );
}
