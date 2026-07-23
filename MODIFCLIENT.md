# MODIFCLIENT — modifier un site client SANS créer de dette

## RÔLE

Guide **réflexe** pour TOUTE modification d'un site existant (`config/sites/<slug>/`),
du changement de texte à l'ajout de page. Objectif : chaque modification laisse le
site **au niveau du parc** — on ne crée jamais de « rattrapage pour plus tard ».
L'audit de 2026-07 a coûté 4 vagues de corrections ; ce fichier existe pour ne
plus jamais avoir à le refaire.

> Pour la CRÉATION d'un site : `NEWCLIENT.md`. Ce fichier-ci couvre la
> modification. Les deux partagent la même checklist SEO (dans NEWCLIENT.md).

---

## LES 6 RÉFLEXES (à dérouler à CHAQUE modification)

### 1. Multilingue = TOUTES les langues, TOUJOURS

Si le site a des `<locale>.json` (regarde le dossier !), **toute** modification de
`config.json` (texte, bloc ajouté/retiré/déplacé, meta, page nouvelle) est
répliquée **traduite** dans **chaque** locale, à structure de blocs identique.
Une modif FR seule = un site étranger qui régresse en silence (vécu en prod :
simulateur absent de l'EN, anti-spam désactivé côté EN, avis inventés restés
dans l'AR).

**Jamais** de champs techniques dans une locale (`customDomains`, `domain`,
`demo`, `noindexSite`, `geo`, `forms`, `googleReviewUrl`, `social`, `theme`,
`stylePack`) : ils sont **hérités** de `config.json` par le loader
(`inheritTechnical`, `src/lib/config-loader.ts`). S'ils traînent dans une
locale, retire-les.

### 2. Tout texte nouveau est UNIQUE — et c'est le script qui juge

Chaque phrase que tu écris doit être propre à CE site, y compris les
« petites » intros de blocs contact/devis/zone/CTA et les FAQ. Ne te fie
jamais à ton impression :

```bash
npm run dedup:check              # tout le parc
node scripts/check-duplication.mjs <slug>   # paires impliquant ce site
```

Zéro séquence partagée = seul état acceptable. Leçon de l'audit : même des
rédactions faites en parallèle par des agents différents **convergent** (116
séquences retrouvées après la 1re vague) — vérifier au script, systématiquement,
après TOUTE rédaction.

### 3. Les bornes meta ne se renégocient pas

- `meta.title` page intérieure : **≤ 55 c, SANS le nom de l'entreprise** (le
  moteur le suffixe et déduplique). Home : marque + accroche, ≤ 55 c.
- `meta.description` : **140-155 c**, l'argument clé dans les 120 premiers.
- Un prix cité doit être **cohérent partout** : si le title dit « dès 15 €/h »
  (après crédit d'impôt) et le H1 « 30 €/h » (facturé), expliciter les deux
  côte à côte. Jamais deux chiffres nus qui se contredisent.

### 4. Une page ajoutée = une page maillée (et l'inverse)

- Nouvelle page → au minimum 2-3 **liens entrants réels** depuis le contenu
  (cartes services `href`, champ `lien` des blocs cta, badges cliquables) —
  `navHidden: true` sans liens entrants = page orpheline invisible (vécu :
  `/credit-impot`, l'argument n°1 d'un client, avait **zéro** lien entrant).
- Page service → le **minimum silo** : meta propre, pageHero + breadcrumb,
  bloc `service{}`, FAQ propre (questions jamais réutilisées ailleurs),
  bloc contenu ≥ ~150 mots utiles, liens vers 2-3 pages sœurs.
- Page supprimée/renommée → chercher les liens entrants (`grep` du chemin dans
  la config) et les rediriger.

### 5. Zéro fait inventé, zéro promesse hors cadre

- Prix, avis, adresses, délais, notes, certifications : **uniquement** des
  données fournies par le client ou déjà dans la config. Donnée manquante →
  on la demande, on n'improvise pas (et on le signale dans le récap).
- Avis : vrais avis Google, recopiés fidèlement, **jamais** le dirigeant ni sa
  famille. Pas d'avis → pas de bloc avis.
- Crédit d'impôt 50 % : domicile de particulier UNIQUEMENT. Jamais sur du
  débarras/évacuation (même dans une prestation Diogène), jamais B2B. Au
  moindre doute : « selon la nature de la prestation, précisé au devis ».
- Une ville n'entre dans les metas/keywords QUE si une page la porte vraiment.
  L'ajouter « pour le SEO » sans page = dilution (vécu : Lyon, Aix, Montpellier).

### 6. Valider, déployer, VÉRIFIER EN PROD

Dans l'ordre, à chaque fois :

```bash
python3 -m json.tool config/sites/<slug>/*.json   # chaque fichier touché
node scripts/generate-sites-manifest.mjs
npx tsc --noEmit
npm run dedup:check
npm run build            # si blocs/pages ajoutés (pas pour un simple texte)
npm run deploy           # push + attente READY + syncs
npm run canonicals:check # OBLIGATOIRE si multilingue ou domaine touché
```

Puis contrôle le rendu réel : `curl -s https://<domaine>/<page>` → title,
description, canonical, et le JSON-LD si la donnée modifiée y transite
(prix, horaires, adresse, FAQ). Un deploy sans vérification live n'est pas
une modification terminée.

---

## CAS FRÉQUENTS — le piège de chacun

| Modification | Le piège à ne pas rater |
|---|---|
| Changer un prix | Le prix vit en 4+ endroits : title, H1, blocs, FAQ, `service.priceFrom` (JSON-LD), simulateur — et dans CHAQUE locale. Grep le chiffre AVANT/APRÈS. |
| Ajouter une prestation | C'est un silo complet (réflexe 4), pas une carte de plus sur la home. FAQ et textes uniques (réflexe 2). |
| Redesign / changement de blocs | Répliquer la structure dans toutes les locales (réflexe 1) ; re-vérifier H1 unique et og:image après coup. |
| Changer domaine / langues | `customDomains` apex en premier, UNIQUEMENT dans config.json ; onboard pour le câblage ; `canonicals:check` après deploy ; propriété GSC du nouveau domaine (étape `gsc`). |
| Retoucher les horaires/adresse | Horaires : format parsable pour le JSON-LD, jours « Lun - Ven », heures « 8h30 - 18h » (sinon omis). Adresse : ne pas écrire `contact.adresse`, `resolveAdresse()` se replie sur `entreprise.siege` — on affiche par défaut (déjà publique sur la fiche Google). La renseigner seulement pour afficher autre chose que le siège ; `"adresse": false` pour masquer, **à la demande du client uniquement**. |
| Passer un prospect en client | Retirer `noindexSite` (PAS `demo` si hors portfolio), câbler `customDomains` + onboard, propriété GSC, `canonicals:check`, et relire la checklist SEO de NEWCLIENT.md en entier. |
| Ajouter des avis | Vrais avis Google uniquement, fidèles, jamais dirigeant/famille ; `googleReviewUrl` renseigné → page /avis + hasMap automatiques. |

---

## À LA FIN — récap obligatoire

Comme pour un nouveau client : ce qui a changé, dans quelles langues, les
validations passées (dedup/tsc/build/canonicals), la vérification live
effectuée, et **tout manque signalé** (donnée client à demander, décision en
attente). Une modification sans récap ni vérification = non terminée.
