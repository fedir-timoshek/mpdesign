# Supplier Sync Runbook (Witraz -> MPDESIGN)

## Purpose
Synchronize catalog data from supplier pages, localize media assets, and validate FR/DE integrity before deploy.

## Preconditions

- Node 24 LTS active.
- Dependencies installed with `npm ci`.
- Local draft source is present in `../черновик:макет`.

Reachability check:

```bash
curl -I --max-time 20 https://www.witraz.eu/fr/produits/fenetres-pvc
```

## Standard Flow

```bash
npm run content:sync:witraz
npm run content:enrich:experience
npm run content:localize:images
npm run content:audit
npm run test:e2e:ux
npm run content:audit:strict
npm run release:check
```

## What Each Step Does

1. `content:sync:witraz`
- Crawls FR/DE/PL supplier product pages (including related products).
- Merges products into local typed catalog.
- Keeps FR/DE explicit fields in local JSON.

2. `content:enrich:experience`
- Adds palette presets where missing, based on product family.

3. `content:localize:images`
- Downloads supplier images into `public/assets/supplier`.
- Rewrites media URLs in `src/data/content.local.json` to local paths.

4. `content:audit`
- Fails if FR/DE fields are missing or media still points to remote URLs.

5. `test:e2e:ux`
- Runs dedicated UX quality scenarios for product interactions (keyboard gallery control, mobile swipe, sticky CTA behavior).

6. `content:audit:strict`
- Production-readiness gate.
- In addition to base integrity checks, fails on placeholder-like specs/text and weak palette coverage.

7. `release:check`
- Runs content audits, lint, typecheck, unit tests, e2e tests, and build.

## If Supplier Is Unreachable

Symptoms:
- `curl` timeout to `www.witraz.eu`
- `content:sync:witraz` cannot complete

Action:
1. Use fallback flow from local draft:

```bash
npm run content:generate
npm run content:enrich:experience
npm run content:localize:images
npm run content:audit:strict
```

2. `content:localize:images` now supports proxy fallback (`wsrv.nl`) and can still localize image binaries even when direct supplier access is blocked.
3. Run full `release:check` before deploy.

## Go-Live Order

1. Run supplier sync flow and commit content/assets changes.
2. Push to `main` for staging deploy.
3. Confirm workflow step `Smoke check staging` is green.
4. Validate lead pipeline manually on staging (form -> Sheets -> Telegram).
5. Create production release tag `v*`.
6. Confirm workflow step `Smoke check production` is green.
7. Start 7-day post-release monitoring.

## Go-Live Smoke Protocol

CI smoke step uses:

```bash
bash scripts/smoke-check.sh "<base-url>"
```

Coverage:
- `robots.txt` and `sitemap.xml`
- FR/DE core pages
- canonical + hreflang presence
- sitemap contains FR and DE URLs

Manual local example:

```bash
npm run smoke:site -- https://example.com
```

## How Sync Affects Production

- Sync scripts modify only repository data (`src/data/content.local.json`) and local assets (`public/assets/supplier`).
- Production website changes only after:
1. Committing updated files to GitHub.
2. CI passing.
3. Deployment to staging/production.
- If no deploy happened, running sync locally does not affect live site.

## Current Blocking Signals To Watch

- `content:audit` fails if any supplier image is still remote (`https://www.witraz.eu/...`).
- `content:audit:strict` fails if product specs still contain placeholders like `A confirmer` / `Zu bestaetigen`.
- Treat these two failures as hard blockers for production cutover.

## User-Provided Inputs Needed Before Production

- Final legal/company details for FR/DE legal pages.
- Final contact values (phone, WhatsApp, email).
- Domain/SSL and Cloudflare token for production analytics.
- Hetzner staging/production credentials in GitHub secrets.
- Staging and production public URLs for smoke checks (`HETZNER_STAGING_URL`, `HETZNER_PRODUCTION_URL`).

## Rollback Procedure

1. Re-run deployment for last stable release tag.
2. If needed, upload previous `out/` build to Hetzner path via SFTP.
3. Re-run smoke checks against restored version.
