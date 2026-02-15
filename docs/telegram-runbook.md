# Telegram Runbook (Leads Notifications)

Goal: every successful lead form submit writes a row to Google Sheets and sends 1 Telegram message.

Security rule:

- Do not store secrets in git.
- Do not paste tokens into chat.
- Use Apps Script **Script Properties**.

## 1) Create Bot Token

1. Open Telegram and start a chat with `@BotFather`.
2. Run `/newbot`.
3. Follow the prompts and copy the bot token.

Result:

- `TELEGRAM_BOT_TOKEN`

## 2) Choose Destination (Personal Chat or Group)

Option A: Personal chat

1. Open your bot in Telegram.
2. Click **Start** and send any message (for example `test`).

Option B: Group

1. Create a group (example: `MPDESIGN Leads`).
2. Add your bot to the group.
3. Send any message to the group (for example `test`).

## 3) Get CHAT_ID

1. Open in browser:
   - `https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/getUpdates`
2. Find the `chat` object for the message you sent.
3. Copy `chat.id` as:
   - `TELEGRAM_CHAT_ID`

Notes:

- For groups, the chat id is usually negative (starts with `-`).
- If you get an empty result, send another message and refresh.

## 4) Set Script Properties (Apps Script)

Open your Apps Script project that hosts the lead endpoint.

1. Go to **Project Settings**.
2. In **Script Properties**, add:
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_CHAT_ID`
3. Optional tuning:
   - `RATE_LIMIT_PER_HOUR` (default `5`)
   - `DUPLICATE_WINDOW_SECONDS` (default `600`)

## 5) Test

1. Open staging site.
2. Submit a lead form.
3. Confirm:
   - A new row appears in the configured Google Sheet
   - Exactly 1 Telegram message is received

