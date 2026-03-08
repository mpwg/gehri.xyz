# gehri.xyz

Persoenliche Astro-Webseite, deployt als Cloudflare Worker.

## Lokal

```bash
npm install
npm run dev
```

## GitHub -> Cloudflare Deploy

Das Repository ist so vorbereitet, dass `main` per GitHub Actions direkt nach Cloudflare deployed wird.

Wichtig:

- Die Deploy-Pipeline selbst braucht laut Cloudflare-Doku ein `CLOUDFLARE_API_TOKEN` und eine `CLOUDFLARE_ACCOUNT_ID`.
- Komplett ohne Cloudflare-Zugangsdaten geht das nicht. Komplett ohne manuelle Dashboard-Konfiguration geht es aber sehr wohl.
- Die Domain-Zuordnung liegt in [wrangler.toml](/Users/mat/code/gehri.xyz/wrangler.toml) und nutzt `custom_domain = true` fuer `gehri.xyz` und `www.gehri.xyz`.
- Das funktioniert nur, wenn die Zone `gehri.xyz` bereits in deinem Cloudflare-Account aktiv ist und keine kollidierenden DNS-Eintraege fuer diese Hostnamen existieren.

### Einmaliges Bootstrap

Voraussetzungen:

- `gh auth login`
- `npx wrangler login`
- ein Cloudflare API Token mit Rechtebereich fuer Workers-Deployments
- optional: `CLOUDFLARE_ACCOUNT_ID`, falls nicht automatisch erkannt werden soll

Dann:

```bash
npm run setup:github-deploy
git push origin main
```

Das Skript [scripts/bootstrap-github-deploy.sh](/Users/mat/code/gehri.xyz/scripts/bootstrap-github-deploy.sh) setzt die GitHub-Secrets:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`

Danach uebernimmt [.github/workflows/deploy-cloudflare.yml](/Users/mat/code/gehri.xyz/.github/workflows/deploy-cloudflare.yml) jeden Deploy auf `main`.
