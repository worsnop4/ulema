-- Add the "Ashen Bloom" theme (id 18) to the shared themes table.
-- Themes are DB-authoritative (20260718_themes_to_db.sql), so a new bespoke
-- theme must be inserted here to appear in the catalog for everyone.
-- Idempotent: safe to re-run.
insert into themes (id, name, code, emoji, thumbnail, layout, colors, description, category, theme_type) values
  (18, 'Ashen Bloom', 'SPL-005', '🌸', '', 'ashen-bloom',
   '["#eceae6","#b07a52","#33312d"]',
   'Tema Special ivory-ash lembut dengan floral watercolor terracotta, foto lengkung, tipografi Marcellus & Pinyon Script yang elegan',
   'Special', 'photo')
on conflict (id) do nothing;
