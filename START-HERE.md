# ChatCRM — Fresh Start Guide

Follow these steps in order. Two PowerShell windows needed (one for backend, one for frontend).

---

## WINDOW 1: BACKEND

```powershell
cd backend
```

```powershell
npm install
```

Create the `.env` file (replace YOUR_PASSWORD with your real PostgreSQL password):
```powershell
'DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/chatcrm"
JWT_SECRET="chatcrm-secret-key-abc123xyz"
PORT=5000
NODE_ENV=development' | Out-File -FilePath .env -Encoding utf8
```

Push the database schema:
```powershell
npx prisma db push
```

Load demo data:
```powershell
node prisma/seed.js
```

Start the server:
```powershell
npm run dev
```

✅ You should see: `ChatCRM API running on port 5000`
**Keep this window open.**

---

## WINDOW 2: FRONTEND

Open a **new** PowerShell window.

```powershell
cd frontend
```

```powershell
npm install --legacy-peer-deps
```

```powershell
npx expo start
```

Press **W** to open in browser.

---

## LOGIN
- Email: `owner@chatcrm.com`
- Password: `password123`

---

## IMPORTANT — DO NOT RUN
- `npm audit fix --force` — this breaks Expo version compatibility
- Do not change package.json versions in frontend

If something breaks, delete `node_modules` and `package-lock.json` in that folder, then `npm install` again with the same command above.
