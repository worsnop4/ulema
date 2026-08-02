-- Add the "Opaline Pearl" theme (id 20) to the shared themes table.
-- Themes are DB-authoritative (20260718_themes_to_db.sql), so a new bespoke
-- theme must be inserted here to appear in the catalog for everyone.
-- Idempotent: safe to re-run.
insert into themes (id, name, code, emoji, thumbnail, layout, colors, description, category, theme_type) values
  (20, 'Opaline Pearl', 'SPL-007', '🤍', '/themes/Special/theme-12/cover-relief.jpg', 'opaline-pearl',
   '["#FCF9F7","#C3A15D","#2E2722"]',
   'Tema Special pearl-ivory dengan shimmer opal, pintu ornamen 3D yang membuka saat undangan dibuka, filigree emas yang menggambar sendiri, dan tipografi Parisienne & Cormorant yang elegan',
   'Special', 'photo')
on conflict (id) do nothing;
