# HomeWise Pre-Launch Checklist

## 🔴 Critical — Fix Before Any Real Users

### Security
- [x] **Add try-catch to all async route handlers** — unhandled rejections crash endpoints without a clean error response (`routes/auth.ts`, `appliances.ts`, `schedules.ts`, `history.ts`)
- [x] **Fix auth middleware missing `return`** — `middleware/auth.ts` sends a 401 but doesn't return, allowing the route handler to continue executing with no user attached
- [x] **Rate limit forgot-password and reset-password** — currently unlimited, anyone can spam password reset emails to your users or attempt to brute-force tokens
- [ ] **`sameSite: 'none'` cookie in production** — since Vercel and Railway are different domains you need `none`, but verify CSRF risk is acceptable (the API is JSON-only which significantly reduces CSRF risk in practice)

### Infrastructure
- [x] **Verify Brevo sending domain** — added DNS records in Namecheap (TXT, CNAME x2, DMARC) so emails send from `reminders@yourhomewise.app`. Switched from Resend to Brevo (Resend free tier limited to 1 domain, already used by Boardfoot).
- [x] **Set all env vars on Railway** — `MONGODB_URI`, `JWT_SECRET`, `BREVO_API_KEY`, `BREVO_FROM_EMAIL`, `CLIENT_URL`, `NODE_ENV=production`
- [x] **Set `VITE_API_URL` on Vercel** — pointing to Railway backend URL

---

## 🟠 High — Fix Before Marketing/Sharing

### Security
- [x] **Add env var validation on server startup** — if `JWT_SECRET` or `MONGODB_URI` is missing the app starts but silently breaks; fail fast with a clear error
- [x] **Increase bcrypt rounds from 10 → 12** — OWASP recommendation, adds ~300ms to login which is acceptable
- [x] **Specify JWT algorithm explicitly** — add `{ algorithm: 'HS256' }` to `jwt.sign()` and `{ algorithms: ['HS256'] }` to `jwt.verify()`
- [x] **Hash reset tokens before DB storage** — tokens are 256-bit entropy (great) but stored plaintext; if DB is breached all valid reset tokens are exposed. SHA-256 hash before saving.
- [x] **Sanitize production error messages** — `errorHandler.ts` sends `err.message` to the client, which can include MongoDB internals like collection names and duplicate key values

### Deployment
- [x] **Test full deploy on Railway + Vercel** — complete end-to-end smoke test in production before sharing with anyone
- [x] **Verify HTTPS is enforced** — Railway and Vercel both do this automatically; cookies set with `Secure: true` in production
- [ ] **Run the weekly digest manually** — trigger `runWeeklyDigest()` with your user ID once in production to confirm emails send correctly from `reminders@yourhomewise.app`
- [x] **Set up MongoDB Atlas IP allowlist** — allowed all IPs (`0.0.0.0/0`) since Railway uses dynamic IPs; acceptable tradeoff for Railway-hosted apps

### Content/Legal
- [x] **Privacy Policy** — live at `/privacy`; covers data collection, Brevo as processor, affiliate disclosure, user rights
- [x] **Terms of Service** — live at `/terms`; covers acceptable use, no warranty, affiliate disclosure
- [x] **Add links to both in the footer** — landing page footer includes Privacy Policy and Terms of Service links

---

## 🟡 Medium — First Week After Launch

### Security
- [x] **Fix `Appliance` model `userId` type** — was `String`, migrated to `Schema.Types.ObjectId` via migration script; also ran `migrate-appliance-userid.ts` against production to fix existing documents
- [x] **Add rate limit to appliance creation** — currently unlimited; a bad actor could spam thousands of appliances
- [x] **Password complexity requirements** — currently only enforces 8 character minimum; add at least a number requirement

### Email
- [x] **Unsubscribe link in digest email** — built tokenized `/unsubscribe?token=xxx` system; `unsubscribeToken` stored on User, generated at registration, included in every digest email footer. CAN-SPAM compliant one-click unsubscribe with no login required.
- [ ] **Test digest with real tasks** — trigger `runWeeklyDigest()` manually in production and check a real inbox (including spam folder)
- [ ] **Run unsubscribe token migration** — `MONGODB_URI="..." npx tsx scripts/add-unsubscribe-tokens.ts` to backfill tokens for any existing users

### Product
- [x] **Update feedback email** — `AppLayout.tsx` updated to `hello@yourhomewise.app`
- [ ] **Update Plausible domain** — uncomment the analytics script in `client/index.html` and set real domain once deployed
- [x] **Seed production DB** — run `npm run seed` against production MongoDB Atlas; includes all 17 appliance types (including Sprinkler System added this session)

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
- [x] **Email forwarding** — `hello@yourhomewise.app` forwards to `homewiseapp@outlook.com` via Namecheap email forwarding
- [x] **FROM_EMAIL** — `emailService.ts` uses `reminders@yourhomewise.app` via Brevo

---

## The Short List — Ship This Week

1. ~~Auth middleware `return` fix~~ ✓
2. ~~Try-catch sweep on all route handlers~~ ✓
3. ~~Rate limit forgot-password + reset-password~~ ✓
4. ~~Env vars set on Railway and Vercel~~ ✓
5. ~~Seed production DB~~ ✓
6. ~~Privacy policy + ToS live on landing page~~ ✓
7. ~~Full production smoke test~~ ✓
8. ~~Tokenized unsubscribe endpoint~~ ✓
9. ~~Purchase domain (`yourhomewise.app`)~~ ✓
10. ~~Switch to Brevo + verify sending domain~~ ✓
11. ~~Run weekly digest manually~~ ✓
12. ~~Run unsubscribe token migration~~ ✓
