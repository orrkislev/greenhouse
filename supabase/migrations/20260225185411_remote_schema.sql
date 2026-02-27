create extension if not exists "moddatetime" with schema "extensions";

drop extension if exists "pg_net";

create type "public"."event_context" as enum ('personal', 'group', 'meeting', 'other', 'mentorship', 'study_path', 'research', 'project');

create type "public"."group_type" as enum ('class', 'major', 'club', 'custom');

create type "public"."project_status" as enum ('draft', 'active', 'completed', 'archived');

create type "public"."task_status" as enum ('todo', 'in_progress', 'completed', 'archived', 'closed');

create type "public"."task_type" as enum ('project', 'study_path', 'group', 'event', 'other', 'research', 'mentorship', 'personal');

create type "public"."user_role" as enum ('student', 'staff', 'admin');


  create table "public"."audit_log" (
    "id" uuid not null default gen_random_uuid(),
    "updating_user" uuid not null,
    "timestamp" timestamp with time zone not null default now(),
    "entity_type" text not null,
    "project_id" uuid,
    "student_id" uuid,
    "research_id" uuid,
    "new_data" jsonb not null,
    "old_data" jsonb,
    "changed_fields" text[],
    "metadata" jsonb default '{}'::jsonb,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."audit_log" enable row level security;


  create table "public"."event_participants" (
    "event_id" uuid not null,
    "user_id" uuid not null,
    "role" text default 'participant'::text,
    "created_at" timestamp with time zone default now()
      );



  create table "public"."events" (
    "id" uuid not null default gen_random_uuid(),
    "title" text not null,
    "start" time without time zone not null,
    "end" time without time zone not null,
    "created_by" uuid,
    "metadata" jsonb default '{}'::jsonb,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "day_of_the_week" integer,
    "date" date,
    "group_id" uuid
      );


alter table "public"."events" enable row level security;


  create table "public"."groups" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "type" public.group_type not null default 'custom'::public.group_type,
    "description" text,
    "metadata" jsonb default '{}'::jsonb,
    "message" text
      );


alter table "public"."groups" enable row level security;


  create table "public"."links" (
    "id" uuid not null default gen_random_uuid(),
    "a_table" text not null,
    "a_id" uuid not null,
    "b_table" text not null,
    "b_id" uuid not null,
    "metadata" jsonb default '{}'::jsonb,
    "last_check" time without time zone default now()
      );



  create table "public"."logs" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "action_type" text,
    "text" text not null,
    "metadata" jsonb default '{}'::jsonb,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "mentor_id" uuid,
    "context_table" text,
    "context_id" uuid
      );


alter table "public"."logs" enable row level security;


  create table "public"."mentorships" (
    "id" uuid not null default gen_random_uuid(),
    "mentor_id" uuid not null,
    "student_id" uuid not null,
    "subject" text,
    "description" text,
    "is_active" boolean default true,
    "started_at" timestamp with time zone not null default now(),
    "ended_at" timestamp with time zone,
    "metadata" jsonb default '{}'::jsonb,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."mentorships" enable row level security;


  create table "public"."misc" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "data" jsonb not null default '{}'::jsonb
      );


alter table "public"."misc" enable row level security;


  create table "public"."projects" (
    "id" uuid not null default gen_random_uuid(),
    "title" text not null,
    "student_id" uuid,
    "status" public.project_status not null default 'draft'::public.project_status,
    "metadata" jsonb default '{}'::jsonb,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "term" uuid[],
    "master" uuid
      );


alter table "public"."projects" enable row level security;


  create table "public"."report_cards_private" (
    "id" uuid not null default gen_random_uuid(),
    "ikigai" jsonb,
    "mentors" jsonb,
    "liba" jsonb,
    "learning" jsonb,
    "vocation" jsonb,
    "special" jsonb
      );


alter table "public"."report_cards_private" enable row level security;


  create table "public"."research" (
    "id" uuid not null default gen_random_uuid(),
    "title" text not null,
    "student_id" uuid not null,
    "status" text default 'active'::text,
    "metadata" jsonb default '{}'::jsonb,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "sections" jsonb not null default '{}'::jsonb,
    "docUrl" text,
    "term" uuid[]
      );


alter table "public"."research" enable row level security;


  create table "public"."study_paths" (
    "id" uuid not null default gen_random_uuid(),
    "title" text not null,
    "description" text,
    "student_id" uuid,
    "metadata" jsonb default '{}'::jsonb,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "status" text,
    "vocabulary" jsonb default '[]'::jsonb,
    "sources" jsonb default '[]'::jsonb
      );


alter table "public"."study_paths" enable row level security;


  create table "public"."task_assignments" (
    "task_id" uuid not null,
    "student_id" uuid not null,
    "status" public.task_status not null default 'todo'::public.task_status,
    "completed_at" timestamp with time zone,
    "current_count" integer
      );


alter table "public"."task_assignments" enable row level security;


  create table "public"."tasks" (
    "id" uuid not null default gen_random_uuid(),
    "title" text not null,
    "description" text,
    "student_id" uuid,
    "status" public.task_status not null default 'todo'::public.task_status,
    "due_date" timestamp with time zone,
    "metadata" jsonb default '{}'::jsonb,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "position" integer,
    "goal" text,
    "target_count" integer,
    "created_by" uuid,
    "current_count" integer,
    "url" text
      );


alter table "public"."tasks" enable row level security;


  create table "public"."terms" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "name" text,
    "start" date,
    "end" date
      );


alter table "public"."terms" enable row level security;


  create table "public"."user_profiles" (
    "id" uuid not null,
    "avatar_url" text,
    "profile" jsonb default '{}'::jsonb,
    "googleRefreshToken" text,
    "updated_at" timestamp with time zone default now(),
    "portfolio_url" text,
    "id_number" bigint,
    "cv_url" text,
    "title" text
      );


alter table "public"."user_profiles" enable row level security;


  create table "public"."users" (
    "id" uuid not null,
    "username" text,
    "first_name" text,
    "role" public.user_role not null default 'student'::public.user_role,
    "last_name" text,
    "is_admin" boolean not null default false,
    "active" boolean not null default true
      );


alter table "public"."users" enable row level security;


  create table "public"."users_groups" (
    "user_id" uuid not null,
    "group_id" uuid not null,
    "role_in_group" text,
    "joined_at" timestamp with time zone not null default now()
      );


alter table "public"."users_groups" enable row level security;


  create table "public"."vocation" (
    "id" bigint generated by default as identity not null,
    "created_at" timestamp with time zone not null default now(),
    "user_id" uuid,
    "place_of_work" text default ''::text,
    "position" text default ''::text,
    "work_hours" jsonb default '[]'::jsonb
      );


CREATE UNIQUE INDEX audit_log_pkey ON public.audit_log USING btree (id);

CREATE UNIQUE INDEX event_participants_pkey ON public.event_participants USING btree (event_id, user_id);

CREATE UNIQUE INDEX events_pkey ON public.events USING btree (id);

CREATE UNIQUE INDEX groups_pkey ON public.groups USING btree (id);

CREATE INDEX idx_audit_log_entity_timestamp ON public.audit_log USING btree (entity_type, "timestamp" DESC);

CREATE INDEX idx_audit_log_entity_type ON public.audit_log USING btree (entity_type);

CREATE INDEX idx_audit_log_project_id ON public.audit_log USING btree (project_id) WHERE (project_id IS NOT NULL);

CREATE INDEX idx_audit_log_research_id ON public.audit_log USING btree (research_id) WHERE (research_id IS NOT NULL);

CREATE INDEX idx_audit_log_student_id ON public.audit_log USING btree (student_id) WHERE (student_id IS NOT NULL);

CREATE INDEX idx_audit_log_timestamp ON public.audit_log USING btree ("timestamp" DESC);

CREATE INDEX idx_audit_log_updating_user ON public.audit_log USING btree (updating_user);

CREATE INDEX idx_event_participants_event_id ON public.event_participants USING btree (event_id);

CREATE INDEX idx_event_participants_user_id ON public.event_participants USING btree (user_id);

CREATE INDEX idx_events_created_by ON public.events USING btree (created_by);

CREATE INDEX idx_events_group_id ON public.events USING btree (group_id);

CREATE INDEX idx_events_start ON public.events USING btree (start);

CREATE INDEX idx_groups_type ON public.groups USING btree (type);

CREATE INDEX idx_links_a_table_id ON public.links USING btree (a_table, a_id);

CREATE INDEX idx_links_b_table_id ON public.links USING btree (b_table, b_id);

CREATE INDEX idx_logs_created_at ON public.logs USING btree (created_at DESC);

CREATE INDEX idx_logs_user_id ON public.logs USING btree (user_id);

CREATE INDEX idx_mentorships_mentor_id ON public.mentorships USING btree (mentor_id);

CREATE INDEX idx_mentorships_student_id ON public.mentorships USING btree (student_id);

CREATE INDEX idx_projects_status ON public.projects USING btree (status);

CREATE INDEX idx_projects_student ON public.projects USING btree (student_id);

CREATE INDEX idx_studypaths_creator ON public.study_paths USING btree (student_id);

CREATE INDEX idx_task_assignments_status ON public.task_assignments USING btree (status);

CREATE INDEX idx_task_assignments_student ON public.task_assignments USING btree (student_id);

CREATE INDEX idx_task_assignments_task ON public.task_assignments USING btree (task_id);

CREATE INDEX idx_tasks_due_date ON public.tasks USING btree (due_date);

CREATE INDEX idx_tasks_status ON public.tasks USING btree (status);

CREATE INDEX idx_tasks_student ON public.tasks USING btree (student_id);

CREATE INDEX idx_user_groups_group ON public.users_groups USING btree (group_id);

CREATE INDEX idx_user_groups_user ON public.users_groups USING btree (user_id);

CREATE INDEX idx_users_role ON public.users USING btree (role);

CREATE INDEX links_a_idx ON public.links USING btree (a_table, a_id);

CREATE INDEX links_b_idx ON public.links USING btree (b_table, b_id);

CREATE INDEX links_groups_tasks_a ON public.links USING btree (a_table, a_id, b_table, b_id);

CREATE INDEX links_groups_tasks_b ON public.links USING btree (b_table, b_id, a_table, a_id);

CREATE UNIQUE INDEX links_pkey ON public.links USING btree (id);

CREATE INDEX links_task_a ON public.links USING btree (a_table, a_id);

CREATE INDEX links_task_b ON public.links USING btree (b_table, b_id);

CREATE INDEX links_tasks_projects_a ON public.links USING btree (a_table, a_id, b_table, b_id);

CREATE INDEX links_tasks_projects_b ON public.links USING btree (b_table, b_id, a_table, a_id);

CREATE INDEX links_tasks_studypaths_a ON public.links USING btree (a_table, a_id, b_table, b_id);

CREATE INDEX links_tasks_studypaths_b ON public.links USING btree (b_table, b_id, a_table, a_id);

CREATE UNIQUE INDEX links_unique_pair ON public.links USING btree (LEAST(((a_table || '::'::text) || a_id), ((b_table || '::'::text) || b_id)), GREATEST(((a_table || '::'::text) || a_id), ((b_table || '::'::text) || b_id)));

CREATE UNIQUE INDEX logs_pkey ON public.logs USING btree (id);

CREATE UNIQUE INDEX mentorships_pkey ON public.mentorships USING btree (id);

CREATE UNIQUE INDEX mentorships_unique_pair ON public.mentorships USING btree (mentor_id, student_id);

CREATE INDEX misc_metadata_gin_idx ON public.misc USING gin (data);

CREATE INDEX misc_name_idx ON public.misc USING btree (name);

CREATE UNIQUE INDEX misc_name_key ON public.misc USING btree (name);

CREATE UNIQUE INDEX misc_pkey ON public.misc USING btree (id);

CREATE UNIQUE INDEX projects_pkey ON public.projects USING btree (id);

CREATE UNIQUE INDEX report_cards_pkey ON public.report_cards_private USING btree (id);

CREATE UNIQUE INDEX research_pkey ON public.research USING btree (id);

CREATE UNIQUE INDEX study_paths_pkey ON public.study_paths USING btree (id);

CREATE UNIQUE INDEX task_assignments_pkey ON public.task_assignments USING btree (task_id, student_id);

CREATE INDEX task_assignments_task_user ON public.task_assignments USING btree (task_id, student_id);

CREATE UNIQUE INDEX tasks_pkey ON public.tasks USING btree (id);

CREATE INDEX tasks_status_due_idx ON public.tasks USING btree (status, due_date);

CREATE INDEX tasks_status_due_pos ON public.tasks USING btree (status, due_date, "position");

CREATE INDEX tasks_student_status_due ON public.tasks USING btree (student_id, status, due_date);

CREATE UNIQUE INDEX terms_pkey ON public.terms USING btree (id);

CREATE UNIQUE INDEX user_groups_pkey ON public.users_groups USING btree (user_id, group_id);

CREATE UNIQUE INDEX user_profiles_pkey ON public.user_profiles USING btree (id);

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (username);

CREATE INDEX users_groups_group_idx ON public.users_groups USING btree (group_id);

CREATE INDEX users_groups_user_idx ON public.users_groups USING btree (user_id);

CREATE INDEX users_id_idx ON public.users USING btree (id);

CREATE INDEX users_is_admin_idx ON public.users USING btree (is_admin);

CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id);

CREATE INDEX users_role_idx ON public.users USING btree (role);

CREATE UNIQUE INDEX vocation_pkey ON public.vocation USING btree (id);

alter table "public"."audit_log" add constraint "audit_log_pkey" PRIMARY KEY using index "audit_log_pkey";

alter table "public"."event_participants" add constraint "event_participants_pkey" PRIMARY KEY using index "event_participants_pkey";

alter table "public"."events" add constraint "events_pkey" PRIMARY KEY using index "events_pkey";

alter table "public"."groups" add constraint "groups_pkey" PRIMARY KEY using index "groups_pkey";

alter table "public"."links" add constraint "links_pkey" PRIMARY KEY using index "links_pkey";

alter table "public"."logs" add constraint "logs_pkey" PRIMARY KEY using index "logs_pkey";

alter table "public"."mentorships" add constraint "mentorships_pkey" PRIMARY KEY using index "mentorships_pkey";

alter table "public"."misc" add constraint "misc_pkey" PRIMARY KEY using index "misc_pkey";

alter table "public"."projects" add constraint "projects_pkey" PRIMARY KEY using index "projects_pkey";

alter table "public"."report_cards_private" add constraint "report_cards_pkey" PRIMARY KEY using index "report_cards_pkey";

alter table "public"."research" add constraint "research_pkey" PRIMARY KEY using index "research_pkey";

alter table "public"."study_paths" add constraint "study_paths_pkey" PRIMARY KEY using index "study_paths_pkey";

alter table "public"."task_assignments" add constraint "task_assignments_pkey" PRIMARY KEY using index "task_assignments_pkey";

alter table "public"."tasks" add constraint "tasks_pkey" PRIMARY KEY using index "tasks_pkey";

alter table "public"."terms" add constraint "terms_pkey" PRIMARY KEY using index "terms_pkey";

alter table "public"."user_profiles" add constraint "user_profiles_pkey" PRIMARY KEY using index "user_profiles_pkey";

alter table "public"."users" add constraint "users_pkey" PRIMARY KEY using index "users_pkey";

alter table "public"."users_groups" add constraint "user_groups_pkey" PRIMARY KEY using index "user_groups_pkey";

alter table "public"."vocation" add constraint "vocation_pkey" PRIMARY KEY using index "vocation_pkey";

alter table "public"."audit_log" add constraint "audit_log_entity_type_check" CHECK ((entity_type = ANY (ARRAY['project'::text, 'research'::text, 'report_card'::text]))) not valid;

alter table "public"."audit_log" validate constraint "audit_log_entity_type_check";

alter table "public"."audit_log" add constraint "audit_log_project_id_fkey" FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE SET NULL not valid;

alter table "public"."audit_log" validate constraint "audit_log_project_id_fkey";

alter table "public"."audit_log" add constraint "audit_log_research_id_fkey" FOREIGN KEY (research_id) REFERENCES public.research(id) ON DELETE SET NULL not valid;

alter table "public"."audit_log" validate constraint "audit_log_research_id_fkey";

alter table "public"."audit_log" add constraint "audit_log_student_id_fkey" FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE SET NULL not valid;

alter table "public"."audit_log" validate constraint "audit_log_student_id_fkey";

alter table "public"."audit_log" add constraint "audit_log_updating_user_fkey" FOREIGN KEY (updating_user) REFERENCES public.users(id) ON DELETE SET NULL not valid;

alter table "public"."audit_log" validate constraint "audit_log_updating_user_fkey";

alter table "public"."event_participants" add constraint "event_participants_event_id_fkey" FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE not valid;

alter table "public"."event_participants" validate constraint "event_participants_event_id_fkey";

alter table "public"."event_participants" add constraint "event_participants_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."event_participants" validate constraint "event_participants_user_id_fkey";

alter table "public"."events" add constraint "events_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL not valid;

alter table "public"."events" validate constraint "events_created_by_fkey";

alter table "public"."events" add constraint "events_day_of_the_week_range" CHECK (((day_of_the_week IS NULL) OR ((day_of_the_week >= 1) AND (day_of_the_week <= 7)))) not valid;

alter table "public"."events" validate constraint "events_day_of_the_week_range";

alter table "public"."events" add constraint "events_exactly_one_timing" CHECK ((((date IS NOT NULL) AND (day_of_the_week IS NULL)) OR ((date IS NULL) AND (day_of_the_week IS NOT NULL)))) not valid;

alter table "public"."events" validate constraint "events_exactly_one_timing";

alter table "public"."events" add constraint "events_group_id_fkey" FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE not valid;

alter table "public"."events" validate constraint "events_group_id_fkey";

alter table "public"."events" add constraint "events_time_order" CHECK ((start < "end")) not valid;

alter table "public"."events" validate constraint "events_time_order";

alter table "public"."links" add constraint "links_different_records" CHECK ((NOT ((a_table = b_table) AND (a_id = b_id)))) not valid;

alter table "public"."links" validate constraint "links_different_records";

alter table "public"."logs" add constraint "logs_action_type_check" CHECK ((action_type = ANY (ARRAY['system'::text, 'manual'::text]))) not valid;

alter table "public"."logs" validate constraint "logs_action_type_check";

alter table "public"."logs" add constraint "logs_mentor_id_fkey" FOREIGN KEY (mentor_id) REFERENCES public.users(id) not valid;

alter table "public"."logs" validate constraint "logs_mentor_id_fkey";

alter table "public"."logs" add constraint "logs_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."logs" validate constraint "logs_user_id_fkey";

alter table "public"."mentorships" add constraint "mentorships_mentor_id_fkey" FOREIGN KEY (mentor_id) REFERENCES public.users(id) not valid;

alter table "public"."mentorships" validate constraint "mentorships_mentor_id_fkey";

alter table "public"."mentorships" add constraint "mentorships_student_id_fkey" FOREIGN KEY (student_id) REFERENCES public.users(id) not valid;

alter table "public"."mentorships" validate constraint "mentorships_student_id_fkey";

alter table "public"."mentorships" add constraint "mentorships_unique_pair" UNIQUE using index "mentorships_unique_pair";

alter table "public"."misc" add constraint "misc_name_key" UNIQUE using index "misc_name_key";

alter table "public"."projects" add constraint "projects_master_fkey" FOREIGN KEY (master) REFERENCES public.users(id) not valid;

alter table "public"."projects" validate constraint "projects_master_fkey";

alter table "public"."projects" add constraint "projects_student_id_fkey" FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."projects" validate constraint "projects_student_id_fkey";

alter table "public"."report_cards_private" add constraint "report_cards_id_fkey" FOREIGN KEY (id) REFERENCES public.users(id) not valid;

alter table "public"."report_cards_private" validate constraint "report_cards_id_fkey";

alter table "public"."research" add constraint "research_student_id_fkey" FOREIGN KEY (student_id) REFERENCES public.users(id) not valid;

alter table "public"."research" validate constraint "research_student_id_fkey";

alter table "public"."study_paths" add constraint "study_paths_student_id_fkey" FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE SET NULL not valid;

alter table "public"."study_paths" validate constraint "study_paths_student_id_fkey";

alter table "public"."task_assignments" add constraint "task_assignments_student_id_fkey" FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."task_assignments" validate constraint "task_assignments_student_id_fkey";

alter table "public"."task_assignments" add constraint "task_assignments_task_id_fkey" FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE not valid;

alter table "public"."task_assignments" validate constraint "task_assignments_task_id_fkey";

alter table "public"."tasks" add constraint "tasks_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL not valid;

alter table "public"."tasks" validate constraint "tasks_created_by_fkey";

alter table "public"."tasks" add constraint "tasks_student_id_fkey" FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."tasks" validate constraint "tasks_student_id_fkey";

alter table "public"."user_profiles" add constraint "user_profiles_id_fkey" FOREIGN KEY (id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_profiles" validate constraint "user_profiles_id_fkey";

alter table "public"."users" add constraint "chk_users_name_or_email" CHECK (((COALESCE(TRIM(BOTH FROM first_name), ''::text) <> ''::text) OR (COALESCE(TRIM(BOTH FROM username), ''::text) <> ''::text))) not valid;

alter table "public"."users" validate constraint "chk_users_name_or_email";

alter table "public"."users" add constraint "users_email_key" UNIQUE using index "users_email_key";

alter table "public"."users" add constraint "users_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."users" validate constraint "users_id_fkey";

alter table "public"."users_groups" add constraint "user_groups_group_id_fkey" FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE not valid;

alter table "public"."users_groups" validate constraint "user_groups_group_id_fkey";

alter table "public"."users_groups" add constraint "user_groups_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."users_groups" validate constraint "user_groups_user_id_fkey";

alter table "public"."vocation" add constraint "vocation_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) not valid;

alter table "public"."vocation" validate constraint "vocation_user_id_fkey";

set check_function_bodies = off;

create or replace view "public"."audit_log_readable" as  SELECT al.id,
    al.entity_type,
    to_char(al."timestamp", 'YYYY-MM-DD HH24:MI:SS'::text) AS timestamp_readable,
    al."timestamp" AS timestamp_full,
    al.updating_user AS updating_user_id,
    u_updating.first_name AS updating_user_first_name,
    u_updating.last_name AS updating_user_last_name,
    u_updating.username AS updating_user_username,
    al.student_id,
    COALESCE(u_student.first_name, ( SELECT u.first_name
           FROM (public.projects p
             JOIN public.users u ON ((u.id = p.student_id)))
          WHERE (p.id = al.project_id)), ( SELECT u.first_name
           FROM (public.research r
             JOIN public.users u ON ((u.id = r.student_id)))
          WHERE (r.id = al.research_id))) AS student_first_name,
    COALESCE(u_student.last_name, ( SELECT u.last_name
           FROM (public.projects p
             JOIN public.users u ON ((u.id = p.student_id)))
          WHERE (p.id = al.project_id)), ( SELECT u.last_name
           FROM (public.research r
             JOIN public.users u ON ((u.id = r.student_id)))
          WHERE (r.id = al.research_id))) AS student_last_name,
    COALESCE(u_student.username, ( SELECT u.username
           FROM (public.projects p
             JOIN public.users u ON ((u.id = p.student_id)))
          WHERE (p.id = al.project_id)), ( SELECT u.username
           FROM (public.research r
             JOIN public.users u ON ((u.id = r.student_id)))
          WHERE (r.id = al.research_id))) AS student_username,
    al.project_id,
    al.research_id,
        CASE
            WHEN (al.entity_type = 'project'::text) THEN ( SELECT projects.title
               FROM public.projects
              WHERE (projects.id = al.project_id))
            WHEN (al.entity_type = 'research'::text) THEN ( SELECT research.title
               FROM public.research
              WHERE (research.id = al.research_id))
            ELSE NULL::text
        END AS entity_title,
    al.new_data,
    al.old_data,
    al.changed_fields,
    al.metadata,
    to_char(al.created_at, 'YYYY-MM-DD HH24:MI:SS'::text) AS created_at_readable,
    al.created_at AS created_at_full
   FROM ((public.audit_log al
     LEFT JOIN public.users u_updating ON ((u_updating.id = al.updating_user)))
     LEFT JOIN public.users u_student ON ((u_student.id = al.student_id)))
  ORDER BY al."timestamp" DESC;


create or replace view "public"."audit_log_simple" as  SELECT to_char(al."timestamp", 'Mon DD, YYYY HH24:MI'::text) AS "when",
    al.entity_type AS what,
    u_updating.first_name AS who,
    COALESCE(u_student.first_name, ( SELECT u.first_name
           FROM (public.projects p
             JOIN public.users u ON ((u.id = p.student_id)))
          WHERE (p.id = al.project_id)), ( SELECT u.first_name
           FROM (public.research r
             JOIN public.users u ON ((u.id = r.student_id)))
          WHERE (r.id = al.research_id))) AS student,
        CASE
            WHEN (al.entity_type = 'project'::text) THEN ( SELECT projects.title
               FROM public.projects
              WHERE (projects.id = al.project_id))
            WHEN (al.entity_type = 'research'::text) THEN ( SELECT research.title
               FROM public.research
              WHERE (research.id = al.research_id))
            ELSE 'Report Card'::text
        END AS title,
    array_to_string(al.changed_fields, ', '::text) AS changed,
    al.new_data,
    al.id
   FROM ((public.audit_log al
     LEFT JOIN public.users u_updating ON ((u_updating.id = al.updating_user)))
     LEFT JOIN public.users u_student ON ((u_student.id = al.student_id)))
  ORDER BY al."timestamp" DESC;


create or replace view "public"."current_term" as  SELECT id,
    created_at,
    name,
    start,
    "end"
   FROM public.terms
  WHERE ((start <= CURRENT_DATE) AND (("end" IS NULL) OR ("end" >= CURRENT_DATE)))
  ORDER BY start DESC
 LIMIT 1;


CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE
AS $function$declare
    claims jsonb;
    user_record record;
    target_uuid uuid;
  begin
    -- 1. Explicitly cast the incoming ID
    target_uuid := (event->>'user_id')::uuid;

    -- 2. Fetch the record
    select role, is_admin into user_record
    from public.users
    where id = target_uuid;

    claims := event->'claims';

    claims := jsonb_set(claims, '{app_metadata, target_uuid}', to_jsonb(target_uuid::text));

    -- 3. Logic Check
    if user_record is not null then
      claims := jsonb_set(claims, '{app_metadata, role}', to_jsonb(user_record.role::text));
      claims := jsonb_set(claims, '{app_metadata, is_admin}', to_jsonb(user_record.is_admin));
      claims := jsonb_set(claims, '{app_metadata, debug_found}', 'true');
    else
      -- If we hit this, the SELECT failed to find the UUID in public.users
      claims := jsonb_set(claims, '{app_metadata, role}', '"not_found"');
      claims := jsonb_set(claims, '{app_metadata, is_admin}', 'false');
      claims := jsonb_set(claims, '{app_metadata, debug_found}', 'false');
      claims := jsonb_set(claims, '{app_metadata, debug_tried_id}', to_jsonb(target_uuid::text));
    end if;

    return jsonb_set(event, '{claims}', claims);
  end;$function$
;

CREATE OR REPLACE FUNCTION public.get_audit_history(p_entity_type text, p_entity_id uuid)
 RETURNS TABLE(id uuid, change_timestamp timestamp with time zone, updating_user uuid, username text, new_data jsonb, old_data jsonb, changed_fields text[])
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    al.id,
    al.timestamp,
    al.updating_user,
    u.username,
    al.new_data,
    al.old_data,
    al.changed_fields
  FROM audit_log al
  LEFT JOIN users u ON u.id = al.updating_user
  WHERE al.entity_type = p_entity_type
    AND (
      (p_entity_type = 'project' AND al.project_id = p_entity_id) OR
      (p_entity_type = 'research' AND al.research_id = p_entity_id) OR
      (p_entity_type = 'report_card' AND al.student_id = p_entity_id)
    )
  ORDER BY al.timestamp DESC;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_event_ids_in_window(p_start_date date, p_end_date date DEFAULT NULL::date, p_weekday_sunday_is_1 boolean DEFAULT true)
 RETURNS TABLE(event_id uuid)
 LANGUAGE sql
 STABLE
AS $function$
  WITH bounds AS (
    SELECT
      p_start_date AS range_start,
      COALESCE(p_end_date, p_start_date) AS range_end,
      -- Build the weekday set 1..7 (Sunday=1)
      ARRAY(
        SELECT extract(dow FROM d)::int + 1  -- Convert 0-6 to 1-7
        FROM generate_series(
          p_start_date,
          COALESCE(p_end_date, p_start_date),
          interval '1 day'
        ) AS d
      ) AS weekdays_set
  )
  SELECT e.id
  FROM events e, bounds b
  WHERE
    -- Non-repeating: check if date is in range
    (
      e.day_of_the_week IS NULL
      AND e.date >= b.range_start
      AND e.date <= b.range_end
    )
    OR
    -- Repeating: check if day_of_the_week matches any day in range
    (
      e.day_of_the_week IS NOT NULL
      AND e.day_of_the_week = ANY(b.weekdays_set)
    );
$function$
;

CREATE OR REPLACE FUNCTION public.get_linked_items(p_table_name text, p_item_id uuid, p_target_types text[] DEFAULT NULL::text[])
 RETURNS json
 LANGUAGE plpgsql
AS $function$
DECLARE
  result         jsonb := '[]'::jsonb;
  target_table   text;
  target_id      uuid;
  row_json       jsonb;
  include_target boolean;
  table_exists   boolean;
  has_id_column  boolean;
BEGIN
  -- Explicitly union both directions and DISTINCT to dedupe
  FOR target_table, target_id IN
    SELECT DISTINCT trg_table, trg_id
    FROM (
      SELECT l.b_table AS trg_table, l.b_id AS trg_id
      FROM public.links l
      WHERE l.a_table = p_table_name AND l.a_id = p_item_id
      UNION
      SELECT l.a_table AS trg_table, l.a_id AS trg_id
      FROM public.links l
      WHERE l.b_table = p_table_name AND l.b_id = p_item_id
    ) AS targets
  LOOP
    -- Skip malformed rows
    IF target_table IS NULL OR target_id IS NULL THEN
      CONTINUE;
    END IF;

    -- Filter by p_target_types (include all if NULL or empty)
    include_target := (p_target_types IS NULL)
                   OR (array_length(p_target_types, 1) IS NULL)
                   OR (target_table = ANY (p_target_types));
    IF NOT include_target THEN
      CONTINUE;
    END IF;

    -- Validate table exists and has an 'id' column in public
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = target_table
    ) INTO table_exists;

    IF NOT table_exists THEN
      -- Include a minimal record with a reason for visibility
      result := result || jsonb_build_array(
        jsonb_build_object(
          'table', target_table,
          'id',    target_id,
          'data',  NULL,
          'note',  'table not found in public'
        )
      );
      CONTINUE;
    END IF;

    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = target_table AND column_name = 'id'
    ) INTO has_id_column;

    IF NOT has_id_column THEN
      result := result || jsonb_build_array(
        jsonb_build_object(
          'table', target_table,
          'id',    target_id,
          'data',  NULL,
          'note',  'no id column on target table'
        )
      );
      CONTINUE;
    END IF;

    -- Fetch target row as JSONB
    EXECUTE format('SELECT to_jsonb(t) FROM public.%I t WHERE t.id = $1', target_table)
      INTO row_json
      USING target_id;

    -- Append even if row not found (to make iteration visible)
    result := result || jsonb_build_array(
      jsonb_build_object(
        'table', target_table,
        'id',    target_id,
        'data',  row_json,
        'note',  CASE WHEN row_json IS NULL THEN 'row not found' ELSE NULL END
      )
    );
  END LOOP;

  RETURN result::json;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_next_project_tasks(p_project_id uuid, p_max_upcoming integer DEFAULT 1)
 RETURNS json
 LANGUAGE sql
AS $function$
  WITH linked_tasks AS (
    SELECT t.*
    FROM public.tasks t
    JOIN public.links l
      ON (
        (l.a_table = 'tasks' AND l.a_id = t.id AND l.b_table = 'projects' AND l.b_id = p_project_id) OR
        (l.b_table = 'tasks' AND l.b_id = t.id AND l.a_table = 'projects' AND l.a_id = p_project_id)
      )
    WHERE t.status IN ('todo','in_progress')
  ),
  overdue AS (
    SELECT t.*
    FROM linked_tasks t
    WHERE t.due_date IS NOT NULL
      AND t.due_date < now()
    ORDER BY t.due_date ASC NULLS LAST, t.created_at ASC
  ),
  upcoming AS (
    SELECT t.*
    FROM linked_tasks t
    WHERE t.due_date IS NOT NULL
      AND t.due_date >= now()
    ORDER BY t.due_date ASC, t.created_at ASC
    LIMIT p_max_upcoming
  ),
  combined AS (
    SELECT * FROM overdue
    UNION ALL
    SELECT * FROM upcoming
  )
  SELECT coalesce(jsonb_agg(to_jsonb(c) ORDER BY c.due_date ASC NULLS LAST, c.created_at ASC), '[]'::jsonb)::json
  FROM combined c;
$function$
;

CREATE OR REPLACE FUNCTION public.get_screen_data(p_group_id text, p_include_staff boolean DEFAULT false, p_date date DEFAULT CURRENT_DATE)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_result JSON;
    v_group JSON;
    v_students JSON;
    v_day_of_week INT;
BEGIN
    -- Get day of week (1-7, where 1 = Sunday)
    v_day_of_week := EXTRACT(DOW FROM p_date)::INT + 1;

    -- Get group info
    SELECT row_to_json(g.*)
    INTO v_group
    FROM groups g
    WHERE g.id = p_group_id;

    -- Get students with their events, project, and research
    SELECT json_agg(student_data ORDER BY student_data->>'first_name')
    INTO v_students
    FROM (
        SELECT json_build_object(
            'id', u.id,
            'first_name', u.first_name,
            'last_name', u.last_name,
            'username', u.username,
            'role', u.role,
            'avatar_url', up.avatar_url,
            'events', (
                SELECT json_build_object(
                    'scheduledEvents', COALESCE((
                        SELECT json_agg(e ORDER BY e.start)
                        FROM (
                            SELECT * FROM get_user_events(u.id, p_date, p_date)
                        ) e
                    ), '[]'::json),
                    'meetings', COALESCE((
                        SELECT json_agg(m ORDER BY m.start)
                        FROM (
                            SELECT * FROM get_user_recurring_events(u.id, v_day_of_week)
                        ) m
                    ), '[]'::json)
                )
            ),
            'project', (
                SELECT row_to_json(proj.*)
                FROM (
                    SELECT * FROM get_student_current_term_project(u.id)
                ) proj
            ),
            'research', (
                SELECT row_to_json(r.*)
                FROM research r
                WHERE r.student_id = u.id
                AND r.status = 'active'
                LIMIT 1
            )
        ) as student_data
        FROM users_groups ug
        JOIN users u ON u.id = ug.user_id
        LEFT JOIN user_profiles up ON up.user_id = u.id
        WHERE ug.group_id = p_group_id
        AND (p_include_staff OR u.role = 'student')
    ) students;

    -- Build final result
    v_result := json_build_object(
        'group', v_group,
        'students', COALESCE(v_students, '[]'::json)
    );

    RETURN v_result;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_studypath_next_tasks(p_study_path_id uuid, p_max_overdue integer DEFAULT 50)
 RETURNS json
 LANGUAGE sql
AS $function$
  WITH linked_active AS (
    SELECT t.*
    FROM public.tasks t
    JOIN public.links l
      ON (
        (l.a_table = 'tasks' AND l.a_id = t.id AND l.b_table = 'study_paths' AND l.b_id = p_study_path_id) OR
        (l.b_table = 'tasks' AND l.b_id = t.id AND l.a_table = 'study_paths' AND l.a_id = p_study_path_id)
      )
    WHERE t.status IN ('todo','in_progress')
  ),
  overdue AS (
    SELECT t.*
    FROM linked_active t
    WHERE t.due_date IS NOT NULL
      AND t.due_date < now()
    ORDER BY t.due_date ASC, t.created_at ASC
    LIMIT p_max_overdue
  ),
  next_task AS (
    -- Pick the next not-done task by position; if positions are null/tied, use due_date then created_at
    SELECT t.*
    FROM linked_active t
    WHERE NOT EXISTS (
      SELECT 1 FROM overdue o WHERE o.id = t.id
    )
    ORDER BY t.position ASC NULLS LAST, t.due_date ASC NULLS LAST, t.created_at ASC
    LIMIT 1
  )
  SELECT jsonb_build_object(
    'overdue', coalesce(jsonb_agg(to_jsonb(o)) FILTER (WHERE o.id IS NOT NULL), '[]'::jsonb),
    'next_task', coalesce((SELECT to_jsonb(nt) FROM next_task nt), 'null'::jsonb)
  )::json
  FROM overdue o;
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_events(p_user_id uuid, p_start_date date, p_end_date date)
 RETURNS json
 LANGUAGE sql
 STABLE
AS $function$
WITH bounds AS (
  SELECT
    COALESCE(p_start_date, current_date) AS start_date,
    COALESCE(p_end_date,   current_date) AS end_date
),
user_event_ids AS (
  -- Events created by user (non-recurring), within date bounds
  SELECT e.id
  FROM events e
  CROSS JOIN bounds b
  WHERE e.created_by = p_user_id
    AND e.day_of_the_week IS NULL
    AND e.date >= b.start_date
    AND e.date <= b.end_date
),
enriched AS (
  SELECT e.*
  FROM events e
  WHERE e.id IN (SELECT id FROM user_event_ids)
)
SELECT COALESCE(
  json_agg(
    enriched
    ORDER BY
      enriched.date ASC,
      enriched.start ASC,
      enriched.created_at ASC
  ),
  '[]'::json
)
FROM enriched;
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_group_tasks_by_group(p_user_id uuid, p_group_id uuid)
 RETURNS jsonb
 LANGUAGE sql
 STABLE
AS $function$
WITH user_role AS (
  SELECT u.role
  FROM public.users u
  WHERE u.id = p_user_id
  LIMIT 1
),
group_tasks AS (
  SELECT
    t.id,
    t.title,
    t.description,
    t.status,      -- base status; filtered to 'todo'
    t.due_date,
    t.created_at,
    t.updated_at
  FROM public.links l
  JOIN public.tasks t
    ON t.id = CASE
                WHEN l.a_table = 'tasks' THEN l.a_id
                ELSE l.b_id
              END
  WHERE
    (
      (l.a_table = 'groups' AND l.a_id = p_group_id AND l.b_table = 'tasks') OR
      (l.b_table = 'groups' AND l.b_id = p_group_id AND l.a_table = 'tasks')
    )
    AND t.status = 'todo'
),
student_view AS (
  SELECT
    gt.id AS task_id,
    COALESCE(ta.status, 'todo') AS status,
    '[]'::jsonb AS completed,
    gt.title,
    gt.description,
    gt.due_date,
    gt.created_at,
    gt.updated_at
  FROM group_tasks gt
  LEFT JOIN public.task_assignments ta
    ON ta.task_id = gt.id
   AND ta.student_id = p_user_id
),
staff_view AS (
  SELECT
    gt.id AS task_id,
    gt.status AS status,
    COALESCE(
      (
        SELECT jsonb_agg(ta2.student_id ORDER BY ta2.student_id)
        FROM public.task_assignments ta2
        WHERE ta2.task_id = gt.id
          AND ta2.status = 'completed'
      ),
      '[]'::jsonb
    ) AS completed,
    gt.title,
    gt.description,
    gt.due_date,
    gt.created_at,
    gt.updated_at
  FROM group_tasks gt
)
SELECT COALESCE(
  jsonb_agg(
    jsonb_build_object(
      'id', v.task_id,
      'title', v.title,
      'description', v.description,
      'status', v.status,
      'completed', v.completed,
      'due_date', v.due_date,
      'created_at', v.created_at,
      'updated_at', v.updated_at
    )
    ORDER BY
      CASE WHEN v.due_date IS NOT NULL AND v.due_date < now() THEN 0 ELSE 1 END,
      v.due_date ASC NULLS LAST,
      v.created_at ASC
  ),
  '[]'::jsonb
)
FROM (
  SELECT * FROM student_view WHERE (SELECT role FROM user_role) = 'student'
  UNION ALL
  SELECT * FROM staff_view   WHERE (SELECT role FROM user_role) = 'staff'
) AS v;
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_groups(p_user_id uuid)
 RETURNS json
 LANGUAGE sql
AS $function$-- p_user_id must be provided in the calling context

WITH user_groups AS (
  SELECT g.*
  FROM public.groups g
  JOIN public.users_groups ug
    ON ug.group_id = g.id
  WHERE ug.user_id = p_user_id
),
group_mentors AS (
  SELECT
    g.id AS group_id,
    COALESCE(
      jsonb_agg(
        to_jsonb(sp)
      ) FILTER (WHERE sp.user_id IS NOT NULL),
      '[]'::jsonb
    ) AS mentors
  FROM user_groups g
  LEFT JOIN public.users_groups ug2
    ON ug2.group_id = g.id
  LEFT JOIN public.staff_public sp
    ON sp.user_id = ug2.user_id
  GROUP BY g.id
)
SELECT COALESCE(
  jsonb_agg(
    to_jsonb(g) || jsonb_build_object('mentors', gm.mentors)
  ),
  '[]'::jsonb
)::json
FROM user_groups g
LEFT JOIN group_mentors gm
  ON gm.group_id = g.id;$function$
;

CREATE OR REPLACE FUNCTION public.get_user_mentorships(p_user_id uuid, p_is_active boolean DEFAULT NULL::boolean)
 RETURNS json
 LANGUAGE sql
AS $function$
  WITH base AS (
    SELECT m.*
    FROM public.mentorships m
    WHERE (m.student_id = p_user_id OR m.mentor_id = p_user_id)
      AND (p_is_active IS NULL OR m.is_active = p_is_active)
  ),
  enriched AS (
    SELECT
      b.*,
      CASE
        WHEN b.mentor_id = p_user_id THEN
          (SELECT to_jsonb(u) FROM public.users u WHERE u.id = b.student_id)
        ELSE NULL
      END AS student,
      CASE
        WHEN b.student_id = p_user_id THEN
          (SELECT to_jsonb(u) FROM public.users u WHERE u.id = b.mentor_id)
        ELSE NULL
      END AS mentor
    FROM base b
  )
  SELECT coalesce(
    jsonb_agg(
      to_jsonb(enriched)
      || CASE
           WHEN enriched.student IS NOT NULL THEN jsonb_build_object('student', enriched.student)
           ELSE '{}'::jsonb
         END
      || CASE
           WHEN enriched.mentor IS NOT NULL THEN jsonb_build_object('mentor', enriched.mentor)
           ELSE '{}'::jsonb
         END
    ),
    '[]'::jsonb
  )::json
  FROM enriched;
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_orphaned_tasks(p_user_id uuid, p_active_only boolean DEFAULT true, p_max_count integer DEFAULT 100)
 RETURNS json
 LANGUAGE sql
AS $function$
  WITH relevant AS (
    SELECT t.*
    FROM public.tasks t
    WHERE
      -- Owned by user only (exclude group-assigned here; handled by get_user_group_tasks)
      t.student_id = p_user_id
      AND (p_active_only = false OR t.status IN ('todo','in_progress'))
      AND NOT EXISTS (
        -- Exclude if linked to project/study_path/research
        SELECT 1 FROM public.links l
        WHERE (l.a_table = 'tasks' AND l.a_id = t.id AND l.b_table IN ('projects','study_paths','research'))
           OR (l.b_table = 'tasks' AND l.b_id = t.id AND l.a_table IN ('projects','study_paths','research'))
      )
      AND NOT EXISTS (
        -- Exclude if linked to any group (keep group tasks out of "orphaned")
        SELECT 1 FROM public.links l
        WHERE (l.a_table = 'tasks' AND l.a_id = t.id AND l.b_table = 'groups')
           OR (l.b_table = 'tasks' AND l.b_id = t.id AND l.a_table = 'groups')
      )
  ),
  ordered AS (
    SELECT r.*
    FROM relevant r
    ORDER BY
      CASE WHEN r.due_date IS NOT NULL AND r.due_date < now() THEN 0 ELSE 1 END,
      r.due_date ASC NULLS LAST,
      r.created_at ASC
    LIMIT p_max_count
  )
  SELECT coalesce(jsonb_agg(to_jsonb(o)), '[]'::jsonb)::json
  FROM ordered o;
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_recurring_events(p_user_id uuid, p_day_of_week integer DEFAULT NULL::integer)
 RETURNS json
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN (
    WITH user_recurring_event_ids AS (
      -- Recurring events created by user
      SELECT e.id
      FROM events e
      WHERE e.created_by = p_user_id
        AND e.day_of_the_week IS NOT NULL
        AND (p_day_of_week IS NULL OR e.day_of_the_week = p_day_of_week)
      
      UNION
      
      -- Recurring events where user is a direct participant
      SELECT ep.event_id
      FROM event_participants ep
      JOIN events e ON e.id = ep.event_id
      WHERE ep.user_id = p_user_id
        AND e.day_of_the_week IS NOT NULL
        AND (p_day_of_week IS NULL OR e.day_of_the_week = p_day_of_week)
    ),
    enriched AS (
      SELECT 
        e.*,
        -- Get participants (excluding the current user)
        -- Fetch from both users and staff_public, prioritizing users table
        COALESCE(
          (
            SELECT jsonb_agg(
              jsonb_build_object(
                'id', COALESCE(u.id, sp.user_id),
                'username', u.username,
                'first_name', COALESCE(u.first_name, sp.first_name),
                'last_name', COALESCE(u.last_name, sp.last_name),
                'avatar_url', sp.avatar_url,
                'role', CASE 
                  WHEN COALESCE(u.id, sp.user_id) = e.created_by THEN 'creator'
                  ELSE COALESCE(ep.role, 'participant')
                END
              )
              ORDER BY 
                CASE WHEN COALESCE(u.id, sp.user_id) = e.created_by THEN 1 ELSE 2 END,
                COALESCE(u.first_name, sp.first_name),
                COALESCE(u.last_name, sp.last_name)
            )
            FROM (
              -- Creator (if not the current user)
              SELECT u.id
              FROM users u
              WHERE u.id = e.created_by
                AND u.id != p_user_id
              
              UNION
              
              -- Direct participants (excluding current user)
              SELECT ep.user_id
              FROM event_participants ep
              WHERE ep.event_id = e.id
                AND ep.user_id != p_user_id
            ) participant_ids
            LEFT JOIN users u ON u.id = participant_ids.id
            LEFT JOIN staff_public sp ON sp.user_id = participant_ids.id
            LEFT JOIN event_participants ep ON ep.event_id = e.id 
              AND ep.user_id = COALESCE(u.id, sp.user_id)
            WHERE u.id IS NOT NULL OR sp.user_id IS NOT NULL
          ),
          '[]'::jsonb
        ) as participants
      FROM events e
      JOIN user_recurring_event_ids urei ON urei.id = e.id
    )
    SELECT COALESCE(
      jsonb_agg(
        to_jsonb(enriched)
        ORDER BY 
          enriched.day_of_the_week ASC,
          enriched.start ASC,
          enriched.created_at ASC
      ),
      '[]'::jsonb
    )::json
    FROM enriched
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.group_full_state(p_group_id uuid, p_term_id uuid DEFAULT NULL::uuid)
 RETURNS json
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
WITH grp AS (
  SELECT
    g.name,
    g.type,
    g.description
  FROM public.groups g
  WHERE g.id = p_group_id
),
group_students AS (
  SELECT
    ug.user_id AS id,
    u.first_name,
    u.last_name,
    u.role
  FROM public.users_groups ug
  JOIN public.users u ON u.id = ug.user_id
  WHERE ug.group_id = p_group_id
),
target_term AS (
  SELECT COALESCE(p_term_id, (SELECT id FROM public.current_term LIMIT 1)) AS id
),
group_events AS (
  SELECT COALESCE(
    json_agg(
      e.*
      ORDER BY e.start ASC, e.created_at ASC
    ),
    '[]'::json
  ) AS events_json
  FROM public.events e
  WHERE e.group_id = p_group_id
    AND p_term_id IS NULL
    AND (
      (e.day_of_the_week IS NULL AND e.date = current_date)
      OR
      (e.day_of_the_week IS NOT NULL AND e.day_of_the_week = EXTRACT(DOW FROM current_date)::int + 1)
    )
),
students_payload AS (
  SELECT
    json_build_object(
      'first_name', gs.first_name,
      'last_name',  gs.last_name,
      'role', gs.role,
      'project', (
                    SELECT row_to_json(p.*)
                    FROM public.projects p
                    WHERE p.student_id = gs.id
                      AND p.term @> ARRAY[(SELECT id FROM target_term)]::uuid[]
                    ORDER BY p.created_at DESC
                    LIMIT 1
                  ),
      'research',   (
                    SELECT row_to_json(r.*)
                    FROM public.research r
                    WHERE r.student_id = gs.id
                      AND r.term @> ARRAY[(SELECT id FROM target_term)]::uuid[]
                    ORDER BY r.created_at DESC
                    LIMIT 1
                  ),
      'events',     CASE
                      WHEN p_term_id IS NULL THEN (
                        COALESCE(public.get_user_events(gs.id, current_date, current_date)::jsonb, '[]'::jsonb)
                        ||
                        COALESCE(public.get_user_recurring_events(gs.id, EXTRACT(DOW FROM current_date)::int + 1)::jsonb, '[]'::jsonb)
                      )::json
                      ELSE NULL
                    END
    ) AS student_obj
  FROM group_students gs
),
students_agg AS (
  SELECT COALESCE(
           json_agg(
             student_obj
             ORDER BY
               (student_obj->>'last_name') ASC NULLS LAST,
               (student_obj->>'first_name') ASC NULLS LAST
           ),
           '[]'::json
         ) AS students_json
  FROM students_payload
)
SELECT json_build_object(
         'name',        (SELECT name        FROM grp),
         'type',        (SELECT type        FROM grp),
         'description', (SELECT description FROM grp),
         'students',    (SELECT students_json FROM students_agg),
         'events',      CASE WHEN p_term_id IS NULL THEN (SELECT events_json FROM group_events) ELSE NULL END
       );
$function$
;

CREATE OR REPLACE FUNCTION public.log_project_metadata_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Only log if metadata actually changed
  IF (TG_OP = 'UPDATE' AND OLD.metadata IS DISTINCT FROM NEW.metadata) 
     OR TG_OP = 'INSERT' THEN
    
    INSERT INTO public.audit_log (
      updating_user,
      entity_type,
      project_id,
      student_id,
      new_data,
      old_data,
      changed_fields
    ) VALUES (
      COALESCE(auth.uid(), NEW.student_id), -- Use authenticated user or fallback to student_id
      'project',
      NEW.id,
      NEW.student_id,
      NEW.metadata,
      CASE WHEN TG_OP = 'UPDATE' THEN OLD.metadata ELSE NULL END,
      CASE 
        WHEN TG_OP = 'UPDATE' THEN ARRAY['metadata']
        ELSE ARRAY['created']
      END
    );
  END IF;
  
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.log_report_card_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_changed_fields TEXT[] := '{}';
  v_new_data JSONB;
  v_old_data JSONB;
BEGIN
  -- Build full row as JSONB
  v_new_data := to_jsonb(NEW);
  v_old_data := CASE WHEN TG_OP = 'UPDATE' THEN to_jsonb(OLD) ELSE NULL END;
  
  -- Track which fields changed
  IF TG_OP = 'UPDATE' THEN
    IF OLD.ikigai IS DISTINCT FROM NEW.ikigai THEN
      v_changed_fields := array_append(v_changed_fields, 'ikigai');
    END IF;
    IF OLD.mentors IS DISTINCT FROM NEW.mentors THEN
      v_changed_fields := array_append(v_changed_fields, 'mentors');
    END IF;
    IF OLD.liba IS DISTINCT FROM NEW.liba THEN
      v_changed_fields := array_append(v_changed_fields, 'liba');
    END IF;
    IF OLD.learning IS DISTINCT FROM NEW.learning THEN
      v_changed_fields := array_append(v_changed_fields, 'learning');
    END IF;
    IF OLD.vocation IS DISTINCT FROM NEW.vocation THEN
      v_changed_fields := array_append(v_changed_fields, 'vocation');
    END IF;
    IF OLD.special IS DISTINCT FROM NEW.special THEN
      v_changed_fields := array_append(v_changed_fields, 'special');
    END IF;
  END IF;
  
  -- Only log if something actually changed or it's an insert
  IF TG_OP = 'INSERT' OR array_length(v_changed_fields, 1) > 0 THEN
    INSERT INTO public.audit_log (
      updating_user,
      entity_type,
      student_id,
      new_data,
      old_data,
      changed_fields
    ) VALUES (
      COALESCE(auth.uid(), NEW.id),
      'report_card',
      NEW.id,
      v_new_data,
      v_old_data,
      CASE 
        WHEN TG_OP = 'UPDATE' THEN v_changed_fields
        ELSE ARRAY['created']
      END
    );
  END IF;
  
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.log_research_metadata_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Only log if metadata actually changed
  IF (TG_OP = 'UPDATE' AND OLD.metadata IS DISTINCT FROM NEW.metadata) 
     OR TG_OP = 'INSERT' THEN
    
    INSERT INTO public.audit_log (
      updating_user,
      entity_type,
      research_id,
      student_id,
      new_data,
      old_data,
      changed_fields
    ) VALUES (
      COALESCE(auth.uid(), NEW.student_id),
      'research',
      NEW.id,
      NEW.student_id,
      NEW.metadata,
      CASE WHEN TG_OP = 'UPDATE' THEN OLD.metadata ELSE NULL END,
      CASE 
        WHEN TG_OP = 'UPDATE' THEN ARRAY['metadata']
        ELSE ARRAY['created']
      END
    );
  END IF;
  
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.mentors_by_user(p_user_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 STABLE
AS $function$declare
  v_groups_json json;      -- JSON array returned by get_user_groups
  v_class_group_id uuid;   -- the selected class group id
  v_result json;           -- final JSON array
begin
  -- 1) Get the user's groups as JSON
  v_groups_json := public.get_user_groups(p_user_id);

  -- 2) Extract the first group where type == 'class'
  -- If your get_user_groups returns {"groups":[...]} instead of a bare array, change to json_array_elements(v_groups_json->'groups')
  select (g->>'id')::uuid
    into v_class_group_id
  from json_array_elements(v_groups_json) as g
  where g->>'type' = 'class'
  limit 1;

  -- If no class group, return empty array
  if v_class_group_id is null then
    return '[]'::json;
  end if;

  -- 3) Get members of that group via users_groups; filter mentors by users.role = 'staff'
  select coalesce(
      json_agg(row_to_json(s) order by s.first_name nulls last),
      '[]'::json
  ) into v_result
  from public.users_groups ug
  join public.staff_public s
    on s.id = ug.user_id
  where ug.group_id = v_class_group_id
    and s.role = 'staff';


  return v_result;
end;$function$
;

CREATE OR REPLACE FUNCTION public.project_get_master(p_project_id uuid)
 RETURNS json
 LANGUAGE plpgsql
AS $function$DECLARE
    -- JSON returned by get_linked_items (array of objects)
    v_links json;
    -- First element of v_links (object with keys: table, id, data, note)
    v_first_link jsonb;
    -- Extracted mentor_id from the 'data' object
    v_mentor_id uuid;
    -- Resulting mentor user row as json
    v_master json;
BEGIN
    /*
      Fetch mentorships linked to this project using existing get_linked_items.
      Expected shape: [
        { table: 'mentorships', id: '<uuid>', data: { mentor_id: '<uuid>', ... }, note: null | 'row not found' },
        ...
      ]
    */
    SELECT public.get_linked_items(
               p_item_id      := p_project_id,
               p_table_name   := 'projects',
               p_target_types := ARRAY['mentorships']::text[]
           )
      INTO v_links;

    -- If no links or empty array, return null
    IF v_links IS NULL OR json_array_length(v_links) = 0 THEN
        RETURN NULL;
    END IF;

    -- Take the first link object
    v_first_link := (v_links->0)::jsonb;

    -- If 'data' is missing or null, return null
    IF v_first_link ? 'data' IS FALSE OR v_first_link->'data' IS NULL THEN
        RETURN NULL;
    END IF;

    -- Extract mentor_id from the data object
    v_mentor_id := ((v_first_link->'data')->>'mentor_id')::uuid;

    -- If mentor_id missing, return null
    IF v_mentor_id IS NULL THEN
        RETURN NULL;
    END IF;

    -- Fetch the mentor user, return as JSON (single row)
    SELECT to_json(u)
      INTO v_master
      FROM public.staff_public u
     WHERE u.user_id = v_mentor_id;

    -- If no user found, return null
    IF v_master IS NULL THEN
        RETURN NULL;
    END IF;

    RETURN v_master;
END;$function$
;

create or replace view "public"."staff_public" as  SELECT u.id AS user_id,
    u.first_name,
    u.last_name,
    up.avatar_url
   FROM (public.users u
     JOIN public.user_profiles up ON ((up.id = u.id)))
  WHERE (u.role = 'staff'::public.user_role);


CREATE OR REPLACE FUNCTION public.update_student_ikigai(new_ikigai jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  student_id uuid;
  student_role text;
BEGIN
  -- Get the current user's ID and role
  student_id := auth.uid();
  student_role := (auth.jwt() -> 'app_metadata'::text) ->> 'role'::text;
  
  -- Check if user is authenticated
  IF student_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Check if user is a student
  IF student_role != 'student' THEN
    RAISE EXCEPTION 'Only students can update their ikigai';
  END IF;
  
  -- Update only the ikigai field for this student
  UPDATE report_cards_private
  SET ikigai = new_ikigai
  WHERE id = student_id;
  
  -- Check if the update affected any rows
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Report card not found for user';
  END IF;
END;
$function$
;

create or replace view "public"."report_cards_public" as  SELECT rcp.id,
    u.first_name,
    u.last_name,
    up.id_number,
    rcp.ikigai,
    rcp.liba,
    rcp.learning,
    rcp.vocation,
    rcp.special,
    ( SELECT g.name
           FROM (public.users_groups ug
             JOIN public.groups g ON ((g.id = ug.group_id)))
          WHERE ((ug.user_id = rcp.id) AND (g.type = 'major'::public.group_type))
         LIMIT 1) AS major,
    ( SELECT g.name
           FROM (public.users_groups ug
             JOIN public.groups g ON ((g.id = ug.group_id)))
          WHERE ((ug.user_id = rcp.id) AND (g.type = 'class'::public.group_type))
         LIMIT 1) AS class,
    ( SELECT g.description
           FROM (public.users_groups ug
             JOIN public.groups g ON ((g.id = ug.group_id)))
          WHERE ((ug.user_id = rcp.id) AND (g.type = 'class'::public.group_type))
         LIMIT 1) AS year,
    ( SELECT
                CASE
                    WHEN (p.metadata ? 'review'::text) THEN ((jsonb_build_object('id', p.id) || (p.metadata -> 'review'::text)) || jsonb_build_object('title', p.title, 'term', ( SELECT terms.name
                       FROM public.terms
                      WHERE (terms.id = 'ef0dddf1-3a4c-4e90-ad3f-d991f0e35755'::uuid)), 'master', jsonb_build_object('first_name', sp.first_name, 'last_name', sp.last_name)))
                    ELSE jsonb_build_object('id', p.id, 'title', p.title, 'term', ( SELECT terms.name
                       FROM public.terms
                      WHERE (terms.id = 'ef0dddf1-3a4c-4e90-ad3f-d991f0e35755'::uuid)), 'master', jsonb_build_object('first_name', sp.first_name, 'last_name', sp.last_name))
                END AS jsonb_build_object
           FROM (public.projects p
             LEFT JOIN public.staff_public sp ON ((sp.user_id = p.master)))
          WHERE ((p.student_id = rcp.id) AND (p.term @> ARRAY['ef0dddf1-3a4c-4e90-ad3f-d991f0e35755'::uuid]))
         LIMIT 1) AS autumn_project,
    ( SELECT
                CASE
                    WHEN (p.metadata ? 'review'::text) THEN ((jsonb_build_object('id', p.id) || (p.metadata -> 'review'::text)) || jsonb_build_object('title', p.title, 'term', ( SELECT terms.name
                       FROM public.terms
                      WHERE (terms.id = '2105340d-e3d5-4cf5-b68c-ef57ff5454dc'::uuid)), 'master', jsonb_build_object('first_name', sp.first_name, 'last_name', sp.last_name)))
                    ELSE jsonb_build_object('id', p.id, 'title', p.title, 'term', ( SELECT terms.name
                       FROM public.terms
                      WHERE (terms.id = '2105340d-e3d5-4cf5-b68c-ef57ff5454dc'::uuid)), 'master', jsonb_build_object('first_name', sp.first_name, 'last_name', sp.last_name))
                END AS jsonb_build_object
           FROM (public.projects p
             LEFT JOIN public.staff_public sp ON ((sp.user_id = p.master)))
          WHERE ((p.student_id = rcp.id) AND (p.term @> ARRAY['2105340d-e3d5-4cf5-b68c-ef57ff5454dc'::uuid]))
         LIMIT 1) AS winter_project,
    ( SELECT
                CASE
                    WHEN (r.metadata ? 'review'::text) THEN ((jsonb_build_object('id', r.id) || (r.metadata -> 'review'::text)) || jsonb_build_object('title', r.title, 'term', ( SELECT terms.name
                       FROM public.terms
                      WHERE (terms.id = 'ef0dddf1-3a4c-4e90-ad3f-d991f0e35755'::uuid))))
                    ELSE jsonb_build_object('id', r.id, 'title', r.title, 'term', ( SELECT terms.name
                       FROM public.terms
                      WHERE (terms.id = 'ef0dddf1-3a4c-4e90-ad3f-d991f0e35755'::uuid)))
                END AS jsonb_build_object
           FROM public.research r
          WHERE ((r.student_id = rcp.id) AND (r.term @> ARRAY['ef0dddf1-3a4c-4e90-ad3f-d991f0e35755'::uuid]))
         LIMIT 1) AS autumn_research,
    ( SELECT
                CASE
                    WHEN (r.metadata ? 'review'::text) THEN ((jsonb_build_object('id', r.id) || (r.metadata -> 'review'::text)) || jsonb_build_object('title', r.title, 'term', ( SELECT terms.name
                       FROM public.terms
                      WHERE (terms.id = '2105340d-e3d5-4cf5-b68c-ef57ff5454dc'::uuid))))
                    ELSE jsonb_build_object('id', r.id, 'title', r.title, 'term', ( SELECT terms.name
                       FROM public.terms
                      WHERE (terms.id = '2105340d-e3d5-4cf5-b68c-ef57ff5454dc'::uuid)))
                END AS jsonb_build_object
           FROM public.research r
          WHERE ((r.student_id = rcp.id) AND (r.term @> ARRAY['2105340d-e3d5-4cf5-b68c-ef57ff5454dc'::uuid]))
         LIMIT 1) AS winter_research,
    up.portfolio_url
   FROM ((public.report_cards_private rcp
     LEFT JOIN public.users u ON ((u.id = rcp.id)))
     LEFT JOIN public.user_profiles up ON ((up.id = rcp.id)));


grant delete on table "public"."audit_log" to "anon";

grant insert on table "public"."audit_log" to "anon";

grant references on table "public"."audit_log" to "anon";

grant select on table "public"."audit_log" to "anon";

grant trigger on table "public"."audit_log" to "anon";

grant truncate on table "public"."audit_log" to "anon";

grant update on table "public"."audit_log" to "anon";

grant delete on table "public"."audit_log" to "authenticated";

grant insert on table "public"."audit_log" to "authenticated";

grant references on table "public"."audit_log" to "authenticated";

grant select on table "public"."audit_log" to "authenticated";

grant trigger on table "public"."audit_log" to "authenticated";

grant truncate on table "public"."audit_log" to "authenticated";

grant update on table "public"."audit_log" to "authenticated";

grant delete on table "public"."audit_log" to "service_role";

grant insert on table "public"."audit_log" to "service_role";

grant references on table "public"."audit_log" to "service_role";

grant select on table "public"."audit_log" to "service_role";

grant trigger on table "public"."audit_log" to "service_role";

grant truncate on table "public"."audit_log" to "service_role";

grant update on table "public"."audit_log" to "service_role";

grant delete on table "public"."event_participants" to "anon";

grant insert on table "public"."event_participants" to "anon";

grant references on table "public"."event_participants" to "anon";

grant select on table "public"."event_participants" to "anon";

grant trigger on table "public"."event_participants" to "anon";

grant truncate on table "public"."event_participants" to "anon";

grant update on table "public"."event_participants" to "anon";

grant delete on table "public"."event_participants" to "authenticated";

grant insert on table "public"."event_participants" to "authenticated";

grant references on table "public"."event_participants" to "authenticated";

grant select on table "public"."event_participants" to "authenticated";

grant trigger on table "public"."event_participants" to "authenticated";

grant truncate on table "public"."event_participants" to "authenticated";

grant update on table "public"."event_participants" to "authenticated";

grant delete on table "public"."event_participants" to "service_role";

grant insert on table "public"."event_participants" to "service_role";

grant references on table "public"."event_participants" to "service_role";

grant select on table "public"."event_participants" to "service_role";

grant trigger on table "public"."event_participants" to "service_role";

grant truncate on table "public"."event_participants" to "service_role";

grant update on table "public"."event_participants" to "service_role";

grant delete on table "public"."events" to "anon";

grant insert on table "public"."events" to "anon";

grant references on table "public"."events" to "anon";

grant select on table "public"."events" to "anon";

grant trigger on table "public"."events" to "anon";

grant truncate on table "public"."events" to "anon";

grant update on table "public"."events" to "anon";

grant delete on table "public"."events" to "authenticated";

grant insert on table "public"."events" to "authenticated";

grant references on table "public"."events" to "authenticated";

grant select on table "public"."events" to "authenticated";

grant trigger on table "public"."events" to "authenticated";

grant truncate on table "public"."events" to "authenticated";

grant update on table "public"."events" to "authenticated";

grant delete on table "public"."events" to "service_role";

grant insert on table "public"."events" to "service_role";

grant references on table "public"."events" to "service_role";

grant select on table "public"."events" to "service_role";

grant trigger on table "public"."events" to "service_role";

grant truncate on table "public"."events" to "service_role";

grant update on table "public"."events" to "service_role";

grant delete on table "public"."groups" to "anon";

grant insert on table "public"."groups" to "anon";

grant references on table "public"."groups" to "anon";

grant select on table "public"."groups" to "anon";

grant trigger on table "public"."groups" to "anon";

grant truncate on table "public"."groups" to "anon";

grant update on table "public"."groups" to "anon";

grant delete on table "public"."groups" to "authenticated";

grant insert on table "public"."groups" to "authenticated";

grant references on table "public"."groups" to "authenticated";

grant select on table "public"."groups" to "authenticated";

grant trigger on table "public"."groups" to "authenticated";

grant truncate on table "public"."groups" to "authenticated";

grant update on table "public"."groups" to "authenticated";

grant delete on table "public"."groups" to "service_role";

grant insert on table "public"."groups" to "service_role";

grant references on table "public"."groups" to "service_role";

grant select on table "public"."groups" to "service_role";

grant trigger on table "public"."groups" to "service_role";

grant truncate on table "public"."groups" to "service_role";

grant update on table "public"."groups" to "service_role";

grant delete on table "public"."links" to "anon";

grant insert on table "public"."links" to "anon";

grant references on table "public"."links" to "anon";

grant select on table "public"."links" to "anon";

grant trigger on table "public"."links" to "anon";

grant truncate on table "public"."links" to "anon";

grant update on table "public"."links" to "anon";

grant delete on table "public"."links" to "authenticated";

grant insert on table "public"."links" to "authenticated";

grant references on table "public"."links" to "authenticated";

grant select on table "public"."links" to "authenticated";

grant trigger on table "public"."links" to "authenticated";

grant truncate on table "public"."links" to "authenticated";

grant update on table "public"."links" to "authenticated";

grant delete on table "public"."links" to "service_role";

grant insert on table "public"."links" to "service_role";

grant references on table "public"."links" to "service_role";

grant select on table "public"."links" to "service_role";

grant trigger on table "public"."links" to "service_role";

grant truncate on table "public"."links" to "service_role";

grant update on table "public"."links" to "service_role";

grant delete on table "public"."logs" to "anon";

grant insert on table "public"."logs" to "anon";

grant references on table "public"."logs" to "anon";

grant select on table "public"."logs" to "anon";

grant trigger on table "public"."logs" to "anon";

grant truncate on table "public"."logs" to "anon";

grant update on table "public"."logs" to "anon";

grant delete on table "public"."logs" to "authenticated";

grant insert on table "public"."logs" to "authenticated";

grant references on table "public"."logs" to "authenticated";

grant select on table "public"."logs" to "authenticated";

grant trigger on table "public"."logs" to "authenticated";

grant truncate on table "public"."logs" to "authenticated";

grant update on table "public"."logs" to "authenticated";

grant delete on table "public"."logs" to "service_role";

grant insert on table "public"."logs" to "service_role";

grant references on table "public"."logs" to "service_role";

grant select on table "public"."logs" to "service_role";

grant trigger on table "public"."logs" to "service_role";

grant truncate on table "public"."logs" to "service_role";

grant update on table "public"."logs" to "service_role";

grant delete on table "public"."mentorships" to "anon";

grant insert on table "public"."mentorships" to "anon";

grant references on table "public"."mentorships" to "anon";

grant select on table "public"."mentorships" to "anon";

grant trigger on table "public"."mentorships" to "anon";

grant truncate on table "public"."mentorships" to "anon";

grant update on table "public"."mentorships" to "anon";

grant delete on table "public"."mentorships" to "authenticated";

grant insert on table "public"."mentorships" to "authenticated";

grant references on table "public"."mentorships" to "authenticated";

grant select on table "public"."mentorships" to "authenticated";

grant trigger on table "public"."mentorships" to "authenticated";

grant truncate on table "public"."mentorships" to "authenticated";

grant update on table "public"."mentorships" to "authenticated";

grant delete on table "public"."mentorships" to "service_role";

grant insert on table "public"."mentorships" to "service_role";

grant references on table "public"."mentorships" to "service_role";

grant select on table "public"."mentorships" to "service_role";

grant trigger on table "public"."mentorships" to "service_role";

grant truncate on table "public"."mentorships" to "service_role";

grant update on table "public"."mentorships" to "service_role";

grant delete on table "public"."misc" to "anon";

grant insert on table "public"."misc" to "anon";

grant references on table "public"."misc" to "anon";

grant select on table "public"."misc" to "anon";

grant trigger on table "public"."misc" to "anon";

grant truncate on table "public"."misc" to "anon";

grant update on table "public"."misc" to "anon";

grant delete on table "public"."misc" to "authenticated";

grant insert on table "public"."misc" to "authenticated";

grant references on table "public"."misc" to "authenticated";

grant select on table "public"."misc" to "authenticated";

grant trigger on table "public"."misc" to "authenticated";

grant truncate on table "public"."misc" to "authenticated";

grant update on table "public"."misc" to "authenticated";

grant delete on table "public"."misc" to "service_role";

grant insert on table "public"."misc" to "service_role";

grant references on table "public"."misc" to "service_role";

grant select on table "public"."misc" to "service_role";

grant trigger on table "public"."misc" to "service_role";

grant truncate on table "public"."misc" to "service_role";

grant update on table "public"."misc" to "service_role";

grant delete on table "public"."projects" to "anon";

grant insert on table "public"."projects" to "anon";

grant references on table "public"."projects" to "anon";

grant select on table "public"."projects" to "anon";

grant trigger on table "public"."projects" to "anon";

grant truncate on table "public"."projects" to "anon";

grant update on table "public"."projects" to "anon";

grant delete on table "public"."projects" to "authenticated";

grant insert on table "public"."projects" to "authenticated";

grant references on table "public"."projects" to "authenticated";

grant select on table "public"."projects" to "authenticated";

grant trigger on table "public"."projects" to "authenticated";

grant truncate on table "public"."projects" to "authenticated";

grant update on table "public"."projects" to "authenticated";

grant delete on table "public"."projects" to "service_role";

grant insert on table "public"."projects" to "service_role";

grant references on table "public"."projects" to "service_role";

grant select on table "public"."projects" to "service_role";

grant trigger on table "public"."projects" to "service_role";

grant truncate on table "public"."projects" to "service_role";

grant update on table "public"."projects" to "service_role";

grant delete on table "public"."report_cards_private" to "anon";

grant insert on table "public"."report_cards_private" to "anon";

grant references on table "public"."report_cards_private" to "anon";

grant select on table "public"."report_cards_private" to "anon";

grant trigger on table "public"."report_cards_private" to "anon";

grant truncate on table "public"."report_cards_private" to "anon";

grant update on table "public"."report_cards_private" to "anon";

grant delete on table "public"."report_cards_private" to "authenticated";

grant insert on table "public"."report_cards_private" to "authenticated";

grant references on table "public"."report_cards_private" to "authenticated";

grant select on table "public"."report_cards_private" to "authenticated";

grant trigger on table "public"."report_cards_private" to "authenticated";

grant truncate on table "public"."report_cards_private" to "authenticated";

grant update on table "public"."report_cards_private" to "authenticated";

grant delete on table "public"."report_cards_private" to "service_role";

grant insert on table "public"."report_cards_private" to "service_role";

grant references on table "public"."report_cards_private" to "service_role";

grant select on table "public"."report_cards_private" to "service_role";

grant trigger on table "public"."report_cards_private" to "service_role";

grant truncate on table "public"."report_cards_private" to "service_role";

grant update on table "public"."report_cards_private" to "service_role";

grant delete on table "public"."research" to "anon";

grant insert on table "public"."research" to "anon";

grant references on table "public"."research" to "anon";

grant select on table "public"."research" to "anon";

grant trigger on table "public"."research" to "anon";

grant truncate on table "public"."research" to "anon";

grant update on table "public"."research" to "anon";

grant delete on table "public"."research" to "authenticated";

grant insert on table "public"."research" to "authenticated";

grant references on table "public"."research" to "authenticated";

grant select on table "public"."research" to "authenticated";

grant trigger on table "public"."research" to "authenticated";

grant truncate on table "public"."research" to "authenticated";

grant update on table "public"."research" to "authenticated";

grant delete on table "public"."research" to "service_role";

grant insert on table "public"."research" to "service_role";

grant references on table "public"."research" to "service_role";

grant select on table "public"."research" to "service_role";

grant trigger on table "public"."research" to "service_role";

grant truncate on table "public"."research" to "service_role";

grant update on table "public"."research" to "service_role";

grant delete on table "public"."study_paths" to "anon";

grant insert on table "public"."study_paths" to "anon";

grant references on table "public"."study_paths" to "anon";

grant select on table "public"."study_paths" to "anon";

grant trigger on table "public"."study_paths" to "anon";

grant truncate on table "public"."study_paths" to "anon";

grant update on table "public"."study_paths" to "anon";

grant delete on table "public"."study_paths" to "authenticated";

grant insert on table "public"."study_paths" to "authenticated";

grant references on table "public"."study_paths" to "authenticated";

grant select on table "public"."study_paths" to "authenticated";

grant trigger on table "public"."study_paths" to "authenticated";

grant truncate on table "public"."study_paths" to "authenticated";

grant update on table "public"."study_paths" to "authenticated";

grant delete on table "public"."study_paths" to "service_role";

grant insert on table "public"."study_paths" to "service_role";

grant references on table "public"."study_paths" to "service_role";

grant select on table "public"."study_paths" to "service_role";

grant trigger on table "public"."study_paths" to "service_role";

grant truncate on table "public"."study_paths" to "service_role";

grant update on table "public"."study_paths" to "service_role";

grant delete on table "public"."task_assignments" to "anon";

grant insert on table "public"."task_assignments" to "anon";

grant references on table "public"."task_assignments" to "anon";

grant select on table "public"."task_assignments" to "anon";

grant trigger on table "public"."task_assignments" to "anon";

grant truncate on table "public"."task_assignments" to "anon";

grant update on table "public"."task_assignments" to "anon";

grant delete on table "public"."task_assignments" to "authenticated";

grant insert on table "public"."task_assignments" to "authenticated";

grant references on table "public"."task_assignments" to "authenticated";

grant select on table "public"."task_assignments" to "authenticated";

grant trigger on table "public"."task_assignments" to "authenticated";

grant truncate on table "public"."task_assignments" to "authenticated";

grant update on table "public"."task_assignments" to "authenticated";

grant delete on table "public"."task_assignments" to "service_role";

grant insert on table "public"."task_assignments" to "service_role";

grant references on table "public"."task_assignments" to "service_role";

grant select on table "public"."task_assignments" to "service_role";

grant trigger on table "public"."task_assignments" to "service_role";

grant truncate on table "public"."task_assignments" to "service_role";

grant update on table "public"."task_assignments" to "service_role";

grant delete on table "public"."tasks" to "anon";

grant insert on table "public"."tasks" to "anon";

grant references on table "public"."tasks" to "anon";

grant select on table "public"."tasks" to "anon";

grant trigger on table "public"."tasks" to "anon";

grant truncate on table "public"."tasks" to "anon";

grant update on table "public"."tasks" to "anon";

grant delete on table "public"."tasks" to "authenticated";

grant insert on table "public"."tasks" to "authenticated";

grant references on table "public"."tasks" to "authenticated";

grant select on table "public"."tasks" to "authenticated";

grant trigger on table "public"."tasks" to "authenticated";

grant truncate on table "public"."tasks" to "authenticated";

grant update on table "public"."tasks" to "authenticated";

grant delete on table "public"."tasks" to "service_role";

grant insert on table "public"."tasks" to "service_role";

grant references on table "public"."tasks" to "service_role";

grant select on table "public"."tasks" to "service_role";

grant trigger on table "public"."tasks" to "service_role";

grant truncate on table "public"."tasks" to "service_role";

grant update on table "public"."tasks" to "service_role";

grant delete on table "public"."terms" to "anon";

grant insert on table "public"."terms" to "anon";

grant references on table "public"."terms" to "anon";

grant select on table "public"."terms" to "anon";

grant trigger on table "public"."terms" to "anon";

grant truncate on table "public"."terms" to "anon";

grant update on table "public"."terms" to "anon";

grant delete on table "public"."terms" to "authenticated";

grant insert on table "public"."terms" to "authenticated";

grant references on table "public"."terms" to "authenticated";

grant select on table "public"."terms" to "authenticated";

grant trigger on table "public"."terms" to "authenticated";

grant truncate on table "public"."terms" to "authenticated";

grant update on table "public"."terms" to "authenticated";

grant delete on table "public"."terms" to "service_role";

grant insert on table "public"."terms" to "service_role";

grant references on table "public"."terms" to "service_role";

grant select on table "public"."terms" to "service_role";

grant trigger on table "public"."terms" to "service_role";

grant truncate on table "public"."terms" to "service_role";

grant update on table "public"."terms" to "service_role";

grant delete on table "public"."user_profiles" to "anon";

grant insert on table "public"."user_profiles" to "anon";

grant references on table "public"."user_profiles" to "anon";

grant select on table "public"."user_profiles" to "anon";

grant trigger on table "public"."user_profiles" to "anon";

grant truncate on table "public"."user_profiles" to "anon";

grant update on table "public"."user_profiles" to "anon";

grant delete on table "public"."user_profiles" to "authenticated";

grant insert on table "public"."user_profiles" to "authenticated";

grant references on table "public"."user_profiles" to "authenticated";

grant select on table "public"."user_profiles" to "authenticated";

grant trigger on table "public"."user_profiles" to "authenticated";

grant truncate on table "public"."user_profiles" to "authenticated";

grant update on table "public"."user_profiles" to "authenticated";

grant delete on table "public"."user_profiles" to "service_role";

grant insert on table "public"."user_profiles" to "service_role";

grant references on table "public"."user_profiles" to "service_role";

grant select on table "public"."user_profiles" to "service_role";

grant trigger on table "public"."user_profiles" to "service_role";

grant truncate on table "public"."user_profiles" to "service_role";

grant update on table "public"."user_profiles" to "service_role";

grant delete on table "public"."users" to PUBLIC;

grant insert on table "public"."users" to PUBLIC;

grant references on table "public"."users" to PUBLIC;

grant select on table "public"."users" to PUBLIC;

grant trigger on table "public"."users" to PUBLIC;

grant truncate on table "public"."users" to PUBLIC;

grant update on table "public"."users" to PUBLIC;

grant delete on table "public"."users" to "anon";

grant insert on table "public"."users" to "anon";

grant references on table "public"."users" to "anon";

grant select on table "public"."users" to "anon";

grant trigger on table "public"."users" to "anon";

grant truncate on table "public"."users" to "anon";

grant update on table "public"."users" to "anon";

grant delete on table "public"."users" to "authenticated";

grant insert on table "public"."users" to "authenticated";

grant references on table "public"."users" to "authenticated";

grant select on table "public"."users" to "authenticated";

grant trigger on table "public"."users" to "authenticated";

grant truncate on table "public"."users" to "authenticated";

grant update on table "public"."users" to "authenticated";

grant delete on table "public"."users" to "service_role";

grant insert on table "public"."users" to "service_role";

grant references on table "public"."users" to "service_role";

grant select on table "public"."users" to "service_role";

grant trigger on table "public"."users" to "service_role";

grant truncate on table "public"."users" to "service_role";

grant update on table "public"."users" to "service_role";

grant select on table "public"."users" to "supabase_auth_admin";

grant delete on table "public"."users_groups" to "anon";

grant insert on table "public"."users_groups" to "anon";

grant references on table "public"."users_groups" to "anon";

grant select on table "public"."users_groups" to "anon";

grant trigger on table "public"."users_groups" to "anon";

grant truncate on table "public"."users_groups" to "anon";

grant update on table "public"."users_groups" to "anon";

grant delete on table "public"."users_groups" to "authenticated";

grant insert on table "public"."users_groups" to "authenticated";

grant references on table "public"."users_groups" to "authenticated";

grant select on table "public"."users_groups" to "authenticated";

grant trigger on table "public"."users_groups" to "authenticated";

grant truncate on table "public"."users_groups" to "authenticated";

grant update on table "public"."users_groups" to "authenticated";

grant delete on table "public"."users_groups" to "service_role";

grant insert on table "public"."users_groups" to "service_role";

grant references on table "public"."users_groups" to "service_role";

grant select on table "public"."users_groups" to "service_role";

grant trigger on table "public"."users_groups" to "service_role";

grant truncate on table "public"."users_groups" to "service_role";

grant update on table "public"."users_groups" to "service_role";

grant delete on table "public"."vocation" to "anon";

grant insert on table "public"."vocation" to "anon";

grant references on table "public"."vocation" to "anon";

grant select on table "public"."vocation" to "anon";

grant trigger on table "public"."vocation" to "anon";

grant truncate on table "public"."vocation" to "anon";

grant update on table "public"."vocation" to "anon";

grant delete on table "public"."vocation" to "authenticated";

grant insert on table "public"."vocation" to "authenticated";

grant references on table "public"."vocation" to "authenticated";

grant select on table "public"."vocation" to "authenticated";

grant trigger on table "public"."vocation" to "authenticated";

grant truncate on table "public"."vocation" to "authenticated";

grant update on table "public"."vocation" to "authenticated";

grant delete on table "public"."vocation" to "service_role";

grant insert on table "public"."vocation" to "service_role";

grant references on table "public"."vocation" to "service_role";

grant select on table "public"."vocation" to "service_role";

grant trigger on table "public"."vocation" to "service_role";

grant truncate on table "public"."vocation" to "service_role";

grant update on table "public"."vocation" to "service_role";


  create policy "Admins can view audit log"
  on "public"."audit_log"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.is_admin = true)))));



  create policy "Service role can manage audit log"
  on "public"."audit_log"
  as permissive
  for all
  to service_role
using (true)
with check (true);



  create policy "Staff can view student audit logs"
  on "public"."audit_log"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = 'staff'::public.user_role)))));



  create policy "Users can view own audit log"
  on "public"."audit_log"
  as permissive
  for select
  to authenticated
using (((student_id = auth.uid()) OR (updating_user = auth.uid())));



  create policy "anyone can read"
  on "public"."events"
  as permissive
  for select
  to public
using (true);



  create policy "staff have full access"
  on "public"."events"
  as permissive
  for all
  to authenticated
using ((((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'staff'::text));



  create policy "users manage their own data"
  on "public"."events"
  as permissive
  for all
  to authenticated
using ((auth.uid() = created_by));



  create policy "anyone can read"
  on "public"."groups"
  as permissive
  for select
  to authenticated
using (true);



  create policy "staff have full access"
  on "public"."groups"
  as permissive
  for all
  to public
using ((((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'staff'::text));



  create policy "staff have full access"
  on "public"."logs"
  as permissive
  for all
  to authenticated
using ((((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'staff'::text));



  create policy "users manage their own data"
  on "public"."logs"
  as permissive
  for all
  to public
using ((auth.uid() = user_id));



  create policy "staff have full access"
  on "public"."mentorships"
  as permissive
  for all
  to authenticated
using ((((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'staff'::text));



  create policy "students read their own"
  on "public"."mentorships"
  as permissive
  for select
  to authenticated
using ((auth.uid() = student_id));



  create policy "admin have edit"
  on "public"."misc"
  as permissive
  for update
  to public
using (((((auth.jwt() -> 'app_metadata'::text) ->> 'is_admin'::text))::boolean = true));



  create policy "anyone can read"
  on "public"."misc"
  as permissive
  for select
  to public
using (true);



  create policy "staff have full access"
  on "public"."projects"
  as permissive
  for all
  to authenticated
using ((((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'staff'::text));



  create policy "users manage their own data"
  on "public"."projects"
  as permissive
  for all
  to authenticated
using ((auth.uid() = student_id));



  create policy "full access to own row"
  on "public"."report_cards_private"
  as permissive
  for all
  to public
using ((auth.uid() = id));



  create policy "staff have full access"
  on "public"."report_cards_private"
  as permissive
  for all
  to public
using ((((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'staff'::text));



  create policy "staff have full access"
  on "public"."research"
  as permissive
  for all
  to authenticated
using ((((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'staff'::text));



  create policy "users manage their own data"
  on "public"."research"
  as permissive
  for all
  to authenticated
using ((auth.uid() = student_id));



  create policy "staff have full access"
  on "public"."study_paths"
  as permissive
  for all
  to authenticated
using ((((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'staff'::text));



  create policy "users manage their own data"
  on "public"."study_paths"
  as permissive
  for all
  to public
using ((auth.uid() = student_id));



  create policy "anyone can read"
  on "public"."task_assignments"
  as permissive
  for select
  to public
using (true);



  create policy "staff have full acess"
  on "public"."task_assignments"
  as permissive
  for all
  to authenticated
using ((((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'staff'::text));



  create policy "staff have full access "
  on "public"."tasks"
  as permissive
  for all
  to public
using ((((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'staff'::text));



  create policy "users has full access to their own"
  on "public"."tasks"
  as permissive
  for all
  to authenticated
using ((auth.uid() = student_id));



  create policy "admin "
  on "public"."terms"
  as permissive
  for all
  to public
using (((((auth.jwt() -> 'app_metadata'::text) ->> 'is_admin'::text))::boolean = true));



  create policy "anyone can read"
  on "public"."terms"
  as permissive
  for select
  to public
using (true);



  create policy "Users can update own profile"
  on "public"."user_profiles"
  as permissive
  for update
  to public
using ((auth.uid() = id));



  create policy "Users can view own profile"
  on "public"."user_profiles"
  as permissive
  for select
  to public
using ((auth.uid() = id));



  create policy "staff can read all"
  on "public"."user_profiles"
  as permissive
  for select
  to authenticated
using ((((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'staff'::text));



  create policy "staff can update all"
  on "public"."user_profiles"
  as permissive
  for update
  to public
using ((((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'staff'::text));



  create policy "Users can view own official record"
  on "public"."users"
  as permissive
  for select
  to public
using ((auth.uid() = id));



  create policy "admins can update"
  on "public"."users"
  as permissive
  for update
  to authenticated
using (((((auth.jwt() -> 'app_metadata'::text) ->> 'is_admin'::text))::boolean = true));



  create policy "allow auth admin to read"
  on "public"."users"
  as permissive
  for select
  to supabase_auth_admin
using (true);



  create policy "staff can read all"
  on "public"."users"
  as permissive
  for select
  to authenticated
using ((((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'staff'::text));



  create policy "anyone can read"
  on "public"."users_groups"
  as permissive
  for select
  to authenticated
using (true);



  create policy "staff has full access"
  on "public"."users_groups"
  as permissive
  for all
  to authenticated
using ((((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'staff'::text));



  create policy "users can read their own"
  on "public"."users_groups"
  as permissive
  for select
  to authenticated
using ((auth.uid() = user_id));


CREATE TRIGGER trigger_log_project_metadata AFTER INSERT OR UPDATE OF metadata ON public.projects FOR EACH ROW EXECUTE FUNCTION public.log_project_metadata_change();

CREATE TRIGGER trigger_log_report_card AFTER INSERT OR UPDATE ON public.report_cards_private FOR EACH ROW EXECUTE FUNCTION public.log_report_card_change();

CREATE TRIGGER trigger_log_research_metadata AFTER INSERT OR UPDATE OF metadata ON public.research FOR EACH ROW EXECUTE FUNCTION public.log_research_metadata_change();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime('updated_at');


  create policy "full_access 1ffg0oo_0"
  on "storage"."objects"
  as permissive
  for select
  to authenticated, supabase_realtime_admin, service_role
using ((bucket_id = 'images'::text));



  create policy "full_access 1ffg0oo_1"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated, supabase_realtime_admin, service_role
with check ((bucket_id = 'images'::text));



  create policy "full_access 1ffg0oo_2"
  on "storage"."objects"
  as permissive
  for update
  to authenticated, supabase_realtime_admin, service_role
using ((bucket_id = 'images'::text));



  create policy "full_access 1ffg0oo_3"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated, supabase_realtime_admin, service_role
using ((bucket_id = 'images'::text));



