# Runbook — Onboarder un client sur un nouveau widget Turnstile (« xklic 2 »)

But : câbler un nouveau client sur un **2ᵉ widget Cloudflare** quand « xklic 1 »
approche la limite de 10 hostnames. Suivre dans l'ordre, les yeux fermés.

**Prérequis (faits une fois)** : backoffice + engine déployés avec le chantier
Turnstile-par-widget (slug-à-l'upsert, endpoint `POST /v1/public/turnstile/widgets`,
onboarding `--widget`). Le client a commandé via la vitrine → **un dossier existe**
en base (sinon, pas de slug déterministe).

Terminologie : le **slug** est déterministe et **figé sur le dossier** dès la
commande. On l'utilise partout à l'identique (`config/sites/<slug>`, tenant,
`/config`). Ne jamais l'inventer — le lire via `dossier:get`.

---

## 1. Créer le widget « xklic 2 » sur Cloudflare

Dashboard Cloudflare → **Turnstile** → **Add widget** :

- **Widget name** : `xklic 2`
- **Hostnames** : le domaine du client, apex **et** www — ex. `client.fr` et
  `www.client.fr`. (Cloudflare exige ≥ 1 hostname : c'est pour ça qu'on attend
  le premier client.)
- **Widget Mode** : `Managed` (comme « xklic 1 »).
- **Create** → copier la **Site Key** (publique, `0x…`) et la **Secret Key** (`0x…`).

---

## 2. Récupérer le slug du client

Depuis `xklic_engine/` :

```bash
npm run dossier:get -- "<nom entreprise>"
```

Dans le résumé, noter :
- **Slug** → `<slug>` (à réutiliser tel quel partout).
- **Ref** → `<ref-dossier>` (identifiant du dossier).
- Le bloc **tenant** : s'il affiche « aucun tenant lié », le tenant est à créer
  (étape 5) ; s'il affiche déjà un tenant + widget, sauter l'étape 5.

---

## 3. Poser sitekey + secret dans le fichier dédié (gitignoré)

Créer / éditer `xklic_engine/.env.turnstile-widget` — **jamais commité**
(couvert par `.gitignore` via `.env*`). Format EXACT :

```dotenv
TURNSTILE_WIDGET_SITEKEY=0x4AAAAAA...   # Site Key de « xklic 2 »
TURNSTILE_WIDGET_SECRET=0x4AAAAAA...    # Secret Key de « xklic 2 »
```

Ces deux valeurs alimentent l'étape 5 (via `source`) et l'étape 6 (chargées
automatiquement par l'onboarding). Le secret ne transite jamais en clair sur la
ligne de commande.

---

## 4. Créer la config du site

Créer `xklic_engine/config/sites/<slug>/config.json` (méthode : `NEWCLIENT.md`),
en utilisant **exactement** le `<slug>` de l'étape 2. Vérifier :

```json
"forms": { "turnstile": true }
```

---

## 5. Provisionner le côté back-office (widget + tenant + assignation)

Client nouveau ⇒ son tenant n'existe pas encore. Une seule commande crée le
widget « xklic 2 » (chiffre le secret), crée le tenant **lié au dossier** en
reprenant le slug figé, et l'assigne au widget.

```bash
# charger les secrets (sitekey/secret widget + connexion DB + clé de chiffrement)
cd xklic_engine        && set -a && source .env.turnstile-widget && set +a
cd ../xklic-backoffice && set -a && source .env.backfill         && set +a
cd api

# dry-run (n'écrit rien) — vérifier le tenant ciblé
go run ./cmd/seed-turnstile --name "xklic 2" \
  --sitekey "$TURNSTILE_WIDGET_SITEKEY" --secret "$TURNSTILE_WIDGET_SECRET" \
  --tenants <slug> --tenant-name "<Nom Client>" --create-missing --baserow-ref <ref-dossier>

# apply
go run ./cmd/seed-turnstile --name "xklic 2" \
  --sitekey "$TURNSTILE_WIDGET_SITEKEY" --secret "$TURNSTILE_WIDGET_SECRET" \
  --tenants <slug> --tenant-name "<Nom Client>" --create-missing --baserow-ref <ref-dossier> --apply
```

Sortie attendue à l'apply : `widget créé` (ou réutilisé), `+ tenant créé`,
`↔ dossier … lié`, `OK : 1/1 tenant(s) assignés`.

> Garde-fou : si `<slug>` ≠ le `tenant_slug` figé du dossier, la commande
> **échoue bruyamment** (« divergence slug »). Corriger `<slug>` avec la valeur
> exacte de `dossier:get`.
>
> Variante marchand (boutique) : si le client est activé comme marchand côté
> admin SA, le tenant est créé par l'activation — sauter cette étape, vérifier
> juste que le slug correspond.

---

## 6. Onboarder le domaine (Cloudflare hostnames + DNS + SSL + déploiement)

Depuis `xklic_engine/` (le secret est lu automatiquement de `.env.turnstile-widget`) :

```bash
# dry-run
npm run onboard -- --slug <slug> --domain <domaine>.fr \
  --widget "xklic 2" --widget-sitekey "$TURNSTILE_WIDGET_SITEKEY" --dry-run

# apply
npm run onboard -- --slug <slug> --domain <domaine>.fr \
  --widget "xklic 2" --widget-sitekey "$TURNSTILE_WIDGET_SITEKEY" --apply
```

L'étape `turnstile` de l'onboarding : ajoute les hostnames au **widget Cloudflare
« xklic 2 »** (ciblé par `--widget-sitekey`), ré-assure le widget back-office
(idempotent — déjà créé à l'étape 5), ré-assigne (idempotent). L'onboarding
attend le déploiement Vercel READY avant de finir.

> Si un `warn` « slug tenant ≠ slug config » apparaît : le `shop.tenant` de la
> config diffère du slug — aligner avant de continuer.

---

## 7. Vérifications de succès

Attendre la fin du déploiement (l'onboard le fait), puis :

```bash
# a. Le back-office renvoie bien la sitekey « xklic 2 » pour ce tenant.
#    (ENGINE_API_KEY = la clé partagée ; dans le .env prod du back-office.)
curl -s -H "X-API-Key: <ENGINE_API_KEY>" \
  https://api.xklic.com/v1/public/tenants/<slug>/config
#    attendu → {"turnstile_sitekey":"0x<sitekey de xklic 2>"}

# b. La sitekey est rendue sur une page à formulaire du client.
curl -s https://<domaine>.fr/contact | grep -o "0x4AAAAAA[A-Za-z0-9_-]*" | sort -u
#    attendu → la sitekey de « xklic 2 »

# c. Soumission avec token bidon → 403 (vérif engine→back-office active).
curl -s -w " [%{http_code}]" -X POST https://<domaine>.fr/api/contact \
  -H "Content-Type: application/json" \
  -d '{"mode":"contact","name":"Test","email":"t@example.com","consent":true,"site":"<Nom Client>","siteSlug":"<slug>","turnstileToken":"bogus"}'
#    attendu → {"error":"Vérification anti-robot échouée."} [403]
```

Les 3 passent ⇒ le client est câblé sur « xklic 2 ». ✅

> Rappel comportement : la vérif est **fail-closed** — si le back-office est
> indisponible, les formulaires renvoient 403 (sécurité préservée, au prix de la
> disponibilité). Un `403` en (c) avec un vrai token qui échoue est donc normal.

---

## Aide-mémoire (valeurs à remplacer)

| Placeholder        | Où le trouver                                   |
|--------------------|-------------------------------------------------|
| `<slug>`           | `dossier:get` → ligne **Slug**                  |
| `<ref-dossier>`    | `dossier:get` → ligne **Ref**                   |
| `<Nom Client>`     | nom d'entreprise                                |
| `<domaine>.fr`     | domaine du client                               |
| Site Key / Secret  | Cloudflare → widget « xklic 2 » (étape 1)       |
| `<ENGINE_API_KEY>` | `.env` prod back-office (`ENGINE_API_KEY`)      |
