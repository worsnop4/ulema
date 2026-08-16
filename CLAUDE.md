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

- **Theme-preset → Supabase migration ("Tahap 2")** is pending (see Data Architecture above).
- ~~Security/RLS review is unverified~~ — **done 2026-08-09/10.** All 10 tables have RLS with
  policies. The leaked `service_role` key in `VITE_SUPABASE_ANON_KEY` was rotated to a
  publishable key and legacy JWT keys disabled (both old keys now return 401). An open write
  hole on `musics` was closed, and guest wishes moved to the `append_invitation_wish` RPC so
  they no longer rewrite the whole invitation row.

## Open tasks — known, unfixed, in rough priority order

1. **`events[2]` and beyond are silently dropped** in Botanical Ivory, Bordeaux Luxe,
   Cinematic Shadow and Minang Elegant. Each hardwires `akad = events[0]` / `resepsi =
   events[1]` and renders only those two, but `AcaraForm` lets a couple add unlimited
   sessions. A third session vanishes with no warning anywhere. Fixing means mapping over
   `data.events` (Senja Diorama and BaseThemeEngine already do), which is a structural change
   to those four sections, not a rename.
2. ~~`data.giftAddress` ignored by 8 themes~~ — **done 2026-08-16.** All bespoke themes now
   render it, and each one's gift section gate was loosened from `if (!accounts.length) return
   null` so a couple who enables only the shipping address keeps the section. Fixing this also
   turned up Cinematic Luxury reading accounts as `acc.no` / `acc.name`; the real fields are
   `number` / `holder` (verified: 37 stored accounts, zero with `no` or `name`).
3. **Demo invitations accept wishes that are never saved.** `/invite/demo?theme=N` shows the
   normal RSVP form and confirms success, but `useWishSubmit` skips persistence for demo
   routes, so the wish disappears on reload. Decision already taken (2026-08-09): keep demo
   wishes local for the session but label the form honestly as "mode pratinjau" instead of
   letting it claim a save. Not yet built.
4. **`referral_code` may not be set on new signups.** `LoginPage.jsx` generates it client-side
   and writes it via `profiles.update` immediately after `signUp()`. Under the publishable key
   that write is subject to `auth.uid() = id`, and with email confirmation enabled there is no
   session yet — so it can fail silently (only `console.error`). Needs checking against a real
   new account; the durable fix is to move signup bootstrap to a trigger or server endpoint.
5. **`withdrawals` has no admin policy.** Fine today because the client only INSERTs, but an
   admin approval screen would read nothing.
6. **`ProfilePage.jsx` hardcodes a fake phone** as `defaultValue="+62 812 3456 7890"`, so every
   user sees a stranger's-looking number prefilled in their own profile. Should read the real
   `profiles.phone`.
7. **`themes` table only holds ids 7–21.** Ids 1–6 (Classic Elegance, Rose Garden, Midnight
   Gold, Ivory Dream, Lavender Bliss, Tropical Breeze) exist in `DEFAULT_THEMES` but were never
   seeded. Most real invitations sit on `theme_id: 1`, which the DB does not describe.
8. **Velour Olive asks for a cover video nothing renders.** `themeType` does not mean "this theme
   uses video" — it means "the couple supplies the video": `FotoVideoForm.jsx` swaps the cover
   uploader from photo to video when it is `'video'`, and only `CinematicLuxuryTheme` ever reads
   the resulting `meta.coverVideo`. Velour Olive is marked `'video'` but paints its own shipped
   backdrop, so a couple there uploads a cover video that is silently never shown — and never
   gets offered the cover-photo box the theme actually falls back to. Istana Kencana is
   deliberately `'photo'` for this reason. Fixing Velour Olive is a one-word change in
   `DEFAULT_THEMES` plus the `themes` row, but it changes a live theme, so it needs a decision.
9. **Bottom nav and music button use `fixed md:absolute`** in most bespoke themes. At ≥768px the
   `absolute` variant wins and anchors them to the content container instead of the screen, so
   they scroll away instead of staying put. Istana Kencana uses plain `fixed` anchored to
   `--inv-w` (see its `MusicButton`) — that is the pattern to copy when this is fixed elsewhere.

**Field-name drift is the recurring bug class here.** Four separate rounds of it have now been
found and fixed (love-story `desc`, event `venue`/`start`/`maps`, gift bank/e-wallet, and
Cinematic Luxury's account `no`/`name`). The
editor's `*Form.jsx` modules are the source of truth for field names — `src/types/invitation.js`
is outdated and has been wrong more than once. Before wiring any theme to data, verify against
the form module, and ideally against real rows in Supabase.

## House style

- Match the surrounding code's conventions. Use `THEMES.*` constants instead of magic layout strings.
- Ask before large refactors or destructive changes. When a spec conflicts with the real data model
  or an existing name, stop and flag it rather than guessing/overwriting.
