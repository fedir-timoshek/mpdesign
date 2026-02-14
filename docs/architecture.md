# Architecture

## Frontend

- Next.js App Router with static export (`output: export`)
- Routes:
  - `/fr`, `/de`
  - `/[locale]/windows/{pvc|wood|aluminum}`
  - `/[locale]/doors`
  - `/[locale]/products/[slug]`
  - `/[locale]/impressum`, `/[locale]/datenschutz`, `/[locale]/cookies`

## Content Layer

- `src/data/content.local.json` is generated from draft HTML assets.
- Optional remote content API can be plugged via `CONTENT_API_URL`.
- Locale policy:
  - only `fr` and `de` are supported
  - missing translation is treated as a build-time data error (no runtime fallback)

## Lead Pipeline

- Frontend sends JSON payload directly to `NEXT_PUBLIC_LEAD_ENDPOINT`.
- Expected endpoint implementation:
  - honeypot validation
  - row insert in Google Sheets
  - Telegram notification

## Analytics

- Cloudflare Web Analytics script enabled via `NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN`.

## Security Baseline

- No secrets in repo
- Honeypot field in form payload
- Lead API rate-limit + duplicate guard (Apps Script)
- Static security headers delivered via `public/.htaccess`
- Strict lint/type/test gates before deployment
