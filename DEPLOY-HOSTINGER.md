# Deploy Guide — Hostinger KVM 1 VPS (All-in-One with Coolify)

Frontend + Backend + PostgreSQL — sab kuch ek hi VPS par. Ek hi bill (~₹1176/month), koi Vercel/Railway/Supabase ki zaroorat nahi.

**Stack after migration:**

| Piece | Before | After |
|---|---|---|
| Frontend (React/Vite) | Vercel | Coolify static site on VPS |
| Backend (Express/Prisma) | Railway | Coolify app on VPS |
| Database (PostgreSQL) | Supabase | Coolify PostgreSQL container on VPS |
| SSL / Domains | Vercel/Railway auto | Coolify (Traefik + Let's Encrypt) |

**Coolify kya hai?** Free, self-hosted panel jo Vercel/Railway jaisa experience deta hai — GitHub se auto-deploy, one-click Postgres, auto SSL. Hostinger ke paas iska ready-made OS template hai.

---

## Step 0 — Purana data bachao (VPS kharidne se PEHLE)

> ✅ **HO GAYA (2026-07-15):** Backup le liya gaya hai → `d:\lms_backups\lms_backup_2026-07-15.sql`
> (12 users, 2 institutes, 2 classes, 3 content items, 2 enrollments). Isse Google Drive/pendrive par bhi copy kar lo. Neeche ke sub-steps sirf reference ke liye hain agar dobara dump lena pade.

Supabase project paused ho to data nikalne ke liye pehle usse restore karna hoga.

1. [supabase.com/dashboard](https://supabase.com/dashboard) → project `umjjphifzpzrbgkizffq` kholo → **Restore project** click karo → 2-5 min wait.
   - Agar project dashboard mein dikh hi nahi raha → data permanently delete ho chuka hai. Is case mein Step 3 skip karke fresh `migrate deploy + seed` karna (guide mein note hai).
2. Apne Windows PC par Postgres client tools install karo (sirf `pg_dump`/`psql` chahiye):
   ```powershell
   winget install PostgreSQL.PostgreSQL.17
   ```
   (Install ke baad naya terminal kholo; `pg_dump --version` chal ke dikhna chahiye.)
3. Database dump lo — `server/.env` wale `DIRECT_URL` se:
   ```powershell
   pg_dump "postgresql://postgres.umjjphifzpzrbgkizffq:<PASSWORD>@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres" --schema=public --no-owner --no-privileges -f lms_backup.sql
   ```
4. Verify karo ki dump mein data hai:
   ```powershell
   Select-String -Path lms_backup.sql -Pattern "COPY public." | Select-Object -First 20
   ```
   `COPY public."User"`, `COPY public."Institute"` etc. dikhne chahiye.
5. `lms_backup.sql` ko safe jagah copy karo (Google Drive/pendrive). **Yeh file hi tumhara poora data hai.**

---

## Step 1 — VPS kharido + Coolify install

> 💡 **Windows vs Ubuntu confusion clear kar lo:** VPS (Hostinger ka cloud server) par **Ubuntu** chalta hai — yeh Hostinger khud install karta hai, tumhe kuch nahi karna. Tumhara apna laptop **Windows hi rehta hai**, usmein koi change nahi. VPS se interact karne ke liye bas **browser** (Coolify dashboard ke liye) aur **PowerShell** (jo already use kar rahe ho — Windows 11 mein SSH built-in hai) chahiye.

1. Hostinger → **VPS → KVM 1** plan lo.
2. OS choose karte waqt: **Applications → Coolify** template select karo (Ubuntu 24.04 + Coolify pre-installed) — yeh sirf ek dropdown/click hai Hostinger ke purchase panel mein.
   - Agar template nahi mila to plain **Ubuntu 24.04** lo, phir Windows PowerShell se SSH karke install karo:
     ```powershell
     ssh root@<VPS_IP>
     ```
     (login hone ke baad, VPS ke andar hi yeh chalao):
     ```bash
     curl -fsSL https://cdn.coollabs.io/coolify/install.sh | sudo bash
     ```
3. Hostinger panel se **root password / SSH key** set karo. VPS ka **IP address note karo** — aage har jagah `<VPS_IP>` ki jagah yahi use hoga.
4. Apne Windows PC ke **browser** mein kholo: `http://<VPS_IP>:8000` → Coolify admin account banao (email + strong password — yeh panel ka master login hai).
5. Onboarding mein "Localhost" server hi rakho (same VPS machine par deploy hoga).
6. **Firewall** — Hostinger panel → VPS → Firewall (ya SSH se ufw): sirf yeh ports allow karo:
   - `22` (SSH), `80` (HTTP), `443` (HTTPS), `8000` (Coolify panel)
   - Baaki sab block. Postgres ka 5432 **kabhi public mat kholo** (import ke waqt temporarily chhodkar — Step 3).

---

## Step 2 — PostgreSQL banao (Coolify mein)

1. Coolify → **+ New → Database → PostgreSQL** (version 16).
2. Strong password set karo (generate button hai).
3. **Start** karo.
4. Database page par **internal connection URL** dikhega, is form mein:
   ```
   postgresql://postgres:<DB_PASSWORD>@<internal-host>:5432/postgres
   ```
   Yeh URL note karo — server ke env vars mein yahi jayega. `<internal-host>` Coolify ka container hostname hota hai (e.g. `xyz123`), VPS ke andar hi resolve hota hai.
5. **"Make it publicly available" OFF rakho** (sirf Step 3 import ke liye ON karenge).

---

## Step 3 — Purana data import karo

> ⚠️ **Fresh-start fallback** (sirf tab jab backup use nahi karna): repo ki ekmatr migration base schema nahi banati (original schema `db push` se bana tha), isliye khali DB par `migrate deploy` fail hoga. Fresh DB ke liye — public port ON karke apne PC se:
> ```powershell
> cd server
> $env:DATABASE_URL="postgresql://postgres:<DB_PASSWORD>@<VPS_IP>:<PUBLIC_PORT>/postgres"; $env:DIRECT_URL=$env:DATABASE_URL
> npx prisma db push
> npx prisma migrate resolve --applied 20260621000000_add_content_institute
> npm run seed   # sirf fresh DB par! Yeh saara existing data DELETE karta hai
> ```
> Backup import karne ke baad seed **kabhi mat chalana**.

1. Coolify → PostgreSQL → **"Make it publicly available" ON** karo → ek public port milega (e.g. `<VPS_IP>:5433`).
2. Apne PC se import:
   ```powershell
   psql "postgresql://postgres:<DB_PASSWORD>@<VPS_IP>:<PUBLIC_PORT>/postgres" -f lms_backup.sql
   ```
   (Kuch `already exists` type warnings aa sakti hain — ignore karo; errors on `COPY` lines nahi aani chahiye.)
3. Verify:
   ```powershell
   psql "postgresql://postgres:<DB_PASSWORD>@<VPS_IP>:<PUBLIC_PORT>/postgres" -c "SELECT count(*) FROM \"User\";"
   ```
4. **Public access wapas OFF karo.** (Zaroori security step!)

---

## Step 4 — Backend deploy karo

1. Coolify → **+ New → Application → GitHub** → repo connect karo (`Code-Sumba/lms4`, branch `main`).
2. Settings:
   - **Base Directory:** `server`
   - **Build Pack:** Nixpacks
   - **Install Command:** `npm install` (default; `postinstall` se `prisma generate` khud chalega)
   - **Pre-deployment Command:** `npx prisma migrate deploy`
   - **Start Command:** `node server.js`
   - **Port:** `5000`
   - **Health check path:** `/api/health`
3. **Environment Variables** (Coolify → app → Environment Variables):
   ```env
   DATABASE_URL=postgresql://postgres:<DB_PASSWORD>@<internal-host>:5432/postgres
   DIRECT_URL=postgresql://postgres:<DB_PASSWORD>@<internal-host>:5432/postgres
   JWT_SECRET=<NAYA random secret — neeche command>
   JWT_EXPIRES_IN=1d
   CLIENT_URL=http://localhost:5173
   CLOUDINARY_CLOUD_NAME=...
   CLOUDINARY_API_KEY=...
   CLOUDINARY_API_SECRET=...
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=465
   SMTP_USER=...
   SMTP_PASS=...
   SMTP_FROM="Motion Robotics LMS <...>"
   ```
   - **Note:** Ab real Postgres hai (PgBouncer nahi), isliye `?pgbouncer=true&connection_limit=1` wale params **nahi chahiye**. `DATABASE_URL` aur `DIRECT_URL` same hain.
   - `CLIENT_URL` Step 7 mein update hoga (frontend URL milne ke baad).
   - Naya JWT secret generate karo (purana weak hai):
     ```powershell
     node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
     ```
4. **Domains** section mein Coolify khud ek URL dega:
   `http://<random>.<VPS_IP>.sslip.io` — yehi tumhara **API URL** hai. Note karo.
   (sslip.io free hai, kaam karta hai bina domain kharide.)
5. **Deploy** dabao. Logs mein dikhna chahiye:
   - `prisma migrate deploy` → "No pending migrations" (import kiya tha) ya "applied N migrations" (fresh start)
   - `✓ Database connected` aur `✓ Server on port 5000`
6. Test: browser mein `http://<api-host>/api/health` → `{"status":"ok",...}`

---

## Step 5 — Frontend deploy karo

1. Coolify → **+ New → Application → GitHub** → same repo.
2. Settings:
   - **Base Directory:** `client`
   - **Build Pack:** Nixpacks
   - **Build Command:** `npm run build`
   - **Is it a static site?** YES → **Publish Directory:** `dist`
   - **SPA / Single Page Application toggle ON** (agar toggle nahi hai to Coolify ke custom nginx config mein yeh daalo):
     ```nginx
     location / {
       try_files $uri $uri/ /index.html;
     }
     ```
     (Iske bina `/admin/courses` jaise direct links refresh par 404 denge.)
3. **Environment Variables** (build-time):
   ```env
   VITE_API_URL=http://<api-host-from-step-4>/api
   ```
   ⚠️ Vite env **build ke waqt** bake hota hai — isse badalne par **Redeploy** zaroori hai.
4. **Deploy** → Coolify frontend ka URL dega: `http://<random>.<VPS_IP>.sslip.io` — yehi **website URL** hai.

---

## Step 6 — CORS jodo + live test

1. Backend app → Environment Variables → `CLIENT_URL` update karo:
   ```env
   CLIENT_URL=http://<frontend-host>,http://localhost:5173
   ```
2. Backend **Restart/Redeploy** karo.
3. **Full test:**
   - Website URL kholo → login (migrated account se) → dashboard load ho
   - Image upload test (Cloudinary)
   - OTP email test (SMTP)
   - Ek deep link (e.g. `/admin/courses`) par **refresh** karke dekho — 404 nahi aana chahiye

🎉 **Website live hai!** (abhi IP-based sslip.io URL par)

---

## Step 7 — Domain + HTTPS (school ko dene se pehle ZAROORI)

sslip.io URLs kaam chalau hain, lekin school ke liye proper domain + HTTPS chahiye (bina HTTPS ke passwords plain-text mein jaate hain).

1. Domain kharido (Hostinger se hi le sakte ho, ~₹700-800/yr `.in`).
2. DNS mein 2 **A records** banao, dono VPS IP par point karte hue:
   | Type | Name | Value |
   |---|---|---|
   | A | `lms` | `<VPS_IP>` |
   | A | `api` | `<VPS_IP>` |
3. Coolify:
   - Backend app → Domains → `https://api.tumhara-domain.in`
   - Frontend app → Domains → `https://lms.tumhara-domain.in`
   - Coolify/Traefik **khud Let's Encrypt SSL** le lega (2-3 min).
4. Update + redeploy:
   - Frontend: `VITE_API_URL=https://api.tumhara-domain.in/api` → **Redeploy**
   - Backend: `CLIENT_URL=https://lms.tumhara-domain.in` → Restart

---

## Step 8 — Hardening + handover checklist

- [ ] **DB backup schedule:** Coolify → PostgreSQL → Backups → daily local backup ON (aur ho sake to S3/Drive par bhi). VPS crash = data gone, backup zaroori hai.
- [ ] `JWT_SECRET` naya random hai (Step 4)
- [ ] `JWT_EXPIRES_IN=1d` set hai
- [ ] Demo/seed users ke passwords change ya delete (`superadmin@motionrobotics.in / super123` etc. agar DB mein hain)
- [ ] Postgres public access OFF hai
- [ ] Firewall sirf 22/80/443/8000 allow karta hai
- [ ] Coolify panel (port 8000) ka password strong hai — ya isse bhi firewall mein sirf apne IP ke liye kholo
- [ ] HTTPS chal raha hai (Step 7)
- [ ] `lms_backup.sql` safe jagah rakhi hai
- [ ] 1 hafta stable chalne ke baad: Railway service, Vercel project, Supabase project delete karo (paisa bachao)

---

## Roz ka workflow (migration ke baad)

Code change → `git push` → Coolify **auto-deploy** kar dega (webhook GitHub connect karte waqt ban jaata hai). Backend push par `prisma migrate deploy` bhi khud chalega. Bas.

## Troubleshooting

| Problem | Fix |
|---|---|
| CORS error browser console mein | Backend `CLIENT_URL` mein frontend ka **exact** URL (https, no trailing slash) hai? Restart kiya? |
| Frontend par refresh = 404 | Step 5 ka SPA fallback set nahi hai |
| API calls `localhost:5000` par ja rahe | `VITE_API_URL` galat build hua — env set karke frontend **Redeploy** karo |
| `P1001 can't reach database` | Postgres container chal raha hai? Internal host/password sahi? |
| 4 GB RAM full | KVM 1 ke liye normal load theek hai; build ke waqt spike aata hai. Coolify → server → configure 1-2 GB **swap** add karo |
| Deploy stuck / build fail | Coolify app → Deployments → logs padho; 90% cases env var ya base directory galat hoti hai |
