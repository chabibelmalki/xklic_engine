RÔLE
Génère la config d'un NOUVEAU client pour le moteur agence_website, à partir des réponses
du FORMULAIRE collé ci-dessous. Inspire-toi des sites existants pour la qualité et la
structure — notamment config/sites/souadtazya/ (config.json = défaut, en.json, ar.json).
Atteins au moins ce niveau, avec le contenu du client, jamais ses mots.

SUIS LE FORMULAIRE À LA LETTRE
Tu ne fais que ce que le formulaire demande, ni plus ni moins.
- Langues : génère uniquement celles sélectionnées. Si seule la langue par défaut est choisie,
  tu ne crées AUCUN fichier de traduction.
- Même logique pour toute option : tu n'ajoutes pas ce qui n'a pas été demandé, tu n'omets
  pas ce qui l'a été.

SORTIE
config/sites/<slug>/ en miroir de la structure de l'exemple (config.json + un fichier par
langue sélectionnée). <slug> dérivé du nom commercial. Config valide contre le schéma.

QUALITÉ
Même soin que souadtazya : complet, crédible, responsive, SEO propre, contenu 100 % original.

STYLE-AWARE : RENDS CHAQUE SITE DISTINCT (lis catalog.json)
Deux sites ne doivent PAS se ressembler. La différence vient surtout de la TYPO, du
LAYOUT et du MOTION — pas que de la couleur. Trois leviers, à varier d'un client à l'autre :
1. `stylePack` (niveau site) : choisis le pack dont l'ambiance colle au métier
   (voir catalog.json > stylePacks). Ex. pâtisserie → maison-premium, garage →
   atelier-industriel, ménage → clair-frais, coach/food → pop-moderne, paysagiste/
   bien-être → terra-naturel. Le pack porte sa propre palette : `theme` devient
   secondaire (laisse-le cohérent, ou omets-le).
2. `variant` (par bloc) : pour CHAQUE bloc, prends une variante dans la curation du
   pack (catalog.json > stylePacks[].recommendedVariants). Reste dans les variantes
   recommandées du pack pour ne pas casser l'harmonie. La liste complète des
   variantes par bloc est dans catalog.json > blocks.
3. ORDRE & COMPOSITION (`pages[].blocks[]`) : choisis QUELS blocs et dans QUEL ORDRE.
   Deux clients doivent avoir un squelette différent (pas toujours hero → services →
   tarifs → avis → contact). Adapte au métier.
Garde mobile-first, contrastes AA, et le contenu passe toujours par l'i18n.

SI UN BESOIN N'EST PAS COUVERT PAR LE MOTEUR
Ne bricole jamais. Exemple : une pâtisserie veut afficher ses produits avec photos + prix,
mais le bloc `tarifs` actuel est pensé pour le ménage et ne convient pas. Dans ce cas :
  1. Arrête-toi et dis-moi clairement que le composant n'existe pas.
  2. Propose le nouveau bloc que tu créerais (nom, rôle, champs).
  3. Attends ma validation avant de le construire.
Une fois validé : tu l'ajoutes au moteur + au catalogue, puis tu l'utilises dans la config.

À la fin : récap court — slug, langues et pages générées, thème choisi, et tout manque signalé.

----------------------------------------
FORMULAIRE DU CLIENT :
2026-06-12T20:58:55.046Z	Chabib	Patisserie	Osny	les-deux	"Je réalise des pâtisseries sur commande pour vos événements. Pièces montées (choux / nougatine) pour mariages et baptêmes
  sur devis, à partir de 4€ la part. Gâteaux d'anniversaire personnalisés (layer cake, number cake) sur devis selon le nombre de parts et
  le décor. Wedding cakes à étages sur devis avec dégustation préalable. Sur place ou en livraison."	[{"id":"1d54827b-dc6d-4bc0-871e-3386c8cab46a","title":"Corne de gazelle","description":"","price":"2euros le kilo","category":"","photos":[{"name":"images.jfif","url":"https://wie1kgknszlo37fw.public.blob.vercel-storage.com/leads/images-SUwvZ50KLQK16whZispXx5SpVyZbo8.jfif"}]},{"id":"2ac15fe6-b6a3-414d-80cb-e0c835c07c01","title":"croissant","description":"","price":"1.2","category":"","photos":[{"name":"Croissant-Petr_Kratochvil.jpg","url":"https://wie1kgknszlo37fw.public.blob.vercel-storage.com/leads/Croissant-Petr_Kratochvil-TYolS8YBPDnLiAk5jiRuFp7UFNJpyd.jpg"}]}]	698998869	chabib.elmalki@gmail.com	698998869	17 Rue de Moscou		fr, es, en, ar	rose, feminin		