alter table "public"."topic_bank"
  add column "position" integer not null default 0;

-- Initialize positions from alphabetical order within each sibling group
with ranked as (
  select id,
         (row_number() over (
           partition by parent_id
           order by name
         ) - 1) as pos
  from topic_bank
)
update topic_bank t set position = r.pos from ranked r where t.id = r.id;
