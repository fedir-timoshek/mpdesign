# Supplier Sync Runbook (Witraz -> MPDESIGN)

## Purpose
Synchronize catalog data from supplier pages, localize media assets, and validate FR/DE integrity before deploy.

## Preconditions

- Node pinned via `.nvmrc` (`24.13.1`).
- Dependencies installed with `npm ci` (or use `./scripts/npm.sh ci` if Node is not installed globally).
- Local draft source is present in `../черновик:макет`.

Reachability check:

```bash
curl -I --max-time 20 https://www.witraz.eu/fr/produits/fenetres-pvc
```

## Standard Flow

```bash
npm run content:sync:witraz
npm run content:enrich:supplier
npm run content:normalize
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

4. `content:enrich:supplier`
- Backfills missing specs/features via a supplier proxy (no runtime dependency).
- Keeps FR/DE strictly present for all fields.

5. `content:normalize`
- Normalizes brand spelling inside FR/DE copy (e.g. `Witraż` -> `Witraz`) so content stays clean and avoids locale-noise.

6. `content:audit`
- Fails if FR/DE fields are missing or media still points to remote URLs.

7. `test:e2e:ux`
- Runs dedicated UX quality scenarios for product interactions (keyboard gallery control, mobile swipe, sticky CTA behavior).

8. `content:audit:strict`
- Release-readiness gate (staging).
- In addition to base integrity checks, fails on placeholder-like specs/text and weak palette coverage.

9. `release:check`
- Runs content audits, lint, typecheck, unit tests, e2e tests, and build.

## If Supplier Is Unreachable

Symptoms:
- `curl` timeout to `www.witraz.eu`
- `content:sync:witraz` cannot complete

Action:
1. If you only need to ship with the last known catalog (no new products), skip sync and run:

```bash
npm run content:enrich:supplier
npm run content:normalize
npm run content:enrich:experience
npm run content:localize:images
npm run content:audit:strict
npm run release:check
```

2. If you need to import newly published supplier products, run `content:sync:witraz` from a network that can reach `www.witraz.eu` (or via VPN), then continue with the standard flow.

3. Alternative fallback flow from local draft (minimal catalog, no supplier crawl):

```bash
npm run content:generate
npm run content:enrich:supplier
npm run content:normalize
npm run content:enrich:experience
npm run content:localize:images
npm run content:audit:strict
```

4. Notes:
- `content:localize:images` supports proxy fallback (`wsrv.nl`) and can still localize images even when direct supplier access is blocked.
- `content:enrich:supplier` uses a proxy read layer (`r.jina.ai`) and can still backfill specs when the supplier origin is slow/unreachable.

## Go-Live Order

1. Run supplier sync flow and commit content/assets changes.
2. Push to `main` for staging deploy.
3. Confirm workflow step `Smoke check staging` is green.
4. Validate lead pipeline manually on staging (form -> Sheets -> Telegram).
5. Start 7-day post-release monitoring.

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

## How Sync Affects Staging (Short Version)

- Sync scripts modify only repository data (`src/data/content.local.json`) and local assets (`public/assets/supplier`).
- Staging website changes only after:
1. Committing updated files to GitHub.
2. CI passing.
3. Deployment to staging.
- If no deploy happened, running sync locally does not affect live site.

## Current Blocking Signals To Watch

- `content:audit` fails if any supplier image is still remote (`https://www.witraz.eu/...`).
- `content:audit:strict` fails if product specs still contain placeholders like `A confirmer` / `Zu bestaetigen`.
- Treat these two failures as hard blockers for staging deploy.

## User-Provided Inputs Needed Before Staging Deploy

- Final legal/company details for FR/DE legal pages.
- Final contact values (phone, WhatsApp, email).
- Cloudflare token for analytics (optional).
- Hetzner staging credentials in GitHub secrets.
- Staging public URL for smoke checks (`HETZNER_STAGING_URL`).

## Rollback Procedure

1. Re-run deployment for the last stable commit on `main`.
2. If needed, upload previous `out/` build to Hetzner path via SFTP.
3. Re-run smoke checks against restored version.
