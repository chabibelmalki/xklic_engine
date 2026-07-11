# Runbook — Onboarder un client sur un nouveau widget Turnstile (« xklic 2 »)

But : câbler un nouveau client sur un **2ᵉ widget Cloudflare** quand « xklic 1 »
approche la limite de 10 hostnames. Suivre dans l'ordre, les yeux fermés.

**Prérequis (faits une fois)** : backoffice + engine déployés avec le chantier
Turnstile-par-widget **self-service** : endpoints `POST /v1/public/turnstile/widgets`
(créer un widget), `GET /v1/public/turnstile/widgets` (lister), et
`POST /v1/public/tenants/{slug}/turnstile-widget` avec `create_missing` (crée le
tenant à la volée). L'onboarding de l'engine fait **tout le câblage back-office à
distance** — plus besoin du repo `xklic-backoffice` ni d'un accès DB. Le client a
commandé via la vitrine → **un dossier existe** en base (sinon, pas de slug
déterministe).

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

## 5. (Optionnel) Vérifier les widgets back-office existants

Plus de provisionnement manuel : le côté back-office (widget + tenant +
assignation) est fait **automatiquement par l'onboarding (étape 6)** depuis
l'engine, via l'API. Aucun accès au repo `xklic-backoffice` ni à la DB requis.

Pour juste voir quels widgets existent déjà côté back-office :

```bash
npm run onboard -- --list-widgets
```

> Garde-fou : si `<slug>` ≠ le `tenant_slug` figé du dossier, la création du
> tenant **échoue en 409 `slug_mismatch`**. Corriger `<slug>` avec la valeur
> exacte de `dossier:get`.
>
> Variante marchand (boutique) : si le client est déjà activé comme marchand côté
> admin SA, le tenant existe déjà — l'onboarding se contente de l'assigner.

---

## 6. Onboarder le domaine (Cloudflare + DNS + SSL + back-office + déploiement)

Depuis `xklic_engine/` (le sitekey **et le secret** sont lus automatiquement de
`.env.turnstile-widget`). Passer `--dossier-ref <ref-dossier>` pour lier le tenant
créé à son dossier :

```bash
# dry-run
npm run onboard -- --slug <slug> --domain <domaine>.fr \
  --widget "xklic 2" --dossier-ref <ref-dossier> --dry-run

# apply
npm run onboard -- --slug <slug> --domain <domaine>.fr \
  --widget "xklic 2" --dossier-ref <ref-dossier> --apply
```

L'étape `turnstile` de l'onboarding, **de bout en bout** :
1. ajoute les hostnames au **widget Cloudflare « xklic 2 »** (ciblé par la sitekey
   de `.env.turnstile-widget`) ;
2. **crée le widget back-office** « xklic 2 » si absent (chiffre le secret) —
   idempotent ;
3. **crée le tenant** s'il n'existe pas (`create_missing`), le nomme depuis
   `entreprise.nom` et le **lie au dossier** (`--dossier-ref`), puis l'**assigne**
   au widget — idempotent.

L'onboarding attend le déploiement Vercel READY avant de finir.

> Note : `--widget-sitekey` reste accepté mais n'est plus nécessaire si la sitekey
> est dans `.env.turnstile-widget`.

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
