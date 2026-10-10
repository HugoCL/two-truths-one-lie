# Two Truths, One Lie

A real-time multiplayer party game for 2 to 12 friends. One player writes two truths and one lie, everyone else votes on which is the lie. No accounts, no downloads: you join with an invite code.

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs)
![Convex](https://img.shields.io/badge/backend-Convex-orange)

![Home screen of Two Truths, One Lie](docs/screenshots/home.jpg)

## How a game works

1. One player creates a game and shares the 6-character invite code (or a `/join?code=...` link) from the lobby.
2. Players join from their own device. The host starts the game once at least 2 players are in.
3. Each round has one submitter, picked in join order. They write three statements (up to 200 characters each) and mark which one is the lie.
4. The host or the submitter starts a 10-second voting countdown.
5. Everyone except the submitter votes on which statement is the lie. Votes can be changed until the timer ends, and live vote counts are shown.
6. The round is revealed: the lie, who voted for what, and the updated scoreboard. Each correct vote is worth 1 point.
7. The host moves to the next round. The game ends after every player has been the submitter once, and the player with the most points wins.

## Features

- Real-time state: every screen updates live through Convex queries, with no polling or manual refresh.
- Join by code or by shareable link, with a copy-invite-link button in the lobby.
- Lobby, writing, waiting, voting, reveal and final scoreboard views, one per game phase.
- Server-side countdown: the vote closes through a Convex scheduled function, so a slow client cannot keep voting open.
- Anonymous sessions: each browser gets a random session ID stored in `localStorage`, so a reload does not drop you from the game.
- Input validation in the backend: name length (1 to 30 characters), exactly 3 statements, no empty statements, valid lie index, one vote per player per round, no voting on your own round.

## Stack

- [Next.js](https://nextjs.org) 16 (App Router) with React 19 and the React Compiler
- [Convex](https://convex.dev) for the database, real-time queries, mutations and scheduled functions
- Tailwind CSS 4, [shadcn/ui](https://ui.shadcn.com) and [Base UI](https://base-ui.com) components
- TypeScript, ESLint, pnpm
- Deployed on Vercel, with Convex deployed during the Vercel build

### Project layout

```
convex/
  schema.ts          # games, players, rounds, votes tables
  games.ts           # create, join, start, getGameState
  rounds.ts          # submitStatements, startVoteCountdown, castVote, advanceRound, closeVoting
  lib/               # game logic, session checks, validators
src/
  app/               # routes: / (create or join), /join, /game/[gameId]
  components/game/   # one view per phase (lobby, submit, voting, reveal, finished)
  components/ui/     # shared UI primitives
  lib/session.ts     # anonymous session ID
```

## Run it locally

You need Node.js and [pnpm](https://pnpm.io). You also need a free Convex account, because the backend runs on a Convex deployment (a dev deployment is created for you).

```bash
pnpm install
cp .env.example .env.local
```

Start the Convex backend in one terminal. On first run it asks you to log in and creates a dev deployment, then writes `NEXT_PUBLIC_CONVEX_URL` to `.env.local`.

```bash
pnpm exec convex dev
```

Start Next.js in another terminal:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). To test with several players, open the game in different browsers or private windows, since each one has its own session.

### Environment variables

| Name | Purpose | Required |
| --- | --- | --- |
| `NEXT_PUBLIC_CONVEX_URL` | URL of the Convex deployment the frontend connects to. | Yes |
| `CONVEX_DEPLOY_KEY` | Lets Vercel deploy the Convex functions during `pnpm build:vercel`. Set it in Vercel only. | Production deploys only |

### Scripts

```bash
pnpm dev        # Next.js dev server
pnpm build      # production build
pnpm start      # run the production build
pnpm lint       # ESLint
pnpm typecheck  # TypeScript check
```

## Deploy

The repo includes a `vercel.json` that runs `pnpm build:vercel`. That script runs `convex deploy` and then the Next.js build, and injects `NEXT_PUBLIC_CONVEX_URL` automatically.

1. Create a deploy key for your production Convex deployment:

   ```bash
   pnpm exec convex deployment token create vercel --prod --save-env
   ```

2. In Vercel, add the generated `CONVEX_DEPLOY_KEY` under Project Settings > Environment Variables for Production (and Preview if you want preview builds).
3. Push to GitHub, or deploy from the CLI:

   ```bash
   pnpm dlx vercel --prod
   ```

## License

Code under the MIT license. Use it however you like, keeping the copyright notice. See [LICENSE](LICENSE).

## Author

Hugo Castro - [github.com/HugoCL](https://github.com/HugoCL) - [hugocastro.dev](https://hugocastro.dev)
