# HomeWise Pre-Launch Checklist

## 🔴 Critical — Fix Before Any Real Users

### Security
- [x] **Add try-catch to all async route handlers** — unhandled rejections crash endpoints without a clean error response (`routes/auth.ts`, `appliances.ts`, `schedules.ts`, `history.ts`)
- [x] **Fix auth middleware missing `return`** — `middleware/auth.ts` sends a 401 but doesn't return, allowing the route handler to continue executing with no user attached
- [x] **Rate limit forgot-password and reset-password** — currently unlimited, anyone can spam password reset emails to your users or attempt to brute-force tokens
- [ ] **`sameSite: 'none'` cookie in production** — since Vercel and Railway are different domains you need `none`, but verify CSRF risk is acceptable (the API is JSON-only which significantly reduces CSRF risk in practice)

### Infrastructure
- [ ] **Verify Resend sending domain** — add DNS records in your domain registrar so emails send from `reminders@yourdomain.com` instead of Resend's shared domain. Without this, emails may land in spam or fail entirely. Blocked until domain is purchased.
- [x] **Set all env vars on Railway** — `MONGODB_URI`, `JWT_SECRET`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `CLIENT_URL`, `PORT`, `NODE_ENV=production`
- [x] **Set `VITE_API_URL` on Vercel** — pointing to your Railway backend URL

---

## 🟠 High — Fix Before Marketing/Sharing

### Security
- [x] **Add env var validation on server startup** — if `JWT_SECRET` or `MONGODB_URI` is missing the app starts but silently breaks; fail fast with a clear error
- [x] **Increase bcrypt rounds from 10 → 12** — OWASP recommendation, adds ~300ms to login which is acceptable
- [x] **Specify JWT algorithm explicitly** — add `{ algorithm: 'HS256' }` to `jwt.sign()` and `{ algorithms: ['HS256'] }` to `jwt.verify()`
- [x] **Hash reset tokens before DB storage** — tokens are 256-bit entropy (great) but stored plaintext; if DB is breached all valid reset tokens are exposed. SHA-256 hash before saving.
- [x] **Sanitize production error messages** — `errorHandler.ts` sends `err.message` to the client, which can include MongoDB internals like collection names and duplicate key values

### Deployment
- [x] **Test full deploy on Railway + Vercel** — do a complete end-to-end smoke test in production before sharing with anyone
- [x] **Verify HTTPS is enforced** — Railway and Vercel both do this automatically, but confirm cookies are being set with `Secure: true` in production
- [ ] **Run the weekly digest manually** — trigger `runWeeklyDigest()` with your user ID once in production to confirm emails send correctly from the real domain
- [x] **Set up MongoDB Atlas IP allowlist** — allowed all IPs (`0.0.0.0/0`) since Railway uses dynamic IPs; acceptable tradeoff for Railway-hosted apps

### Content/Legal
- [x] **Privacy Policy** — required before collecting any user data. Covers: what you collect (email, name, zip, appliance data), how it's used (reminders, affiliate referrals), Resend as a processor, no selling data. Free generators: Termly, Iubenda.
- [x] **Terms of Service** — basic ToS covering acceptable use, no warranty, affiliate disclosure. Same generators work.
- [x] **Add links to both in the footer** — landing page and possibly the register page

---

## 🟡 Medium — First Week After Launch

### Security
- [x] **Fix `Appliance` model `userId` type** — it's `String` while every other model uses `Schema.Types.ObjectId`. Low risk now but will cause issues in future aggregations.
- [x] **Add rate limit to appliance creation** — currently unlimited; a bad actor could spam thousands of appliances
- [x] **Password complexity requirements** — currently only enforces 8 character minimum; add at least a number requirement

### Email
- [ ] **Unsubscribe link in digest email** — CAN-SPAM requires a one-click unsubscribe that works without logging in. The current "Manage preferences" link requires auth. Add a tokenized `/unsubscribe?token=xxx` endpoint. Do before sharing with anyone.
- [ ] **Test digest with real tasks** — trigger `runWeeklyDigest()` manually in production and check a real inbox (including spam folder). Blocked until Resend domain is verified.

### Product
- [ ] **Update feedback email** — `AppLayout.tsx` has `feedback@homewise.app` hardcoded in the mailto; update to your real address. Blocked until domain is purchased.
- [ ] **Update Plausible domain** — uncomment the analytics script in `client/index.html` and set your real domain once deployed
- [x] **Seed production DB** — run `npm run seed` from `server/` against your production MongoDB Atlas instance so appliance types exist

---

## 🟢 Low — Nice to Have Before Growth

### Security
- [ ] **Hash reset tokens in DB** — medium severity, low urgency given 1-hour expiry
- [ ] **MongoDB transactions for appliance deletion** — `ReminderSchedule.deleteMany` and `MaintenanceLog.deleteMany` happen sequentially without a transaction; if one fails the other is left orphaned

### Outside Services
- [ ] **Apply for Thumbtack partner program** — search "Thumbtack partner program"; links work now but you're not earning referral fees yet
- [ ] **Apply for Angi affiliate program** — runs through the Impact network; search "Angi affiliate Impact"
- [ ] **Don't apply for Amazon Associates yet** — wait until you have 3 qualifying sales (their requirement within 180 days of approval)

### SEO / Distribution
- [ ] **Submit sitemap to Google Search Console** — Vite doesn't auto-generate one; create a simple `/sitemap.xml` with just the landing page for now
- [ ] **Add favicon** — `client/public/` currently uses Vite's default
- [ ] **OG image** — `index.html` has OG tags but no `og:image`; even a simple green card with the logo significantly improves link previews when shared

### Monitoring
- [ ] **Set up Railway health check alerts** — configure Railway to alert you if the backend goes down
- [ ] **Replace node-cron with external trigger** — node-cron won't fire if Railway restarts at exactly 8am Monday. Use cron-job.org to hit a `/api/cron/weekly-digest` endpoint instead for reliability.

---

## 🔧 Placeholder Updates — Swap Before Launch

Items in the codebase with placeholder values that need real ones before going live.

- [x] **Feedback email** — updated to `hello@yourhomewise.app`
- [x] **Privacy contact email** — updated to `hello@yourhomewise.app`
- [x] **Legal contact email** — updated to `hello@yourhomewise.app`
- [ ] **Set up email forwarding** — in Namecheap, forward `hello@yourhomewise.app` to your real inbox so you receive messages sent to that address

---

## The Short List — Ship This Week

If you want to get this live fast, these are the true blockers:

1. ~~Auth middleware `return` fix~~ ✓
2. ~~Try-catch sweep on all route handlers~~ ✓
3. ~~Rate limit forgot-password + reset-password~~ ✓
4. ~~Env vars set on Railway and Vercel~~ ✓
5. ~~Seed production DB~~ ✓
6. ~~Privacy policy + ToS live on landing page~~ ✓
7. ~~Full production smoke test~~ ✓
8. **Add tokenized unsubscribe endpoint** — CAN-SPAM blocker before sharing with real users
9. **Purchase domain** — unblocks Resend domain verification, email delivery, and placeholder updates
10. **Verify Resend sending domain** — required for reliable email delivery
