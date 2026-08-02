-- Let admins show/hide a theme from the public landing-page catalog without
-- deleting it (still usable in the editor/theme picker for existing users).
-- Idempotent: safe to re-run.
alter table themes add column if not exists visible boolean not null default true;
