# ChatCRM — Free Hosted Deployment Guide

No local setup. Push code once, get live URLs you can test from any browser/phone.

**Backend + Database → Railway** (free trial, no card)
**Frontend (Web) → Vercel** (free forever)

Total time: ~15 minutes.

---

## PART 1 — Push code to GitHub

1. Go to https://github.com/new → create a new repository called `chatcrm` (Public or Private, your choice)
2. Don't add README/gitignore (we already have files)
3. On your PC, inside the `chatcrm-fixed` folder (the one with `backend` and `frontend`), open PowerShell and run:

```powershell
git init
git add .
git commit -m "Initial ChatCRM commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/chatcrm.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

If `git` is not installed: download from https://git-scm.com/download/win

---

## PART 2 — Deploy Backend + Database on Railway

1. Go to https://railway.com → Sign up with GitHub (no card needed for trial)
2. Click **New Project** → **Deploy from GitHub repo** → select your `chatcrm` repo
3. Railway will ask which folder — set **Root Directory** to `backend`
4. Click **Add a service** → **Database** → **PostgreSQL** (in the same project)
5. Go to your backend service → **Variables** tab → add:
   ```
   DATABASE_URL = ${{Postgres.DATABASE_URL}}
   JWT_SECRET = chatcrm-secret-key-change-this-abc123
   NODE_ENV = production
   ```
   (Railway auto-fills `${{Postgres.DATABASE_URL}}` when you start typing — pick it from the dropdown.)
6. Go to **Settings** tab of the backend service → **Networking** → click **Generate Domain**
7. Copy the generated URL (looks like `chatcrm-backend-production.up.railway.app`)
8. Wait for deployment to finish (check **Deployments** tab → should show "Success")
9. Seed demo data — go to backend service → click the **⋮** menu → **Shell**, then run:
   ```
   node prisma/seed.js
   ```

Your API is now live at: `https://your-backend-url.up.railway.app/api`

Test it: open `https://your-backend-url.up.railway.app/api/health` in browser — should show `{"status":"ok"}`

---

## PART 3 — Deploy Frontend on Vercel

1. Go to https://vercel.com → Sign up with GitHub
2. Click **Add New** → **Project** → import your `chatcrm` repo
3. Set **Root Directory** to `frontend`
4. Under **Environment Variables**, add:
   ```
   EXPO_PUBLIC_API_URL = https://your-backend-url.up.railway.app/api
   ```
   (use the Railway URL from Part 2, Step 7 — make sure to add `/api` at the end)
5. Click **Deploy**

Vercel will build and give you a live URL like `https://chatcrm.vercel.app`

---

## PART 4 — Test it

Open your Vercel URL in any browser (or share it with anyone to test):
- Email: `owner@chatcrm.com`
- Password: `password123`

---

## Updating after code changes

Anytime you fix something, just:
```powershell
git add .
git commit -m "fix: description of fix"
git push
```

Both Railway and Vercel auto-redeploy on every push to `main`. No manual steps needed.

---

## Troubleshooting

**Backend shows "Application failed to respond"**
→ Check Railway → Deployments → View Logs for the actual error.

**Frontend shows blank/white screen**
→ Open browser console (F12) → check for errors. Usually means `EXPO_PUBLIC_API_URL` is wrong or missing a trailing `/api`.

**Login fails with network error**
→ Verify the backend URL is reachable: visit `https://your-backend-url.up.railway.app/api/health` directly in browser.
