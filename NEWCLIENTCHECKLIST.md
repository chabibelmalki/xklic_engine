# Onboarding domaine custom — Xklic Engine

Procédure complète pour mettre un client sur son propre domaine (`.fr`) au lieu de `*.xklic.com`.
Validé en prod sur **sanadclean.fr** (premier client).

---

## Checklist complète

| # | Étape | Automatisable ? |
|---|-------|-----------------|
| 1 | **Achat domaine OVH** | ❌ Manuel (paiement + titulaire `.fr`) |
| 2 | **Config DNS OVH** (A apex + CNAME www, suppression parking/AAAA/TXT) | ✅ API OVH |
| 3 | **Ajout domaine dans Vercel** (apex + www, projet `engine`, sans redirect) | ✅ Vercel Domains API |
| 4 | **Récupération records DNS Vercel** → reportés dans OVH | ✅ (sortie API Vercel) |
| 5 | **Attente SSL Vercel** (provisioning auto) | ✅ Auto (poll jusqu'à "valid") |
| 6 | **`customDomains` dans `config.json`** du tenant | ✅ Le moteur génère le config |
| 7 | **Régénération manifeste** (`CUSTOM_DOMAINS` + `CANONICAL_DOMAIN`) | ✅ Script predev/prebuild |
| 8 | **Deploy** (`npm run deploy`) | ✅ Déjà scripté |
| 9 | **Tests de validation** (4 curl) | ✅ Scriptable (curl + asserts) |
| 10 | **GSC : propriété Domaine + TXT OVH + validation** | ✅ Site Verification API + DNS API |
| 11 | **GSC : soumission sitemap** | ✅ Search Console API |
| 12 | **Turnstile : ajout hostname** | ✅ API Cloudflare |
| 13 | **Test formulaire en vert** | ⚠️ Semi (test e2e possible) |

---

## Détail par étape

### 1. Achat domaine OVH — MANUEL
- Acheter le domaine dans OVH.
- **Titulaire = le client** (idéalement), toi en contact technique. *(Compromis actuel : acheté sous compte xklic, transférable au client plus tard.)*
- ⚠️ **Activer le renouvellement auto** — sinon le site client meurt silencieusement à l'échéance.
- Attendre le statut **"actif"** (pas "en cours de création") avant de continuer.

### 2-4. DNS OVH ↔ Vercel
Records Vercel à récupérer (projet `engine`, **sans** "Redirect apex to www") :

| Type | Pour | Cible (exemple sanadclean) |
|------|------|----------------------------|
| **A** | apex `@` | `216.198.79.1` |
| **CNAME** | `www` | `<hash>.vercel-dns-017.com.` |

⚠️ **Toujours prendre les valeurs affichées par Vercel** — l'IP/CNAME peuvent changer.

**Nettoyage zone DNS OVH neuve (parking) :**
- **Modifier** le `A @` parking (`213.186.33.5`) → IP Vercel
- **Supprimer** le `A www` parking → puis **créer** le CNAME www
- **Supprimer** les TXT parking (`"1|..."` sur @, `"3|welcome"` sur www)
- **Supprimer** le `AAAA` (IPv6 parking) s'il existe → sinon casse la résolution
- **Laisser** : les 2 `NS` ovh.net, le `CNAME ftp`, le `SPF` + les 3 `MX` (mail)

> ⚠️ **Piège CNAME** : OVH refuse un CNAME `www` tant qu'un autre record (`A` ou `TXT`) existe sur `www`. Erreur *"CNAME and other data"*. → Supprimer TOUT ce qui est sur `www`, rafraîchir, **ensuite** créer le CNAME.

### 5. Attente SSL
- Vercel provisionne le certificat dès que le DNS résout (quelques min à ~1h).
- Point de contrôle : domaines en ✅ **"Valid Configuration"** + cadenas HTTPS sur le site.

### 6-7. Config moteur + manifeste
Dans `config/sites/<slug>/config.json` :
```json
"customDomains": ["sanadclean.fr", "www.sanadclean.fr"]
```
- **Apex en premier = canonique** (pilote canonical/hreflang/OG/sitemap/JSON-LD via `siteOrigin`).
- Régénérer : `npm run predev` (ou `node scripts/generate-sites-manifest.mjs`).

**Point de contrôle** — `src/lib/sites-manifest.ts` doit contenir :
```js
CUSTOM_DOMAINS = {
  "sanadclean.fr": "sanadclean",
  "www.sanadclean.fr": "sanadclean"
}
CANONICAL_DOMAIN = { "sanadclean": "sanadclean.fr" }
```
⚠️ Si les maps sont **vides** → le générateur n'a pas lu `customDomains` → rien ne marchera. Bloquant.

### 8. Deploy
```bash
cd xklic_engine && npm run deploy
```
> `domains:sync` gère les `*.xklic.com`, **pas** l'apex perso → mapping Vercel manuel (déjà fait étape 3).

### 9. Tests de validation (les 4 curl)
```bash
curl -sI https://<slug>.xklic.com/ | grep -i location   # → location: https://<domaine>/
curl -sI https://www.<domaine>/ | grep -i location       # → location: https://<domaine>/
curl -s https://<domaine>/sitemap.xml | grep -m1 loc      # → doit contenir <domaine>, pas xklic.com
curl -sI https://<domaine>/ | head -1                     # → HTTP/2 200
```
Les 4 OK = custom domain pleinement câblé et SEO-cohérent.

### 10-11. Google Search Console
- **Ajouter une propriété → type "Domaine"** (pas "Préfixe URL") : couvre apex + www + sous-domaines d'un coup.
- Google donne un TXT `google-site-verification=...`.
- L'ajouter dans OVH : `TXT`, sous-domaine **vide** (`@`), valeur = le code. ⚠️ **Ne pas écraser le SPF** — plusieurs TXT sur `@` cohabitent, ajouter à côté.
- **Valider** (si échec : propagation DNS, attendre 15-30 min et re-valider).
- **Sitemaps** → ajouter `sitemap.xml` → Envoyer.
> ⚠️ `sitemaps:sync` du deploy ignore le `.fr` si la propriété GSC est `xklic.com`. D'où la propriété Domaine dédiée au `.fr`.

### 12. Turnstile (Cloudflare)
- Dashboard Cloudflare → widget Turnstile → **ajouter `<domaine>` aux hostnames**.
- **Critique** : sans ça, le formulaire de contact/devis casse sur le nouveau domaine → pas de leads.

### 13. Test formulaire
- Charger `https://<domaine>`, soumettre le formulaire, vérifier widget **vert** + envoi OK.

---

## Cohérence trailing slash
Tout le site est aligné **sans slash final** (apex + sous-pages) : canonical, sitemap, proxy servent la même forme. Convention uniforme. Ne pas réintroduire de `/` sur la home seule.

---

## Découpage manuel / auto

```
[MANUEL]  Achat OVH + titulaire + renouvellement auto
   ↓
[AUTO]    DNS OVH → Vercel → poll SSL → config+manifeste → deploy
          → asserts curl → GSC (property+verify+sitemap) → Turnstile
   ↓
[MANUEL]  Vérif rapport + remplacer faux témoignages + récolte avis Google
```

**Irréductiblement manuel :** achat domaine, fiche Google Business + avis (vrai levier SEO local), backlinks.

---

## Plan d'automatisation (à faire après 2-3 clients manuels)

Cible : un script CLI `npm run onboard -- --slug X --domain X.fr` (PAS n8n pour l'infra).
- Idempotent + reprenable (chaque étape vérifie "déjà fait ?").
- Sous-commandes invocables : `onboard:dns`, `onboard:vercel`, `onboard:config`, `onboard:gsc`, `onboard:turnstile`.
- n8n réservé à la couche **business** (webhook Stripe, avis Google, relances mail), pas à l'infra.

**Ne pas automatiser avant d'avoir fait 2-3 clients à la main** et documenté chaque appel API (endpoint, payload, réponse).

---

## Rappel indexation
Un `.fr` neuf repart de zéro côté autorité → "Crawled - currently not indexed" pendant **2-6 semaines, normal**. Le 301 depuis `*.xklic.com` transfère les signaux. Leviers réels : avis Google, vrais témoignages, 1-2 backlinks.

---

## Suivi des domaines (à tenir à jour)

| Client | Domaine | Titulaire | Expiration | Renouvellement auto |
|--------|---------|-----------|------------|---------------------|
| Sanad Clean | sanadclean.fr | (xklic, à transférer) | _à compléter_ | _à vérifier_ |