---
name: xklic-design
description: Design system de l'engine Xklic — les 3 axes (theme/stylePack/famille), tokens CSS, règles motion & animations scroll, checklist pour créer un pack ou une famille SANS régression sur le parc. À lire avant TOUT travail visuel (nouvelle famille, nouveau pack, animations, refonte).
---

# Xklic — Design system de l'engine

Cette skill encode les règles VISUELLES du moteur. Le contenu/SEO reste régi par
`NEWCLIENT.md` (création) et `MODIFCLIENT.md` (modification) — cette skill ne les
remplace pas, elle les complète sur l'axe design/motion.

## Les 3 axes (indépendants, combinés librement)

| Axe | Rôle | Registre | Appliqué via |
|---|---|---|---|
| `theme` | palette de couleurs uniquement | `src/lib/theme.ts` (13 thèmes) | `data-theme="…"` + blocs `[data-theme]` dans `globals.css` |
| `stylePack` | parti pris complet : typo, formes, ombres, motion, stratégie de fonds, famille | `src/lib/packs.ts` (20 packs) | `data-pack="…"` + `[data-pack]` dans `globals.css` |
| famille | jeu de composants (blocs + chrome) | `src/families/index.ts` (10 familles) | `StylePack.family` (défaut `classic`) |

- La config d'un site ne nomme JAMAIS une famille : elle nomme un `stylePack`,
  qui pointe la famille. Chaîne : `config.stylePack` → `getPack()` → `getFamily()`.
- `branding.colors` (`{ brand, accent?, neutral? }`) écrase la palette du thème :
  `src/lib/colors.ts` (`brandColorStyle`) génère l'échelle `--brand-50…800` +
  `--brand-contrast` injectée inline sur la racine.

## Tokens — la seule matière autorisée

- Tailwind **v4, CSS-first** : pas de `tailwind.config.*`. Tout vit dans
  `src/app/globals.css` (`@theme inline` + blocs `[data-theme]`/`[data-pack]`).
- Les composants n'utilisent QUE les tokens sémantiques : `bg-brand-600`,
  `text-ink`, `text-muted`, `bg-alt`, `bg-surface`, `border-border`,
  `rounded-[var(--radius-card)]`, `font-display`… **Jamais de hex en dur** dans
  un composant — un hex en dur casse le theming de tous les tenants.
- Polices : déclarées par pack (`fonts: { display, sans }` dans `packs.ts`) →
  variables `--pack-font-*`. Suivre le pattern des packs existants.

## Motion & animations scroll

Base existante :
- `src/components/ui/Reveal.tsx` — entrée au scroll via IntersectionObserver
  (`.reveal` → `.is-revealed`), SSR-safe, fallback `<noscript>`, actif seulement
  sous `prefers-reduced-motion: no-preference`.
- Tokens `--motion-distance` / `--motion-duration` / `--motion-ease` dans
  `globals.css`, **surchargeables par `[data-pack]`** : un pack règle son
  intensité de mouvement sans toucher les autres packs.

Règles NON NÉGOCIABLES pour tout nouvel effet :
1. **Décoratif = débrayable** : tout effet est inerte sous
   `prefers-reduced-motion: reduce` (media query CSS ou gate JS, comme Reveal).
2. **CSS d'abord** : effets liés au scroll de préférence en CSS scroll-driven
   (`animation-timeline: view()`) — progressive enhancement natif, les
   navigateurs sans support retombent sur l'état final ou sur Reveal. Le JS
   (IntersectionObserver, petit hook maison) seulement quand le CSS ne suffit pas.
3. **Pas de lib d'animation** (gsap, framer-motion…) sans validation explicite —
   le poids embarque TOUS les sites du moteur.
4. **60 fps** : n'animer que `transform` / `opacity` / `clip-path` /
   `stroke-dashoffset`. Jamais de propriété de layout (width/height/top…).
5. **SSR-safe** : jamais d'état initial en style inline côté client qui diverge
   du HTML serveur (hydration mismatch) — suivre le pattern Reveal (classe CSS,
   pas de style inline).
6. Les keyframes spécifiques à un pack sont **préfixées et scopées** au pack
   (ex. `epure-marquee`, `cascade-seal-spin`) dans `globals.css`.

## Créer une FAMILLE — checklist

1. Dossier `src/families/<id>/{blocks,chrome,ui}/` + déclaration dans
   `src/families/index.ts` ; contrat dans `src/families/types.ts`.
2. **Registry partiel** : n'implémenter QUE les blocs où la famille apporte une
   vraie signature ; le reste retombe automatiquement famille → `classic` →
   `Unknown`. Ne jamais dupliquer un bloc pour le dupliquer.
3. **Chrome complet obligatoire** (`Header`, `Footer`, `FloatingActions`) avec
   **exactement les props** de `SiteHeader`/`SiteFooter`/`FloatingActions`.
4. ⚠️ **Contrat Footer** : chaque footer de famille DOIT reproduire la logique de
   `src/components/layout/SiteFooter.tsx` — liens légaux, résolution de nav,
   réseaux sociaux, backlink SEO `xklic.com`, copyright. Il existe déjà 10
   exemplaires (SiteFooter + 9 familles) : **toute évolution fonctionnelle du
   footer doit être répercutée dans TOUS les exemplaires** (grep « Props
   identiques à SiteFooter »).
5. Créer le(s) pack(s) associé(s) dans `packs.ts` : `family`, `fonts`,
   `sectionStrategy` (`flat|striped|surface-alt|brand-tinted|bordered`),
   `sectionDivider` (`none|rule|bevel|wave|arch|…`), variantes curatées par bloc,
   et le bloc CSS `[data-pack="<id>"]` dans `globals.css`.
6. Header overlay : si la famille supporte le hero `plein`/`fondu` plein cadre,
   respecter la bascule overlay automatique (voir NEWCLIENT.md, conventions).

## Non-régression — obligatoire avant tout deploy visuel

- Un nouveau pack / une nouvelle famille ne modifie **aucun fichier partagé**
  (`globals.css` hors blocs scopés `[data-pack]`, `SiteRenderer`, blocs
  `classic`, chrome partagé) sans vérifier l'impact sur le parc entier.
- Valider : `npx tsc --noEmit` + `npm run build` (+ `npm run dedup:check` si du
  contenu a changé).
- **Contrôle visuel croisé** : lancer le dev server et vérifier AU MOINS 2 sites
  existants de familles différentes (desktop + mobile) en plus du site en cours —
  un token global modifié se voit là, pas sur le nouveau site.
- Vérifier le nouveau rendu en `prefers-reduced-motion: reduce` (le site doit
  rester complet et lisible, effets inertes) et en contraste AA.
- Chaque site du parc doit rester DISTINCT : jamais de choix famille/pack « par
  métier » (règle détaillée dans NEWCLIENT.md, section DESIGN).
