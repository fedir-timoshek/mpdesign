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

## Deploy (Web App)

This project is designed to be bound to a Google Sheet (it uses `SpreadsheetApp.getActiveSpreadsheet()`).

1. Open the Apps Script project.
2. Click **Deploy** -> **New deployment**.
3. Select type **Web app**.
4. Set **Execute as**: `Me`.
5. Set **Who has access**: `Anyone`.
6. Click **Deploy** and copy the Web App URL.

Put the URL into GitHub Secrets:

- `NEXT_PUBLIC_LEAD_ENDPOINT`

### Browser CORS note (important)

Apps Script Web Apps return CORS headers for `POST`, but **do not** handle `OPTIONS` preflight.
So the frontend must send a "simple request":

- send the JSON payload as a plain string body
- do **not** set `Content-Type: application/json`

See `/Users/ftimoshek/Desktop/MPDesign/проект/src/components/lead-form.tsx`.

## Telegram setup

In Apps Script > Project Settings > Script Properties:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`
- `RATE_LIMIT_PER_HOUR` (optional, default `5`)
- `DUPLICATE_WINDOW_SECONDS` (optional, default `600`)

Step-by-step guide:

- `/Users/ftimoshek/Desktop/MPDesign/проект/docs/telegram-runbook.md`

## Anti-spam and validation

`lead-api.gs` enforces:

- honeypot check
- strict payload validation (`fr|de`, consent required, email/phone format, min message length)
- per-email rate limit
- duplicate submission guard (same lead fingerprint within short window)
