@AGENTS.md

# Baserow — récupérer un dossier client

Les données clients (issues du formulaire de la vitrine) vivent dans **Baserow**
(base « xklic »). Pour travailler un dossier dans le moteur, récupère-le d'abord :

```bash
npm run dossier:get -- "Casa Clean"
# ou : node scripts/get-dossier.mjs "<nom d'entreprise | Ref | OrderId>"
```

`scripts/get-dossier.mjs` récupère le dossier **complet** (fiche + `Paiements` +
`Production` + `Notes` + `Produits`) en suivant les liens natifs, valeurs aplaties
(menus déroulants et liens résolus). **stderr = résumé lisible · stdout = JSON
exploitable** — à utiliser pour construire / mettre à jour le site du client dans
`config/sites/<slug>/config.json`.

- Si plusieurs dossiers correspondent → le script les liste et demande de préciser.
- Script **local uniquement** (lit `.env.local`, pas besoin de Vercel).

## Modèle (base « xklic »)

`Dossiers` (clé `Ref` = OrderId) liée à `Paiements` / `Production` / `Notes` /
`Produits`. `Statut commande` = lead/panier/payé (écrit par la vitrine) ;
`Statut production` = kanban interne (Prospect → À faire → En prod → En ligne…).

## Env (dans `.env.local`, gitignoré)

`BASEROW_TOKEN`, `BASEROW_TABLE_DOSSIERS/PAIEMENTS/PRODUCTION/NOTES/PRODUITS`,
`BASEROW_API_URL` (défaut `https://api.baserow.io`).
