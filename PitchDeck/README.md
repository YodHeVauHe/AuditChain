# AuditLinkTrail Pitch Deck

A [Next.js](https://nextjs.org) 16 presentation deck for the AuditLinkTrail seed pitch.
The deck is fully static — every slide is prerendered HTML and route-addressable
(`/`, `/problem`, `/solution`, `/integrity-demo`, …), with keyboard navigation,
a progress indicator, and per-slide animations. There are no API routes, no
database, and no environment variables.

## Requirements

- Node.js 20.9 or newer (pinned via `engines.node`)

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Use ←/→ (or Space/Shift+Space)
to move between slides; press `?` for the full keyboard shortcut list.

Other scripts:

```bash
npm run build      # production build (also verifies types + static generation)
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
```

## Deploy to Vercel

The deck deploys as a standard Next.js project — Vercel detects the framework,
build command, and output automatically. The only thing to get right is that the
app lives in the `PitchDeck/` subdirectory of this repository, not the repo root.

### Option A — Vercel dashboard (recommended)

1. Push this repository to GitHub (already done: `YodHeVauHe/AuditLinkTrail`).
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
3. In **Build & Output Settings**, set **Root Directory** to `PitchDeck`.
   Vercel then auto-detects Next.js and fills in `npm run build`.
4. Click **Deploy**. No environment variables are needed.

Every push to `main` deploys a new production build; pull requests get preview URLs.

### Option B — Vercel CLI

From the `PitchDeck/` directory:

```bash
npx vercel          # preview deployment
npx vercel --prod   # production deployment
```

The CLI creates and links the project on first run; since the deployment root is
`PitchDeck/`, the app is detected without extra configuration.
