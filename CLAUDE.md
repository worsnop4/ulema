# Ulema — Digital Wedding Invitation SaaS

Ulema (`ulema.id`) is a wedding-invitation SaaS. Couples buy a package, pick a theme,
fill in their details on a dashboard, and share a personalized invitation link. Guests
open `/invite/<slug>` (no login) to RSVP, leave wishes, view the event, gift accounts, etc.

The app has three surfaces:
1. **Landing page** (`/`) — marketing site (hero, promo, catalog, testimonials, FAQ).
2. **Dashboard** (`/dashboard/*`) — authenticated area where couples edit their invitation and admins manage themes/pricing/finance.
3. **Public invitation** (`/invite/:slug`) — the rendered invitation guests see.

## Tech Stack

- **React 19** + **Vite 8** (SPA, `react-router-dom` v7). No SSR.
- **Tailwind CSS 3** for styling (+ some plain CSS files like `src/pages/LandingPage.css`).
- **Framer Motion** for animation; **lucide-react** for icons (v1.17 — note: it does NOT ship brand/social icons like Instagram; build inline SVGs for those).
- **Supabase** (Postgres + Auth + Storage) as the backend. Client uses the `anon` key.
- **Vercel** for hosting + a Vercel **Edge Middleware** (`middleware.js`).

## Workflow — IMPORTANT

- **Do NOT run `npm run dev` / a localhost dev server.** The real pipeline is
  **GitHub → Vercel → Supabase**. Verify changes with `npm run build` + `npx eslint`,
  then commit and push straight to `main`. Vercel auto-deploys from `main`.
- Production domain is **`ulema.id`** (also `www.ulema.id`).
- `npm run build` is exactly what Vercel runs — treat a green build as the gate.

## Linting — strict, read this before touching hooks/render

`eslint-plugin-react-hooks@7` runs React-Compiler-era rules. Two that bite:
- `react-hooks/purity` — flags impure calls (`Math.random()`, `crypto.randomUUID()`, `Date.now()`)
  during render, **even inside `useMemo`**. Fix by moving them into a lazy state initializer:
  `useState(() => crypto.randomUUID())`, not a ref-mutation or `useMemo`.
- `react-hooks/refs` — flags mutating `ref.current` during render. Same fix: use
  `useState(() => …)` instead of `if (!ref.current) ref.current = …`.

Pre-existing noise you can ignore: many files still have an unused `import React from 'react'`
(React 19 doesn't need it) and a couple of unused vars. These lint errors are pre-existing —
don't let them block you, and don't do a mass cleanup unless asked.

## Theme System (two tiers)

1. **Config-driven themes** — most "standard" themes render through
   `src/themes/BaseThemeEngine.jsx`, configured by `src/themes/themeConfigs.js`.
2. **Bespoke themes** — fully custom components (e.g. `MinangElegantTheme.jsx`,
   `BordeauxLuxeTheme.jsx`, `CinematicShadowTheme.jsx`, `CinematicLuxuryTheme.jsx`).

**Adding/registering a theme touches these files together — keep them in sync:**
- `src/config/constants.js` — `THEMES` enum + `THEME_CATEGORY_MAP`.
- `src/data/defaultData.js` — the `DEFAULT_THEMES` array (id, name, layout, colors, category).
- `src/pages/InvitationTemplate.jsx` — lazy import + `THEME_COMPONENTS` map.
- `src/themes/components/InvitationLayout.jsx` — only if a dark bespoke theme needs custom background handling.

Categories: `Special`, `Luxury`, `Motion` (3D), `Adat` (traditional).

## Data Architecture — know this before "fixing" data flows

- **Invitations** live in Supabase (table `invitations`, JSONB `data` column). Real, per-couple.
- **Theme presets** (name/desc/colors/thumbnail/pricing) currently live **only in browser
  localStorage** (`getThemes()`/`saveThemes()` in `src/hooks/useSharedInvitation.js`), seeded
  from the hardcoded `DEFAULT_THEMES`. Consequence: **admin edits to theme presets are NOT
  visible to other visitors** — each browser seeds independently. Migrating theme presets to a
  Supabase table is a known pending task ("Tahap 2"), not yet done.
- Cross-tab/component sync uses a `'local-storage-update'` window event + a module-level cache.

### Demo invitations
`/invite/demo?theme=N` does NOT look up the literal slug `"demo"`. It resolves to the seeded
slug `demo-theme-${N}`. This resolution is implemented in BOTH `src/hooks/useInvitationData.js`
(client) and `middleware.js` (server) — keep them consistent.

### Open Graph / link previews (`middleware.js`)
Because this is a client-rendered SPA, link-preview crawlers (WhatsApp, Facebook, etc.) see no
per-invitation metadata. `middleware.js` is a Vercel Edge Middleware that detects bot User-Agents
on `/invite/:slug`, fetches the invitation from Supabase's REST API, and returns hand-built HTML
with real `og:*` / Twitter Card tags. Real visitors pass through untouched to the SPA.
- OG image priority: `meta.ogImage` → `meta.coverPhoto` → `meta.photo` → bride/groom photo → default.
- `middleware.js` reads `process.env.VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` (Vercel exposes
  all project env vars server-side). It has its own ESLint override in `eslint.config.js`.

## Key Directories

- `src/pages/` — route-level pages (`LandingPage`, `InvitationTemplate`, `InvitationEdit`, dashboard pages).
- `src/components/landing/` — landing-page sections (Navbar, Hero, Features, Testimonials, Catalog, HowItWorks, FAQ, Footer).
- `src/components/modules/` — invitation-editor form modules (e.g. `MetaTagForm`, `RekeningForm`).
- `src/components/admin/` — admin panels (`AdminThemes`, `AdminFinance`, …).
- `src/components/common/` — shared UI (`FormHelpers.jsx` has `PhotoUploadBox` → crop → compress → Supabase upload).
- `src/hooks/` — data/invitation hooks (`useSharedInvitation`, `useInvitationData/Save/Sync`, `useWishSubmit`, `useCopyToClipboard`, `useAuth`).
- `src/services/` — Supabase access layer (`invitationService`, `authService`, `storageService`, `supabaseStorageService`).
- `src/config/constants.js` — `THEMES`, category maps, package names, admin WhatsApp, referral constants.
- `src/data/defaultData.js` — seed data incl. `DEFAULT_THEMES`.
- `src/types/invitation.js` — JSDoc typedefs for the invitation data shape (source of truth for field names).
- `public/` — static assets. NOTE: images here have been hand-optimized; keep new assets small
  (avatars display at 40–64px — ship them ~256px, not multi-MB). `public/avatars/Adat/` (~48MB) is
  used by the invitation editor's avatar picker and is a known un-optimized area.

## Data-shape gotchas (verify against `src/types/invitation.js`, don't assume)

- Gift accounts: `data.accounts` with fields `{ bank, holder, number, type }` (NOT `bankAccounts`/`accountName`).
- Names: `data.bride` / `data.groom` are `Person` objects (`name`, `nickname`, `photo`, `father`, `mother`, …). There is no birth-order field.
- Wishes/RSVP: `data.rsvps` array.
- Always use optional chaining (`?.`) when reading invitation data — fields are user-filled and often empty.

## Open items / pending (context, not a to-do list)

- **Security/RLS review is unverified.** Supabase RLS policies aren't in the repo. Public
  `/invite/:slug` write access and direct-from-component Supabase calls are known risk areas.
  Treat "is this secure?" as an open question until RLS is confirmed.
- **Theme-preset → Supabase migration ("Tahap 2")** is pending (see Data Architecture above).

## House style

- Match the surrounding code's conventions. Use `THEMES.*` constants instead of magic layout strings.
- Ask before large refactors or destructive changes. When a spec conflicts with the real data model
  or an existing name, stop and flag it rather than guessing/overwriting.
