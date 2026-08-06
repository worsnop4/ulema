-- Add the "Tema Draft" scaffold theme (id 21) to the shared themes table.
-- This is a bare-bones structural theme (cover, doa, data mempelai, acara,
-- RSVP & ucapan) meant to be restyled later once a real visual direction is
-- chosen (e.g. from a reference video). Kept hidden from the public landing
-- catalog (visible = false) but still selectable/previewable in admin.
-- Idempotent: safe to re-run.
insert into themes (id, name, emoji, thumbnail, layout, colors, description, category, theme_type, visible) values
  (21, 'Tema Draft', '📝', '', 'draft',
   '["#F7F5F1","#B99A6B","#2A2A28"]',
   'Skeleton dasar: cover, doa, data mempelai, acara, RSVP & ucapan. Belum didesain final — siap direstyle sesuai referensi visual.',
   'Special', 'photo', false)
on conflict (id) do nothing;
