## RÔLE

Génère la config d'un NOUVEAU site client pour le moteur `agence_website`, à
partir du DOSSIER client **récupéré depuis le back-office** (voir « DOSSIER CLIENT » en
bas : on te donne juste le nom ou la Ref, tu vas chercher les données toi-même
avec le script). Le résultat : un site complet, crédible et **unique**, propre au
métier et à la ville du client.

---

## NON-NÉGOCIABLE : ZÉRO COPIE, ZÉRO BIAIS

- Tu ne copies **aucun** site existant : ni structure, ni contenu, ni design, ni
  mots, ni palette.
- **« Prestations : comme [un autre client] »** (ex. « comme sanad clean ») ne
  vise QUE le **périmètre des services**. Tu n'en reprends **ni** la structure,
  **ni** le design, **ni** les prix, **ni** les mots, **ni** la palette : tu
  inventes les tiens. Référencer un client par son nom = piège à clone.
- Tu peux lire les configs existantes (`config/sites/*`) **uniquement** pour
  comprendre le schéma et les conventions techniques — **jamais comme modèle à
  imiter**. Aucun site n'est une référence privilégiée.
- Contenu rédactionnel **100 % original**, spécifique à ce client.
- Tu n'inventes **aucun fait**. Colonne vide = champ absent : tu ne l'affiches pas.
- Tu ne fais **que** ce que les données demandent.

---

## ENRICHISSEMENT (si un identifiant légal est renseigné)

Si un identifiant légal d'entreprise est fourni (SIREN/SIRET en France, numéro
BCE/KBO en Belgique, ou l'équivalent d'un autre pays), déduis et recoupe les
données légales de l'entreprise (raison sociale, forme juridique, dirigeant,
adresse, statut, GPS).

**Utilise uniquement le registre officiel des entreprises du pays concerné**
(source publique et faisant foi) — jamais un site tiers, agrégateur ou annuaire
non officiel, qui bloque souvent la récupération auto et n'engage pas sa fiabilité.
En France, la source de référence est `recherche-entreprises.api.gouv.fr/search?q=<id>`.

N'utilise que ce qui est concordant ; signale tout écart ou doute.

---

## CONTRAINTES TECHNIQUES

- `<slug>` = nom commercial normalisé (minuscules, sans accents ni espaces).
- Langues : 1re = défaut (`config.json`) ; chaque autre = `<lang>.json`.
- Config **valide** contre `src/types/config.ts` ; passe `npx tsc --noEmit`.
- Sites **auto-découverts** : après création du dossier, lance
  `node scripts/generate-sites-manifest.mjs` (`src/lib/sites-manifest.ts` est
  généré — ne jamais l'éditer à la main).
- `sitemap`/`robots`/`llms.txt` générés par le moteur : rien à écrire à la main.
- Logo/Photos : URLs déjà hébergées (Scaleway, bucket xklic-media, préfixe sites/), référence-les directement.
- Domaine custom = branchement Vercel **manuel** : signale-le.

---

## DESIGN — CHAQUE SITE EST DISTINCT

Trois axes INDÉPENDANTS, à combiner librement — jamais choisis « par métier »
(le réflexe sectoriel produit des clones) :

1. **FAMILLE de template** — le levier de divergence le PLUS FORT. Une famille
   définit la structure profonde : composition, primitives (sections, titres,
   traitement d'image), chrome (header/footer), grammaire visuelle d'ensemble.
   Deux familles = deux « studios » différents, bien au-delà de la couleur ou de
   la typo. **Découvre les familles disponibles dans le moteur** et choisis selon
   l'AMBIANCE et le CARACTÈRE voulus pour ce client. Une famille au parti pris
   fort diverge ; un choix tiède converge vers le look des autres.

2. **`stylePack`** (typo / layout / motion) — affine à l'intérieur de la famille,
   selon l'ambiance, jamais selon le métier.

3. **`theme`** (couleur) — indépendant, selon la couleur demandée par le client.

**AVANT de choisir : regarde les sites déjà en prod** et prends sciemment une
famille + un pack + un thème + une composition différents des clients proches. Si
un voisin du même métier existe, tu DOIS diverger d'abord sur la FAMILLE (ou, à
famille égale, sur pack + thème + hero + ordre des blocs — jamais un seul).

Aucune famille, aucun pack, aucun thème n'est réservé à un secteur : on peut
avoir de tout sous tout.

4. **`variant`** (par bloc) — suggestion, pas contrainte : mélange librement.

5. **ORDRE & COMPOSITION** (`pages[].blocks[]`) — invente une structure propre.
   Ne reproduis aucun squelette d'un site existant (accueil ET pages internes).

Toujours : mobile-first, contrastes AA, tout le texte via i18n.

> 🎨 Référence design détaillée : la skill projet **`.claude/skills/xklic-design/`**
> (tokens CSS, règles motion/animations scroll, checklist famille/pack,
> non-régression parc). Claude Code la charge automatiquement ; à lire avant tout
> parti pris visuel fort (nouvelle famille, nouveau pack, animations).

---

## SILOS DE SERVICES (activité de services)

Pas de one-pager : crée **une page dédiée par prestation**. Le **minimum SEO** de
chaque silo (à respecter, mais ce n'est PAS un gabarit à recopier) : `meta` propre
(title ≤ 55 c sans marque), `pageHero` + `breadcrumb` (→ `BreadcrumbList`), bloc
`service` (→ `Service` JSON-LD, `priceFrom` si un vrai prix existe), un bloc
`contenu` d'au moins **~150 mots utiles** (déroulé concret, inclus/exclus — le
thin content ne ranke pas), une **FAQ propre à la page** (3-4 questions
spécifiques, jamais réutilisées sur une autre page ni un autre site), et du
**maillage croisé** vers 2-3 pages sœurs. `navHidden: true` seulement si la page
reçoit des liens entrants réels depuis le contenu (sinon page orpheline). Plus
une page `services` qui les regroupe, et `tarifs` (`serviceQuoteBuilder`) si
pertinent.

⚠️ **Le silo n'impose aucune composition figée.** Au-delà de ce minimum, **varie**
les blocs, leurs variantes et leur ordre — d'un silo à l'autre ET d'un client à
l'autre. Deux sites de services ne doivent PAS partager le même squelette de pages
internes (c'est le piège du clone). Choisis les blocs selon le sens de la
prestation (FAQ ciblée, `zone`, `galerie`, `etapes`, `avis`… quand c'est utile),
pas par habitude.

---

## BOUTIQUE EN LIGNE (module e-commerce : catalogue live + paiement Stripe)

Pour un client qui **vend en ligne** (restauration/click & collect, produits…) —
signalé par `boutique_tier` au dossier. Retour d'expérience de la 1re boutique
(`o-poulet-braise`, 2026-07-14) :

**Côté config (engine)** — le strict minimum :
- `shop: { enabled: true }` (top-level). `tenant` optionnel (défaut = `slug`).
- Une page « commander » avec un bloc **`catalogue`** (boutique LIVE : panier +
  Stripe hosted). NE PAS mettre les produits/prix dans la config : ils vivent
  dans le **back-office** (source de vérité prix/stock), chargés en direct.
- Une page **`merci`** (`navHidden: true` + `noindex: true`) avec un bloc
  **`commandeRecap`** (lit `?session_id=` posé par Stripe sur la success URL).
- `boutique` (statique, sortie « devis » sans paiement) ≠ `catalogue` (live +
  paiement). Pour vendre vraiment : `catalogue`.

**Menus composés / formules / add-ons (groupes d'options, 2026-07-15)** :
- Un produit peut porter des **groupes de choix** (« 2 accompagnements au choix »,
  « 1 boisson au choix », suppléments +X €) — définis dans la fiche produit du
  back-office (« Choix pour le client »), génériques tous métiers.
- Côté engine : **rien à configurer** — le bloc `catalogue` détecte les options et
  ouvre un configurateur (compteurs, min/max, prix live) ; chaque composition fait
  sa propre ligne de panier. Le back-office reste seul juge (validation min/max +
  prix = base + suppléments recalculés en DB au checkout, code erreur
  `options_invalid`). Les choix sont snapshotés sur la commande (admin, mail,
  Stripe, page merci).
- **Choix = un produit du catalogue** : un choix peut être lié à un produit vendu à
  l'unité (ex. « Riz thaï ») plutôt qu'un libellé libre → réutilise nom + photo, et
  **le choisir dans un menu décompte le stock du produit lié**. Le configurateur
  affiche l'image et grise les choix épuisés (`available:false`). Le marchand lie via
  l'autocomplétion de la fiche produit ; côté engine c'est transparent.

**Côté back-office (à provisionner AVANT de livrer)** — c'est là que ça bloque :
- Le tenant doit exister avec **produits + catégories + modes de livraison +
  Stripe connecté**. Vérifier d'un `curl` :
  `GET {BACKOFFICE_API_URL}/v1/public/tenants/<slug>/catalog` (header `X-API-Key`)
  → regarder `products`, `delivery_methods`, `tenant.checkout_enabled`.
- **Produits vides = boutique vide** : le bloc affiche alors le `emptyMessage` de
  la config (prévois-en un utile, ex. « appelez-nous au … »). Le menu/les prix
  sont saisis côté **admin back-office**, pas par l'engine.

**Env engine (Vercel) — sinon la boutique casse en prod** :
- `SHOP_API_URL=https://api.xklic.com` (en local `.env.local` pointe sur
  `localhost:8080` → catalogue « momentanément indisponible » tant que l'API Go
  locale ne tourne pas : c'est normal en dev).
- `ENGINE_API_KEY` **valide** contre le back-office (⚠️ distincte de
  `BACKOFFICE_API_KEY`; la valeur locale peut être un placeholder qui renvoie 401).
- États du bloc `catalogue` : `loadError` → « indisponible » ; chargé + 0 produit
  → `emptyMessage` ; sinon panier → `POST /api/shop/checkout` → Stripe.

**Turnstile sur la boutique** : `forms.turnstile` n'a d'effet que si le tenant a
un **widget assigné** côté back-office (sinon pas de sitekey) ET si le
(sous-)domaine est **dans les hostnames du widget**. Pour un sous-domaine
`.xklic.com` neuf, l'ajouter au widget (sinon 403 au checkout). Sans widget, laisser
`forms.turnstile` absent : le honeypot protège déjà, le checkout marche.

---

## RÈGLES PARTICULIÈRES

- **Avis** : **vrais avis Google uniquement**, recopiés fidèlement (jamais reformulés).
  **Jamais** de témoignages inventés — même signalés comme « exemple » / « à titre
  d'illustration » : c'est visible en prod, ça détruit la confiance et c'est un risque
  Google (faux avis / Helpful Content). Mention type *« Avis authentiques publiés par nos
  clients sur notre fiche Google »*. **Pas de vrais avis → pas de bloc `avis`** (le moteur
  ne rend rien si `items` est vide) ; la page « Laissez un avis » (`googleReviewUrl`)
  sert à en collecter. Modèle de référence : `parfait-menage-26`.
- **Formule** `google`/`haut-google` → SEO/GEO poussé au maximum.
- **Crédit d'impôt** : simulateur + page `credit-impot` + badges 50 %, **uniquement**
  pour prestations au domicile d'un particulier. Jamais B2B / locaux pros / produits.
- **Géo** : `geo` (lat/lng) approximatif depuis la ville/adresse — **signale-le** à
  affiner avec les vraies coordonnées de la fiche Google.
- **Légal** : mentions + confidentialité cohérentes, honnêteté des dispositifs.
- **`llms.txt`** : **auto-généré** depuis la config (`buildLlmsTxt`, servi par domaine
  comme le sitemap) — n'écris jamais de fichier `llms.txt` à la main. Il reflète nom,
  services (avec liens vers les pages silo), zone, contact : une config propre = un
  `llms.txt` propre.

---

## CHECKLIST SEO — leçons de l'audit du parc (2026-07-11)

Chaque point ci-dessous est une erreur RÉELLEMENT constatée en prod sur le parc.
À vérifier systématiquement avant de livrer une config.

**Balises**
- `meta.title` : **≤ 55 caractères, SANS le nom de l'entreprise** — le moteur
  ajoute ` — <entreprise.nom>` lui-même (et déduplique, mais un title propre reste
  plus court). Service + ville EN TÊTE (la troncature SERP coupe vers 60 c.).
  Constaté : titles de 77 à 114 c. avec marque en double sur 3 sites.
- `meta.description` : 140-155 caractères, l'argument clé (prix, crédit d'impôt…)
  dans les 120 premiers. Jamais la même description sur deux pages (constaté :
  home ≈ /services chez un client).

**i18n (sites multilingues)**
- Un `<locale>.json` = du **CONTENU traduit**, rien d'autre. Les champs techniques
  (`customDomains`, `domain`, `demo`, `noindexSite`, `geo`, `forms`,
  `googleReviewUrl`, `social`, `theme`, `stylePack`) sont **hérités de
  `config.json`** par le loader — ne JAMAIS les répéter dans une locale.
  (Bug historique : locale sans `customDomains` → canonical/hreflang des pages
  EN/AR émis sur `<slug>.xklic.com` ; 3 sites touchés en prod.)
- **Toute évolution de `config.json` doit être répliquée traduite dans CHAQUE
  locale** (bloc ajouté, meta modifiée, page nouvelle). Constaté : simulateur
  absent de l'EN, Turnstile désactivé côté EN.

**Contenu**
- Aucune page service sous **~150 mots utiles** (hors nav/footer) : pageHero +
  3 cartes + CTA = thin content qui ne ranke pas. Chaque silo porte un bloc
  `contenu` (déroulé concret, inclus/exclus) + une **FAQ propre à la page**
  (3-4 questions spécifiques au service).
- **Jamais la même FAQ sur deux pages** (ni la même question crédit d'impôt
  partout) : le détail fiscal vit sur `/credit-impot`, les autres pages y renvoient.
- **Unicité vs LE PARC, pas seulement vs le client** : ne réutilise jamais les
  intros de blocs devis/contact/zone d'un autre site, ni les formulations FAQ
  crédit d'impôt/CESU d'un autre client — reformule TOUT dans le registre du
  client (l'audit a mesuré jusqu'à 26 % de texte commun entre deux clients sur
  une page money ; c'est l'empreinte « réseau de sites » la plus dangereuse).

**Ciblage local**
- Une ville n'apparaît dans les metas/keywords **que si une page la porte
  réellement** (title + contenu dédiés). Lister une métropole en zone n'est PAS
  la cibler (constaté : Lyon, Aix, Montpellier revendiquées sans page).
- Si deux clients du parc partagent une ville : **différencier les angles
  éditoriaux et les patterns de titles** (sinon ils se cannibalisent en SERP).
- `/zone-intervention` n'est pas une liste de communes : un paragraphe par
  bassin/secteur, sinon la page ne capte rien.

**Maillage**
- Aucune page **orpheline** : une page `navHidden: true` doit recevoir des liens
  depuis le contenu (cartes services `href`, badges cliquables, blocs zone).
  Constaté : `/credit-impot` (l'argument n°1 du client !) sans AUCUN lien entrant.
- Liens croisés entre pages service sœurs (« autres prestations »).

**Données**
- `contact.adresse` : **ne l'écris pas par défaut.** L'adresse affichée est
  résolue par `resolveAdresse()` (`src/lib/adresse.ts`) et se déduit du **statut
  juridique**, sans rien à recopier :
  - **société** (SARL, SAS, SASU, EURL, SA, SCI, SRL/SPRL belge… ou `capital`
    renseigné) → repli automatique sur `entreprise.siege`, dont la publicité est
    déjà acquise au RCS / à la BCE. **Laisse la clé absente.**
  - **personne physique** (EI, micro-entrepreneur / auto-entrepreneur, et
    équivalents belges) → **aucune adresse affichée**, jamais de repli : le siège
    est presque toujours le **domicile du dirigeant**. Laisse la clé absente.
    Les mentions légales continuent d'afficher le siège, comme la loi l'exige.
  - Ne renseigne `contact.adresse` que si l'adresse est un **lieu qui reçoit du
    public** (boutique, atelier, agence) ou un simple **libellé de zone** — c'est
    un acte délibéré, y compris pour une personne physique. Une vraie voie
    postale ou un libellé de zone ; le JSON-LD filtre les accroches type
    « 22 communes autour de… », mais l'UI, elle, les affiche.
  - `"adresse": false` = masquage explicite, même pour une société.
- `social[]` = des **URLs** (WhatsApp → `https://wa.me/336…`, jamais un numéro
  brut) ; ajouter le lien Google Maps de la fiche (`platform: "google"`) quand
  il existe → `hasMap` (sinon dérivé de `googleReviewUrl`).
- Avis : en plus de « vrais avis Google uniquement » — **jamais un avis du
  dirigeant ou de sa famille** (constaté en prod, crédibilité détruite).
- Crédit d'impôt : rappel — domicile de particulier UNIQUEMENT. Un débarras /
  une évacuation de déchets n'y est PAS éligible, même dans une prestation
  « syndrome de Diogène » (constaté : promesse non conforme en prod).

**Après mise en ligne**
- Propriété **Search Console du domaine client** : `sync-sitemaps.mjs` ne couvre
  que `sc-domain:xklic.com` — dérouler l'étape `gsc` d'onboard (TXT) pour chaque
  domaine perso, sinon zéro suivi d'indexation.
- `npm run canonicals:check` après chaque deploy touchant un site multilingue ou
  un domaine : vérifie que le canonical de chaque accueil (et de chaque langue)
  pointe le bon domaine.

---

## CONVENTIONS DE BLOCS (pièges vérifiés)

- **Icônes** = noms **lucide en PascalCase** (`Flame`, `ChefHat`, `Star`,
  `BadgeCheck`, `Utensils`, `CreditCard`, `ShoppingBag`…). Un nom inconnu ou en
  kebab-case retombe **silencieusement** sur `Sparkles` (toutes les icônes se
  ressemblent alors). Vaut pour `hero.trust[].icone`, `etapes[].icone`,
  `services[].icone`.
- **Hero — CTA secondaire** : ne peut PAS être un canal de contact
  (`tel:`/`mailto:`/`wa.me`) — `resolveHeroSecondary` le remplace par un lien
  « explore » vers une page interne (souvent un doublon du CTA primaire). Le
  téléphone vit dans le **header** + le **bouton flottant** + le bloc `contact` ;
  le bloc `cta` de bas de page, lui, accepte un `tel:`. Pour un hero à une seule
  action, ne mets **que** `ctaPrimaire`.
- **Hero variant `centre`** : le sous-titre descriptif se met dans **`accroche`**
  (pas `sousTitre`, qui ne sert que de repli au badge quand `eyebrow` est absent).
- **Hero plein cadre `plein`** (image de fond + texte blanc ancré en bas) : le hero
  remonte SOUS l'en-tête, qui bascule **automatiquement en overlay** (transparent,
  logo/nav/tél en blanc, sans bordure ; solide au scroll). Détecté quand le 1er bloc
  de la page est un hero `plein`/`fondu` avec image → n'affecte que ces pages, le
  reste du parc garde son en-tête habituel. Idéal restauration/immersif.

---

## SI LE MOTEUR NE COUVRE PAS UN BESOIN

Ne bricole jamais : arrête-toi, propose le bloc à créer (nom, rôle, champs) + son
entrée catalogue, attends ma validation, puis utilise-le.

---

## DEFINITION OF DONE — validations OBLIGATOIRES avant de livrer

Un site n'est « au niveau du parc » que si TOUT passe :

```bash
python3 -m json.tool config/sites/<slug>/*.json   # chaque fichier
node scripts/generate-sites-manifest.mjs           # manifeste à jour
npx tsc --noEmit                                   # config conforme au schéma
npm run dedup:check                                # ZÉRO séquence partagée avec le parc
npm run build                                      # build vert
```

- `dedup:check` est **le seul juge** de l'unicité : même deux rédactions
  indépendantes convergent (constaté à l'audit 2026-07 : 116 séquences après
  une réécriture pourtant « originale »). Tant qu'il sort ✗, on réécrit.
- Après mise en ligne (`npm run deploy`) : `npm run canonicals:check` (chaque
  langue annonce le bon domaine) + curl du title/description/JSON-LD sur 2-3
  pages réelles. Propriété **Search Console** du domaine client (étape `gsc`
  d'onboard) — sans elle, zéro suivi.
- Prospect non signé : `demo: true` + `noindexSite: true`, pas de
  `customDomains` — la levée de ces flags à la signature suit `MODIFCLIENT.md`
  (cas « Passer un prospect en client »).

> Pour toute MODIFICATION ultérieure d'un site existant : suivre
> **`MODIFCLIENT.md`** (les 6 réflexes) — jamais de modif « rapide » hors process.

---

## À LA FIN

Récap court : `<slug>`, langues et pages générées, `stylePack` choisi (et pourquoi),
prestations en pages silo, résultats des validations (dedup/tsc/build), et
**tout manque ou hypothèse signalé** (donnée client absente = demandée, jamais
inventée).

---

## DOSSIER CLIENT :

On te donne **uniquement le nom de l'entreprise ou la Ref** du dossier (ci-dessous).
Tu ne colles JAMAIS de données client à la main : tu les récupères depuis le
back-office avec le script dédié.

```bash
npm run dossier:get -- "<nom de l'entreprise | Ref | OrderId>"
```

- **stdout** = le JSON des données du dossier (tel que fourni par le back-office,
  le paiement retiré) : c'est la **SOURCE de vérité** pour bâtir la config.
- **stderr** = un résumé lisible (statuts commande/production, métier, ville,
  e-mail, téléphone, nb d'éléments liés) — pour vérifier d'un coup d'œil.
- Si **plusieurs dossiers** correspondent, le script liste les candidats avec leur
  Ref : relance avec le **nom exact** ou la **Ref**.
- Si un **identifiant légal** (SIREN/SIRET, BCE/KBO, équivalent étranger) figure
  au dossier → applique l'ENRICHISSEMENT ci-dessus.
- Rappel : `dossier:get` lit `.env.local` (`BACKOFFICE_API_URL`,
  `BACKOFFICE_API_KEY`), c'est un script **local de lecture** (API Go du
  back-office, distinct des écritures de la prod).

⚠️ Ne **jamais committer** la sortie du script (données client réelles, e-mails,
téléphone, OrderId, secrets) — ni dans ce fichier, ni ailleurs dans le repo.

<!-- Nom / Ref du dossier à traiter : -->

