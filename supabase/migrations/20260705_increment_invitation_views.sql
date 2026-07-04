-- Atomic view counter for invitations.data->>'views'.
-- Fixes the lost-update bug where every guest page view triggered a full-row
-- overwrite of `invitations` (via updateInvitation), which could race with
-- concurrent edits/views and silently drop data.
--
-- security definer: lets anonymous guests (no direct UPDATE grant on
-- `invitations`) increment the counter through this single narrow function,
-- without needing broad anon UPDATE access to the table.
create or replace function increment_invitation_views(p_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update invitations
  set data = jsonb_set(
    coalesce(data, '{}'::jsonb),
    '{views}',
    (coalesce((data->>'views')::int, 0) + 1)::text::jsonb
  )
  where id = p_id;
$$;

grant execute on function increment_invitation_views(uuid) to anon, authenticated;
