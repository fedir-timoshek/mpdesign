# Hetzner Deployment (Staging + Guarded Production: GitHub Actions + SFTP)

This repository deploys to **staging** on every push to `main`.

- Push to `main` -> staging deploy
- Production deploy exists but is intentionally **guarded** and **must not be used** until explicit go-live.

## Required GitHub Secrets

- `HETZNER_HOST`
- `HETZNER_USERNAME`
- `HETZNER_PASSWORD`

Staging:
- `HETZNER_STAGING_PATH` (example `/staging`)
- `HETZNER_STAGING_URL` (example `https://staging.example.com` or `https://example.com/staging`)

Production (keep unset / unused until go-live):
- `HETZNER_PRODUCTION_PATH` (example `/`)
- `HETZNER_PRODUCTION_URL` (example `https://example.com`)

Shared:
- `NEXT_PUBLIC_SITE_URL` (canonical public domain; can be production even for staging because staging is noindex)
- `NEXT_PUBLIC_LEAD_ENDPOINT`
- `NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN` (optional)
- `CONTENT_API_URL` (optional)

Notes:
- On Hetzner Webhosting, the SFTP user home directory typically maps to `public_html/`.
  That is why paths are usually `/` and `/staging` (not `/public_html/...`).

## Production Guardrail

The GitHub Actions job `deploy_production` is guarded by a secret:

- `PRODUCTION_DEPLOY_ENABLED` must be set to `1` for the production job to run.

Rule:

- Keep `PRODUCTION_DEPLOY_ENABLED` **unset** until you explicitly approve go-live.

## Build Artifact

- Static export folder: `out/`
- `next.config.ts` must keep `output: "export"` and `trailingSlash: true`.

## Security Headers on Hetzner

- Security headers are delivered via `public/.htaccess` and exported to `out/.htaccess`.
- Validate on staging after deploy:

```bash
curl -I https://<staging-domain>/fr/
```

If headers are missing:
- Hetzner Webhosting may ignore `Header` directives in `.htaccess` (hosting-level limitation).
- In that case move headers to Cloudflare (Transform Rules / Response Header Modification) and treat `.htaccess` as best-effort.

Recommended baseline headers (via Cloudflare if needed):
- `Content-Security-Policy` (or start with Report-Only)
- `X-Content-Type-Options`
- `Referrer-Policy`
- `Permissions-Policy`
- `Strict-Transport-Security` (only when HTTPS is guaranteed end-to-end)

## Post-Deploy Smoke Protocol

Workflow runs `bash scripts/smoke-check.sh "<base-url>"` after deploy.

Checks:
- `robots.txt`, `sitemap.xml`
- FR/DE core routes
- canonical/hreflang presence
- sitemap contains FR/DE URLs
- asset sanity check (one CSS + one JS chunk referenced by HTML)

Local manual run:

```bash
npm run smoke:site -- https://example.com
```

## Rollback

Staging:

1. Re-run the last successful `CI-CD` workflow run for `main` (staging deploy).
2. If you need a manual rollback, upload a previous `out/` snapshot via SFTP to the staging path.
3. Re-run smoke checks against the restored version.

Production:

1. Re-run the last successful production workflow run (only after go-live).
2. If needed, upload a previous `out/` snapshot via SFTP to the production path.
3. Re-run smoke checks against the restored version.

## Notes About Consistent Deploys

Deploy job uploads hashed assets (`out/_next`, `out/assets`) first to avoid situations where HTML points to
missing chunk files during an interrupted transfer.

We intentionally avoid remote `--delete` to reduce the risk of breaking previously deployed pages during partial deploys.
