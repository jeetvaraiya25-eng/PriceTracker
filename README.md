# Dropwatch

Price drop tracker: paste a product URL (or add it from a bookmarklet, Chrome extension, or WhatsApp), and Dropwatch checks the price on a schedule, stores history, and alerts you when it falls.

## Stack

- **Frontend:** React, Vite, Tailwind CSS, Recharts
- **Backend:** Node.js 22+, Express, Cheerio (optional Puppeteer), node-cron, JWT auth
- **Database:** SQLite via `node:sqlite` (swap the file for Postgres later if you deploy)
- **Alerts:** Nodemailer + WhatsApp Cloud API

## Run locally

You need **Node.js 22 or newer** (`node:sqlite`).

```bash
npm run install:all
npm run dev
```

- App: http://localhost:5173
- API: http://localhost:3001

Create an account, then paste a product URL. Demo pages that always parse:

- http://localhost:3001/demo/headphones
- http://localhost:3001/demo/shoes
- http://localhost:3001/demo/kettle

## Environment

Copy `.env.example`. Important keys:

| Variable | Purpose |
| --- | --- |
| `JWT_SECRET` | Signs login tokens |
| `CHECK_INTERVAL_HOURS` | Cron interval (default 6) |
| `SMTP_*` | Email alerts (logs to console if unset) |
| `WHATSAPP_TOKEN` | Meta Cloud API access token |
| `WHATSAPP_PHONE_NUMBER_ID` | WhatsApp Business phone number ID |
| `WHATSAPP_VERIFY_TOKEN` | Token you set in the Meta webhook |
| `WHATSAPP_DISPLAY_NUMBER` | Human-readable number shown in Settings |
| `ENABLE_PUPPETEER` | `true` to fall back to a headless browser for JS-heavy shops |
| `VITE_API_PUBLIC_URL` | Public API origin used by the bookmarklet and extension |

## Bookmarklet

Dashboard or Settings → drag **Track with Dropwatch** onto the bookmarks bar. Click it on a product page.

## Chrome extension

1. Open `chrome://extensions`
2. Enable Developer mode
3. Load unpacked → select the `extension/` folder
4. Paste your JWT from Settings into the popup

Customize `extension/manifest.json` (icons, domain list) and `extension/content.js` (button placement) as needed.

## WhatsApp bot

Uses the official [WhatsApp Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api).

1. Create a Meta app with WhatsApp, then set `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, and `WHATSAPP_VERIFY_TOKEN`
2. Point the webhook at `https://your-api.onrender.com/api/whatsapp/webhook` (verify token must match)
3. Restart the API
4. Message the business number, send `connect`, and enter the code in Dropwatch → Settings
5. Paste product links in that chat

For local testing, expose the API with a tunnel (ngrok, Cloudflare Tunnel) so Meta can reach the webhook.

## Deploy

- Frontend on Vercel (`frontend/`, build `npm run build`, output `dist`)
- API on Render (background worker / web service running `npm start` in `backend/`)
- Point `VITE_API_PUBLIC_URL` at the Render URL and enable CORS (already `origin: true`)
