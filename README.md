# ChatCRM — Phase 1

A conversation-first CRM. One screen per customer. Chat, quotes, orders, invoices, tasks, notes, timeline — all in one place.

---

## Project Structure

```
chatcrm/
├── backend/          # Node.js + Express + Prisma + PostgreSQL
├── frontend/         # Expo (React Native Web — runs on iOS, Android, Web)
└── docker-compose.yml
```

---

## Quick Start (Docker — Recommended)

### 1. Start the database + backend
```bash
docker-compose up -d
```

### 2. Run database migrations + seed demo data
```bash
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend node prisma/seed.js
```

### 3. Start the frontend (mobile/web)
```bash
cd frontend
npm install
npm start        # Expo dev server
# Press W for web, scan QR for mobile
```

---

## Manual Setup (No Docker)

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env — set DATABASE_URL and JWT_SECRET

npx prisma migrate dev --name init
node prisma/seed.js          # Load demo data

npm run dev                  # Starts on :5000
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env — set EXPO_PUBLIC_API_URL=http://localhost:5000/api

npm start
# W = web browser
# Scan QR = mobile (install Expo Go app first)
```

---

## Demo Login

After running seed:
- **Email:** owner@chatcrm.com
- **Password:** password123

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/register | Register company + owner |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Current user |
| GET | /api/dashboard | Dashboard stats |
| GET | /api/search?q= | Global search |
| GET/POST | /api/customers | List / Create |
| GET/PUT | /api/customers/:id | Get / Update |
| GET/POST | /api/customers/:id/messages | Chat messages |
| GET/POST | /api/customers/:id/quotes | Quotes |
| POST | /api/customers/:id/quotes/:id/convert | Quote → Order |
| GET/PUT | /api/customers/:id/orders | Orders |
| POST | /api/customers/:id/orders/:id/invoice | Order → Invoice |
| GET/PUT | /api/customers/:id/invoices | Invoices |
| GET/POST/PUT/DELETE | /api/customers/:id/tasks | Tasks |
| GET/POST/DELETE | /api/customers/:id/notes | Notes |
| GET | /api/customers/:id/timeline | Timeline |

---

## Phase 2 Roadmap

- [ ] PDF generation (quotes & invoices)
- [ ] File uploads (S3 / local)
- [ ] Multi-user roles (Admin / Staff)
- [ ] WhatsApp integration
- [ ] Email notifications
- [ ] Payment tracking
- [ ] Reports & analytics
- [ ] Customer portal

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile + Web | Expo (React Native Web) |
| Navigation | React Navigation v6 |
| Backend | Node.js + Express |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT |
| Containers | Docker + Docker Compose |

