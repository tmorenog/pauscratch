# Pau's Worldcup Bracket

An interactive World Cup knockout-stage bracket app. Enter match scores, pick
tiebreakers, and watch teams march through the tournament all the way to the
final. Results are saved to `localStorage` so you can pick up where you left
off. Built with **Next.js (App Router) + React + TypeScript** and ready to
deploy on **Vercel**.

## Features

- Full knockout bracket: Round of 16 → Quarterfinals → Semifinals →
  Third-place match → Final
- Editable scores per match with automatic winner detection
- Tiebreakers for tied games: choose winner after extra time or penalties
- Automatic advancement — winners populate the next round immediately
- Re-propagation: editing an earlier result clears invalid later results
- Champion, runner-up, and third-place podium display with trophy
- Round-by-round progress indicator
- Stadium, city, country, and date shown on every match card
- Reset everything (with confirmation), plus JSON export/import
- Print-friendly view
- Light / dark mode toggle
- Responsive layout — scrollable bracket on small screens
- Keyboard-accessible inputs and semantic HTML

## Tech stack

- Next.js 14 (App Router)
- React 18
- TypeScript
- Plain CSS (no heavy UI framework)
- `localStorage` for persistence — no backend needed

## Getting started locally

```bash
# 1. install dependencies
npm install

# 2. start the dev server
npm run dev

# 3. open http://localhost:3000
```

Other scripts:

```bash
npm run build       # production build
npm run start       # run production build
npm run lint        # eslint
npm run typecheck   # tsc --noEmit
```

## Deploy to Vercel

This is a stock Next.js app, so the default Vercel config works with zero setup:

1. Push this repo to GitHub / GitLab / Bitbucket.
2. Import the repo at <https://vercel.com/new>.
3. Accept the detected defaults (Framework: **Next.js**, Build command:
   `next build`, Output: `.next`) and hit **Deploy**.

Or from the CLI:

```bash
npx vercel
npx vercel --prod
```

## Project structure

```
src/
├── app/
│   ├── globals.css       # all styling (light + dark)
│   ├── layout.tsx        # root layout, metadata, theme pre-hydration
│   └── page.tsx          # main app page
├── components/
│   ├── Bracket.tsx       # column layout for all rounds
│   ├── Champion.tsx      # trophy + podium panel
│   ├── Controls.tsx      # reset / export / import / print
│   ├── MatchCard.tsx     # individual match with score inputs + tiebreaker
│   ├── Progress.tsx      # round-by-round progress bars
│   └── ThemeToggle.tsx   # dark mode toggle
├── data/
│   └── tournament.json   # sample tournament (16 teams, 15 matches)
└── lib/
    ├── bracket.ts        # pure progression logic
    ├── types.ts          # data model
    └── useBracket.ts     # React hook with localStorage persistence
```

## Data model

Each match is a node in the bracket graph:

```ts
interface Match {
  id: string;
  round: "round_of_16" | "quarterfinal" | "semifinal" | "third_place" | "final";
  matchNumber: number;
  team1: Team | null;
  team2: Team | null;
  score1: number | null;
  score2: number | null;
  winnerId: string | null;
  loserId: string | null;
  decidedBy: "regular" | "extra_time" | "penalties" | null;
  stadium: string;
  city: string;
  country: string;
  date?: string;
  nextMatchId: string | null;      // where the winner advances
  nextMatchSlot: "team1" | "team2" | null;
  loserNextMatchId?: string | null; // used for SF -> 3rd place
  loserNextMatchSlot?: "team1" | "team2" | null;
}
```

Semifinals have **both** a `nextMatchId` (the final) and a `loserNextMatchId`
(the third-place match), so winner and loser flow through the bracket
simultaneously.

## How bracket propagation works

All logic lives in `src/lib/bracket.ts` as **pure functions** that take a list
of matches in and return a new list out. The UI is a thin wrapper over that
state.

1. **Enter scores.** `setMatchResult(matches, id, opts)` updates `score1` /
   `score2` on the chosen match.
2. **Decide a winner.**
   - If one score is higher, the higher-scoring team wins automatically
     (`decidedBy: "regular"`).
   - If scores are tied, `tiebreakWinnerSlot` + `decidedBy` must be supplied by
     the UI (the "ET" / "Pens" buttons).
   - Otherwise winner stays `null` and no one advances.
3. **Propagate forward.** When the winner (or loser, for semifinals) changes,
   `propagateSlot` fills the correct slot of the downstream match using
   `nextMatchId` / `nextMatchSlot` (and `loserNextMatchId` for the 3rd-place
   game).
4. **Invalidate stale results.** If the downstream slot actually changes, the
   downstream match's score/winner is cleared and the propagation cascades
   recursively — so an old result from a different team can never persist.

This guarantees the bracket is always in a consistent state: no team advances
without a defined winner, and editing an earlier round automatically resets
everything downstream that depended on the old result.

## Editing tournament data

Open `src/data/tournament.json` and edit match IDs, team info, stadiums, or
dates. The existing `id` / `nextMatchId` / `nextMatchSlot` fields define the
tournament topology; as long as those stay consistent, the progression logic
will work for any 16-team knockout tournament.

You can also import/export the *current* bracket state (with scores) as JSON
from the in-app Controls panel.

## License

MIT — have fun, Pau! 🏆
