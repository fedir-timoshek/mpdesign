# Apps Script Endpoints

## 1. Content API

- File: `content-api.gs`
- Method: `GET`
- Example: `.../exec?locale=fr&type=products`

## 2. Lead API

- File: `lead-api.gs`
- Method: `POST`
- Contract:
  - input: `locale, sourcePage, productSlug, name, phone, email, message, consent, honeypot`
  - output: `{ ok, leadId, timestamp, errorCode }`

## Telegram setup

In Apps Script > Project Settings > Script Properties:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`
- `RATE_LIMIT_PER_HOUR` (optional, default `5`)
- `DUPLICATE_WINDOW_SECONDS` (optional, default `600`)

## Anti-spam and validation

`lead-api.gs` enforces:

- honeypot check
- strict payload validation (`fr|de`, consent required, email/phone format, min message length)
- per-email rate limit
- duplicate submission guard (same lead fingerprint within short window)
