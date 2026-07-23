import { cn } from "@/lib/utils";

/**
 * PRIMITIVES de la famille VERRIÈRE — le vocabulaire de l'ART NOUVEAU nancéien
 * (École de Nancy : Gallé, Majorelle, Daum).
 *
 * Parti pris : la page est une VERRIÈRE. Chaque bloc est un PANNEAU DE VITRAIL à
 * sommet CINTRÉ (`.verriere-arc`), serti d'un plomb et d'un filet de laiton
 * (`.verriere-plomb`), rempli d'un lavis de verre (`.verriere-verre`). Le rythme
 * vient de trois motifs conducteurs :
 *   - le COUP DE FOUET (`CoupDeFouet`), la courbe-signature Art nouveau, qui se
 *     TRACE au scroll en CSS natif (aucun JS, cf. `.verriere-trace`) ;
 *   - l'OMBELLE (`Ombelle`), l'ombelle végétale de Gallé, en puce de kicker et
 *     en filigrane ;
 *   - la FERRONNERIE (`Ferronnerie`), la volute de garde-corps de Majorelle,
 *     posée aux angles des panneaux profonds.
 *
 * Volontairement DISTINCT d'azulejo (losanges droits, céramique plate), de fil
 * (couture, photo duotone), d'aronde (bois, angles nets), de cascade (dégradés
 * hydro) : ici tout est COURBE, végétal et serti. 100 % tokens (la matière
 * `--vn-*` dérive de la palette du site), zéro couleur en dur, zéro JS.
 */

/**
 * COUP DE FOUET — la ligne « whiplash », signature formelle de l'Art nouveau :
 * une courbe qui prend de l'élan, se retourne et s'achève en volute. Sert de
 * filet sous les titres et de séparation dans le chrome, à la place d'un trait
 * droit. La longueur du chemin est CONSTANTE (viewBox fixe) : c'est ce qui
 * permet au pack de piloter le tracé au scroll avec un `--vn-trace` unique.
 */
export function CoupDeFouet({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 240 32"
      fill="none"
      className={cn("h-6 w-56", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        className="verriere-trace"
        d="M2 22C40 22 52 6 92 10c36 4 40 17 68 16 26-1 30-14 46-14 12 0 16 8 10 12-5 3-11 0-8-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * OMBELLE — l'ombelle végétale (tige + rayons terminés de fleurons), motif de
 * prédilection de Gallé. Puce du kicker et filigrane des panneaux. Décor pur :
 * la couleur vient du `text-*` de l'appelant (`currentColor`).
 */
export function Ombelle({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      className={cn("size-4", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 23v-9m0 0L5.5 7.5M12 14 12 4m0 10 6.5-6.5M12 14 8 5.5M12 14l4-8.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="5.5" cy="7" r="1.5" fill="currentColor" />
      <circle cx="12" cy="3.4" r="1.5" fill="currentColor" />
      <circle cx="18.5" cy="7" r="1.5" fill="currentColor" />
      <circle cx="7.8" cy="4.9" r="1.1" fill="currentColor" />
      <circle cx="16.2" cy="4.9" r="1.1" fill="currentColor" />
    </svg>
  );
}

/**
 * FERRONNERIE — la volute de garde-corps forgé (Majorelle), posée dans l'angle
 * d'un panneau profond. `corner` oriente la volute vers l'un des quatre coins.
 */
export function Ferronnerie({
  corner = "tl",
  className,
}: {
  corner?: "tl" | "tr" | "bl" | "br";
  className?: string;
}) {
  const flip = {
    tl: "",
    tr: "-scale-x-100",
    bl: "-scale-y-100",
    br: "-scale-100",
  }[corner];
  return (
    <svg
      aria-hidden
      viewBox="0 0 72 72"
      fill="none"
      className={cn("size-20", flip, className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 4v26c0 16 11 27 27 27 9 0 15-6 15-13s-5-12-12-12c-5 0-9 3-9 8 0 4 3 6 6 6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M4 4h26c16 0 27 11 27 27 0 9-6 15-13 15"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="30" cy="30" r="2.2" fill="currentColor" />
    </svg>
  );
}

/**
 * KICKER — ombelle + libellé en capitales espacées, souligné d'un filet de
 * laiton. Distinct de la pilule de classic, du carreau d'azulejo, du volet
 * split-flap d'escale.
 */
export function VerriereKicker({
  children,
  onDark = false,
  className,
}: {
  children: React.ReactNode;
  onDark?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2.5 border-b pb-2 text-[0.7rem] font-semibold uppercase tracking-[0.22em]",
        onDark
          ? "border-white/25 text-white/85"
          : "border-accent-500/45 text-brand-700",
        className,
      )}
    >
      <Ombelle className={cn("size-4 shrink-0", onDark ? "text-white/70" : "text-accent-600")} />
      {children}
    </span>
  );
}

/**
 * En-tête de section VERRIÈRE — kicker à ombelle, titre en display Art nouveau,
 * puis le COUP DE FOUET qui se trace au scroll. Le lede vient après la courbe :
 * la courbe fait office de respiration, pas de simple ornement.
 */
export function VerriereHeading({
  kicker,
  title,
  lede,
  align = "left",
  onDark = false,
  className,
}: {
  kicker?: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  align?: "left" | "center";
  onDark?: boolean;
  className?: string;
}) {
  const centered = align === "center";
  return (
    <div className={cn("max-w-3xl", centered && "mx-auto text-center", className)}>
      {kicker && (
        <div className={cn("mb-6 flex", centered && "justify-center")}>
          <VerriereKicker onDark={onDark}>{kicker}</VerriereKicker>
        </div>
      )}
      <h2
        className={cn(
          "font-display text-[1.85rem] leading-[1.12] sm:text-[2.4rem]",
          onDark ? "text-white" : "text-ink",
        )}
      >
        {title}
      </h2>
      <div className={cn("mt-4 flex", centered && "justify-center")}>
        <CoupDeFouet className={onDark ? "text-white/45" : "text-accent-500/70"} />
      </div>
      {lede && (
        <p
          className={cn(
            "mt-3 max-w-2xl text-lg leading-relaxed",
            centered && "mx-auto",
            onDark ? "text-white/85" : "text-muted",
          )}
        >
          {lede}
        </p>
      )}
    </div>
  );
}

/**
 * PANNEAU DE VITRAIL — le conteneur de base de la famille : sommet cintré,
 * sertissure plomb + laiton, lavis de verre. `flat` retire l'ombre (panneaux
 * déjà posés sur un fond profond).
 */
export function Vitrail({
  className,
  flat = false,
  children,
}: {
  className?: string;
  flat?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "verriere-arc verriere-plomb verriere-verre relative isolate overflow-hidden",
        !flat && "shadow-[var(--shadow-card)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * MÉDAILLON — le disque de ferronnerie qui porte une icône ou un chiffre :
 * cercle de marque cerclé d'un jonc de laiton. C'est la ponctuation de la
 * famille (services, étapes, badges).
 */
export function Medaillon({
  children,
  size = "md",
  onDark = false,
  className,
}: {
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
  onDark?: boolean;
  className?: string;
}) {
  const dim = size === "lg" ? "size-20" : size === "sm" ? "size-10" : "size-14";
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-full ring-1 ring-offset-2",
        dim,
        onDark
          ? "bg-white/10 text-white ring-white/45 ring-offset-transparent"
          : "bg-brand-700 text-brand-contrast ring-accent-500/70 ring-offset-[var(--surface)]",
        className,
      )}
    >
      {children}
    </span>
  );
}

/**
 * RÉSILLE — la grille de cames de plomb d'un vitrail, posée en surimpression
 * sur une photo. Décor pur, toujours sur un élément `aria-hidden`.
 */
export function Resille({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("verriere-resille pointer-events-none absolute inset-0", className)}
    />
  );
}

/**
 * FILET DE FERRONNERIE — la bande de rivets de laiton sur fer forgé qui ferme
 * l'en-tête et coiffe les actions flottantes (à la place d'une bordure plate).
 */
export function FiletFerronnerie({ className }: { className?: string }) {
  return <div aria-hidden className={cn("verriere-ferro h-1.5 w-full", className)} />;
}
