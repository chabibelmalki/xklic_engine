2. Le renouvellement des 90 jours (certif wildcard)
Tous les ~90 jours, tu refais exactement les 2 commandes de tout à l'heure :
vercel certs issue --challenge-only "*.xklic.com" --scope elmalkifamily16-2202s-projects
→ ça te donne un nouveau TXT _acme-challenge → tu remplaces sa valeur dans Cloudflare → puis :
vercel certs issue "*.xklic.com" --scope elmalkifamily16-2202s-projects


sync subdomains
node --env-file=.env.local scripts/sync-domains.mjs --dry-run
node --env-file=.env.local scripts/sync-domains.mjs

sitemap
npm run sitemaps:sync:dry
npm run sitemaps:sync
 

  npm run deploy            # push prod + attente READY + syncs réels
  npm run deploy:dry        # aucun push, diffs domaines + sitemaps (sûr)
  npm run deploy:sync-only  # après un push déjà fait : syncs uniquement