# HomeWise

**Live app → [yourhomewise.app](https://yourhomewise.app)**

A free home appliance maintenance tracker. Add your appliances, get email reminders before things break, and find local professionals when needed. No subscription, no paywall.

---

## What it does

- **Appliance registry** — Users add appliances from a catalog of 15+ types (HVAC, water heater, refrigerator, etc.), each pre-loaded with maintenance schedules and task intervals
- **Smart reminders** — A weekly cron job calculates upcoming due dates and sends personalized email digests
- **Maintenance logs** — Users log completed tasks (self or pro), with optional cost tracking; logs feed back into next-due-date calculations
- **Health scores** — Each appliance gets an overdue-weighted score so users know what needs attention first
- **DIY guides** — Every task links to an iFixit or YouTube walkthrough
- **Affiliate deep links** — "Find a Pro" routes users to Thumbtack and Angi pre-filtered by service category and zip code; "Tools & Parts" surfaces Amazon product searches
- **Password reset** — Full forgot/reset flow via email token
- **Unsubscribe** — One-click email opt-out without requiring login

---

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | React 18 + Vite, TypeScript, Tailwind CSS |
| Backend | Node.js + Express, TypeScript |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT in httpOnly cookies |
| Email | Brevo (transactional + reminder digest) |
| Validation | Zod (client + server) |
| Scheduler | node-cron (weekly digest, Mondays 8am UTC) |
| Security | helmet, express-rate-limit, bcryptjs |
| Analytics | Vercel Analytics |
| Hosting | Vercel (frontend) + Railway (backend) |

---

## Project structure

```
homewise/
├── client/                  # React + Vite frontend
│   ├── src/
│   │   ├── components/      # Reusable UI (TaskCard, ApplianceCard, etc.)
│   │   ├── pages/           # Route-level pages (Dashboard, ApplianceDetail, etc.)
│   │   ├── hooks/           # Custom React hooks
│   │   ├── context/         # AuthContext
│   │   └── lib/             # API client, utility functions
│   └── public/
└── server/
    └── src/
        ├── models/          # Mongoose models (User, Appliance, MaintenanceLog, etc.)
        ├── routes/          # Express route handlers
        ├── middleware/      # JWT auth, error handling
        ├── services/        # Email, scheduler, health score logic
        └── data/            # Appliance type seed data
```

---

## Running locally

### Prerequisites

- Node.js 18+
- A [MongoDB Atlas](https://cloud.mongodb.com) cluster (free tier works)
- A [Brevo](https://brevo.com) account for email (free tier: 300 emails/day)

### 1. Clone and install

```bash
git clone git@github.com:thebenstenator/homewise.git
cd homewise

npm install
cd client && npm install
cd ../server && npm install
```

### 2. Environment variables

**`server/.env`**

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Random secret — `openssl rand -hex 32` |
| `RESEND_API_KEY` | From your Brevo dashboard |
| `RESEND_FROM_EMAIL` | Verified sender, e.g. `HomeWise <reminders@yourdomain.com>` |
| `CLIENT_URL` | Frontend URL (no trailing slash) |
| `PORT` | Defaults to 3001 |

**`client/.env`**

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend URL (no trailing slash) |

### 3. Seed the database

```bash
cd server
npm run seed
```

Populates the `ApplianceType` collection with all 15+ appliance categories and their maintenance tasks. Run once per database.

### 4. Start dev servers

```bash
# Terminal 1 — backend (http://localhost:3001)
cd server && npm run dev

# Terminal 2 — frontend (http://localhost:5173)
cd client && npm run dev
```

Health check: `GET http://localhost:3001/api/health`

---

## Deployment

### Frontend → Vercel

1. Import repo, set **Root Directory** to `client`
2. Build command: `npm run build` / Output: `dist`
3. Add env var: `VITE_API_URL=https://your-backend.up.railway.app`
4. `client/vercel.json` handles SPA routing automatically

### Backend → Railway

1. New project, connect repo, set **Root Directory** to `server`
2. Build: `npm run build` / Start: `npm start`
3. Add all server env vars in Railway's Variables panel
4. Set `CLIENT_URL` to your Vercel frontend URL

### After deploying both

Update `CLIENT_URL` on Railway and `VITE_API_URL` on Vercel to point at each other, then redeploy.
