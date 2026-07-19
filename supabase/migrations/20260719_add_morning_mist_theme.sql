-- Add the "Morning Mist Luxe" theme (id 17) to the shared themes table.
-- Since themes are now DB-authoritative (20260718_themes_to_db.sql), a new
-- bespoke theme must be inserted here to appear in the catalog for everyone —
-- adding it to DEFAULT_THEMES only covers the offline fallback.
-- Idempotent: safe to re-run.
insert into themes (id, name, code, emoji, thumbnail, layout, colors, description, category, theme_type) values
  (17, 'Morning Mist Luxe', 'LUX-006', '🌫️', '', 'morning-mist-luxe',
   '["#0e141b","#c9d4dc","#eef2f5"]',
   'Tema luxury kabut pagi sinematik: gelap berkabut, aksen silver-champagne, panel kaca berembun, dan tipografi script Ephesis elegan',
   'Luxury', 'photo')
on conflict (id) do nothing;
