# ChatCRM - Windows Setup Guide (No Docker)

## Step 1 — Install Node.js (if not already)
Download from: **https://nodejs.org** → choose "LTS" version → install with defaults.

Verify in PowerShell:
```
node --version
```

---

## Step 2 — Install PostgreSQL
Download from: **https://www.postgresql.org/download/windows/**

During install:
- Set a password for the `postgres` user — **remember this password!**
- Keep default port: `5432`
- Keep default locale

---

## Step 3 — Create the database
After PostgreSQL installs, open **pgAdmin** (installed with PostgreSQL) or open **SQL Shell (psql)** from Start Menu.

In SQL Shell, press Enter 4 times to accept defaults, then type your password.
Then run:
```sql
CREATE DATABASE chatcrm;
\q
```

---

## Step 4 — Configure the backend
Open the `backend` folder. Edit the `.env` file (or it will be created from `.env.windows`):

Change `YOUR_PG_PASSWORD` to the password you set in Step 2:
```
DATABASE_URL="postgresql://postgres:YOUR_PG_PASSWORD@localhost:5432/chatcrm"
```

---

## Step 5 — Start the backend
Open PowerShell inside the `backend` folder:
```powershell
cd backend
npm install
npx prisma db push
node prisma/seed.js
npm run dev
```

You should see: `ChatCRM API running on port 5000`

---

## Step 6 — Start the frontend (new PowerShell window)
```powershell
cd frontend
npm install --legacy-peer-deps
npx expo start
```

Press **W** to open in your browser.

---

## Demo Login
- Email: `owner@chatcrm.com`
- Password: `password123`

---

## Quick Commands (after first setup)

Start backend:
```powershell
cd backend
npm run dev
```

Start frontend:
```powershell
cd frontend
npx expo start
```
