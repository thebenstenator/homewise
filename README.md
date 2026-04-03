# HomeWise

Free home appliance maintenance tracker. Add your appliances, get smart reminders before things break, and find local professionals when needed.

**Tech stack:** React 18 + Vite · Node.js + Express · MongoDB Atlas · TypeScript · Tailwind CSS

---

## Getting started

### Prerequisites

- Node.js 18+
- A [MongoDB Atlas](https://cloud.mongodb.com) cluster (free tier works)
- A [Resend](https://resend.com) account for email reminders (free tier: 3,000/month)

### 1. Clone and install

```bash
git clone git@github.com:thebenstenator/homewise.git
cd homewise

# Install root + both workspaces
npm install
cd client && npm install
cd ../server && npm install
```

### 2. Set up environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.example   # read the comments in .env.example

# Create the actual files:
# server/.env  (copy server section from .env.example)
# client/.env  (copy client section from .env.example)
```

**Required server variables:**

| Variable | Description |
|---|---|
| `MONGODB_URI` | Atlas connection string |
| `JWT_SECRET` | Random secret — run `openssl rand -hex 32` |
| `RESEND_API_KEY` | From resend.com dashboard |
| `RESEND_FROM_EMAIL` | Verified sender address in Resend |
| `CLIENT_URL` | Frontend URL (no trailing slash) |

**Required client variables:**

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend URL (no trailing slash) |

### 3. Seed the database

```bash
cd server
npm run seed
```

This populates `ApplianceType` documents (15 appliance categories with tasks). Run once per database.

### 4. Run in development

```bash
# Terminal 1 — backend
cd server && npm run dev

# Terminal 2 — frontend
cd client && npm run dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:3001  
Health check: http://localhost:3001/api/health

---

## Deployment

### Frontend → Vercel

1. Import the repo in Vercel, set **Root Directory** to `client`
2. Build command: `npm run build`
3. Output directory: `dist`
4. Add environment variable: `VITE_API_URL=https://your-backend.up.railway.app`
5. The `client/vercel.json` handles SPA routing automatically

### Backend → Railway

1. Create a new Railway project, connect the repo
2. Set **Root Directory** to `server`
3. Build command: `npm run build`
4. Start command: `npm start` (runs `node dist/index.js`)
5. Add all server environment variables in Railway's Variables panel
6. Set `CLIENT_URL` to your Vercel frontend URL

### After deploying

- Update `CLIENT_URL` on Railway to your Vercel URL
- Update `VITE_API_URL` on Vercel to your Railway URL
- Re-deploy both after updating variables

---

## Analytics (optional)

The app is pre-wired for [Plausible](https://plausible.io) (privacy-friendly, no cookies, no GDPR banner needed).

To enable: uncomment the script tag in `client/index.html` and replace `yourdomain.com` with your actual domain.

"Find a Pro" clicks are tracked as a custom `find-pro-click` event with a `destination` property (`thumbtack` or `angi`).

---

## Project structure

```
homewise/
├── client/          # React + Vite frontend
├── server/          # Express + MongoDB backend
├── specs/           # Product specs and slice plans
└── .env.example     # Environment variable template
```
