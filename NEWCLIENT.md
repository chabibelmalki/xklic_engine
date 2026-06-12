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
SECTION 1 — VOTRE ACTIVITÉ
- Nom de l'entreprise : MÉCA CONFIANCE
- Votre métier : garage automobile — entretien et réparation toutes marques, mécanique générale
- Ville et déplacement : atelier à Cergy (95), les clients viennent au garage ;
  dépannage/remorquage possible dans tout le Val-d'Oise (~30 km)

SECTION 2 — VOS PRESTATIONS ET PRIX (en vrac)
Vidange à partir de 69€. Révision complète dès 149€. Plaquettes de frein dès 120€.
Montage pneus 15€ le pneu. Diagnostic électronique 49€. Recharge clim 79€.
Pré-contrôle technique offert. Courroie de distribution sur devis. Embrayage sur devis.
Dépannage et remorquage sur devis.
Crédit d'impôt / CESU : Non

SECTION 3 — COMMENT VOUS JOINDRE
- Téléphone : 06 12 34 56 78
- WhatsApp : même numéro
- Email : contact@mecaconfiance.fr
- Adresse : 14 rue de l'Industrie, 95000 Cergy
- Disponibilités : Lun–Sam 8h–19h

SECTION 4 — VOTRE ENTREPRISE
- SIRET : 90112233400025  (exemple — la raison sociale SARL, l'APE et le siège remontent via SIRENE)

SECTION 5 — PHOTOS & LOGO
- Photos : pas de photo
- Logo : a créer

SECTION 6 — VOS AVIS CLIENTS
- "Rapide et honnête, devis respecté au centime près. Je ne vais plus ailleurs." — Karim, Cergy
- "Diagnostic clair, prix justes, équipe sympa. Enfin un garage de confiance." — Sophie, Pontoise

SECTION 7 — LANGUES & STYLE
- Langues : Français et arabe
- Ambiance : sérieux et rassurant, plutôt bleu foncé, look pro