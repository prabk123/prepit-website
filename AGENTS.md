# Repository Guide

Use Yarn 4 for all commands (`packageManager` in `package.json`).

```bash
corepack enable
yarn install --immutable
```

## Development

```bash
yarn dev
```

Runs Next.js on **http://localhost:3000**.

Sharable meal-plan pages need MongoDB env vars in `.env.local` (not committed):

- `MONGODB_URI` — e.g. `mongodb://127.0.0.1:27017`
- `MONGODB_DB_NAME` — same database as the backend (e.g. `prepit_dev`)
- `PREPIT_API_BASE_URL` — backend image base (e.g. `http://127.0.0.1:8081`)

Marketing/static pages work without MongoDB. `yarn build` fails if MongoDB vars are missing because `/sharable/meal-plans/[id]` is built at compile time.

## Cursor Cloud specific instructions

Use Node 20 from nvm (`export PATH="/home/ubuntu/.nvm/versions/node/v20.20.2/bin:$PATH"`).

- `yarn dev` is sufficient to verify the marketing site in cloud VMs.
- Pair with local MongoDB when testing sharable meal-plan routes.
- `yarn lint` / `next lint` may error on Next.js 16 in this repo; `yarn build` (with `.env.local`) is the reliable compile check when MongoDB is available.
