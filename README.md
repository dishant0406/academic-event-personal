# Academic Events Hub

Academic Events Hub is a Next.js frontend with an Express, Sequelize, and MySQL backend for discovering, publishing, moderating, and tracking academic events.

## Architecture

- `app/`: Next.js App Router frontend
- `components/`: shared UI components
- `lib/`: frontend config, API, session, and route helpers
- `backend/`: Express API, Sequelize models, local DB scripts, mailers, and maintenance scripts
- `scripts/local/`: local development automation

## Environment

Copy the example files and fill in real values.

```bash
cp .env.example .env.local
cp backend/.env.example backend/.env
```

Required backend variables:

- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `DB_ROOT_USER` and `DB_ROOT_PASSWORD` for automatic local DB bootstrap
- `JWT_SECRET`
- `ADMIN_CODE`
- `FRONTEND_BASE_URL`
- `ALLOWED_ORIGINS`

Required frontend variables:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_API_ORIGIN`
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_SOCKET_URL`

## Local Development

### One-time setup

Follow `LOCAL_SETUP.md` if you are setting up MySQL for the first time.

Install dependencies:

```bash
npm install
npm --prefix backend install
```

Initialize the local environment:

```bash
npm run local:setup
```

### Start the app locally

```bash
npm run local:start
```

Frontend default URL: `http://localhost:3000`

Backend default URL: `http://localhost:4000`

### Health check

```bash
npm run local:doctor
```

## Quality Checks

Run the full verification loop:

```bash
npm run check
```

Run backend checks directly:

```bash
npm --prefix backend run check
```

## Database Scripts

```bash
npm --prefix backend run db:check
npm --prefix backend run db:sync
npm --prefix backend run db:reset
```

## Maintenance Scripts

Backend maintenance scripts are blocked in production by default.

- `npm --prefix backend run seed`
- `node backend/seed-more.js`
- `node backend/seed-past.js`
- `node backend/cleanup.js`
- `node backend/update-dates.js`
- `node backend/wipe-events.js`

## Deployment Notes

- Do not commit `.env` files.
- Do not commit `node_modules`.
- Set backend env vars in your hosting provider instead of `vercel.json`.
- Set matching frontend and backend origins before going live.
- Rotate any credentials that were previously committed in older history.

## Current Verification Target

The expected local verification loop is:

- `npm run build`
- `npm --prefix backend test`
- `npm run check`
- `npm --prefix backend run check`
