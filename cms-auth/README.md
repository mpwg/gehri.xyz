# CMS Auth Worker

Cloudflare Worker fuer den GitHub OAuth-Flow von Decap CMS.

## Secrets setzen

```bash
npm run cms-auth:secret:id
npm run cms-auth:secret:secret
```

## Deploy

```bash
npm run cms-auth:deploy
```

## Test

- `https://cms-auth.gehri.xyz/` sollte `cms-auth worker is running` zeigen
- `https://cms-auth.gehri.xyz/auth?provider=github` sollte zu GitHub weiterleiten

## GitHub OAuth App

Die GitHub OAuth App braucht als Callback URL:

```text
https://cms-auth.gehri.xyz/callback
```

In [public/admin/config.yml](/Users/mat/code/gehri.xyz/public/admin/config.yml) ist der passende Endpunkt bereits eingetragen.

Da das Repository privat ist, muss in [cms-auth/wrangler.toml](/Users/mat/code/gehri.xyz/cms-auth/wrangler.toml) `GITHUB_REPO_PRIVATE = "1"` gesetzt sein. Dann fordert der OAuth-Flow den Scope `repo,user` statt `public_repo,user` an.
