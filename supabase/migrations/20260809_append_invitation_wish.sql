-- Atomic append for a guest wish/RSVP into invitations.data->'rsvps'.
--
-- Fixes a lost-update bug: submitting a wish went through updateInvitation,
-- which writes back the ENTIRE invitation row from whatever the guest's
-- browser loaded when the page opened. Two guests submitting within the same
-- few seconds both write from the same base, so one wish is silently lost —
-- and if the couple edited their invitation meanwhile, the guest's write
-- reverts those edits.
--
-- Same reasoning as increment_invitation_views (20260705): a guest action must
-- touch only the one field it owns, never the whole row.
--
-- security definer: guests (anon) hold no UPDATE grant on `invitations` and
-- must not be given one. They reach this single narrow field through here
-- instead. Note this intentionally lets any visitor append a wish to any
-- invitation id — that is what a public guestbook is — and is strictly less
-- exposure than the full-row UPDATE it replaces.
create or replace function append_invitation_wish(p_id uuid, p_wish jsonb)
returns void
language sql
security definer
set search_path = public
as $$
  update invitations
  set data = jsonb_set(
    coalesce(data, '{}'::jsonb),
    '{rsvps}',
    -- Newest first, matching how the app renders the list. jsonb_build_array
    -- keeps this explicit rather than relying on object||array coercion.
    jsonb_build_array(p_wish) || coalesce(
      case when jsonb_typeof(data->'rsvps') = 'array' then data->'rsvps' end,
      '[]'::jsonb
    )
  )
  where id = p_id;
$$;

grant execute on function append_invitation_wish(uuid, jsonb) to anon, authenticated;
