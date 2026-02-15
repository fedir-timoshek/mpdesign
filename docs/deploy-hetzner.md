# Hetzner Deployment (GitHub Actions + SFTP)

## Branch/Tag Strategy

- `main` -> staging deploy
- tag `v*` -> production deploy

## Required GitHub Secrets

- `HETZNER_HOST`
- `HETZNER_USERNAME`
- `HETZNER_PASSWORD`
- `HETZNER_STAGING_PATH` (example `/staging`)
- `HETZNER_PRODUCTION_PATH` (example `/`)
- `HETZNER_STAGING_URL` (example `https://staging.example.com` or `https://example.com/staging`)
- `HETZNER_PRODUCTION_URL` (example `https://example.com`)
- `NEXT_PUBLIC_SITE_URL` (production canonical domain)
- `NEXT_PUBLIC_LEAD_ENDPOINT`
- `NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN` (optional)
- `CONTENT_API_URL` (optional)

Notes:
- On Hetzner Webhosting, the SFTP user home directory typically maps to `public_html/`.
  That is why `HETZNER_PRODUCTION_PATH` is usually `/` (not `/public_html`) and staging is `/staging`.

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

Workflow runs `bash scripts/smoke-check.sh "<base-url>"` after both staging and production deploys.

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

1. Re-run deployment for last stable production tag.
2. If workflow artifact is unavailable, upload previous `out/` snapshot via SFTP.
3. Re-run smoke checks against recovered version.

## Notes About Consistent Deploys

Deploy job uploads hashed assets (`out/_next`, `out/assets`) first to avoid situations where HTML points to
missing chunk files during an interrupted transfer.

We intentionally avoid remote `--delete` to reduce the risk of breaking previously deployed pages during partial deploys.
