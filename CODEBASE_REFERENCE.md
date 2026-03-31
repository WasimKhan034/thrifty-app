# Thrifty — Codebase Reference

**Stack:** Vite + React 18 + TypeScript · Supabase (Postgres + Auth) · React Router v6 · Leaflet maps
**Live:** https://thrifty-app-murex.vercel.app
**Repo:** https://github.com/WasimKhan034/thrifty-app

---

## Folder map

```
thrifty_app/
├── src/
│   ├── types/          ← Shared TypeScript contracts (used by everything)
│   ├── data/           ← Seed data + static config lists
│   ├── lib/            ← Low-level adapters (Supabase client, localStorage)
│   ├── services/       ← Data access layer (repository pattern)
│   ├── hooks/          ← App-wide state machine
│   ├── components/     ← Reusable UI components
│   ├── pages/          ← Route-level views
│   ├── styles.css      ← All styling (single file, CSS custom properties)
│   ├── App.tsx         ← Router + wiring
│   └── main.tsx        ← Entry point
├── supabase/
│   └── schema.sql      ← Full Postgres schema + RLS policies
├── index.html
├── vite.config.ts
├── vercel.json
└── package.json
```

---

## FRONTEND

Everything the user sees. Runs entirely in the browser. Zero server-side rendering.

### Entry

| File | Role |
|------|------|
| `index.html` | Single HTML shell. Mounts `<div id="root">`. Pulls in `src/main.tsx`. |
| `src/main.tsx` | React entry — wraps app in `<BrowserRouter>`. |
| `src/App.tsx` | Route definitions (`/`, `/contribute`, `/saved`, `/admin`, `/auth`). Wires all hooks → pages. |

### Components

| File | Role |
|------|------|
| `src/components/AppFrame.tsx` | Persistent top bar: brand, theme toggle, auth pill, tab navigation. Rendered on every route. |
| `src/components/MapPanel.tsx` | Leaflet map embedded in ExplorePage. Renders spot pins, handles click-to-select. |

### Pages (one per route)

| File | Route | Role |
|------|-------|------|
| `src/pages/ExplorePage.tsx` | `/` | Search + filter bar, spot list, sticky detail panel. Main user-facing view. |
| `src/pages/ContributePage.tsx` | `/contribute` | Tab-switched form: "Add a Spot" / "Leave a Review". Single-column, 8-field form. |
| `src/pages/SavedPage.tsx` | `/saved` | Two sections: ☆ Favorites and 🧭 Visited. Compact list rows. |
| `src/pages/AdminPage.tsx` | `/admin` | Pending spot approval queue. Only admin users see content. |
| `src/pages/AuthPage.tsx` | `/auth` | Sign-in / Create Account form. Inline error display. Navigates home on success. |

### Styling

| File | Role |
|------|------|
| `src/styles.css` | **All** CSS in one file. Uses CSS custom properties (`--accent`, `--bg`, `--surface`, etc.) scoped to `[data-theme="light"]` and `[data-theme="dark"]`. No CSS modules, no Tailwind. |

**Current theme palette:**
- Light: `#F5F8F5` background · `#1E6B3C` accent (forest green)
- Dark: `#0C0F0C` background · `#52B788` accent (mint green)

**To change the color scheme**, edit only the two theme blocks at the top of `styles.css`.

### State / Logic

| File | Role |
|------|------|
| `src/hooks/useThriftyApp.ts` | Central state machine. Owns all app state: `currentUser`, `approvedSpots`, `filters`, `selectedSpotId`, etc. Exposes actions: `signIn`, `signOut`, `submitSpot`, `addReview`, `toggleFavorite`, `toggleVisited`, `approveSpot`, `rejectSpot`. |

The hook wires the repository (data) to React state. All pages receive only what they need via props from `App.tsx`.

---

## BACKEND / DATA LAYER

Supabase handles auth, database, and row-level security. The app also has a **local fallback** (localStorage) that runs when no Supabase env vars are present — useful for dev without credentials.

### Database schema

| File | Role |
|------|------|
| `supabase/schema.sql` | Full Postgres DDL. Run this once to set up a fresh Supabase project. |

**Tables:**

| Table | Purpose |
|-------|---------|
| `profiles` | Auth user extension. Adds `full_name`, `email`, `role` (admin / member). Linked 1:1 to `auth.users`. |
| `spots` | Core data. Every thrift store, cinema, coffee shop, etc. Has status: `pending → approved / rejected`. |
| `reviews` | User reviews attached to spots. Six numeric metrics (1–5) + `note` + `would_return`. |
| `favorites` | Join table: `(profile_id, spot_id)`. Tracks user favorites. |
| `visited_spots` | Join table: `(profile_id, spot_id)`. Tracks user visits. |

**Row-Level Security rules (all enforced at DB level):**
- Approved spots are publicly readable; pending/rejected only visible to admins
- Users can only insert/update/delete their own reviews, favorites, and visited records
- Profile rows are only readable by the owner or an admin
- Only admins can change spot status

### Service layer (repository pattern)

| File | Role |
|------|------|
| `src/services/repository.ts` | Implements `ThriftyRepository` interface twice: once for Supabase (`supabaseRepository`), once for localStorage (`localRepository`). Exports whichever is active based on env vars. |
| `src/lib/supabase.ts` | Creates and exports the Supabase JS client. Reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from env. |
| `src/lib/storage.ts` | Thin wrappers around `localStorage.getItem` / `setItem` with JSON parse/stringify. Used by the local fallback repository. |

**The repository interface** (`ThriftyRepository` in `src/types/domain.ts`) defines the full contract:
```
getSnapshot() → current user, approved/pending spots, favorites, visited
signUp / signIn / signOut
submitSpot / addReview
toggleFavorite / toggleVisited
approveSpot / rejectSpot
```

To **swap Supabase for another backend** (e.g. Firebase, PocketBase, a custom API), implement `ThriftyRepository` for your new backend and export it from `repository.ts`. No other files need to change.

---

## SHARED (Types & Static Data)

| File | Role |
|------|------|
| `src/types/domain.ts` | **Single source of truth for all TypeScript types.** `Spot`, `Review`, `UserProfile`, `SpotType`, `AppFilters`, `ThriftyRepository`, etc. Everything else imports from here. |
| `src/data/demoData.ts` | Static lists: `typeOptions`, `regionOptions`, `metrics`, `themes`, `seedSpots`. The seed spots array (24 entries) is what populates the local/demo mode. Adding a spot here makes it appear in demo without a DB. |

---

## CONFIG

| File | Role |
|------|------|
| `package.json` | Dependencies. Key ones: `@supabase/supabase-js`, `react`, `react-router-dom`, `leaflet`. Dev: `vite`, `typescript`. |
| `vite.config.ts` | Vite config. Just enables the React plugin. No special aliases. |
| `tsconfig.app.json` | TypeScript config for the app. Strict mode on. |
| `vercel.json` | Single rewrite rule: all routes → `index.html` (required for React Router to work on Vercel). |

---

## Environment Variables

The app needs two env vars to connect to Supabase. Without them it runs in local-only mode.

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Set these in Vercel (Project → Settings → Environment Variables) or in a local `.env` file.

**Admin account:** The email `wkhantronisgone@gmail.com` is hardcoded in `repository.ts` as the admin email. Any account created with that email gets `role: 'admin'` automatically.

---

## Migrating to a new environment

### To a different hosting provider (Netlify, Railway, etc.)
- Change or remove `vercel.json` (Netlify equivalent: `_redirects` file with `/* /index.html 200`)
- Set the same two env vars in your provider's dashboard
- Run `npm run build` → deploy the `dist/` folder

### To a different database (Firebase, PocketBase, custom API)
1. Implement the `ThriftyRepository` interface from `src/types/domain.ts`
2. Replace the Supabase import in `src/services/repository.ts`
3. Keep everything else the same

### To a different frontend framework (Next.js, Vue, Svelte)
The logic to port:
- `src/types/domain.ts` → copy as-is, just TypeScript types
- `src/services/repository.ts` → copy as-is, just data-fetching logic
- `src/data/demoData.ts` → copy as-is, just static data
- `src/hooks/useThriftyApp.ts` → convert to your framework's state management pattern
- Pages and components → rewrite in your framework using the same props/data structure

---

## Key design decisions

**Repository pattern** — All data access goes through one interface. Swapping backends = one file change.

**Single CSS file** — All styling in `styles.css` with CSS custom properties. No build step for styles, easy to copy or override.

**Local fallback** — The app works without Supabase using localStorage. Useful for rapid prototyping or offline demos.

**No Redux / Zustand** — All state lives in `useThriftyApp`. Simple enough for one hook.

**Supabase RLS** — Security enforced at the database level, not just in frontend code. Frontend auth state is for UX only; the database rejects unauthorized operations regardless.
