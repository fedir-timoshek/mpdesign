# Release Checklist (Staging Only)

## A. Team-Only Gates (no client input required)

- [ ] `npm ci`
- [ ] `npm run content:audit`
- [ ] `npm run content:audit:strict`
- [ ] `npm run release:check`
- [ ] Confirm `src/data/content.local.json` has:
- [ ] 0 remote media URLs
- [ ] 0 placeholder specs/text
- [ ] 133 products
- [ ] Confirm static export contains `out/robots.txt`, `out/sitemap.xml`, `out/fr/`, `out/de/`
- [ ] Staging build has `robots.txt` with `Disallow: /` (noindex staging)
- [ ] Confirm canonical/hreflang on:
- [ ] `/fr/windows/pvc/`
- [ ] `/de/windows/pvc/`
- [ ] `/fr/products/<sample-slug>/`
- [ ] `/de/products/<sample-slug>/`

## B. Client Inputs Required (hard blockers)

- [ ] Final legal data (FR/DE Impressum/Datenschutz/Cookies)
- [ ] Final contact data (phone/email/WhatsApp)
- [ ] GitHub Secrets for Hetzner + endpoints + analytics
- [ ] Apps Script lead endpoint URL published
- [ ] Telegram and Google Sheets lead flow validated
- [ ] Cloudflare proxy + SSL validated for staging subdomain

## C. Staging Cutover

- [ ] Push to `main` and wait for `CI-CD` workflow success
- [ ] Staging deploy job success
- [ ] Staging smoke checks success (workflow step `Smoke check staging`)
- [ ] Confirm staging is noindex and HTML loads its CSS/JS chunks (no missing `_next` assets)
- [ ] Manual lead check on staging:
- [ ] form submit returns `{ ok: true }`
- [ ] row appears in Sheets
- [ ] 1 Telegram message received
 
## D. Post-Release Monitoring (first 7 days)

- [ ] Daily lead pipeline check (form -> Sheets -> Telegram)
- [ ] Daily 404/critical page check
- [ ] Weekly review of CTA analytics events (WhatsApp/Call/Form)

## E. Rollback

- [ ] Re-run workflow for last stable `main` commit
- [ ] If needed, upload previous `out/` artifact manually via SFTP
- [ ] Re-run smoke check against restored version
