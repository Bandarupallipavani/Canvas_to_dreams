# 🎨 Canvas to Dreams — Complete Deployment Guide
## Zero Cost · 10,000+ Users · Full Stack

---

## 📦 What You've Got

```
canvas-to-dreams/
├── backend/          ← FastAPI (Python) — deploy to Render.com (FREE)
└── frontend/         ← React + Vite — deploy to Vercel.com (FREE)
```

---

## 🗃️ STEP 1: Supabase (Free Database + Auth)

**URL:** https://app.supabase.com

1. Click **New Project** → name it `canvas-to-dreams`
2. Choose a region close to India (Singapore)
3. Set a strong DB password → **save it!**
4. Go to **Settings → Database → Connection String**
5. Copy the **URI** (looks like `postgresql://postgres:[password]@db.xxx.supabase.co:5432/postgres`)
6. Replace `[password]` with your actual password
7. Add `+asyncpg` after `postgresql` → `postgresql+asyncpg://...`

> 📌 This is your `DATABASE_URL` for the backend

---

## 🖼️ STEP 2: Cloudinary (Free Image Hosting — 25GB)

**URL:** https://cloudinary.com

1. Sign up for free
2. Go to **Dashboard** → copy:
   - Cloud Name
   - API Key
   - API Secret

> 📌 These become `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

---

## 💳 STEP 3: Payment Gateways

### Razorpay (India — Recommended)
1. Sign up: https://dashboard.razorpay.com
2. Go to **Settings → API Keys → Generate Test Key**
3. Copy **Key ID** and **Key Secret**
4. For production: complete KYC and switch to live keys

### Stripe (International)
1. Sign up: https://dashboard.stripe.com
2. Go to **Developers → API Keys**
3. Copy **Secret key** (sk_test_...) and **Publishable key** (pk_test_...)

---

## 🚀 STEP 4: Deploy Backend to Render.com (FREE)

**URL:** https://render.com

1. Push your code to GitHub:
   ```bash
   cd canvas-to-dreams
   git init
   git add .
   git commit -m "Initial commit: Canvas to Dreams"
   git remote add origin https://github.com/YOUR_USERNAME/canvas-to-dreams.git
   git push -u origin main
   ```

2. On Render: **New → Web Service** → connect your GitHub repo

3. Configure:
   - **Root Directory:** `backend`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type:** Free

4. Add **Environment Variables** (Render → Environment):
   ```
   DATABASE_URL        = postgresql+asyncpg://postgres:[pass]@db.xxx.supabase.co:5432/postgres
   SECRET_KEY          = [generate a random 64-char string]
   CLOUDINARY_CLOUD_NAME = your-cloud-name
   CLOUDINARY_API_KEY  = your-api-key
   CLOUDINARY_API_SECRET = your-api-secret
   RAZORPAY_KEY_ID     = rzp_test_xxx
   RAZORPAY_KEY_SECRET = your-secret
   STRIPE_SECRET_KEY   = sk_test_xxx
   FRONTEND_URL        = https://canvas-to-dreams.vercel.app
   ```

5. Click **Deploy** → wait ~5 min

6. Your API URL will be: `https://canvas-to-dreams-api.onrender.com`

> ✅ Test it: visit `https://canvas-to-dreams-api.onrender.com/` → should say "Canvas to Dreams API is live 🎨"

---

## 🌐 STEP 5: Deploy Frontend to Vercel (FREE)

**URL:** https://vercel.com

1. Push your code to GitHub (done in Step 4)

2. On Vercel: **New Project** → import your GitHub repo

3. Configure:
   - **Framework:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

4. Add **Environment Variables** (Vercel → Settings → Environment Variables):
   ```
   VITE_API_URL              = https://canvas-to-dreams-api.onrender.com
   VITE_RAZORPAY_KEY_ID      = rzp_test_xxx
   VITE_STRIPE_PUBLISHABLE_KEY = pk_test_xxx
   ```

5. Click **Deploy** → wait ~2 min

6. Your site URL: `https://canvas-to-dreams.vercel.app`

---

## 👑 STEP 6: Create Your Admin Account

After deployment, make yourself an admin:

1. Register at your site: `https://canvas-to-dreams.vercel.app/register`
2. Open Supabase → **Table Editor → users**
3. Find your email row → change `role` from `customer` to `admin`
4. Now visit `/admin` — you're in!

---

## 🔄 STEP 7: Connect Frontend URL to Backend

After getting your Vercel URL:
1. Go to Render → your service → **Environment**
2. Update `FRONTEND_URL` to your actual Vercel URL
3. Click **Save** → service will redeploy

---

## 💰 Cost Breakdown

| Service | Free Tier Limit | Cost |
|---------|----------------|------|
| Supabase | 500MB DB, 50k auth users | FREE |
| Render | 750 hrs/month (1 service = always free) | FREE |
| Vercel | Unlimited deployments, 100GB bandwidth | FREE |
| Cloudinary | 25GB storage, 25GB bandwidth | FREE |
| Razorpay | No monthly fees (2% per transaction) | FREE to integrate |
| Stripe | No monthly fees (2.9% + ₹2 per transaction) | FREE to integrate |

**Total monthly cost: ₹0** 🎉

---

## 📊 Handling 10,000 Users

This stack comfortably handles 10k+ users:
- **Vercel Edge Network** → 100GB free bandwidth, global CDN
- **Supabase** → PostgreSQL with connection pooling
- **Render** → Auto-scaling (free tier: 512MB RAM, enough for early stage)
- **Cloudinary** → Images served from CDN, not your server

When you grow past free tiers:
- Render Starter: $7/month
- Supabase Pro: $25/month
- Total for 100k users: ~$32/month

---

## 🛠️ Local Development

```bash
# Backend
cd backend
pip install -r requirements.txt
cp .env.example .env   # fill in your values
uvicorn app.main:app --reload --port 8000

# Frontend (new terminal)
cd frontend
npm install
cp .env.example .env.local   # fill in your values
npm run dev
```

Open: http://localhost:5173

---

## 🎨 Adding Your First Painting

1. Log in as admin → go to `/admin/products`
2. Click **Add Painting**
3. Upload images (goes to Cloudinary automatically)
4. Fill in title, description, price, category
5. Toggle "Featured" to show it on the homepage
6. Click **Add Painting** → it's live!

---

## 📱 Custom Domain (Optional, Free)

1. Buy a domain (e.g. `canvastodreams.in`) from GoDaddy/Namecheap (~₹800/year)
2. In Vercel → Settings → Domains → add your domain
3. Update DNS records as Vercel shows
4. Done! Your site is at your own domain.

---

## 🔐 Security Checklist

- [ ] Change `SECRET_KEY` to a random 64-char string
- [ ] Use different keys for test vs production in Razorpay/Stripe
- [ ] Never commit `.env` files to GitHub — they're in `.gitignore`
- [ ] After going live, update CORS in `backend/app/main.py` to only allow your domain

---

*Built with ❤️ for Canvas to Dreams — canvas_to_dreams on Instagram & YouTube*
