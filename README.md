# Barbear — Hair Style Competition Voting System

Next.js app for barber / hair-style competitions with public voting and an admin dashboard.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- **Local PostgreSQL** (`pg`)
- Cookie-based admin auth (`jose` + `bcryptjs`)
- Local image uploads (`public/uploads`)
- React Hook Form + Zod
- Recharts (admin results)

## Quick start (local Postgres)

### 1. Start PostgreSQL (Docker)

```bash
docker start barbear-postgres 2>/dev/null || \
docker run -d --name barbear-postgres \
  -e POSTGRES_USER=barbear \
  -e POSTGRES_PASSWORD=barbear \
  -e POSTGRES_DB=barbear \
  -p 55432:5432 \
  postgres:16-alpine
```

### 2. Configure env

```bash
cp .env.example .env.local
npm install
```

### 3. Create tables + admin user

```bash
npm run db:setup
```

Default admin:

- **Email:** `admin@barbear.com`
- **Password:** `admin123`

### 4. Run the app

```bash
npm run dev
```

- Public site: http://localhost:3000
- Admin: http://localhost:3000/admin/login

## Admin workflow

1. Sign in at `/admin/login`
2. Create/edit competition
3. Add competitors and upload Front / Back / Left / Right images
4. Publish competitors, set competition status to `active`
5. Monitor votes and results

## Voting integrity

- Email is trimmed + lowercased
- OTP verification before vote is saved
- Database unique constraint: `(competition_id, voter_email)`

## Scripts

```bash
npm run dev
npm run build
npm run db:setup
npm run lint
```
# BarBear-Competatior
