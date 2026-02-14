# MPDESIGN Website (FR/DE)

Production-oriented showcase website for windows and doors, built with Next.js App Router + TypeScript and exported as static files for Hetzner Webhosting S.

## Key Features

- Bilingual routes: `/{locale}` where locale is `fr` or `de`
- Product catalog with typed FR/DE content (currently 47 product detail pages)
- Data-driven architecture (single content bundle)
- Lead form contract prepared for Google Apps Script + Google Sheets + Telegram
- SEO baseline: sitemap, robots, canonical, hreflang
- Mobile sticky CTA (`WhatsApp`, `Call`, `Form`)
- Interactive product experience: gallery + color palette + technical docs

## Stack

- Node.js 24 LTS (`.nvmrc`)
- Next.js 16 + TypeScript
- ESLint + Prettier
- Vitest (unit)
- Playwright (e2e)

## Reproducible Setup

```bash
nvm use
npm ci
```

If Node is not installed, install Node.js 24 LTS first.

## Scripts

```bash
npm run dev
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run test:e2e:ux
npm run build
npm run release:check
npm run content:sync:witraz
npm run content:enrich:experience
npm run content:localize:images
npm run content:audit
npm run content:audit:strict
npm run smoke:site -- https://example.com
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill values:

- `NEXT_PUBLIC_SITE_URL` - canonical site URL
- `NEXT_PUBLIC_LEAD_ENDPOINT` - Google Apps Script lead endpoint
- `CONTENT_API_URL` - optional read-only content API endpoint
- `NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN` - Cloudflare analytics token

## Content Source

Local fallback content is generated from draft pages:

```bash
npm run content:generate
```

Script: `scripts/generate-local-content.mjs`
Output: `src/data/content.local.json`

To validate and sync product names/descriptions against supplier pages:

```bash
npm run content:sync:witraz
```

The sync job crawls supplier pages (`fr`, `de`, `pl`), updates existing catalog entries,
auto-creates newly discovered products, and writes explicit `fr/de` fields for each product.
For top-level fields (`title`, `subtitle`, `summary`) it attempts machine translation only
when one locale is missing.

Audit output: `docs/witraz-catalog-audit-latest.md`

Then enrich UX data and localize supplier images:

```bash
npm run content:enrich:experience
npm run content:localize:images
npm run content:audit
```

- `content:enrich:experience`: ensures every product has a usable color palette block.
- `content:localize:images`: downloads supplier media and rewrites product/category media URLs to local files in `public/assets/supplier` (with automatic proxy fallback if direct supplier access is blocked).
- `content:audit`: strict integrity check (FR/DE presence, specs, palettes, local media URLs).
- `content:audit:strict`: production-readiness check (fails on placeholder specs/text and insufficient palette coverage).
- `release:check`: full gate (content audits + lint + typecheck + tests + build).
- End-to-end operator checklist: `docs/supplier-sync-runbook.md`.

### How Sync Affects Production

- Sync scripts are **build-time/offline tools**. They update `src/data/content.local.json`.
- Production site serves static files only (`next build` + export). It does not call supplier site at runtime.
- If supplier sync fails (network/source unavailable), production keeps working with last valid local content.

## Hetzner Deployment

CI workflow uploads static export (`out/`) via SFTP:

- push to `main` -> staging deploy
- tag `v*` -> production deploy
- post-deploy smoke checks run automatically for staging and production

Required GitHub secrets are documented in `docs/deploy-hetzner.md`.

Security headers for static hosting are provided via `public/.htaccess`.

## Legal and Compliance

Legal pages are present in FR/DE with placeholders:

- `/fr/impressum`, `/de/impressum`
- `/fr/datenschutz`, `/de/datenschutz`
- `/fr/cookies`, `/de/cookies`

Before production cutover, replace placeholders with official legal/company details.
