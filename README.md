# Habit Tracker — Production Revision

## What was actually breaking on Render

Every API request in production was throwing this in your Render logs:

```
ValidationError: The 'X-Forwarded-For' header is set but the Express
'trust proxy' setting is false (default)... ERR_ERL_UNEXPECTED_X_FORWARDED_FOR
```

Render's load balancer sits in front of your app and adds an `X-Forwarded-For`
header to every request. `express-rate-limit` v7 refuses to trust that header
unless Express is explicitly told it's behind a proxy — so **every single
request** (not just over the rate limit) was erroring. This never shows up
locally because there's no proxy in front of `localhost`. Fixed with one line
in `backend/src/app.ts`:

```ts
app.set("trust proxy", 1);
```

Other fixes made at the same time:
- Removed a duplicate/conflicting Express type augmentation file that could
  cause flaky `tsc` builds (`backend/src/types/ambient.d.ts` was redundant
  with `types/index.ts`).
- Simplified `tsconfig.json` back to plain CommonJS (it had drifted to a
  `Node16` module setting with a duplicated `lib` key — harmless most of the
  time, but unnecessary fragility).
- `env.ts` now fails with a clear, readable message naming the exact missing
  variable instead of a bare stack trace, so future misconfiguration is easy
  to diagnose from Render's log viewer.
- Added a **root-level `render.yaml`** with `rootDir: backend`, so you can
  deploy via Render's "New → Blueprint" in one click without manually setting
  the root directory (kept `backend/render.yaml` too, for manual setup).
- Kept your `--include=dev` / `NPM_CONFIG_PRODUCTION=false` build safeguard —
  that was a real, separate issue you'd already caught (Render can skip
  devDependencies like `typescript` based on `NODE_ENV`, breaking the build).
- CORS no longer sets `credentials: true` (unused — auth is bearer-token
  based, not cookie based) and Helmet now explicitly allows cross-origin
  resource reads, which is correct for a public API serving a separate
  frontend origin.
- Confirmed `backend/.env` / `frontend/.env` were never actually committed to
  git (your `.gitignore` was already correct) — your Supabase anon key was
  never exposed on GitHub. (Anon keys are safe to ship in a frontend bundle
  by design — Row Level Security is what actually protects the data — but
  it's still good hygiene to keep `.env` untracked, which it already was.)

All of this was verified by actually building and booting both apps, and
simulating Render's proxy headers against the compiled backend.

---

## What changed in the UI

Same data and behavior, full visual rebuild:

- **New design system** (`frontend/src/index.css`): a near-black workspace
  with one warm signature color (ember/amber, used for the progress ring and
  streak) and a cool indigo for actions — not a generic dark template.
  Three-tier type system: **Outfit** for display text, **Inter** for body,
  **IBM Plex Mono** for numbers/dates (streak count, percentages, history).
- **Responsive**: single column on mobile; a sticky two-column "command
  layout" on desktop (≥980px) with the progress ring + week focus pinned on
  the left, content on the right. One codebase, no separate mobile view.
- **Motion** (Framer Motion): page-load stagger, a sliding active-tab
  indicator, an animated progress ring that eases to its new value, a
  spring-in checkmark on habit completion, animated history bars, toast
  errors that slide in. `prefers-reduced-motion` is respected globally.
- **Google one-click sign-in**, plus the original email/password as a
  fallback (see setup below — this part needs a few minutes in your own
  Google Cloud Console, which only you can do).
- Loading state is a real skeleton matching the layout, not a "Loading…"
  string. Errors surface as a dismissable toast instead of replacing the
  page. The API client now retries with backoff if the Render free instance
  is asleep, instead of surfacing a cold-start as an error.
- Component structure: `components/ui/` now holds `ProgressRing`, `Header`,
  `WeekBanner`, `NavTabs`, `HabitCard`, `ReflectionPanel`, `HistoryView`,
  `PlanView`, `Toast`, `Skeleton` — `DailyTracker.tsx` is now a thin
  orchestrator instead of one large file.

---

## Set up Google sign-in (one-time, ~5 minutes)

This part needs your own Google account — I can't create these credentials
for you.

1. **Google Cloud Console** → console.cloud.google.com → create/select a
   project → **APIs & Services → OAuth consent screen**. Choose "External",
   fill in app name + your email, save.
2. **APIs & Services → Credentials → Create Credentials → OAuth client ID**
   → Application type: **Web application**.
   - **Authorized JavaScript origins**: add `http://localhost:5173` and your
     Vercel URL, e.g. `https://your-app.vercel.app`.
   - **Authorized redirect URIs**: add your Supabase callback URL —
     `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback` (find this exact
     value in Supabase → Authentication → Providers → Google, it's shown for
     you to copy).
   - Save → copy the **Client ID** and **Client Secret**.
3. **Supabase Dashboard → Authentication → Providers → Google** → toggle on
   → paste the Client ID and Client Secret → Save.
4. **Supabase Dashboard → Authentication → URL Configuration** → set **Site
   URL** to your Vercel URL, and add both `http://localhost:5173` and your
   Vercel URL under **Redirect URLs**.
5. Done — the "Continue with Google" button in `Auth.tsx` already calls
   `supabase.auth.signInWithOAuth({ provider: "google" })`; no frontend code
   changes needed once the provider is configured.

---

## Deploy — Render (backend)

1. Push this repo to GitHub (root now has a `render.yaml`).
2. Render dashboard → **New → Blueprint** → select the repo → it reads
   `render.yaml` and proposes `habit-tracker-api` with `rootDir: backend`
   already set.
3. Fill in the three `sync: false` env vars when prompted: `SUPABASE_URL`,
   `SUPABASE_ANON_KEY`, `CORS_ORIGIN` (your Vercel URL — you can use `*`
   temporarily, then tighten it after the frontend is deployed).
4. Deploy. Check `https://your-api.onrender.com/health` → `{"ok":true}`.

(Prefer manual setup instead of Blueprint? Create the Web Service yourself,
set **Root Directory** to `backend`, and the same build/start commands from
`backend/render.yaml` apply.)

## Deploy — Vercel (frontend)

```bash
cd frontend
npm install
vercel
```

Or import the repo in the Vercel dashboard with **Root Directory** set to
`frontend`. Add the three env vars (`VITE_API_URL`, `VITE_SUPABASE_URL`,
`VITE_SUPABASE_ANON_KEY`) in Project Settings → Environment Variables.

---

## Local development

```bash
# backend
cd backend && npm install && npm run dev      # http://localhost:4000

# frontend (new terminal)
cd frontend && npm install && npm run dev     # http://localhost:5173
```

Both `.env` files already exist with your real Supabase project values from
your last upload, so this should run immediately.
