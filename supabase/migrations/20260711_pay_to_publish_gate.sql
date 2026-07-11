-- ============================================================================
-- Pay-to-publish gate + payment verification hardening
-- ============================================================================
-- Supports the "build-first, pay-to-publish" funnel:
--   * A public invitation (/invite/:slug) is only shown to guests when the
--     OWNER's package is active (paid + not expired). The owner themselves can
--     always preview it while logged in.
--   * "Active" is derived from the profile (package_type + package_expiry),
--     which only an admin can change — so a user cannot forge activation by
--     editing their own invitation JSONB.
--
-- SECTIONS 1–3 are SAFE, additive changes — run them as-is.
-- SECTION 4 (RLS) is a RECOMMENDATION to review against your CURRENT policies
-- before applying, because this repo cannot see your live Supabase policies.
-- ============================================================================


-- ── 1. Columns ──────────────────────────────────────────────────────────────
-- Reason shown to the customer when a payment is rejected.
alter table transactions
  add column if not exists rejection_reason text;

-- Package expiry (the app advertises a limited active period). Safe if it
-- already exists.
alter table profiles
  add column if not exists package_expiry timestamptz;


-- ── 2. Activation gate function ─────────────────────────────────────────────
-- Returns true when the given user's package is active:
--   * package_type is a real paid tier (not null / 'none' / 'free'), AND
--   * package_expiry is unset (grandfathered) OR still in the future.
--
-- security definer: guests (anon) can call this narrow boolean check without
-- being granted read access to the profiles table itself, so package details
-- stay private and the flag cannot be forged client-side.
create or replace function is_user_active(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from profiles
    where id = p_user_id
      and coalesce(package_type, 'none') not in ('none', 'free')
      and (package_expiry is null or package_expiry > now())
  );
$$;

grant execute on function is_user_active(uuid) to anon, authenticated;


-- ── 3. Convenience: activate a user for N months (used by admin approval) ────
-- Sets the paid tier and a fresh expiry in one atomic call. The app also does
-- this inline, but exposing it as an RPC keeps the "duration" rule in one place
-- and lets you activate a user manually from the SQL editor if ever needed.
create or replace function activate_user_package(
  p_user_id uuid,
  p_package text,
  p_months int default 12
)
returns void
language sql
security definer
set search_path = public
as $$
  update profiles
  set package_type = p_package,
      package_expiry = now() + (p_months || ' months')::interval
  where id = p_user_id;
$$;

-- Only signed-in staff should call this; the app additionally checks role.
grant execute on function activate_user_package(uuid, text, int) to authenticated;


-- ============================================================================
-- ── 4. RLS RECOMMENDATIONS — REVIEW BEFORE APPLYING ─────────────────────────
-- ============================================================================
-- These are the policies the pay-to-publish model assumes. They are commented
-- out because your project's CURRENT policies are not visible from the repo,
-- and applying conflicting/duplicate policies (or enabling RLS with a wrong
-- policy) can lock the live app out. Compare with your existing policies in
-- Supabase → Authentication → Policies, then enable deliberately.
--
-- Key intents:
--   invitations : owner may read/write ONLY their own row; anon may READ any
--                 row (the gate that hides unpaid invitations is enforced in
--                 the app + is_user_active, since guests still need to read the
--                 row to know whom it belongs to). If you want hard server-side
--                 hiding, replace public SELECT with a security-definer RPC
--                 that returns the row only when is_user_active(owner) is true.
--   profiles    : a user may read/update their OWN row but must NOT be able to
--                 change package_type / package_expiry / role (privilege
--                 columns) — otherwise they could self-activate. Enforce via a
--                 column-restricted policy or a trigger that blocks changes to
--                 those columns unless the caller is an admin.
--   transactions: a user may INSERT + SELECT their own; only admins may UPDATE
--                 (approve/reject).
--
-- Example (adapt to your schema; assumes a profiles.role = 'admin' convention):
--
--   alter table invitations enable row level security;
--   create policy "owner rw own invitation" on invitations
--     for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
--   create policy "public read invitation" on invitations
--     for select using (true);
--
--   alter table transactions enable row level security;
--   create policy "owner insert own tx" on transactions
--     for insert with check (auth.uid() = user_id);
--   create policy "owner read own tx" on transactions
--     for select using (auth.uid() = user_id
--       or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));
--   create policy "admin update tx" on transactions
--     for update using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));
--
--   -- Block self-privilege-escalation on profiles: a trigger is the most
--   -- reliable way to forbid non-admins from changing package_type/expiry/role.
--   create or replace function guard_profile_privileges()
--   returns trigger language plpgsql security definer set search_path = public as $$
--   begin
--     if (new.package_type is distinct from old.package_type
--         or new.package_expiry is distinct from old.package_expiry
--         or new.role is distinct from old.role)
--        and not exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
--     then
--       raise exception 'Not allowed to change privileged profile fields';
--     end if;
--     return new;
--   end $$;
--   create trigger trg_guard_profile_privileges before update on profiles
--     for each row execute function guard_profile_privileges();
-- ============================================================================
