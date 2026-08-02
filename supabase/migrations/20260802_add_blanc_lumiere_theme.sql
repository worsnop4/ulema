-- Add the "Blanc Lumière" theme (id 19) to the shared themes table.
-- Themes are DB-authoritative (20260718_themes_to_db.sql), so a new bespoke
-- theme must be inserted here to appear in the catalog for everyone.
-- Idempotent: safe to re-run.
insert into themes (id, name, code, emoji, thumbnail, layout, colors, description, category, theme_type) values
  (19, 'Blanc Lumière', 'SPL-006', '🤍', '/themes/Special/theme-11/background.jpg', 'blanc-lumiere',
   '["#FEFDFB","#A98A4E","#3C3931"]',
   'Tema Special putih ivory & champagne gold: floral watercolor, foto arch mempelai, petal berjatuhan, dan tipografi Pinyon Script & Cormorant yang elegan',
   'Special', 'photo')
on conflict (id) do nothing;
