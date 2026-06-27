# Onboarding domaine custom — Xklic Engine

Mettre un client sur son propre domaine (`.fr`) au lieu de `*.xklic.com`.
Validé en prod sur **sanadclean.fr** (premier client), puis automatisé.

## TL;DR — chemin automatisé

```bash
npm run onboard -- --slug <slug> --domain <domaine>.fr --dry-run   # plan, ne touche à rien
npm run onboard -- --slug <slug> --domain <domaine>.fr --apply     # exécute
```

Le CLI `scripts/onboard/` orchestre les étapes dans l'ordre
`vercel → dns → ssl → config → manifest → deploy → verify → gsc → turnstile`.
Chaque étape est **idempotente** (« déjà fait ? ») et, si un secret manque ou
qu'une action humaine est requise (ex. TXT GSC), elle **s'arrête en imprimant les
valeurs exactes à saisir** — jamais de bricolage silencieux. Lancer en `--dry-run`
d'abord.

## Prérequis (manuels, avant le CLI)

1. **Achat domaine OVH** — paiement + titulaire `.fr`. Idéalement titulaire = client
   (compromis actuel : acheté sous compte xklic, transférable plus tard). ⚠️ **Activer
   le renouvellement auto** (sinon le site meurt à l'échéance). Attendre le statut
   **« actif »** avant de lancer le CLI.
2. **Secrets dans `.env.local`** : `VERCEL_TOKEN`/`VERCEL_PROJECT_ID`/`VERCEL_TEAM_ID`,
   `OVH_APP_KEY`/`OVH_APP_SECRET`/`OVH_CONSUMER_KEY`/`OVH_ENDPOINT`,
   `CLOUDFLARE_API_TOKEN`/`CLOUDFLARE_ACCOUNT_ID`, `GSC_SERVICE_ACCOUNT_KEY`/`GSC_PROPERTY`/`GSC_HUMAN_OWNER`.

## Ce que le CLI automatise

| Étape | Action |
|-------|--------|
| `vercel` | ajoute apex + `www` au projet (sans redirect) |
| `dns` | pose `A @` + `CNAME www` chez OVH, supprime le parking |
| `ssl` | attend le provisioning du certificat Vercel |
| `config` | patch `config.json` (`customDomains`, apex en premier) |
| `manifest` | régénère `src/lib/sites-manifest.ts` |
| `deploy` | `npm run deploy` |
| `verify` | joue les assertions curl (voir annexe) |
| `gsc` | crée la propriété **Domaine** ; le TXT de vérification reste **human-in-the-loop** |
| `turnstile` | ajoute le hostname au widget Cloudflare |

## Étapes restant (semi-)manuelles

- **GSC — vérification TXT** : ajouter le `google-site-verification=…` en `TXT` sur
  `@` chez OVH (⚠️ **ne pas écraser le SPF** — plusieurs TXT cohabitent), puis valider
  dans Search Console (si échec : propagation, attendre 15-30 min).
- **GSC — sitemap** : soumettre `sitemap.xml` depuis Search Console.
- **Contenu** : remplacer les faux témoignages, lancer la récolte d'avis Google.

---

## Annexe — référence DNS & vérifications

### Records DNS (projet `engine`, sans « Redirect apex to www »)

| Type | Pour | Cible (exemple sanadclean) |
|------|------|----------------------------|
| **A** | apex `@` | `216.198.79.1` |
| **CNAME** | `www` | `<hash>.vercel-dns-017.com.` |

⚠️ **Toujours prendre les valeurs affichées par Vercel** (IP/CNAME peuvent changer).

**Nettoyage d'une zone OVH neuve (parking)** : modifier le `A @` parking
(`213.186.33.5`) → IP Vercel ; supprimer le `A www` parking puis créer le CNAME ;
supprimer les TXT parking et le `AAAA` (IPv6) ; **laisser** les `NS` ovh.net, le
`CNAME ftp`, le `SPF` et les `MX` (mail).

> ⚠️ **Piège CNAME OVH** : OVH refuse un CNAME `www` tant qu'un autre record (`A`/`TXT`)
> existe sur `www` (*« CNAME and other data »*). Tout supprimer sur `www`, rafraîchir,
> **ensuite** créer le CNAME.

### Les 4 curl de validation

```bash
curl -sI https://<slug>.xklic.com/ | grep -i location   # → location: https://<domaine>/
curl -sI https://www.<domaine>/ | grep -i location       # → location: https://<domaine>/
curl -s https://<domaine>/sitemap.xml | grep -m1 loc      # → contient <domaine>, pas xklic.com
curl -sI https://<domaine>/ | head -1                     # → HTTP/2 200
```

### Notes

- **`customDomains`** : apex en premier (= canonique, pilote canonical/hreflang/OG/
  sitemap/JSON-LD). Point de contrôle : `src/lib/sites-manifest.ts` doit contenir le
  mapping `CUSTOM_DOMAINS` + `CANONICAL_DOMAIN` (vide = `customDomains` non lu → bloquant).
- **Trailing slash** : tout le site est **sans slash final** (apex + sous-pages). Ne pas
  réintroduire de `/` sur la home.
- **Indexation** : un `.fr` neuf est « Crawled - currently not indexed » 2-6 semaines
  (normal). Le 301 depuis `*.xklic.com` transfère les signaux. Leviers réels : avis
  Google, vrais témoignages, 1-2 backlinks.

### Suivi des domaines

| Client | Domaine | Titulaire | Expiration | Renouvellement auto |
|--------|---------|-----------|------------|---------------------|
| Sanad Clean | sanadclean.fr | (xklic, à transférer) | _à compléter_ | _à vérifier_ |
