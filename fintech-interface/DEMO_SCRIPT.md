# GlobePay — 2-Minute Demo Script

> **Hackathon Pitch · Live Demo Flow**
> Target time: 2 minutes. Presenter should have the app open on `http://localhost:3000`.

---

## 0:00 – 0:15 | Hook (Landing Page)

> *"Imagine you're traveling abroad — Tokyo, Berlin, New York — and every payment means hidden FX fees and no visibility into what you're actually spending. That's the problem. **GlobePay** is a multi-currency fintech wallet that gives you real-time exchange rates, instant cross-border payments, and full spending analytics — all in one app."*

**Action:** Show the Landing Page. Scroll briefly to highlight the feature cards and currency marquee.

---

## 0:15 – 0:30 | Login

> *"Let's jump in. I'll log in with our demo account."*

**Action:**
1. Click **"Get Started"** → navigates to `/login`
2. Enter: `sraman@demo.com` / `password123`
3. Click **Log In** → redirected to Dashboard

---

## 0:30 – 1:00 | Dashboard Widgets

> *"This is the dashboard. Right away you see three things:"*

1. **FX Ticker** *(top marquee)* — *"Live exchange rates streaming across 12+ currency pairs, updating every 5 minutes from a real API."*
2. **Balance Cards** *(hero card)* — *"My total balance across all currencies — and watch this..."* → Click the currency switcher dropdown → switch from USD to INR → *"Instantly recalculated using live FX rates. No guessing."*
3. **Spending Chart** *(scroll down)* — *"The spending chart is derived from real transaction data — not mocked. Every payment I make updates this chart automatically."*

**Action:** Point to each widget. Toggle currency switcher. Scroll to chart.

---

## 1:00 – 1:25 | QR Payment Flow

> *"Now the killer feature — cross-border QR payments."*

**Action:**
1. Click **"Scan QR"** quick action → `/scanner`
2. *(If camera available)* Scan a QR code, OR click **"Enter Manually"**
3. Type: Merchant `tokyo-cafe-001`, Amount `1500`, Currency `JPY`
4. Click **Get Quote** → FX breakdown card appears showing:
   - Local amount in JPY
   - Converted amount in home currency (INR)
   - Live exchange rate used
   - Fee breakdown
5. Click **Confirm Payment** → Success animation with confetti

> *"That's a real payment — it hit our backend, deducted from my INR balance, and the transaction is now in my history."*

---

## 1:25 – 1:45 | Verify & Transactions

> *"Let's verify."*

**Action:**
1. Navigate to **Dashboard** → scroll to Recent Transactions → the payment to `tokyo-cafe-001` appears at the top
2. Navigate to **Transactions** page → show the full paginated history with status filters (Completed / Pending / Failed)
3. *(Optional)* Navigate to **Convert** page → show a quick EUR → GBP conversion quote

> *"Every transaction is persisted, filterable, and shows the exact FX rate at the time of payment."*

---

## 1:45 – 2:00 | Tech Stack & Close

> *"Under the hood:"*
- **React 19 + TypeScript** frontend with Tailwind CSS & Framer Motion
- **Express 5** backend with JWT auth, real FX rate API with caching
- **Zero mock data** — every widget, chart, and transaction is live
- **Camera-based QR scanning** via html5-qrcode
- **Deployable today** — Vercel for frontend, Render for backend

> *"GlobePay — real rates, real payments, real analytics. Thank you."*

---

## Demo Prep Checklist

- [ ] Backend running: `node server.js` (port 5000)
- [ ] Frontend running: `npm start` (port 3000)
- [ ] Demo user seeded: `sraman@demo.com` / `password123`
- [ ] Demo merchants in db.json: `tokyo-cafe-001`, `berlin-bakery`, `nyc-deli`
- [ ] Camera permissions granted (for QR scanner)
- [ ] Browser zoom at 90-100% for best dashboard layout
- [ ] Dark mode toggled to preference (Topbar moon/sun icon)

---

## Backup QR Codes (pipe-delimited format)

Print or display these on a phone for live scanning:

```
MID:tokyo-cafe-001|AMT:1500|CUR:JPY
MID:berlin-bakery|AMT:25|CUR:EUR
MID:nyc-deli|AMT:18.50|CUR:USD
```

Alternative JSON format:
```json
{"merchantId":"tokyo-cafe-001","amount":1500,"currency":"JPY"}
```
