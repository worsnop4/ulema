-- ============================================================================
-- Allow trusted server-side activation of packages (Midtrans webhook)
-- ============================================================================
-- The guard_profile_privileges trigger (from 20260711) blocks anyone except an
-- admin from changing package_type / package_expiry / role, to stop users
-- self-activating. But the Midtrans webhook activates packages from a SERVER
-- context using the Supabase service role, where auth.uid() is NULL — the old
-- trigger would wrongly block that.
--
-- Fix: only enforce the guard when there IS a logged-in user (auth.uid() is
-- not null). A null auth.uid() can only occur from a trusted server/service
-- context, because anon users are already blocked from UPDATE-ing profiles by
-- RLS ("Users can update own profile" requires auth.uid() = id). So allowing
-- null-uid updates here does not open a hole for anonymous users.
-- ============================================================================

create or replace function guard_profile_privileges()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (new.package_type    is distinct from old.package_type
      or new.package_expiry is distinct from old.package_expiry
      or new.role           is distinct from old.role)
     and auth.uid() is not null
     and not exists (
       select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'
     )
  then
    raise exception 'Not allowed to change privileged profile fields';
  end if;
  return new;
end $$;

-- Trigger definition itself is unchanged; re-create defensively so this file is
-- safe to run standalone.
drop trigger if exists trg_guard_profile_privileges on profiles;
create trigger trg_guard_profile_privileges
  before update on profiles
  for each row execute function guard_profile_privileges();
