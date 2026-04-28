create table "public"."topic_bank" (
  "id"         uuid not null default gen_random_uuid(),
  "name"       text not null,
  "detail"     text not null default '',
  "parent_id"  uuid references "public"."topic_bank"("id") on delete cascade,
  "is_key"     boolean not null default false,
  "created_at" timestamp with time zone not null default now(),
  primary key ("id")
);

alter table "public"."topic_bank" enable row level security;

-- Everyone (authenticated + anon) can read
create policy "topic_bank_select"
  on "public"."topic_bank" for select
  using (true);

-- Only staff can write
create policy "topic_bank_staff_insert"
  on "public"."topic_bank" for insert
  with check (
    exists (select 1 from users where id = auth.uid() and role = 'staff')
  );

create policy "topic_bank_staff_update"
  on "public"."topic_bank" for update
  using (
    exists (select 1 from users where id = auth.uid() and role = 'staff')
  );

create policy "topic_bank_staff_delete"
  on "public"."topic_bank" for delete
  using (
    exists (select 1 from users where id = auth.uid() and role = 'staff')
  );

-- ── Seed: top-level topics (majors) ─────────────────────────────────────────
insert into "public"."topic_bank" (id, name) values
  ('10000000-0000-0000-0000-000000000001'::uuid, 'הייטק'),
  ('10000000-0000-0000-0000-000000000002'::uuid, 'הפקה'),
  ('10000000-0000-0000-0000-000000000003'::uuid, 'עיצוב'),
  ('10000000-0000-0000-0000-000000000004'::uuid, 'כללי'),
  ('10000000-0000-0000-0000-000000000005'::uuid, 'מיומנויות יוטגוגיות');

-- ── Seed: one placeholder category per major ────────────────────────────────
insert into "public"."topic_bank" (name, parent_id) values
  ('קטגוריה 1 בהייטק',                    '10000000-0000-0000-0000-000000000001'::uuid),
  ('קטגוריה 1 בהפקה',                     '10000000-0000-0000-0000-000000000002'::uuid),
  ('קטגוריה 1 בעיצוב',                    '10000000-0000-0000-0000-000000000003'::uuid),
  ('קטגוריה 1 בכללי',                     '10000000-0000-0000-0000-000000000004'::uuid),
  ('קטגוריה 1 במיומנויות יוטגוגיות',     '10000000-0000-0000-0000-000000000005'::uuid);
