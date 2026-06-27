@AGENTS.md

# Xklic — Engine (moteur multi-sites)

**Next.js 16** (App Router, React 19, Tailwind v4, TypeScript) qui **rend tous les
sites clients** à partir de fichiers de configuration, plus une suite de **scripts
Node `.mjs`** d'exploitation (déploiement, domaines, onboarding, Baserow). Un seul
codebase sert N sites, routés par **sous-domaine `*.xklic.com`** et par **domaine
personnalisé**. Le repo voisin `xklic_vitrine` est la vitrine + le tunnel de commande.

> ⚠️ Next.js 16 a des breaking changes vs les versions connues — lire la consigne
> d'**AGENTS.md** (consulter `node_modules/next/dist/docs/`) avant d'écrire du code Next.

## Lancer / vérifier

```bash
npm install
npm run dev      # predev (génère le manifeste) puis next dev
npm run build    # prebuild (manifeste) puis next build
npm run lint     # eslint
npx tsc --noEmit # typecheck (utilisé après édition d'une config/d'un bloc)
```

## Comment un site client est rendu

- **Une config par client** : `config/sites/<slug>/config.json` (schéma typé dans
  `src/types/config.ts`). Contient : `slug`, `customDomains` (array, **apex en
  premier** : `["client.fr","www.client.fr"]`), `theme`, `stylePack`, `branding`
  (`logo`, `icon`, couleurs…), `social[]`, `googleReviewUrl`, `entreprise{}`, le
  contenu des sections, etc. Voir `config/sites/parfait-menage-26/` comme référence.
- **`theme` et `stylePack` sont deux axes indépendants** à combiner librement
  (thème = palette via variables CSS ; stylePack = parti pris visuel).
- **Rendu** : un `SiteRenderer` assemble des **blocs** depuis un catalogue
  (`catalog.json` / `catalog.ts`). Si le moteur ne couvre pas un besoin, on **crée
  un bloc** plutôt que du sur-mesure jetable.
- **Manifeste** : après création/édition d'une config, régénérer le manifeste des
  sites — fait automatiquement par `predev`/`prebuild`, ou à la main :
  `node scripts/generate-sites-manifest.mjs`.
- **Déploiement** : Vercel, avec wildcard `*.xklic.com` ; les domaines perso sont
  branchés via le script `onboard` (voir plus bas).

## Workflow nouveau client (de bout en bout)

1. **Récupérer le dossier** depuis Baserow :
   `npm run dossier:get -- "<nom entreprise>"` → JSON complet (fiche + Paiements +
   Production + Notes + Produits). C'est la source des données client.
2. **Créer la config** `config/sites/<slug>/config.json` (voir `NEWCLIENT.md` pour
   la méthode détaillée et les conventions de blocs/SEO).
3. **Logo + favicon** : `node scripts/upload-logo.mjs <slug> [fichier] --clean-source`
   (upload Vercel Blob + patch `branding.logo`/`branding.icon` + nettoyage local).
4. **Manifeste** : `npm run predev` (ou `generate-sites-manifest.mjs`).
5. **Domaine perso** (si client en `.fr`) : `npm run onboard` (voir ci-dessous).
6. **Déployer** : `npm run deploy`.

## Scripts d'exploitation (commandes npm — source de vérité)

```bash
# Récupérer un dossier client depuis Baserow
npm run dossier:get -- "<nom | Ref | OrderId>"

# Déploiement
npm run deploy            # git push prod + attend READY + syncs (domaines + sitemaps)
npm run deploy:dry        # plan complet sans rien modifier
npm run deploy:sync-only  # après un push déjà fait : syncs uniquement

# Synchros à la carte
npm run domains:sync[:dry]   # sous-domaines *.xklic.com  <->  config/sites (idempotent)
npm run sitemaps:sync[:dry]  # soumission des sitemaps à Google Search Console

# Onboarding domaine personnalisé (CLI, voir section suivante)
npm run onboard -- --slug <slug> --domain <domaine>.fr [--dry-run | --apply]

# Médias / manifeste
node scripts/upload-logo.mjs <slug> [fichier] --clean-source
node scripts/upload-blob.mjs <fichier> --pathname <slug>/x.png
node scripts/generate-sites-manifest.mjs   # auto via predev/prebuild
```

### `onboard` — automatisation domaine perso

`scripts/onboard/` orchestre l'ajout d'un domaine client en étapes **idempotentes**
(ordre : `vercel → dns → ssl → config → manifest → deploy → verify → gsc →
turnstile`). Chaque étape sait dire « déjà fait » et, quand un secret manque ou
qu'une action doit être faite à la main (ex. TXT GSC), s'arrête proprement en
imprimant **les valeurs exactes à saisir** (jamais de bricolage silencieux).
Lancer d'abord en `--dry-run`, puis `--apply`.

> Garde-fou critique (cf. `sync-domains.mjs`) : on ne touche **qu'aux** sous-domaines
> à un seul label sous `.xklic.com` ; jamais l'apex, le www, le wildcard, ni un
> `*.vercel.app`. Liste de slugs vide → abort (anti-suppression massive).

## Données Baserow

`scripts/get-dossier.mjs` lit la base Baserow « xklic » : `Dossiers` (clé `Ref` =
OrderId) liée à `Paiements` / `Production` / `Notes` / `Produits`. Sortie : résumé
lisible sur **stderr**, **JSON aplati** (menus déroulants et liens résolus) sur
**stdout** — prêt à exploiter pour bâtir une config client. `Statut commande`
(lead/panier/payé, écrit par la vitrine) ≠ `Statut production` (kanban interne :
Prospect → À faire → En prod → En ligne → SAV). Script **local** (lit `.env.local`,
ne tourne pas sur Vercel).

## Variables d'environnement

`.env.local` (gitignoré). Chargé par les scripts via `loadEnvLocal()` de
`scripts/onboard/util.mjs` (l'env réel a priorité) — pas besoin de `--env-file`.

- **Vercel** : `VERCEL_TOKEN`, `VERCEL_PROJECT_ID`, `VERCEL_TEAM_ID`,
  `VERCEL_DEPLOY_TIMEOUT_MS` (opt).
- **OVH (DNS)** : `OVH_APP_KEY`, `OVH_APP_SECRET`, `OVH_CONSUMER_KEY`, `OVH_ENDPOINT`.
- **Cloudflare (Turnstile)** : `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`,
  `TURNSTILE_SECRET_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`.
- **Google Search Console** : `GSC_SERVICE_ACCOUNT_KEY` (chemin du JSON),
  `GSC_PROPERTY`, `GSC_HUMAN_OWNER`.
- **Baserow** : `BASEROW_TOKEN`, `BASEROW_API_URL` (défaut `https://api.baserow.io`),
  `BASEROW_TABLE_{DOSSIERS,PAIEMENTS,PRODUCTION,NOTES,PRODUITS}`.
- **Médias / mail** : `BLOB_READ_WRITE_TOKEN`, `RESEND_API_KEY`, `RESEND_FROM`,
  `LEAD_TO`, `LEAD_WEBHOOK_URL`.
- **Divers** : `NEXT_PUBLIC_ROOT_DOMAIN` (défaut `xklic.com`),
  `ONBOARD_SSL_TIMEOUT_MS` (opt), `SITE` (cible un site précis en dev).

## Autres docs (statut)

- **`README.md`** — architecture du moteur (rendu, blocs, thèmes, déploiement). **Vivant.**
- **`NEWCLIENT.md`** — playbook de création de la config d'un site. **Vivant** (compléter
  par : données via `dossier:get`, domaine perso via `customDomains` + `onboard`).
