# Barbear — Hair Style Competition Voting System

Next.js app for barber / hair-style competitions with public voting and an admin dashboard.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- PostgreSQL (`pg`) — local Docker or Render
- Cookie-based admin auth (`jose` + `bcryptjs`)
- Image uploads (local `public/uploads` or Render disk)
- React Hook Form + Zod
- Recharts (admin results)

## Quick start (local)

```bash
npm run db:start
cp .env.example .env.local
npm install
npm run db:setup
npm run dev
```

- Public: http://localhost:3000
- Admin: http://localhost:3000/admin/login (`admin@barbear.com` / `admin123`)

## Deploy on Render

### 1. Push this repo to GitHub

Make sure `main` includes the latest code.

### 2. Create a Web Service

In [Render Dashboard](https://dashboard.render.com):

1. **New → Web Service** → connect `BarBear-Competatior` (or this repo)
2. Settings:
   - **Runtime:** Node
   - **Build command:** `npm ci && npm run build`
   - **Start command:** `npm run start`
   - **Instance:** Starter (needed for the upload disk)
3. Or use Blueprint: **New → Blueprint** → select this repo (`render.yaml`)

### 3. Environment variables

| Key | Value |
|---|---|
| `DATABASE_URL` | Your Render Postgres **External** (or Internal) URL |
| `AUTH_SECRET` | Long random string (or let Render generate) |
| `ADMIN_EMAIL` | `admin@barbear.com` |
| `ADMIN_PASSWORD` | Strong password |
| `NEXT_PUBLIC_APP_URL` | `https://YOUR-SERVICE.onrender.com` |
| `UPLOAD_DIR` | `/var/data/uploads` |

### 4. Persistent disk (photos)

Add a disk so competitor photos survive restarts:

- **Name:** `barbear-uploads`
- **Mount path:** `/var/data`
- **Size:** 1 GB

### 5. Create tables after first deploy

In the Render shell for the service:

```bash
npm run db:setup:prod
```

Or from your laptop (with `DATABASE_URL` set to the Render DB):

```bash
DATABASE_URL='postgresql://...' npm run db:setup:prod
```

### 6. Open the site

- Site: `https://YOUR-SERVICE.onrender.com`
- Admin: `https://YOUR-SERVICE.onrender.com/admin/login`

## Voting rules

- One vote per phone number per competition
- Unique constraint: `(competition_id, voter_phone)`

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run db:setup
npm run db:setup:prod
npm run lint
```
