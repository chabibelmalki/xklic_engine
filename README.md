# Moteur de sites vitrines — `agence_website`

**UN moteur, plusieurs configs.** Une seule app Next.js qui génère des sites
vitrines pro pour des entreprises locales de **toute taille** et **tout statut**
(artisans, commerçants, TPE/PME, indépendants ou sociétés — EI, micro, EURL,
SARL, SAS, SASU…).

Le **métier** et le **statut juridique** sont des **données de configuration**,
jamais des hypothèses codées en dur. Un artisan en société est traité
exactement comme un auto-entrepreneur : même moteur, config différente, mentions
légales justes dans tous les cas.

- **Stack** : Next.js App Router · TypeScript · Tailwind CSS v4 · cible Vercel.
- **Rendu** : SSG/ISR uniquement (jamais client-only — SEO critique).
- **Pas de backend, pas de DB, pas d'auth.** Les configs sont des fichiers JSON.

---

## Démarrer

```bash
npm install
cp .env.example .env.local   # optionnel en dev
npm run dev                  # http://localhost:3000
```

- `http://localhost:3000/` → site **par défaut** (`SITE=fatima`).
- `http://localhost:3000/preview/<slug>` → **n'importe quelle** config, avec la
  **barre de switch dev** (dropdown de tous les slugs) pour basculer d'un site à
  l'autre instantanément.
- Sous-domaines en local : `http://garage-test.localhost:3000/` fonctionne aussi
  (le proxy lit le sous-domaine).

```bash
npm run build && npm start   # build de prod (tout est prérendu en statique)
```

---

## Architecture

```
config/sites/*.json        ← LES SITES (1 fichier = 1 site = 1 sous-domaine)
src/
  types/config.ts          ← schéma SiteConfig (strict, typé)
  lib/
    config-loader.ts        ← lit config/sites/*.json (build/ISR, jamais client)
    theme.ts                ← registre des 3 thèmes (+ repli)
    legal.ts                ← générateur de mentions légales branché sur le statut
    seo.ts / jsonld.ts      ← generateMetadata + JSON-LD LocalBusiness par site
    seo-files.ts            ← sitemap.xml / robots.txt / llms.txt par site
    urls.ts / utils.ts
  blocks/                  ← BIBLIOTHÈQUE DE BLOCS (1 section = 1 composant)
    Hero · Services · Tarifs · Zone · Faq · Galerie · Avis · Contact
    Unknown.tsx             ← repli : un type inconnu dégrade proprement
    catalog.ts              ← REGISTRE type -> composant
  components/
    SiteRenderer.tsx        ← parcourt config.blocks et rend chaque bloc dans l'ordre
    MentionsLegalesPage.tsx · DevSwitcher.tsx · layout/ · ui/ · seo/
  app/
    page.tsx                       ← site par défaut (apex / dev)
    mentions-legales/page.tsx
    sitemap.xml | robots.txt | llms.txt (route handlers, site par défaut)
    sites/[slug]/…                 ← rendu canonique par site (SSG, généré pour chaque slug)
    preview/[slug]/…               ← preview dev + switcher
  proxy.ts                 ← sous-domaine -> réécriture interne vers /sites/[slug]
```

**Flux de rendu** : `SiteConfig` → `<SiteRenderer>` pose le thème (`data-theme`),
injecte le JSON-LD, puis pour chaque bloc demande au `catalog` le composant du
`type` et le rend avec son bout de config. Un `type` non enregistré tombe sur
`Unknown` (rien en prod, encart d'alerte en dev).

**Thèmes** : pilotés par variables CSS (`src/app/globals.css`). Le rendu pose
seulement `data-theme="<id>"` ; les tokens (`--brand`, `--bg`, `--ink`…) font le
reste. 3 thèmes livrés : `douceur-beige`, `energie-corail`, `pro-bleu-nuit`.

**Routage**
- **Prod** : `proxy.ts` lit le sous-domaine `<slug>.<NEXT_PUBLIC_ROOT_DOMAIN>` et
  réécrit en interne vers `/sites/<slug>` (l'URL visible reste le sous-domaine ;
  le rendu statique est servi → SSG/ISR préservé). L'apex sert le site par défaut.
- **Dev** : `/preview/<slug>` + la barre de switch (visible en dev uniquement).

**SEO automatique par site** : `generateMetadata` (title/description/OG uniques),
JSON-LD `LocalBusiness` avec `@type = seo.schemaType`
(`HousekeepingService`, `AutoRepair`, `Bakery`…), NAP + ville + avis, plus
`sitemap.xml`, `robots.txt` et `llms.txt`. La ville est injectée dans le H1 et le
title.

**Assets** : images et logos référencés **par URL** dans la config (object
storage), servis via `next/image` (optimisation + lazy-load). Aucune image n'est
commitée — `next.config.ts` autorise les URLs HTTPS distantes.

---

## ➕ Comment ajouter un site

1. Créer `config/sites/<slug>.json`. Le **nom de fichier = le slug = le
   sous-domaine** (`<slug>.<votre-domaine>`).
2. Renseigner le schéma `SiteConfig` (voir `src/types/config.ts`) :
   - `theme` : `douceur-beige` | `energie-corail` | `pro-bleu-nuit`.
   - `entreprise` : `nom`, `statut` (`EI`, `micro`, `EURL`, `SARL`, `SAS`,
     `SASU`…), `siret`, `tva.regime` (`franchise` | `reel` | `exonere`), et pour
     les sociétés `capital`, `rcs`, `dirigeant`, `siege`. **Les mentions légales
     s'adaptent automatiquement au statut.**
   - `seo.schemaType` (type schema.org du métier) + `seo.ville`.
   - `meta` (title/description/OG) — **contenu unique**, jamais de boilerplate
     partagé (anti duplicate-content).
   - `blocks` : la liste ordonnée des sections (voir blocs ci-dessous).
3. C'est tout. Le site apparaît dans le switcher dev, est prérendu au build et
   servi sur son sous-domaine. **Aucun code à toucher.**

> Astuce : copiez un des exemples (`fatima.json`, `garage-test.json`,
> `patisserie-test.json`) et adaptez-le.

### Blocs disponibles

| `type`     | `variant` / `mode`                                   |
|------------|------------------------------------------------------|
| `hero`     | variant : `split` (défaut) · `centre`                |
| `services` | variant : `cartes` (défaut) · `images`               |
| `tarifs`   | **mode** : `grille` · `a-partir-de` · `sur-devis`    |
| `zone`     | **mode** : `carte` · `liste` · `aucune`              |
| `faq`      | —                                                    |
| `galerie`  | variant : `avant-apres` · `produits` · `grille`      |
| `avis`     | —                                                    |
| `contact`  | —                                                    |

Le contenu exact attendu par chaque bloc est typé dans `src/types/config.ts`
(`HeroContent`, `TarifsContent`, etc.).

---

## ➕ Comment ajouter un bloc

Tout est **additif** : ajouter un bloc ne casse jamais les configs existantes.

1. **Décrire le contenu** dans `src/types/config.ts` : une interface
   `MonBlocContent`, puis l'ajouter à `BlockContentMap` (`monbloc: MonBlocContent`).
2. **Créer le composant** `src/blocks/MonBloc.tsx`. Il reçoit
   `{ block, config, index }` (`BlockComponentProps<MonBlocContent>`) et lit
   `block.content`. Réutilisez `Section`, `SectionHeading`, `Container`, etc.
   ```tsx
   import type { MonBlocContent } from "@/types/config";
   import type { BlockComponentProps } from "./types";
   import { Section } from "@/components/ui/Section";

   export function MonBloc({ block, index }: BlockComponentProps<MonBlocContent>) {
     const c = block.content;
     return <Section id="monbloc" tone={index % 2 ? "surface" : "bg"}>…</Section>;
   }
   ```
3. **L'enregistrer dans `src/blocks/catalog.ts`** :
   ```ts
   import { MonBloc } from "./MonBloc";
   const registry = { …, monbloc: MonBloc };
   ```
4. (Optionnel) ajouter son libellé de nav dans
   `src/components/layout/SiteHeader.tsx` (`NAV_LABELS`).

Utilisez ensuite `{ "type": "monbloc", "content": { … } }` dans une config.

### Ajouter un thème
Ajouter un bloc `[data-theme="mon-theme"] { --brand: …; --bg: …; … }` dans
`src/app/globals.css`, puis l'entrée correspondante dans `THEMES`
(`src/lib/theme.ts`). Les configs peuvent alors poser `"theme": "mon-theme"`.

### Ajouter un statut juridique
Le type `StatutJuridique` accepte déjà toute chaîne. Pour des mentions sur
mesure, compléter `STATUT_LABELS` / la logique dans `src/lib/legal.ts`.

---

## Les 3 exemples livrés (multi-métier ET multi-statut)

| Slug | Métier | Statut | Thème | Particularités |
|---|---|---|---|---|
| `fatima` | Ménage (`HousekeepingService`) | **EI** (franchise TVA) | douceur-beige | zone liste + tarifs **grille** + galerie **avant/après** |
| `garage-test` | Mécanique (`AutoRepair`) | **SARL** (capital, RCS) | pro-bleu-nuit | tarifs **sur-devis**, zone `aucune`, certifications |
| `patisserie-test` | Pâtisserie (`Bakery`) | **SAS** (capital, RCS) | energie-corail | galerie **produits**, sans zone |

---

## Déploiement (Vercel)

1. Importer le repo sur Vercel.
2. Variables d'env : `SITE` (site par défaut de l'apex) et
   `NEXT_PUBLIC_ROOT_DOMAIN` (votre domaine racine).
3. Brancher un **wildcard DNS** `*.<votre-domaine>` sur le projet : chaque
   `<slug>.<votre-domaine>` sert automatiquement la config `<slug>`.
4. Pour un domaine propre client, renseignez `"domain": "exemple.fr"` dans sa
   config (utilisé pour canonical / sitemap / OG) et pointez-le sur le projet.
