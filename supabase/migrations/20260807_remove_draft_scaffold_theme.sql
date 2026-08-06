-- Remove the "Tema Draft" scaffold theme (id 21) added in
-- 20260806_add_draft_scaffold_theme.sql. That theme is being dropped in
-- favor of a design produced via Claude Design instead. Safe/idempotent to
-- run even if the original insert was never applied.
delete from themes where id = 21;
