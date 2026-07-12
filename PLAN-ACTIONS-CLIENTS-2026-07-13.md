# PLAN D'ACTIONS PAR CLIENT — améliorer les scores SEO

> Instantané mis à jour le 2026-07-13. Couvre : les 2 audits des 11-12/07
> (8 agents chacun), les 4 vagues de corrections déployées, le recentrage
> sanadclean (12/07) et le chantier casa complet (13/07 : NAP Berre-l'Étang,
> visuels, avis, page Aubagne, horaires 6h-22h). Scores = re-audit du 12/07,
> mesurés AVANT la passe finale (ce sont des planchers). Toute action se
> réalise selon les réflexes de `MODIFCLIENT.md`.

## Comment lire les scores (et pourquoi personne n'est à 10)

L'échelle est volontairement dure : **5 = moyen, 7 = bon, 9 = excellent**.
Un 7-8 sur cette échelle = **au-dessus de la quasi-totalité des TPE locales**.
Ce qui sépare un 8 d'un 10 n'est presque jamais la qualité de ce qu'on produit :

- **Données que seul le client détient** : photos réelles, vrais prix, avis.
  On ne les invente JAMAIS (un faux avis ou un faux prix détruit la confiance
  et crée un risque légal/Google) — donc tant qu'elles manquent, l'axe plafonne.
- **Signaux hors-site** : fiche Google Business, volume et fraîcheur des avis,
  ancienneté du domaine, liens entrants. Un site ne peut pas se les donner
  à lui-même — c'est du temps + un process de collecte côté client.
- **Choix structurels assumés du moteur** : pas de blog/contenu frais, pas de
  pages ville programmatiques (on a démonté une ferme geo-métier pour de
  bonnes raisons — policies Google). Un 10/10 « contenu » supposerait un
  travail éditorial continu, qui est une prestation en soi, pas un défaut.
- **Une part de jugement d'auditeur** : entre deux audits, le même fait
  (large zone desservie) a été compté force puis faiblesse. Les scores
  servent à PRIORISER, pas à noter notre travail au point près.

**Verdict des auditeurs sur les 6 clients : tous « oui, SEO satisfaisant ».**

---

## Actions transverses (tout le parc)

| Action | Impact | Qui | Effort |
|---|---|---|---|
| Vérifier/créer la propriété **Search Console** de chaque domaine client (étape `gsc` d'onboard, TXT) et soumettre le sitemap | Pilotage : sans elle on ne VOIT pas l'indexation ni les problèmes. Préalable à toute mesure de progrès | Nous | ~30 min/site, une fois |
| Process de **collecte d'avis** systématique (demander l'avis après chaque prestation, lien direct /avis du site) | Local : LE levier du pack local (carte en haut de Google). Effet cumulatif | Client (nous : le lien est déjà en place) | Continu |
| **Liens locaux** de qualité (CCI, annuaires métier sérieux, partenaires, presse locale) | Autorité du domaine : départage deux sites égaux par ailleurs | Client + nous (conseil) | Continu, opportuniste |
| Surveiller `npm run dedup:check` à chaque rédaction et `canonicals:check` à chaque deploy | Garde le niveau acquis (zéro régression) | Nous | Automatique |

---

## adelnet — 7,0 (persona 8 · technique 8 · contenu 6 · local 6)

Le socle est très bon ; tout son retard est concentré sur la preuve sociale.

| # | Action | Impact attendu | Qui | Statut |
|---|---|---|---|---|
| 1 | **Fiche Google Business** : dès validation, envoyer l'URL → on branche `googleReviewUrl` (+ lien Maps en `social[]`) : page /avis, lien footer et hasMap s'activent automatiquement | **Local 6 → 7,5+** : débloque le pack local, aujourd'hui à zéro | Client (en cours) → nous 15 min | ⏳ fiche en validation côté client |
| 2 | **Collecter les premiers avis** puis bloc témoignages sur la home (vrais avis, verbatim) | Local + Persona : première preuve sociale du site | Client → nous 20 min | À la suite de #1 |
| 3 | **Photos réelles** de prestations (5-6 suffisent) → galerie + og:image par page | Contenu 6 → 7 : le site est 100 % texte/icônes aujourd'hui | Client → nous 30 min | À demander |
| 4 | Trancher **Lyon** : la zone liste 14 communes du Rhône sans contenu dédié — soit une vraie page si ambition réelle, soit retirer du bloc zone | Local : concentre le signal sur Saint-Étienne (même logique que le recentrage sanadclean) | Décision CEO/client | Ouvert |

## casa-clean-provence — 7,5 (persona 8 · technique 8 · contenu 6,5 · local 7,5)

Gros chantier bouclé le 2026-07-13 : NAP réaligné sur la fiche réelle
(**Berre-l'Étang**, Rue de la République 13130, GPS exact du plus code
F5F8+PV, horaires 6h-22h partout), 7 visuels Unsplash validés CEO (hero
arrière-plan « plein », og 1200×630, 5 pages illustrées), 2 avis frais
(3e écarté : famille), page pilote `/menage-aubagne`, clic adresse → fiche.

| # | Action | Impact attendu | Qui | Statut |
|---|---|---|---|---|
| 1 | ~~Visuels + image de partage~~ (illustrations banque en place) ; **vraies photos de chantiers** → page Réalisations dédiée | Persona + Contenu : la vraie preuve remplacera l'illustration | Client → nous 30 min | ✅ illustrations FAIT · vraies photos à demander |
| 2 | ~~2 avis Google frais~~ (Sami Zalmat, Sedat Ates intégrés, note 4,9 alignée fiche) ; collecte continue | Local + confiance | Client | ✅ FAIT · collecte continue |
| 3 | ~~Ventilation Diogène~~ | Conformité | Cliente | ✅ CONFIRMÉ 2026-07-13 |
| 4 | ~~Page Aubagne~~ (pilote en ligne) ; **suivre son indexation GSC 3-4 semaines**, puis répliquer sur **Aix** si ça capte | Local : seule façon de ranker hors Marseille | Nous (suivi) → décision Aix | ✅ Aubagne FAIT · suivi en cours |
| 5 | **Propriété Search Console** de casacleanprovence.fr à vérifier (préalable au suivi du pilote) | Pilotage | Nous | À vérifier |

## mb-nettoyage — 7,5 (persona 8 · technique 8 · contenu 7 · local 7)

| # | Action | Impact attendu | Qui | Statut |
|---|---|---|---|---|
| 1 | **Page dédiée « ménage à domicile Aix-en-Provence »** (2e marché revendiqué ; une section existe déjà sur /zone-intervention, insuffisante pour ranker) | **Local 7 → 8** : Aix = 145 000 hab., zéro URL ne peut la capter aujourd'hui | Décision → nous ~1 h | Ouvert |
| 2 | **1 photo réelle par prestation** (repassage, vitres, grand ménage réutilisent les 3 mêmes photos) | Contenu + partage social | Client → nous 20 min | À demander |
| 3 | **Nourrir la fiche Google** (avis réguliers — le site est déjà branché dessus) | Local, cumulatif | Client | Continu |

## parfait-menage-26 — 7,6 (persona 8,5 · technique 8,5 · contenu 6,5 · local 7)

Le mieux noté ; UNE donnée manquante le bride.

| # | Action | Impact attendu | Qui | Statut |
|---|---|---|---|---|
| 1 | **Un taux horaire indicatif** (ou grille simple) → `service.priceFrom` + section tarifs | **Contenu 6,5 → 7,5 + conversion** : « prix ménage Pierrelatte » est LA requête chaude, et l'argument −50 % crédit d'impôt dort sans chiffre. C'est l'action au meilleur ratio impact/effort du parc | Client (1 info) → nous 30 min | À demander |
| 2 | **Confirmer l'avance immédiate URSSAF** (proposée ou non) | Contenu page crédit d'impôt : on ne l'affirme pas tant que non confirmé | Client | À confirmer |
| 3 | **Surface Montélimar/Bollène** (pages secteur) si ambition — les bassins sont déjà rédigés sur /zone-intervention | Local : capter « ménage Montélimar » (ville 40 000 hab.) | Décision → nous ~1 h/page | Ouvert |

## sanadclean — 7,1 mesuré, réel plus haut (persona 8 · technique 8 · contenu 6,5 · local 6→↑)

Le recentrage « Nîmes et 30 km » (déployé 2026-07-12) corrige la cause n°1 de
sa note Local : promesse et réalité sont désormais alignées.

| # | Action | Impact attendu | Qui | Statut |
|---|---|---|---|---|
| 1 | ~~Recentrer la zone sur Nîmes + 30 km~~ | Local : signal concentré, fin de la cannibalisation Marseille | — | ✅ FAIT (déployé) |
| 2 | **Vérifier la fiche Google** de la cliente : si elle affiche encore Montpellier/Marseille, l'aligner sur la nouvelle zone | Cohérence site ↔ fiche (Google recoupe les deux) | Client (nous : conseil) | À vérifier |
| 3 | **Photos avant/après contextualisées** (prestation + commune) pour enrichir /realisations | Contenu : la page existe, elle mérite mieux que 6 clichés muets | Client → nous 20 min | À demander |
| 4 | Avis réguliers sur la fiche (déjà 5 vrais avis sur le site) | Local, cumulatif | Client | Continu |

## taxi-excellence — 7,6 (persona 8 · technique 8,5 · contenu 7 · local 7)

| # | Action | Impact attendu | Qui | Statut |
|---|---|---|---|---|
| 1 | **Confirmer la grille tarifs** : forfaits « au départ de la gare Saint-Roch » alors que la base est Gigean — la valider ou fournir la grille au départ de Gigean | Cohérence + conversion : la page tarifs est son meilleur atout, autant qu'elle soit juste | Client | À confirmer |
| 2 | **2-3 pages secteur** (taxi gare de Sète, Balaruc-les-Bains, Frontignan) | **Local 7 → 8** : « taxi Gigean » seul est un petit marché ; les stations balnéaires d'à côté sont la vraie demande | Décision → nous ~1-2 h | Ouvert |
| 3 | **Avis traduits côté EN** si le client le souhaite (aujourd'hui affichés en français avec mention, choix conservateur) | Persona EN (cible touristique) | Client (accord) | Optionnel |

## taxi-concept — prospect (hors index volontairement)

Déjà réécrit au niveau du parc (zéro duplication, silos complets). À la
signature, dérouler `MODIFCLIENT.md` (cas « Passer un prospect en client ») :

| # | Donnée à obtenir du prospect | Débloque |
|---|---|---|
| 1 | N° TVA intracommunautaire (config : « à compléter ») | Mentions légales conformes |
| 2 | URL fiche Google + confirmation que les 4 avis affichés en proviennent | Page /avis, hasMap, crédibilité |
| 3 | Tarifs réels (forfaits gares/aéroports, van, VIP, colis) | Page tarifs + simulateur (comme taxi-excellence) |
| 4 | Véhicule TPMR ? conventionné CPAM ? | Page PMR précise (fort différenciateur) |
| 5 | Photos réelles de la flotte | Persona/Contenu (2 visuels génériques aujourd'hui) |
| 6 | Domaine souhaité → onboard + levée `demo`/`noindexSite` + propriété GSC + `canonicals:check` | Mise en ligne |

---

## Récapitulatif : les 5 actions au meilleur ratio impact/effort

1. **parfait-menage-26 : obtenir UN taux horaire** (1 info client, 30 min de travail, gros impact SERP + conversion).
2. **adelnet : brancher la fiche Google dès validation** (15 min, débloque son levier n°1).
3. ~~casa : obtenir les photos~~ → illustrations en place (2026-07-13) ; prochaines vraies photos = page Réalisations.
4. **mb : décider la page Aix** (1 h de travail, un marché de 145 000 hab.).
5. **taxi-excellence : décider les pages Sète/Frontignan** (casse son plafond géographique).
