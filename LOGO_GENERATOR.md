# Logo & Favicon

Procédure pour concevoir puis poser le logo + favicon d'un site client. Deux phases :
**Phase 1 = design ensemble** ; **Phase 2 = exécution, uniquement après validation**.

## ⛔ Règle d'or

Ne **PAS** lancer la Phase 2 tant que l'utilisateur n'a pas écrit `VALIDÉ`. À chaque
proposition, s'arrêter et attendre. Pas d'upload, pas de modif de config, pas de
conversion tant que le design n'est pas figé.

## Contexte

- Repo : `xklic_engine`. Site cible : `config/sites/<slug>/`.
- Le logo doit coller à l'identité du site. Aucune donnée inventée. Périmètre strict :
  **un logo + un favicon**, rien d'autre.

## Phase 1 — Design (ensemble)

1. Proposer **une direction forte** en **SVG inline** (pour voir le rendu), pas un mur
   d'options (une alternative max).
2. Contraintes : vectoriel propre, lisible en petit, sans dégradés complexes ;
   fonctionne en **monochrome** ; prévoir un **glyphe/monogramme isolable** pour le favicon.
3. Le **favicon** = le glyphe seul, lisible à **16 px** (le texte du logo est ajouté
   séparément dans le header).
4. Itérer jusqu'à `VALIDÉ`.

## Phase 2 — Exécution (après `VALIDÉ`) — via le script

1. Déposer le logo final (et le favicon) dans **`.temp/`** (zone de dépôt gitignorée),
   convertis en **PNG** (logo + favicon).
2. Lancer le script — il **upload sur Vercel Blob, patch la config et nettoie le local** :
   ```bash
   node scripts/upload-logo.mjs <slug> .temp/logo.png --clean-source
   ```
   Il pose `branding.logo` **et** `branding.icon` = l'URL Blob publique, et nettoie
   `public/sites/<slug>/` (la seule source d'image = l'URL Blob). Le token
   `BLOB_READ_WRITE_TOKEN` est lu depuis `.env.local`.
3. Régénérer le manifeste + valider :
   ```bash
   node scripts/generate-sites-manifest.mjs
   npx tsc --noEmit          # doit être clean
   npm run dev               # vérifier le rendu (références blob.vercel-storage.com)
   ```

> `next.config.ts` autorise déjà tout host https (`remotePatterns` hostname `**`) →
> rien à configurer côté images.

### Upload manuel (secours, si le script ne convient pas)

```bash
TOKEN=$(grep '^BLOB_READ_WRITE_TOKEN=' ./.env.local | cut -d= -f2- | tr -d '"')
vercel blob put <fichier.png> --pathname <slug>/logo.png \
  --access public --allow-overwrite true --rw-token "$TOKEN"
```
Utiliser l'**URL EXACTE** renvoyée (un suffixe aléatoire est ajouté ; l'URL reste
stable). Puis patcher `branding.logo`/`branding.icon`, régénérer le manifeste, `tsc`.
