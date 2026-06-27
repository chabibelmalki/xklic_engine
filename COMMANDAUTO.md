# Commandes d'exploitation (moteur)

Toutes les opérations courantes passent par les scripts npm. Ils chargent
`.env.local` automatiquement (`loadEnvLocal`) — **pas besoin de `--env-file`**.

## Déploiement

```bash
npm run deploy            # git push prod + attend READY + syncs (domaines + sitemaps)
npm run deploy:dry        # plan complet (diffs domaines + sitemaps), ne modifie rien
npm run deploy:sync-only  # après un push déjà fait : syncs uniquement
```

## Synchros à la carte

```bash
npm run domains:sync:dry   # diff sous-domaines *.xklic.com  <->  config/sites
npm run domains:sync       # applique (idempotent ; garde-fous anti-suppression massive)
npm run sitemaps:sync:dry  # diff soumission des sitemaps à Google Search Console
npm run sitemaps:sync      # applique
```

## Nouveau client / domaine perso

```bash
npm run dossier:get -- "<nom>"                                # données client (Baserow)
node scripts/upload-logo.mjs <slug> [fichier] --clean-source  # logo+favicon → Blob + config
npm run onboard -- --slug <slug> --domain <domaine>.fr --dry-run  # plan onboarding domaine
npm run onboard -- --slug <slug> --domain <domaine>.fr --apply    # exécute
```

Création de la config client : voir `NEWCLIENT.md`. Détail de l'onboarding domaine :
`NEWCLIENTCHECKLIST.md`.

## Certificat wildcard `*.xklic.com`

**Aucune action manuelle.** Vercel renouvelle automatiquement le certificat avant
expiration. (L'ancienne procédure `vercel certs issue …` tous les ~90 jours n'est
plus nécessaire.)
