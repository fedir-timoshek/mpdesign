# Cloudflare Runbook (DNS + SSL + Web Analytics)

This runbook is written for the domain:

- `mpdesign-windows.ch` (canonical, no `www`)
- `staging.mpdesign-windows.ch` (staging)

## 1) Add Site

1. Log in to Cloudflare.
2. Click **Add a site**.
3. Enter `mpdesign-windows.ch`.
4. Select plan **Free** (enough for Web Analytics + proxy + redirects).
5. Continue and let Cloudflare scan existing DNS records.

## 2) Switch Nameservers (Registrar: Infomaniak)

Cloudflare will show 2 nameservers (NS). Copy them.

1. Open Infomaniak domain settings for `mpdesign-windows.ch`.
2. Replace the current nameservers with the two Cloudflare NS values.
3. Wait until Cloudflare shows the site status as **Active**.

Notes:

- DNS propagation can take minutes to hours.
- Do not delete your existing DNS records until Cloudflare is active and configured.

## 3) DNS Records (Required)

Create/confirm these records in **Cloudflare -> DNS**:

- `A` record:
  - Name: `@`
  - Value: `78.46.157.243`
  - Proxy: **Proxied** (orange cloud)
- `AAAA` record:
  - Name: `@`
  - Value: `2a01:4f8:d0a:52c6::2`
  - Proxy: **Proxied**
- `A` record:
  - Name: `staging`
  - Value: `78.46.157.243`
  - Proxy: **Proxied**
- `AAAA` record:
  - Name: `staging`
  - Value: `2a01:4f8:d0a:52c6::2`
  - Proxy: **Proxied**

Optional:

- `CNAME`:
  - Name: `www`
  - Target: `@`
  - Proxy: **Proxied**

## 4) SSL/TLS

In **Cloudflare -> SSL/TLS**:

1. Set mode to **Full** initially.
2. When the origin (Hetzner) certificate is confirmed valid, switch to **Full (strict)**.
3. Enable **Always Use HTTPS**.

Important:

- Do not enable HSTS until production is verified to work correctly over HTTPS end-to-end.

## 5) Redirects (Recommended)

In **Cloudflare -> Rules -> Redirect Rules**:

- Redirect `www.mpdesign-windows.ch/*` -> `https://mpdesign-windows.ch/$1` (301)

## 6) Web Analytics

1. Go to **Cloudflare -> Analytics & Logs -> Web Analytics**.
2. Create a site for `mpdesign-windows.ch`.
3. Copy the **token**.
4. Put the token into GitHub Secrets as:
   - `NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN`

## 7) Verify

After a staging deploy, open:

- `https://staging.mpdesign-windows.ch/fr/`

Check page source contains:

- `static.cloudflareinsights.com/beacon.min.js`

Also check robots:

- staging must be `Disallow: /` (noindex)
- production must allow crawling and expose sitemap

