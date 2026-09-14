# Dropwatch

Price drop tracker: paste a product URL (or add it from a bookmarklet or Chrome extension), and Dropwatch checks the price on a schedule, stores history, and emails you when it falls.

## Stack

- **Frontend:** React, Vite, Tailwind CSS, Recharts
- **Backend:** Node.js 22+, Express, Cheerio (optional Puppeteer), node-cron, JWT auth
- **Database:** SQLite via `node:sqlite` (swap the file for Postgres later if you deploy)
- **Alerts:** Email via Nodemailer

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

## Email alerts

When a tracked price hits the target, Dropwatch emails the address the user signed up with. No extra number or bot to connect.

1. Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, and `SMTP_FROM` (Gmail needs an [app password](https://myaccount.google.com/apppasswords))
2. Restart the API
3. In the app, set a target on a product
4. When the price reaches that target, the user gets a drop email

If SMTP is unset, alerts print to the API console instead of sending.

## Deploy

- Frontend on Vercel (`frontend/`, build `npm run build`, output `dist`)
- API on Render (background worker / web service running `npm start` in `backend/`)
- Point `VITE_API_PUBLIC_URL` at the Render URL and enable CORS (already `origin: true`)
