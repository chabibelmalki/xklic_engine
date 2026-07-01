## RÔLE

Génère la config d'un NOUVEAU site client pour le moteur `agence_website`, à
partir du DOSSIER client **récupéré depuis Baserow** (voir « DOSSIER CLIENT » en
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

## ENRICHISSEMENT (si SIREN/SIRET renseigné)

Si un SIREN/SIRET est fourni, déduis et recoupe les données légales de
l'entreprise (raison sociale, forme juridique, dirigeant, adresse, statut, GPS).
Source fiable et gratuite : `recherche-entreprises.api.gouv.fr/search?q=<siret>`
(`societe.com` et `pappers.fr` renvoient souvent 403 à la récupération auto).
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
- Logo/Photos : URLs déjà hébergées (Vercel Blob), référence-les directement.
- Domaine custom = branchement Vercel **manuel** : signale-le.

---

## DESIGN — CHAQUE SITE EST DISTINCT (lis `catalog.json`)

Deux clients ne se ressemblent pas. La différence vient surtout de la **TYPO**, du
**LAYOUT** et du **MOTION** — pas seulement de la couleur.

**RÈGLE ABSOLUE — aucun pack/thème n'est réservé à un métier.** Ne choisis JAMAIS
le design « par secteur » (« ménage → tel pack »). C'est ce réflexe qui produit
des clones. Le `stylePack` (structure/typo/motion) et le `theme` (couleur) sont
**deux axes indépendants à combiner librement** : tu peux mettre n'importe quelle
couleur sous n'importe quelle typo. Pioche dans **toute** la palette de packs ×
thèmes selon l'**ambiance** voulue et le **style demandé par le client**.

**AVANT de choisir : regarde les sites déjà en prod** (`config/sites/*`) et prends
sciemment un pack, un thème, un hero et une composition **différents** des clients
du même métier. Si un voisin proche existe (ex. autre site de ménage), tu DOIS
diverger sur la couleur, la typo, le hero ET l'ordre des blocs — pas juste l'un.

1. **`stylePack`** (`catalog.json > stylePacks.items`) — choisis selon l'**ambiance**
   et le style client, jamais selon le métier. Vérifie qu'aucun site existant
   n'utilise déjà ce pack pour ce métier.
2. **`theme`** (couleur) — choisi indépendamment du pack, selon la couleur demandée
   par le client.
3. **`variant`** (par bloc) — `recommendedVariants` n'est qu'une suggestion de
   combinaisons saines, pas une contrainte : mélange librement.
4. **ORDRE & COMPOSITION** (`pages[].blocks[]`) — invente une structure propre.
   Ne reproduis **aucun** squelette d'un site existant (accueil ET pages internes).

Toujours : mobile-first, contrastes AA, tout le texte via i18n.

---

## SILOS DE SERVICES (activité de services)

Pas de one-pager : crée **une page dédiée par prestation**. Le **minimum SEO** de
chaque silo (à respecter, mais ce n'est PAS un gabarit à recopier) : `meta` propre,
`pageHero` + `breadcrumb` (→ `BreadcrumbList`), bloc `service` (→ `Service`
JSON-LD), `navHidden: true`, et du maillage interne. Plus une page `services` qui
les regroupe, et `tarifs` (`serviceQuoteBuilder`) si pertinent.

⚠️ **Le silo n'impose aucune composition figée.** Au-delà de ce minimum, **varie**
les blocs, leurs variantes et leur ordre — d'un silo à l'autre ET d'un client à
l'autre. Deux sites de services ne doivent PAS partager le même squelette de pages
internes (c'est le piège du clone). Choisis les blocs selon le sens de la
prestation (FAQ ciblée, `zone`, `galerie`, `etapes`, `avis`… quand c'est utile),
pas par habitude.

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

## SI LE MOTEUR NE COUVRE PAS UN BESOIN

Ne bricole jamais : arrête-toi, propose le bloc à créer (nom, rôle, champs) + son
entrée catalogue, attends ma validation, puis utilise-le.

---

## À LA FIN

Récap court : `<slug>`, langues et pages générées, `stylePack` choisi (et pourquoi),
prestations en pages silo, et **tout manque ou hypothèse signalé**.

---

## DOSSIER CLIENT :

On te donne **uniquement le nom de l'entreprise ou la Ref** du dossier (ci-dessous).
Tu ne colles JAMAIS de données client à la main : tu les récupères depuis Baserow
avec le script dédié.

```bash
npm run dossier:get -- "<nom de l'entreprise | Ref | OrderId>"
```

- **stdout** = le JSON complet `{ dossier, paiements, production, notes, produits }`
  (menus déroulants et liens aplatis en valeurs lisibles) : c'est la **SOURCE de
  vérité** pour bâtir la config.
- **stderr** = un résumé lisible (statuts commande/production, métier, ville,
  e-mail, téléphone, nb d'éléments liés) — pour vérifier d'un coup d'œil.
- Si **plusieurs dossiers** correspondent, le script liste les candidats avec leur
  Ref : relance avec le **nom exact** ou la **Ref**.
- Si un **SIREN/SIRET** figure au dossier → applique l'ENRICHISSEMENT ci-dessus.
- Rappel : `dossier:get` lit `.env.local` (`BASEROW_TOKEN`, `BASEROW_TABLE_*`),
  c'est un script **local de lecture** (distinct du token d'écriture de la prod).

⚠️ Ne **jamais committer** la sortie du script (données client réelles, e-mails,
téléphone, OrderId, secrets) — ni dans ce fichier, ni ailleurs dans le repo.

<!-- Nom / Ref du dossier à traiter : -->

