# Deployment Guide

## Stack
- **Frontend** → Vercel (auto-detect Vite)
- **Backend** → Railway (Node.js)
- **Database** → MongoDB Atlas (free tier)

---

## Step 1 — MongoDB Atlas

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) → create free cluster
2. **Database Access** → Add user (username + password)
3. **Network Access** → Allow from anywhere (`0.0.0.0/0`) for Railway
4. **Connect** → Copy the connection string:
   ```
   mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/motionlms?retryWrites=true&w=majority
   ```

---

## Step 2 — Push to GitHub

```bash
cd d:\lms4
git init
git add .
git commit -m "Initial commit — Phase 1 & 2 complete"
# Create repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/motion-lms.git
git push -u origin main
```

---

## Step 3 — Deploy Backend to Railway

1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Select your repo → set **Root Directory** to `server`
3. Add environment variables:
   ```
   MONGO_URI=mongodb+srv://...
   JWT_SECRET=a-very-long-random-secret-key-here
   JWT_EXPIRES_IN=7d
   CLIENT_URL=https://your-app.vercel.app
   PORT=5000
   ```
4. Railway auto-detects Node.js and runs `node server.js`
5. Copy your Railway URL: `https://your-backend.railway.app`

**Seed the database (run once):**
```bash
cd server
MONGO_URI="mongodb+srv://..." node utils/seed.js
```

---

## Step 4 — Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) → New Project → Import GitHub repo
2. Set **Root Directory** to `client`
3. Framework preset: **Vite** (auto-detected)
4. Add environment variable:
   ```
   VITE_API_URL=https://your-backend.railway.app/api
   ```
5. Deploy → get your URL: `https://motion-lms.vercel.app`
6. Go back to Railway → update `CLIENT_URL` to your Vercel URL

---

## Updating After Each Phase

```bash
# After making changes:
git add .
git commit -m "Phase X complete — description"
git push

# Vercel and Railway auto-redeploy on push to main
```

---

## Local Development

```bash
# Terminal 1 — Backend
cd server
cp .env.example .env   # fill in MONGO_URI
npm run dev            # http://localhost:5000

# Terminal 2 — Frontend
cd client
cp .env.example .env.local  # VITE_API_URL=http://localhost:5000/api
npm run dev            # http://localhost:5173
```
