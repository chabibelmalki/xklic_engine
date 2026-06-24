# BRIEF — Logo & Favicon

Session en **deux phases**. Phase 1 = on conçoit le logo ensemble.
Phase 2 = tu exécutes seul le reste, **uniquement après ma validation**.

---

## ⛔ RÈGLE D'OR

Tu ne lances **PAS** la Phase 2 tant que je n'ai pas écrit `VALIDÉ`.
À chaque proposition, tu t'arrêtes et tu attends mon retour. Pas d'upload, pas de
modif de config, pas de conversion tant que le design n'est pas figé.

---

## CONTEXTE
 
- Repo : `xklic_engine`. Site : `config/sites/casa-clean-provence/`. 
- Le logo doit coller à l' identité du site 
- Aucune donnée inventée. Périmètre strict : **un logo + un favicon**, rien d'autre.

---

## PHASE 1 — DESIGN (ensemble)

1. Tu proposes **une direction forte** de logo en **SVG inline** (que je voie le rendu),
   pas un mur d'options. Une variante alternative max si tu hésites.
2. Contraintes techniques :
   - Vectoriel propre, lisible en petit, pas de dégradés complexes.
   - Doit fonctionner en **monochrome** (sert de base au favicon).
   - Wordmark possible, mais prévois un **glyphe/monogramme** isolable pour le favicon.
3. Le **favicon** = version réduite du logo (le glyphe seul), **lisible à 16 px**.
4. Le favicon est une version petite de logo. le texte du logo va etre rajouter manuellement dans le header.
5. On itère jusqu'à ce que j'écrive `VALIDÉ`.

---

## PHASE 2 — EXÉCUTION (toi seul, après `VALIDÉ`)

1. **Sauve** le SVG logo final + le SVG favicon dans un dossier temporaire
   (ex. `./.tmp-assets/`), jamais dans `public/`.
2. **Je le convertis en png**  
3. **Upload sur Vercel Blob via le CLI** (projet déjà lié → aucun token) :
   ```bash
   vercel blob put ./.tmp-assets/logo.png \
     --pathname casa-clean-provence/logo.png --access public
   # idem pour chaque favicon : pathname casa-clean-provence/favicon-32.png, etc.
   ```
   Récupère l'**URL publique** renvoyée par chaque commande.
4. **Patch** `config/sites/casa-clean-provence/config.json` :
   - `branding.logo` = URL du logo ;
   - le(s) champ(s) favicon **selon le schéma** — vérifie `src/types/config.ts`.
     Si le schéma ne prévoit pas de favicon : **arrête-toi et signale-le**
     (propose le champ à ajouter), ne bricole pas.
5. **Nettoie** : supprime tout `./.tmp-assets/` (SVG + PNG). Rien ne doit rester
   dans le repo ni dans `public/`. Les seules sources d'image = les URLs Blob.
6. **Régénère** le manifeste : `node scripts/generate-sites-manifest.mjs`.
7. **Valide** : `npx tsc --noEmit` doit être clean, liens internes résolus.

---

## RÉCAP FINAL

URLs Blob créées, champs de config modifiés, confirmation du nettoyage des fichiers
locaux, et tout manque/hypothèse signalé.