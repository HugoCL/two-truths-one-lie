# Two Truths, One Lie

A real-time party game built with Next.js and Convex.

## Getting Started

Install dependencies:

```bash
pnpm install
```

Run the development servers:

```bash
# Terminal 1 — Convex backend
pnpm exec convex dev

# Terminal 2 — Next.js frontend
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to play.

## Scripts

```bash
pnpm dev        # Start Next.js dev server
pnpm build      # Production build
pnpm start      # Start production server
pnpm lint       # Run ESLint
pnpm typecheck  # Run TypeScript checks
```

## Deploy

This project uses **pnpm**. Vercel detects `pnpm-lock.yaml` automatically.

### Convex + Vercel (production)

1. **Create a Convex deploy key for Vercel** (once):

```bash
pnpm exec convex deployment token create vercel --prod --save-env
```

Copy the generated `CONVEX_DEPLOY_KEY` into Vercel → Project Settings → Environment Variables for **Production** (and Preview if you want preview builds).

2. **Vercel environment variables**:

- `CONVEX_DEPLOY_KEY` — from step 1 (required for `pnpm build:vercel`)
- `NEXT_PUBLIC_CONVEX_URL` = `https://energetic-monitor-366.convex.cloud`
- `NEXT_PUBLIC_CONVEX_SITE_URL` = `https://energetic-monitor-366.convex.site`

3. **Deploy**: push to GitHub or run:

```bash
pnpm dlx vercel --prod
```

The repo includes `vercel.json` with `buildCommand: pnpm build:vercel`, which runs Convex deploy and the Next.js build in CI without interactive prompts.

<!-- deploy test trigger -->
