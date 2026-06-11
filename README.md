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

1. **Deploy Convex backend** (run once, or after backend changes):

```bash
pnpm exec convex deploy
```

Confirm when prompted. Production URL:

`https://energetic-monitor-366.convex.cloud`

2. **Vercel environment variables** (already configured for production):

- `NEXT_PUBLIC_CONVEX_URL` = `https://energetic-monitor-366.convex.cloud`
- `NEXT_PUBLIC_CONVEX_SITE_URL` = `https://energetic-monitor-366.convex.site`

3. **Redeploy Vercel** after env changes:

```bash
pnpm dlx vercel --prod
```

### Optional: auto-deploy Convex on every Vercel build

1. Create a deploy key: `pnpm exec convex deployment token create vercel --prod --save-env`
2. Add `CONVEX_DEPLOY_KEY` to Vercel (Production)
3. Set Vercel build command to: `pnpm build:vercel`
