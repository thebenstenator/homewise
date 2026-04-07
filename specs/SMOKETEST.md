# HomeWise Smoke Test

Run this top-to-bottom against production (`www.yourhomewise.app`). Check each item off as you go.

---

## 1. Landing Page (Unauthenticated)

Open the site while **logged out** (or in an incognito window).

- [ ] Landing page loads — not a redirect to `/login`
- [ ] Hero headline and subheadline visible
- [ ] "Log In" and "Get Started Free" buttons visible in nav
- [ ] "How it works" section shows 3 steps with icons
- [ ] Appliance icon grid shows 17 appliance tiles (including Sprinkler System)
- [ ] Footer visible with Privacy Policy and Terms of Service links
- [ ] Click "Get Started Free" → navigates to `/register`
- [ ] Click "Log In" → navigates to `/login`
- [ ] `/privacy` page loads and shows Brevo (not Resend) as email processor
- [ ] `/terms` page loads and reads correctly

---

## 2. Registration

- [ ] Fill in name, email, valid password (8+ chars, letter + number), 5-digit zip code
- [ ] Submit → redirected to `/dashboard`
- [ ] Browsewrap notice visible below the button: "By creating an account, you agree to our Terms of Service and Privacy Policy"
- [ ] Both links in the notice open the correct pages

---

## 3. Authentication Flows

### Login
- [ ] Log out, log back in with correct credentials → dashboard
- [ ] Wrong password → inline red error (not a toast)
- [ ] Non-existent email → generic error (no account enumeration)

### Forgot Password
- [ ] `/forgot-password` → enter email → "Check your inbox" success message
- [ ] Email arrives from `reminders@yourhomewise.app` with subject "Reset your HomeWise password"
- [ ] Reset link in email navigates to `/reset-password?token=...`
- [ ] Enter new password → "Password updated. You can now log in."
- [ ] Invalid/expired token → error message shown

### Session Persistence
- [ ] Refresh page while logged in → stays on dashboard
- [ ] Close and reopen browser → still logged in

---

## 4. Dashboard

- [ ] Health score card shows score (0–100) and grade (A–F)
- [ ] Stat bar shows: Appliances count | Tasks Due count | Done This Month count
- [ ] Clicking "Tasks Due" stat → switches to "Due Soon" tab
- [ ] Clicking "Appliances" stat → switches to "My Appliances" tab
- [ ] "Done This Month" links to `/history`
- [ ] "Due Soon" tab: tasks overdue or due within 7 days appear here
- [ ] "My Appliances" tab: all registered appliances listed

### Empty State
- [ ] Fresh account shows "You're all caught up!" on Due Soon tab
- [ ] Fresh account shows "No appliances yet" on My Appliances tab

---

## 5. Add Appliance

- [ ] Click "Add Appliance" → modal opens
- [ ] **Step 1**: Grid of 17 appliance types — click one to advance
- [ ] **Step 2**:
  - [ ] Name pre-filled, editable
  - [ ] Brand, Model, Install Year fields (all optional)
  - [ ] "Date of last service" date picker
  - [ ] "Never serviced / not sure" checkbox disables and clears the date picker
  - [ ] Notes textarea
- [ ] **Old appliance** (install year 2+ years ago, no last service date): two buttons appear — "Add & Review Tasks" and "Add Appliance"
- [ ] **New appliance** (recent year): single "Add Appliance" button
- [ ] Submit → success toast, appliance appears in My Appliances tab, tasks appear in Due Soon
- [ ] If "Date of last service" was entered: next due dates calculated from that date

---

## 6. Appliance Detail Page

Click an appliance card to navigate to `/appliances/:id`.

- [ ] Header shows appliance name, type label, icon
- [ ] Brand / Model / Install Year shown if set
- [ ] Notes shown if set
- [ ] Edit and Delete buttons present
- [ ] **Maintenance Tasks tab** (default):
  - [ ] Task cards for all scheduled maintenance
  - [ ] "Always-On Reminders" section appears for applicable appliance types
- [ ] **History tab**:
  - [ ] Shows "No maintenance logged yet" for fresh appliance
  - [ ] After logging tasks: entries appear with date, notes, cost, DIY/Pro badge

---

## 7. Task Actions

### Mark Done
- [ ] Click "Mark Done" → LogTaskModal opens with date (today), DIY/Pro toggle, cost field, notes
- [ ] Submit → success toast, task disappears from Due Soon, appears in history
- [ ] Next due date recalculated from completion date

### DIY Guide
- [ ] Click "DIY Guide" on a task → DiyGuideModal opens
- [ ] Shows numbered steps, tips/notes, tools & parts with Amazon links, video link
- [ ] "Find a Pro" Thumbtack link present in modal
- [ ] Close with Escape key or clicking outside

### Find a Pro
- [ ] Click "Find a Pro" on a task → popover with Thumbtack and Angi buttons
- [ ] Thumbtack link opens new tab pre-filtered by service + zip code, URL includes `utm_source=homewise`
- [ ] Angi link opens new tab with same behavior
- [ ] Both URLs resolve to real pages (not 404)

### Snooze
- [ ] Click "Snooze" → dropdown with 1 week / 2 weeks / 1 month
- [ ] Select one → success toast, task disappears from Due Soon

---

## 8. Edit & Delete Appliance

- [ ] Edit: modal pre-filled with current values, save updates the page
- [ ] Delete: confirmation dialog with warning, confirm deletes appliance + redirects to dashboard
- [ ] All related tasks and history gone after delete

---

## 9. Maintenance History Page (`/history`)

- [ ] All logged tasks shown, grouped by month
- [ ] Each entry: appliance name, task label, date, cost (if entered), DIY/Pro badge, notes (if entered)
- [ ] Appliance filter dropdown works
- [ ] Empty state: "No maintenance logged yet"

---

## 10. Profile Page (`/profile`)

- [ ] Name, Email (read-only), Zip Code fields present
- [ ] Email Reminders toggle present with "Sent every Monday morning" hint
- [ ] Edit name/zip → save → success toast → values persist on refresh
- [ ] Toggle email reminders off → save → reminders disabled

---

## 11. Navigation (Desktop)

- [ ] Nav shows: HomeWise logo | user avatar/initials
- [ ] Click avatar → dropdown: Dashboard, History, Profile, Send Feedback, Log out
- [ ] Log out → redirected to landing page
- [ ] "Install App" button **not visible** on desktop

---

## 12. Navigation & Install Button (Mobile)

Open on a real mobile device.

- [ ] Nav shows HomeWise logo and user avatar
- [ ] Gap between tab group and "Add Appliance" button looks correct (not touching)
- [ ] **Install App button** visible in header when not yet installed

### iOS (Safari)
- [ ] "Install App" tap → popover with Share → Add to Home Screen → Add instructions
- [ ] After installing via share sheet → button disappears, runs in standalone mode

### Android (Chrome)
- [ ] "Install App" tap → native browser install prompt (if eligible) OR manual instructions popover
- [ ] After installing → button disappears, app opens in standalone mode (no address bar)

---

## 13. PWA Icon

- [ ] iOS home screen: no black background around icon (apple-touch-icon has solid background)
- [ ] Android home screen: icon looks correct
- [ ] App opens in standalone mode (no browser chrome / address bar)

---

## 14. Email — Weekly Digest

Trigger manually from `server/`: `MONGODB_URI="..." npx tsx scripts/trigger-digest.ts`

- [ ] Email arrives from `reminders@yourhomewise.app`
- [ ] Subject: "Your HomeWise Maintenance Reminder" (no emoji)
- [ ] Each task shows: appliance name, task label, days until due (color-coded)
- [ ] "DIY Guide →" links to `/appliances/:id?diy=:taskId` — **not** directly to YouTube
  - [ ] Clicking opens the app and auto-opens the correct DIY guide modal
- [ ] "Find a Pro →" links to Thumbtack with correct category + zip — URL resolves (not 404)
- [ ] "View Dashboard →" links to `/dashboard`
- [ ] Footer shows "Unsubscribe" and "Manage preferences" links

---

## 15. Unsubscribe Flow

Click the unsubscribe link from a real digest email.

- [ ] Navigates to `/unsubscribe?token=xxx`
- [ ] Success screen: "You're unsubscribed" with checkmark
- [ ] "Re-enable reminders in your profile" link works
- [ ] No login required
- [ ] Invalid/expired token → "Invalid link" error screen
- [ ] Profile page → Email Reminders toggle now shows Off

---

## 16. Legal

- [ ] `/privacy` accessible, mentions Brevo, lists `hello@yourhomewise.app` as contact
- [ ] `/terms` accessible, lists `hello@yourhomewise.app` as contact
- [ ] Both linked in landing page footer
- [ ] Register page shows browsewrap consent notice with working links

---

## 17. Error States

- [ ] Visit `/appliances/invalid-id` → "Appliance not found." with back link (no crash)
- [ ] Backend 5xx → toast error appears, app doesn't go blank

---

## 18. Health Check

```bash
curl https://homewise-production.up.railway.app/api/health
```

- [ ] Returns `{ "status": "ok", "timestamp": "..." }`

---

## 19. Rate Limiting

Run 6 times rapidly in a terminal:

```bash
for i in {1..6}; do
  curl -s -X POST https://homewise-production.up.railway.app/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"name":"test","email":"test@test.com","password":"password1","zipCode":"12345"}' | jq .error
done
```

- [ ] First 5: registration attempt (success or duplicate email error)
- [ ] 6th: `"Too many registration attempts, please try again later."`
