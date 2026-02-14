# Hetzner Deployment (GitHub Actions + SFTP)

## Branch/Tag Strategy

- `main` -> staging deploy
- tag `v*` -> production deploy

## Required GitHub Secrets

- `HETZNER_HOST`
- `HETZNER_USERNAME`
- `HETZNER_PASSWORD`
- `HETZNER_STAGING_PATH` (example `/public_html/staging`)
- `HETZNER_PRODUCTION_PATH` (example `/public_html`)
- `HETZNER_STAGING_URL` (example `https://staging.example.com` or `https://example.com/staging`)
- `HETZNER_PRODUCTION_URL` (example `https://example.com`)
- `NEXT_PUBLIC_SITE_URL` (production canonical domain)
- `NEXT_PUBLIC_LEAD_ENDPOINT`
- `NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN` (optional)
- `CONTENT_API_URL` (optional)

## Build Artifact

- Static export folder: `out/`
- `next.config.ts` must keep `output: "export"` and `trailingSlash: true`.

## Security Headers on Hetzner

- Security headers are delivered via `public/.htaccess` and exported to `out/.htaccess`.
- Validate on staging after deploy:

```bash
curl -I https://<staging-domain>/fr/
```

Expected headers include:
- `Content-Security-Policy`
- `X-Content-Type-Options`
- `Referrer-Policy`
- `Permissions-Policy`

## Post-Deploy Smoke Protocol

Workflow runs `bash scripts/smoke-check.sh "<base-url>"` after both staging and production deploys.

Checks:
- `robots.txt`, `sitemap.xml`
- FR/DE core routes
- canonical/hreflang presence
- sitemap contains FR/DE URLs

Local manual run:

```bash
npm run smoke:site -- https://example.com
```

## Rollback

1. Re-run deployment for last stable production tag.
2. If workflow artifact is unavailable, upload previous `out/` snapshot via SFTP.
3. Re-run smoke checks against recovered version.

