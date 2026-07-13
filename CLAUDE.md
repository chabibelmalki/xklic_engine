@AGENTS.md

# Xklic — Engine (moteur multi-sites)

**Next.js 16** (App Router, React 19, Tailwind v4, TypeScript) qui **rend tous les
sites clients** à partir de fichiers de configuration, plus une suite de **scripts
Node `.mjs`** d'exploitation (déploiement, domaines, onboarding, back-office). Un seul
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

# Garde-fous SEO du parc (audit 2026-07) — à lancer après toute édition de config
npm run dedup:check       # ZÉRO séquence de 9 mots partagée entre deux sites (exit 1 sinon)
npm run canonicals:check  # post-deploy : chaque site × langue annonce son bon domaine
```

## Comment un site client est rendu

- **Une config par client** : `config/sites/<slug>/config.json` (schéma typé dans
  `src/types/config.ts`). Contient : `slug`, `customDomains` (array, **apex en
  premier** : `["client.fr","www.client.fr"]`), `theme`, `stylePack`, `branding`
  (`logo`, `icon`, couleurs…), `social[]`, `googleReviewUrl`, `entreprise{}`, le
  contenu des sections, etc. Voir `config/sites/parfait-menage-26/` comme référence.
- **Sites multilingues** : les `<locale>.json` portent le CONTENU traduit
  uniquement. Les champs techniques (`customDomains`, `domain`, `demo`,
  `noindexSite`, `geo`, `forms`, `googleReviewUrl`, `social`, `theme`,
  `stylePack`) sont **hérités de `config.json`** par le loader
  (`inheritTechnical`, `src/lib/config-loader.ts`) — ne jamais les y répéter.
  Toute modif de `config.json` se réplique traduite dans CHAQUE locale.
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

1. **Récupérer le dossier** depuis le back-office :
   `npm run dossier:get -- "<nom entreprise>"` → le JSON des données du dossier
   (paiement retiré). C'est la source des données client.
2. **Créer la config** `config/sites/<slug>/config.json` (voir `NEWCLIENT.md` pour
   la méthode détaillée et les conventions de blocs/SEO).
3. **Logo + favicon** : `node scripts/upload-logo.mjs <slug> [fichier] --clean-source`
   (upload Scaleway + patch `branding.logo`/`branding.icon` + nettoyage local).
4. **Manifeste** : `npm run predev` (ou `generate-sites-manifest.mjs`).
5. **Domaine perso** (si client en `.fr`) : `npm run onboard` (voir ci-dessous).
6. **Déployer** : `npm run deploy`.

## Scripts d'exploitation (commandes npm — source de vérité)

```bash
# Récupérer un dossier client depuis le back-office
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

# Médias — stockage objet Scaleway (bucket xklic-media, préfixe sites/)
node scripts/upload-logo.mjs <slug> [fichier] --clean-source   # logo/favicon -> config
node scripts/upload-blob.mjs <fichier> [<slug>/x.png]          # upload brut -> imprime l'URL
npm run media:migrate[:apply]                                  # migration Blob -> Scaleway (one-shot)
node scripts/generate-sites-manifest.mjs                       # auto via predev/prebuild
```

> **Médias sur Scaleway** (migration 2026-07-10) : les assets des sites sont sur le
> **même bucket S3 que le back-office** (`xklic-media`), sous le préfixe `sites/`.
> La config ne stocke que l'URL publique = `MEDIA_BASE_URL + "/" + clé`. Upload
> **brut** (pas de transcodage — préserve PNG transparence / SVG / WebP). Clés de
> logo versionnées par hash de contenu (cache immuable). Helper Node :
> `scripts/lib/scaleway.mjs` (miroir de `internal/media/media.go` du back-office).
> Vercel Blob est **retiré** ; les anciens objets Blob subsistent comme filet
> (à purger plus tard).

### `onboard` — automatisation domaine perso

`scripts/onboard/` orchestre l'ajout d'un domaine client en étapes **idempotentes**
(ordre : `vercel → dns → ssl → config → manifest → deploy → verify → gsc →
turnstile → email`). Chaque étape sait dire « déjà fait » et, quand un secret manque ou
qu'une action doit être faite à la main (ex. TXT GSC), s'arrête proprement en
imprimant **les valeurs exactes à saisir** (jamais de bricolage silencieux).
Lancer d'abord en `--dry-run`, puis `--apply`.

L'étape **`email`** (dernière du pipeline, après `turnstile` pour que le tenant
existe) crée l'adresse pro du client et bascule tout dessus, sans saisie :
1. lit le dossier (par `--dossier-ref`, sinon recherche par nom d'entreprise) ;
2. **cible** = `email_perso`, sinon l'`email` « ancien » (= le perso saisi au départ),
   ou `--redirect-to <email>` en override ; garde-fou anti-boucle (la cible ≠ `contact@`) ;
3. **OVH** : redirection `contact@<domaine>` → cible (namespace `/email/domain/*`, MX Plan requis) ;
4. **back-office** : `email_perso ← cible`, `dossier.email ← contact@<domaine>`,
   `tenant.contact_email ← contact@<domaine>` (endpoint `POST …/tenants/{slug}/contact-email`) ;
5. **config.json** : l'email public affiché → `contact@<domaine>` (commit + push = auto-deploy).

> Garde-fou critique (cf. `sync-domains.mjs`) : on ne touche **qu'aux** sous-domaines
> à un seul label sous `.xklic.com` ; jamais l'apex, le www, le wildcard, ni un
> `*.vercel.app`. Liste de slugs vide → abort (anti-suppression massive).

## Données back-office (API Go → Postgres)

Le back-office (`xklic-backoffice`, API Go → Postgres) est la **source de
vérité unique** des données clients (cf. le chantier de migration à la racine
du dossier parent).

- **Lecture** : `scripts/get-dossier.mjs` interroge
  `GET /v1/public/agency/orders?q=` puis `GET /v1/public/agency/orders/{ref}`.
  Règle de **nettoyage, pas de correspondance** : la sortie est le JSON du
  back-office **tel quel, le paiement retiré** — aucun mapping à maintenir quand
  le back-office ajoute un champ. Sortie : résumé lisible sur **stderr**, **JSON**
  des données du dossier sur **stdout** — prêt à exploiter pour bâtir une config.
  `statut_commande` (lead/panier/payé, écrit par la vitrine) ≠ `statut_production`
  (kanban interne : Prospect → À faire → En prod → En ligne → SAV). Script
  **local** (lit `.env.local`, ne tourne pas sur Vercel).
- **Alignement config → dossier** : `scripts/sync-dossier.mjs` (`npm run dossier:sync`)
  recale un dossier agence sur les données **canoniques du client**, la config
  engine étant la **source de vérité** (email, téléphone, adresse, SIRET, réseaux,
  `domaine` = apex de `customDomains`, `logo_urls`/`photo_urls`). On produit un JSON
  d'entrée `{ "search": "<nom|Ref>", "dossier": { <champs à aligner> } }` (typiquement
  rempli à la main depuis `config/sites/<slug>/config.json`), puis :
  ```bash
  npm run dossier:sync -- entree.json           # DRY-RUN : affiche le décalage
  npm run dossier:sync -- entree.json --apply    # écrit en base
  ```
  L'écriture passe par l'**upsert public par `ref`** : seuls les champs fournis
  sont écrits (coalesce serveur — un champ absent n'est pas touché), le statut est
  renvoyé tel quel, et le **paiement n'est JAMAIS touché** (aucun `payment` envoyé ;
  les clés paiement de l'entrée sont ignorées). Process **manuel, un client à la
  fois** (get → comparer → apply).
- **Écriture** (runtime serveur) : `src/lib/backoffice.ts` — `postLead()` →
  `POST /v1/public/leads` (formulaires, PII) et `postEvent()` →
  `POST /v1/public/events` (clics de contact, sans PII). Fire-and-forget strict
  (timeout 3 s, jamais de throw), gating local via `isInsertEnabled()`.

## Variables d'environnement

`.env.local` (gitignoré). Chargé par les scripts via `loadEnvLocal()` de
`scripts/onboard/util.mjs` (l'env réel a priorité) — pas besoin de `--env-file`.

- **Vercel** : `VERCEL_TOKEN`, `VERCEL_PROJECT_ID`, `VERCEL_TEAM_ID`,
  `VERCEL_DEPLOY_TIMEOUT_MS` (opt).
- **OVH (DNS + email)** : `OVH_APP_KEY`, `OVH_APP_SECRET`, `OVH_CONSUMER_KEY`, `OVH_ENDPOINT`.
  L'étape `email` (redirection `contact@<domaine>` → boîte du client) réutilise ces
  clés mais via le namespace `/email/domain/*` : le **consumer key doit porter en plus**
  les droits `GET/POST/DELETE /email/domain/*` (re-validation manuelle one-shot). Sans
  ces droits (403) ou sans **MX Plan** actif sur le domaine (404) → l'étape s'arrête
  proprement en « manuel » et imprime la redirection exacte à créer.
- **Cloudflare (Turnstile)** : `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`,
  `NEXT_PUBLIC_TURNSTILE_SITE_KEY` — utilisées UNIQUEMENT par le script d'onboarding
  (`scripts/onboard/cloudflare.mjs`, ajout des hostnames au widget). Le RUNTIME
  (rendu de la sitekey + vérif du token) passe désormais par le back-office par
  widget/tenant : `src/lib/turnstile.ts` appelle `GET /config` et
  `POST /turnstile/verify`. `TURNSTILE_SECRET_KEY` n'est plus lue par l'engine
  (le secret vit côté API Go, chiffré). Assignation d'un tenant à un widget :
  `npm run onboard -- … --widget "<nom>"` (défaut « xklic 1 »).
- **Google Search Console** : `GSC_SERVICE_ACCOUNT_KEY` (chemin du JSON),
  `GSC_PROPERTY`, `GSC_HUMAN_OWNER`.
- **Back-office** : `BACKOFFICE_API_URL` (base de l'API Go, sans slash final),
  `BACKOFFICE_API_KEY` (= `ENGINE_API_KEY` côté back-office, header `X-API-Key`) —
  sert aussi à `src/lib/turnstile.ts` (sitekey + vérif Turnstile).
- **Médias (Scaleway S3)** : `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`,
  `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `MEDIA_BASE_URL` — mêmes valeurs que le
  back-office. `BLOB_*` (Vercel) déprécié, plus lu par aucun script.
- **Mail** : `RESEND_API_KEY`, `RESEND_FROM`,
  `LEAD_TO`, `LEAD_WEBHOOK_URL`.
- **Divers** : `NEXT_PUBLIC_ROOT_DOMAIN` (défaut `xklic.com`),
  `ONBOARD_SSL_TIMEOUT_MS` (opt), `SITE` (cible un site précis en dev).

## Autres docs (statut)

- **`README.md`** — architecture du moteur (rendu, blocs, thèmes, déploiement). **Vivant.**
- **`NEWCLIENT.md`** — playbook de création d'un site : conventions, checklist SEO
  du parc (leçons de l'audit 2026-07) et **definition of done** (validations
  obligatoires dont `dedup:check`). **Vivant** — à suivre pour TOUT nouveau site.
- **`MODIFCLIENT.md`** — les 6 réflexes pour **modifier** un site existant sans
  créer de dette (i18n complet, unicité au script, bornes meta, maillage, zéro
  fait inventé, valider→déployer→vérifier live) + pièges par cas fréquent
  (changement de prix, prospect→client, etc.). **Vivant** — à suivre pour TOUTE
  modification d'un site en prod.
