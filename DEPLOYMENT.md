# GlobePay — Deployment Guide

## Frontend: Vercel

### Setup
1. Push repo to GitHub
2. Import project in [vercel.com](https://vercel.com)
3. **Root Directory:** `.` (repo root)
4. Vercel auto-detects `vercel.json` — no further config needed

### What vercel.json does
- Builds the React app from `fintech-interface/`
- Proxies `/api/*` requests to your Render backend
- SPA fallback: all non-static routes → `index.html`
- Security headers + static asset caching

### Environment Variables (Vercel Dashboard)
| Variable | Value |
|---|---|
| `REACT_APP_API_URL` | `https://globepay-api.onrender.com` |

> Update the rewrite destination in `vercel.json` once you have your actual Render URL.

---

## Backend: Render

### Web Service Setup
| Setting | Value |
|---|---|
| **Name** | `globepay-api` |
| **Region** | Oregon (US West) or closest |
| **Branch** | `main` |
| **Root Directory** | `fintech-interface` |
| **Runtime** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `node server.js` |
| **Plan** | Free |

### Environment Variables (Render Dashboard)
| Variable | Value |
|---|---|
| `PORT` | `10000` (Render default) |
| `JWT_SECRET` | `your-production-secret-here` |
| `NODE_ENV` | `production` |
| `CORS_ORIGIN` | `https://globepay.vercel.app` |

### Health Check
- **Path:** `/api/health`
- Returns `{ "status": "ok", "timestamp": "..." }`

---

## Local Development

```bash
# Terminal 1 — Backend
cd fintech-interface
node server.js
# → http://localhost:5000

# Terminal 2 — Frontend
cd fintech-interface
$env:PORT=3000   # Windows PowerShell
npm start
# → http://localhost:3000 (proxied to :5000)
```

---

## Post-Deploy Checklist

- [ ] Verify `/api/health` returns OK on Render URL
- [ ] Verify Vercel frontend loads and shows Landing Page
- [ ] Login with demo credentials works
- [ ] Dashboard FX Ticker shows live rates
- [ ] QR Scanner opens camera (requires HTTPS — Vercel provides this)
- [ ] Payments flow through end-to-end
