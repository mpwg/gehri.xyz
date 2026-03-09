# gehri.xyz

Persoenliche Astro-Webseite, deployt als Cloudflare Worker, mit Decap CMS fuer die Bearbeitung der Startseite.

## Lokal

```bash
npm install
npm run dev
```

## Inhalte per CMS bearbeiten

- Admin-UI: `/admin`
- CMS-Konfiguration: [public/admin/config.yml](/Users/mat/code/gehri.xyz/public/admin/config.yml)
- Bearbeitbare Inhalte: [src/content/site/homepage.yml](/Users/mat/code/gehri.xyz/src/content/site/homepage.yml)

Die Seite liest ihre Inhalte ueber Astro Content Collections aus dem CMS-Dokument. Geaendert werden:

- Hero
- Ueber mich
- Kontaktlinks
- Projekte

### OAuth-Proxy fuer Decap

Wie bei `bindungsschatz.at` nutzt das CMS den GitHub-Backend-Flow ueber einen separaten OAuth-Proxy auf Cloudflare:

- Worker-Code: [cms-auth/src/index.ts](/Users/mat/code/gehri.xyz/cms-auth/src/index.ts)
- Worker-Konfiguration: [cms-auth/wrangler.toml](/Users/mat/code/gehri.xyz/cms-auth/wrangler.toml)
- Anleitung: [cms-auth/README.md](/Users/mat/code/gehri.xyz/cms-auth/README.md)

Einmalig noetig:

```bash
export CMS_OAUTH_ID=...
export CMS_OAUTH_SECRET=...
npm run setup:github-deploy
```

Zusätzlich brauchst du eine GitHub OAuth App mit Callback URL:

```text
https://cms-auth.gehri.xyz/callback
```

Danach deployed [.github/workflows/deploy-cms-auth.yml](/Users/mat/code/gehri.xyz/.github/workflows/deploy-cms-auth.yml) den OAuth-Worker automatisch aus GitHub heraus. Der Workflow synchronisiert dabei die GitHub-Secrets `CMS_OAUTH_ID` und `CMS_OAUTH_SECRET` per `wrangler secret bulk` auf die Cloudflare-Worker-Secrets `GITHUB_OAUTH_ID` und `GITHUB_OAUTH_SECRET` und fuehrt danach `wrangler deploy` aus.

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
- optional `CMS_OAUTH_ID`
- optional `CMS_OAUTH_SECRET`

Danach uebernimmt [.github/workflows/deploy-cloudflare.yml](/Users/mat/code/gehri.xyz/.github/workflows/deploy-cloudflare.yml) jeden Deploy auf `main`.
