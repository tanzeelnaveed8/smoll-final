# Server: Docker (Redis + Postgres) & Demo Login

## 1. Redis + Postgres with Docker

```bash
cd sf-server-v2
docker compose -f docker-compose.local.yml up -d
```

- **Postgres** → `localhost:5433` (user `root`, password `example`, db `postgres`)
- **Redis** → `localhost:6379`

## 2. Environment

Create `.env` from `.env.example` and set:

```env
ENVIRONMENT=development
DATABASE_URL=postgresql://root:example@localhost:5433/postgres
REDIS_HOST=localhost
REDIS_PORT=6379
# JWT, etc. as in .env.example
```

## 3. Migrations & Demo Account

```bash
yarn install
yarn migration:run
yarn seed:member-demo
```

## 4. Run Server

```bash
yarn start:dev
```

## 5. Demo Login (App)

- **Email:** `demo@smoll.com` **or Phone:** `+971501111111`
- **OTP:** When you tap “Login” in the app, the server prints the OTP in the terminal, e.g.  
  `[DEV] OTP for demo@smoll.com: 1234`  
  Enter that 4-digit code in the app.

Only works when `ENVIRONMENT=development` and no real email/SMS is sent.

### Get OTP not working?

1. **App must call this server:** In `sf-app-v2` create `.env` from `.env.example` and set `API_URL` to your backend (e.g. `http://10.0.2.2:3000` for Android emulator). Restart Expo after changing `.env`.
2. **Use demo number:** Phone `+971501111111` (with country code). Run `yarn seed:member-demo` so this user exists; or use any number to register (Stripe is optional in dev).
3. **OTP in server console:** Check the terminal where `yarn start:dev` is running for the 4-digit OTP.
