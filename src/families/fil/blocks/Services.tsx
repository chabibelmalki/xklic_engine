import Link from "next/link";
import Image from "next/image";
import type { ServicesContent, ServiceItem } from "@/types/config";
import type { BlockComponentProps } from "@/blocks/types";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { cn, withBase } from "@/lib/utils";
import { FilSection } from "../ui/Section";
import { FilContainer } from "../ui/Container";
import { FilHeading } from "../ui/Heading";

/**
 * SERVICES fil — des ÉCHANTILLONS ÉPINGLÉS : chaque prestation est une carte
 * « échantillon de tissu » (épingle en tête, liseré cousu pointillé, ombre
 * douce) qui se soulève au survol. Grille 1/2/3 colonnes selon le nombre.
 * Couleurs 100 % tokens.
 */
function Carte({ item, basePath, neutralPhoto }: { item: ServiceItem; basePath: string; neutralPhoto?: boolean }) {
  const inner = (
    <>
      {/* Épingle. */}
      <span
        aria-hidden
        className="absolute -top-[7px] left-1/2 z-10 size-3.5 -translate-x-1/2 rounded-full border-[2.5px] border-bg bg-brand-600 shadow-sm"
      />
      {/* Liseré cousu. */}
      <span aria-hidden className="fil-seam absolute left-8 right-8 top-0 z-10 h-px text-accent-500/80" />
      {/* Photo « échantillon » : re-teintée par un voile de marque (cohérence
          duotone avec le hero), remplace l'icône quand elle existe.
          `neutralPhoto` retire la teinte (photo neutre en niveaux de gris). */}
      {item.image && (
        <div className="relative -mx-7 -mt-7 mb-6 h-44 overflow-hidden rounded-t-[var(--radius-card)]">
          <Image
            src={item.image.url}
            alt={item.image.alt ?? item.nom}
            fill
            sizes="(max-width: 640px) 100vw, 400px"
            className="object-cover"
            style={{ filter: neutralPhoto ? undefined : "saturate(0.6)" }}
          />
          {!neutralPhoto && (
            <span aria-hidden className="absolute inset-0 bg-brand-600 opacity-40 mix-blend-color" />
          )}
          <span aria-hidden className="fil-seam absolute inset-x-0 bottom-0 h-px text-accent-500/80" />
        </div>
      )}
      <div className="flex items-start justify-between gap-3">
        {!item.image && (
          <span className="grid size-11 shrink-0 place-items-center rounded-[var(--radius)] bg-brand-50 text-brand-700">
            <Icon name={item.icone} className="size-5" />
          </span>
        )}
        {item.badge && (
          <span className="ml-auto rounded-full bg-accent-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-accent-600">
            {item.badge}
          </span>
        )}
      </div>
      <h3
        className={cn(
          "font-display text-xl text-ink sm:text-[1.35rem]",
          item.image && !item.badge ? "mt-0" : "mt-5",
        )}
      >
        {item.nom}
      </h3>
      {item.description && (
        <p className="mt-2.5 text-sm leading-relaxed text-muted">{item.description}</p>
      )}
      {(item.priceHint || item.href) && (
        <div className="mt-5 flex items-center justify-between gap-3 border-t border-brand-100/80 pt-4">
          {item.priceHint ? (
            <span className="text-sm font-semibold text-brand-700">{item.priceHint}</span>
          ) : (
            <span />
          )}
          {item.href && (
            <span
              aria-hidden
              className="inline-flex text-brand-700 transition-transform duration-300 group-hover:translate-x-1"
            >
              <Icon name="ArrowRight" className="size-4" />
            </span>
          )}
        </div>
      )}
    </>
  );
  const classes =
    "group relative flex flex-col rounded-[var(--radius-card)] border border-brand-100 bg-surface p-7 shadow-[var(--shadow-card)] transition-all duration-300";
  return item.href ? (
    <Link href={withBase(basePath, item.href)} className={cn(classes, "hover:-translate-y-1.5 hover:shadow-[var(--shadow-pop)]")}>
      {inner}
    </Link>
  ) : (
    <div className={classes}>{inner}</div>
  );
}

export function Services({ block, tone, basePath = "" }: BlockComponentProps<ServicesContent>) {
  const c = block.content;
  const cols =
    c.items.length <= 2
      ? "sm:grid-cols-2"
      : c.items.length === 3
        ? "sm:grid-cols-2 lg:grid-cols-3"
        : "sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4";
  return (
    <FilSection id="services" tone={tone}>
      <FilContainer wide>
        <FilHeading kicker={c.eyebrow ?? "Savoir-faire"} title={c.titre ?? "Nos prestations"} lede={c.intro} />
        <div className={cn("mt-14 grid grid-cols-1 gap-7", cols)}>
          {c.items.map((item) => (
            <Carte key={item.nom} item={item} basePath={basePath} neutralPhoto={c.neutralPhoto} />
          ))}
        </div>
        {c.cta && (
          <div className="mt-12 text-center">
            <Button href={withBase(basePath, c.cta.href)} variant="outline" size="lg">
              {c.cta.label}
            </Button>
          </div>
        )}
      </FilContainer>
    </FilSection>
  );
}
