# Rapport — Itération 2 du moteur `agence_website`

Objectif : **multi-page** + **formulaire contact / demande d'intervention**, validés en
reproduisant `../souadtazya` depuis une seule config. Tout part de l'existant (aucune réécriture).

---

## 1. Multi-page (les pages sont une dimension de la config)

`SiteConfig` gagne `pages: PageConfig[]` — chaque page a `slug`, `label`, `blocks`, `meta?`,
`seo?`, `navHidden?`, `noindex?`. L'accueil porte le slug `""`.

- **Résolution** (`src/lib/pages.ts`) : `resolvePages`, `getPage`, `navPages`, `subPageSlugs`,
  `allBlocks`, `findBlock`. **Rétro-compatible** : un site sans `pages` reste un one-pager
  basé sur `blocks` (vérifié : `fatima` rend toujours en une page avec nav par ancres ;
  `/preview/fatima/services` → 404).
- **Routing** : nouvelles routes `[/page]`, `/sites/[slug]/[page]`, `/preview/[slug]/[page]`
  (SSG + `generateStaticParams` + `generateMetadata` par page). Les routes statiques sœurs
  (mentions-legales, sitemap.xml…) priment sur le segment dynamique.
- **Navigation auto** : header = pages visibles (hors accueil, le logo y mène) avec état actif
  (`aria-current`) ; footer = toutes les pages (footer plus riche). Liens internes préfixés par
  le `basePath` via `withBase()` (preview vs prod).
- **SEO par page** : `buildMetadata(config, page)` → title/description/canonical/OG propres,
  héritage du niveau site. Sitemap = toutes les pages. JSON-LD agrège les blocs de toutes les pages.
  *Vérifié* : titres et canonicals distincts par page.

Bloc ajouté : **`pageHero`** (eyebrow + fil d'ariane + H1 + intro + CTA) pour les pages intérieures.

## 2. Formulaire contact / demande d'intervention

Bloc `contact` avec **modes** (`content.formMode`) :
- `simple` : nom, e-mail, message.
- `demande-intervention` : nom, téléphone, **service**, **zone/adresse**, **date souhaitée**, message.
- `devis` / `contact` : modes historiques conservés.

- **Composant** `ContactForm` (RHF + Zod) — champs conditionnels par mode, états succès/erreur,
  honeypot, **Turnstile optionnel** (monté seulement si clé publique fournie).
- **Route** `POST /api/contact` : livraison **Resend ET/OU webhook n8n**, cumulables, avec
  **surcharge par site** (`config.forms.to` / `config.forms.webhookUrl`) sinon variables d'env.
  Anti-spam : honeypot (faux succès silencieux) + vérification Turnstile serveur. Repli gracieux
  si rien n'est configuré (log + OK).
- *Vérifié* : lead valide → `ok` ; sans nom → 422 ; honeypot rempli → `{ok:true}` silencieux ;
  payload devis avec `items` → `ok`.

Variables d'env ajoutées (`.env.example`) : `RESEND_API_KEY`, `RESEND_FROM`, `LEAD_TO`,
`LEAD_WEBHOOK_URL`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`.

## 3. Bloc `devisBuilder` (panier de prix interactif)

Nouveau bloc **piloté par config** reproduisant le `DevisBuilder` de la référence :
- bascule **crédit d'impôt** (prix normal / −50 %) ;
- catalogue de catégories (emoji, badge éligibilité) avec prestations **horaires**
  (heures +/- , matériel) et **par paliers** (tiers `dès`/`sur devis`) ;
- récapitulatif sticky : quantités +/- , sous-total, crédit, à charge, plafond annuel ;
- **formulaire intégré** → `/api/contact` (mode `devis`, items + estimations).

## 4. Validation : `souadtazya.json` == `../souadtazya`

Config **multi-page** unique (`config/sites/souadtazya.json`) → **10 pages** :
Accueil, Services, Réalisations, Tarifs (devis-builder), Crédit d'impôt, Contact
(demande-intervention), À propos, Zone d'intervention, FAQ, Devis.
- Header nav (5) = Services · Réalisations · Tarifs · Crédit d'impôt · Contact (comme la réf).
- Footer = toutes les pages.
- Rendu vérifié (captures) : accueil, page Services, **Tarifs/devis-builder**, **Contact/demande
  d'intervention**, fil d'ariane, états actifs.

## 5. Divers
- **Bouton WhatsApp flottant masqué en desktop** (`lg:hidden`) — inutile, le header porte déjà tél. + CTA.

## État
- `npm run build` : **OK**, 56 pages statiques. `tsc --noEmit` : **clean**. `eslint` : **clean**.
- Rétro-compatibilité one-pager : **OK** (`fatima`).
- Serveur de prod : `npm run start` (le `next dev` ne se lance pas dans cet environnement —
  contrainte d'outillage, sans impact sur le build/prod).

## Reste éventuel (non bloquant)
- Le message « WebGL » dans la carte des pages contact/zone est un **artefact des captures
  headless** (`--disable-gpu`) ; la carte OSM s'affiche dans un vrai navigateur.
- Page `rendez-vous` (Cal.com) de la référence non reproduite (hors périmètre, optionnelle).
- `LeadForm` + `/api/devis` historiques conservés (rétro-compat) mais remplacés par
  `ContactForm` + `/api/contact` ; suppressibles ultérieurement.
