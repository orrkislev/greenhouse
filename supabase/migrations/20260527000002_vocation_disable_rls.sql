-- Remove RLS from vocation tables to match the rest of the app's security model
-- (all other tables use grants without RLS; access control is done at the application layer)

alter table "public"."vocation" disable row level security;
alter table "public"."vocation_checkins" disable row level security;

-- Ensure grants are in place (consistent with rest of schema)
grant all on table "public"."vocation" to anon, authenticated, service_role;
grant all on table "public"."vocation_checkins" to anon, authenticated, service_role;
