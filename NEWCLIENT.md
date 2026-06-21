# NEWCLIENT — prompt de génération d'un site client

> Colle ce fichier EN ENTIER dans Claude Code, puis **une ligne du fichier Excel
> « nouveaux clients »** (séparée par des tabulations) à l'endroit indiqué tout
> en bas. Claude génère la config d'un nouveau site, au niveau de SANAD CLEAN.

---

## RÔLE

Génère la config d'un NOUVEAU client pour le moteur `agence_website`, à partir de
la LIGNE DE FORMULAIRE collée en bas. La référence de qualité est **SANAD CLEAN** :
lis `config/sites/sanadclean/` (`config.json` = langue par défaut, `en.json`,
`ar.json`) AVANT d'écrire quoi que ce soit, et atteins **au moins ce niveau** —
mais avec le contenu du nouveau client, jamais ses mots, et **un design différent**.

Tu n'inventes aucun fait (téléphone, SIRET, avis, réseau…) : tu n'utilises que ce
que la ligne fournit. Tout contenu rédactionnel est 100 % original et crédible.

---

## SORTIE ATTENDUE

```
config/sites/<slug>/
  config.json        # langue par défaut (1re langue de la colonne « Langues »)
  <lang>.json        # un fichier par AUTRE langue sélectionnée (ex. en.json, ar.json)
```

Les images (logo, photos) sont déjà hébergées sur **Vercel Blob** (même projet) :
on référence directement leurs URLs fournies dans le formulaire. Rien à télécharger,
aucun fichier à créer dans `public/`.

- `<slug>` = nom commercial normalisé (minuscules, sans accents ni espaces : `Boulangerie Léa` → `boulangerie-lea`).
- La config doit être **valide contre le schéma** (`src/types/config.ts`) et passer `npx tsc --noEmit`.
- Les sites sont **auto-découverts** depuis `config/sites/<slug>/` : pas de route à créer.
  Après avoir créé le dossier, régénère le manifeste avec
  `node scripts/generate-sites-manifest.mjs` (`src/lib/sites-manifest.ts` est
  généré — **ne l'édite jamais à la main**).

---

## MAPPING DES COLONNES EXCEL (ordre exact, séparées par des TABULATIONS)

La ligne contient ces 32 colonnes, dans cet ordre. Découpe sur les tabulations.

| # | Colonne | Où ça va dans la config |
|---|---|---|
| 1 | **Date** | Ignorer (métadonnée de lead). |
| 2 | **Statut** | Ignorer (pipeline commercial). |
| 3 | **Formule** | `site` / `google` / `haut-google`. Pilote l'AMBITION SEO (voir §Formule). |
| 4 | **Entreprise** | `entreprise.nom`, `meta.title`, dérive le `<slug>`. |
| 5 | **Metier** | Choix du `stylePack`, `seo.schemaType`, ton du contenu. |
| 6 | **Ville** | `seo.ville`, `geo` (lat/lng approx. de la ville/adresse — voir §Géo), zones. |
| 7 | **Type** | `services` / `produits` / `les-deux` → quels blocs (services vs boutique). |
| 8 | **Se deplace** | oui/non → bloc `zone` (rayon) si oui. |
| 9 | **Zone deplacement** | villes/rayon du bloc `zone` + `areaServed` JSON-LD. |
| 10 | **Prestations** | Texte libre → blocs `services`, `tarifs`/`serviceQuoteBuilder`, **pages silo** par prestation (voir §Silos). |
| 11 | **Credit impot** | oui/non/je-ne-sais-pas → si oui : bloc `simulateur` + page `credit-impot` + badges (services à la personne, **domicile particulier uniquement**). |
| 12 | **Produits** | JSON de produits (titre/prix/photo) → blocs `produits`/`boutique`. Vide si non pertinent. |
| 13 | **Telephone** | `contact.telephone`, CTA `tel:`. |
| 14 | **WhatsApp** | Numéro WhatsApp → `FloatingActions`/CTA `wa.me`. Vide = pas de WhatsApp. |
| 15 | **Email** | `forms.to` + `contact.email`. |
| 16 | **Local/Boutique** | oui → affiche adresse/horaires, carte ; éventuel accent boutique. |
| 17 | **Adresse** | `contact.adresse`, mentions légales, `streetAddress` JSON-LD, carte. |
| 18 | **Disponibilites** | `contact.horaires`, `openingHours` JSON-LD. |
| 19 | **SIRET** | `entreprise.siret` (+ `identifier` JSON-LD). |
| 20 | **SIRET en cours** | oui → SIRET « en cours », ne pas afficher de numéro inventé. |
| 21 | **Langues** | Liste (ex. `fr, en, ar`). 1re = défaut (`config.json`) ; les autres = `<lang>.json`. **Aucune autre langue → aucun fichier de traduction.** |
| 22 | **Styles** | Mots-clés de style → affine `stylePack` + `variant` par bloc. |
| 23 | **Couleur** | Préférence couleur → palette/accent (cohérente avec le pack). |
| 24 | **Ambiance** | Ambiance souhaitée → renforce le choix de pack + le motion. |
| 25 | **Logo** | URL Vercel Blob → `branding.logo` (lien direct, aucun téléchargement). |
| 26 | **Photos** | URLs Vercel Blob → `galerie`/héros (liens directs, aucun téléchargement). |
| 27 | **Facebook** | `social: [{ platform:"facebook", url }]` si fourni. |
| 28 | **Instagram** | idem `instagram`. |
| 29 | **TikTok** | idem `tiktok`. |
| 30 | **X** | idem `x`. |
| 31 | **Google** | idem `google` (fiche Google → `hasMap` + source des vraies étoiles). |
| 32 | **Extra** | Demande libre / précisions → à prendre en compte ou à signaler si hors moteur. |

Colonne vide = champ absent. **Tu ne fais que ce que la ligne demande, ni plus ni moins.**

---

## DESIGN — RENDS CHAQUE SITE DISTINCT (lis `catalog.json`)

Deux clients ne doivent PAS se ressembler. La différence vient surtout de la TYPO,
du LAYOUT et du MOTION — pas que de la couleur. Trois leviers :

1. **`stylePack`** (niveau site, `catalog.json > stylePacks.items`) — choisis selon le métier/l'ambiance :

   | Pack | Pour |
   |---|---|
   | `maison-premium` | pâtisserie, traiteur, bijoutier, hôtellerie (serif haut de gamme, ivoire/encre/or) |
   | `atelier-industriel` | garage, BTP, métallerie, déménagement (condensé MAJUSCULES, anthracite + orange) |
   | `clair-frais` | ménage, garde d'enfants, dentiste, pressing (teal/ciel, arrondi, pill — **c'est SANAD CLEAN**) |
   | `pop-moderne` | coaching, food, événementiel, agence créa (violet/lime/corail, ombres dures, joueur) |
   | `terra-naturel` | paysagiste, bien-être, bio, yoga (sauge/terracotta, soft-serif, organique) |

   ⚠️ Un nouveau client dans le MÊME métier que SANAD CLEAN (ménage) doit quand même
   **se démarquer** : même pack possible mais varie couleur/variantes/composition,
   ou choisis un pack voisin. Le but est qu'aucun site ne soit le clone d'un autre.

2. **`variant`** (par bloc) — pour chaque bloc, prends une variante dans
   `stylePacks.items[].recommendedVariants` du pack (liste complète des variantes
   dans `catalog.json > blocks`). Reste dans les recommandées pour garder l'harmonie.

3. **ORDRE & COMPOSITION** (`pages[].blocks[]`) — choisis QUELS blocs et dans QUEL
   ORDRE, adapté au métier. Ne reproduis pas mécaniquement le squelette de SANAD CLEAN.

Toujours : mobile-first, contrastes AA, tout le texte passe par l'i18n.

---

## SILOS DE SERVICES (le standard SANAD CLEAN, à reproduire)

Pour une activité de services, ne te contente pas d'un one-pager. À partir de la
colonne **Prestations**, crée **une page dédiée par prestation** (comme
`menage-domicile`, `nettoyage-vitres`… dans sanadclean), chacune avec :
- `meta` propre (title `<prestation> à <ville>`, description, `keywords`) ;
- `pageHero` avec **`breadcrumb`** (Accueil › Services › Prestation) — il alimente le `BreadcrumbList` JSON-LD ;
- bloc **`service`** (name, serviceType, priceFrom) → JSON-LD `Service` ;
- FAQ ciblée + bloc `zone` + maillage interne « nos autres prestations » ;
- `navHidden: true` (liées depuis la grille services, pas dans le menu).

Plus une page `services` qui les regroupe, et `tarifs` (`serviceQuoteBuilder`) si
les prix s'y prêtent. SEO toujours : `sitemap`/`robots`/`llms.txt` sont générés
automatiquement par le moteur à partir des pages — pas de fichier à écrire.

---

## RÈGLES PARTICULIÈRES

- **Formule** : `site` = vitrine complète. `google`/`haut-google` = pousse le SEO/GEO
  au maximum (toutes les pages silo, FAQ riches, page `zone-intervention`, `llms.txt`
  bien rempli). `haut-google` = ambition SEO maximale.
- **Crédit d'impôt** : uniquement pour les prestations au **domicile d'un particulier**
  (services à la personne). Jamais sur du B2B / locaux pros / produits. Si « oui »,
  ajoute simulateur + page `credit-impot` + badges 50 %, comme sanadclean.
- **Géo** : déduis un `geo` (lat/lng) approximatif depuis la ville/adresse et **signale-le**
  comme à affiner avec les vraies coordonnées de la fiche Google.
- **Images** : référence directement les URLs Vercel Blob fournies (Logo/Photos) —
  même projet, rien à télécharger. (SANAD CLEAN, avec ses images locales dans
  `public/`, était une exception : ne la reproduis pas.)
- **Légal** : mentions légales + confidentialité cohérentes (statut, dirigeant si
  fourni, SIRET ou « en cours », hébergeur Vercel). Honnêteté des dispositifs.

---

## SI LE MOTEUR NE COUVRE PAS UN BESOIN

Ne bricole jamais. Si un besoin (ex. un type de bloc) n'existe pas :
1. Arrête-toi et dis-le clairement.
2. Propose le bloc à créer (nom, rôle, champs) + son entrée catalogue.
3. Attends ma validation avant de le construire, puis utilise-le dans la config.

---

## À LA FIN

Récap court : `<slug>`, langues et pages générées, `stylePack` choisi (et pourquoi),
prestations transformées en pages silo, et **tout manque ou hypothèse signalé**
(géo approximatif, champ ambigu, image manquante…).

---

## FORMULAIRE DU CLIENT (colle UNE ligne de l'Excel, séparée par des tabulations) :

```
<<< COLLE ICI LA LIGNE >>>
```
