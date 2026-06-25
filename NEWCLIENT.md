## RÔLE

Génère la config d'un NOUVEAU site client pour le moteur `agence_website`, à
partir des DONNÉES collées en bas (en-têtes + valeurs). Le résultat : un site
complet, crédible et **unique**, propre au métier et à la ville du client.

---

## NON-NÉGOCIABLE : ZÉRO COPIE, ZÉRO BIAIS

- Tu ne copies **aucun** site existant : ni structure, ni contenu, ni design, ni
  mots, ni palette.
- Tu peux lire les configs existantes (`config/sites/*`) **uniquement** pour
  comprendre le schéma et les conventions techniques — **jamais comme modèle à
  imiter**. Aucun site n'est une référence privilégiée.
- Contenu rédactionnel **100 % original**, spécifique à ce client.
- Tu n'inventes **aucun fait**. Colonne vide = champ absent : tu ne l'affiches pas.
- Tu ne fais **que** ce que les données demandent.

---

## ENRICHISSEMENT (si SIREN/SIRET renseigné)

Si un SIREN/SIRET est fourni, déduis et recoupe les données légales de
l'entreprise (raison sociale, forme juridique, dirigeant, adresse, statut) en
croisant **societe.com** et **pappers.fr**. N'utilise que ce qui est concordant ;
signale tout écart ou doute.

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
   Ne reproduis **aucun** squelette existant (surtout pas celui de sanadclean).

Toujours : mobile-first, contrastes AA, tout le texte via i18n.

---

## SILOS DE SERVICES (activité de services)

Pas de one-pager. À partir des prestations, crée **une page dédiée par
prestation** : `meta` propre, `pageHero` + `breadcrumb` (→ `BreadcrumbList`
JSON-LD), bloc `service` (→ `Service` JSON-LD), FAQ ciblée, bloc `zone`, maillage
interne, `navHidden: true`. Plus une page `services` qui les regroupe, et `tarifs`
(`serviceQuoteBuilder`) si pertinent.

---

## RÈGLES PARTICULIÈRES

- **Formule** `google`/`haut-google` → SEO/GEO poussé au maximum.
- **Crédit d'impôt** : simulateur + page `credit-impot` + badges 50 %, **uniquement**
  pour prestations au domicile d'un particulier. Jamais B2B / locaux pros / produits.
- **Géo** : `geo` (lat/lng) approximatif depuis la ville/adresse — **signale-le** à
  affiner avec les vraies coordonnées de la fiche Google.
- **Légal** : mentions + confidentialité cohérentes, honnêteté des dispositifs.

---

## SI LE MOTEUR NE COUVRE PAS UN BESOIN

Ne bricole jamais : arrête-toi, propose le bloc à créer (nom, rôle, champs) + son
entrée catalogue, attends ma validation, puis utilise-le.

---

## À LA FIN

Récap court : `<slug>`, langues et pages générées, `stylePack` choisi (et pourquoi),
prestations en pages silo, et **tout manque ou hypothèse signalé**.

---

## DONNÉES DU CLIENT   :

```
"{
  ""Date"": ""2026-06-25T12:35:17.626Z"",
  ""Statut"": ""payé"",
  ""Formule"": ""haut-google"",
  ""Entreprise"": ""Adelnet"",
  ""Metier"": ""Aide ménagère"",
  ""Ville"": ""Saint-Étienne"",
  ""Type"": ""services"",
  ""Se deplace"": ""oui"",
  ""Zone deplacement"": ""Saint Étienne  ,Lyon et alentours"",
  ""Prestations"": ""Comme sanad clean (sanadclean)"",
  ""Credit impot"": ""oui"",
  ""Produits"": """",
  ""Telephone"": ""760153853"",
  ""WhatsApp"": ""oui"",
  ""Email"": ""khadijaselhami00@gmail.com"",
  ""Local/Boutique"": ""non"",
  ""Adresse"": """",
  ""Disponibilites"": ""Lundi au dimanche 7h - 22h"",
  ""SIRET"": ""10336611800018"",
  ""SIRET en cours"": ""non"",
  ""Langues"": ""fr"",
  ""Styles"": ""Pro & rassurant, Moderne & dynamique, Naturel"",
  ""Couleur"": ""bleu"",
  ""Ambiance"": """",
  ""Logo"": """",
  ""Photos"": """",
  ""Facebook"": """",
  ""Instagram"": """",
  ""TikTok"": """",
  ""X"": """",
  ""Google"": """",
  ""Extra"": """",
  ""Mode"": ""Formulaire complet"",
  ""Montant"": ""179.80"",
  ""CodePromo"": ""SOUAD3"",
  ""OrderId"": ""1ce12265-07bd-4e60-8d0e-58b93a6d1f13"",
  ""SessionStripe"": ""cs_live_b15PlQ2FGpDeX9Fa9Z3ZNe8AUCFKX1rUy33AjoQqMxOPkHwuX3LdqnW5fv"",
  ""AbonnementStripe"": ""sub_1TmCUtBKXDIyeh9aBYWA7KGe"",
  ""nom domaine"": """",
  ""fournisseur"": """",
  ""date fin"": """",
  ""G-Lien"": """",
  ""MAIL PRO 2"": """",
  ""lien fiche google"": """",
  ""Commentaire"": ""Modifier le nom commercial de la société par \""Adelnet\""""
}"
```