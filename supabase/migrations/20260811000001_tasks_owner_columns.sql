-- Replace the generic `links` table with real FK columns on tasks.
--
-- `links` was a polymorphic many-to-many table, but in practice it only ever
-- expressed "what owns this task". Groups already moved to tasks.group_id in
-- 20260301202626_group_task_arrays.sql; this does the same for projects and
-- study paths, and removes the table.
--
-- Verified against production before writing: 0 tasks had more than one owner,
-- and the remaining non-task pairs (projects<->terms, events<->groups) are fully
-- redundant with projects.term and events.group_id respectively.

-- 1. Owner columns. ON DELETE CASCADE is the point of the exercise: deleting a
--    project or study path previously orphaned its tasks silently.
ALTER TABLE public.tasks
  ADD COLUMN project_id    uuid REFERENCES public.projects(id)    ON DELETE CASCADE,
  ADD COLUMN study_path_id uuid REFERENCES public.study_paths(id) ON DELETE CASCADE;

CREATE INDEX idx_tasks_project_id    ON public.tasks USING btree (project_id);
CREATE INDEX idx_tasks_study_path_id ON public.tasks USING btree (study_path_id);

-- 2. Backfill. links stores pairs unordered, so normalize direction first.
--    Rows whose owner no longer exists are skipped here and handled in step 3.
WITH task_links AS (
  SELECT
    CASE WHEN l.a_table = 'tasks' THEN l.a_id    ELSE l.b_id    END AS task_id,
    CASE WHEN l.a_table = 'tasks' THEN l.b_table ELSE l.a_table END AS owner_table,
    CASE WHEN l.a_table = 'tasks' THEN l.b_id    ELSE l.a_id    END AS owner_id
  FROM public.links l
  WHERE 'tasks' IN (l.a_table, l.b_table)
)
UPDATE public.tasks t
SET project_id = tl.owner_id
FROM task_links tl
WHERE tl.task_id = t.id
  AND tl.owner_table = 'projects'
  AND EXISTS (SELECT 1 FROM public.projects p WHERE p.id = tl.owner_id);

WITH task_links AS (
  SELECT
    CASE WHEN l.a_table = 'tasks' THEN l.a_id    ELSE l.b_id    END AS task_id,
    CASE WHEN l.a_table = 'tasks' THEN l.b_table ELSE l.a_table END AS owner_table,
    CASE WHEN l.a_table = 'tasks' THEN l.b_id    ELSE l.a_id    END AS owner_id
  FROM public.links l
  WHERE 'tasks' IN (l.a_table, l.b_table)
)
UPDATE public.tasks t
SET study_path_id = tl.owner_id
FROM task_links tl
WHERE tl.task_id = t.id
  AND tl.owner_table = 'study_paths'
  AND EXISTS (SELECT 1 FROM public.study_paths s WHERE s.id = tl.owner_id);

-- 3. Archive tasks whose owner was already deleted (82 rows at time of writing).
--    They have been unreachable in the UI for months; without this they would
--    resurface as personal tasks the moment the links-based filter goes away.
--    'archived' is already excluded by the planning queries.
WITH task_links AS (
  SELECT
    CASE WHEN l.a_table = 'tasks' THEN l.a_id    ELSE l.b_id    END AS task_id,
    CASE WHEN l.a_table = 'tasks' THEN l.b_table ELSE l.a_table END AS owner_table,
    CASE WHEN l.a_table = 'tasks' THEN l.b_id    ELSE l.a_id    END AS owner_id
  FROM public.links l
  WHERE 'tasks' IN (l.a_table, l.b_table)
),
orphans AS (
  SELECT tl.task_id
  FROM task_links tl
  WHERE (tl.owner_table = 'projects'
         AND NOT EXISTS (SELECT 1 FROM public.projects p WHERE p.id = tl.owner_id))
     OR (tl.owner_table = 'study_paths'
         AND NOT EXISTS (SELECT 1 FROM public.study_paths s WHERE s.id = tl.owner_id))
)
UPDATE public.tasks t
SET status = 'archived'
FROM orphans o
WHERE o.task_id = t.id
  AND t.status IN ('todo', 'in_progress');

-- 4. Orphaned-task lookup no longer needs links.
--    The 'research' owner type is dropped - nothing has written one in a long time.
CREATE OR REPLACE FUNCTION public.get_user_orphaned_tasks(p_user_id uuid, p_active_only boolean DEFAULT true, p_max_count integer DEFAULT 100)
 RETURNS json
 LANGUAGE sql
AS $function$
  WITH relevant AS (
    SELECT t.*
    FROM public.tasks t
    WHERE
      t.student_id = p_user_id
      AND (p_active_only = false OR t.status IN ('todo','in_progress'))
      AND t.project_id    IS NULL
      AND t.study_path_id IS NULL
      AND t.group_id      IS NULL
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
$function$;

-- 5. Drop the link machinery. project_get_master calls get_linked_items, so it
--    goes first. It has no callers and is superseded by the projects.master FK.
DROP FUNCTION IF EXISTS public.project_get_master(uuid);
DROP FUNCTION IF EXISTS public.get_next_project_tasks(uuid, integer);
DROP FUNCTION IF EXISTS public.get_studypath_next_tasks(uuid, integer);
DROP FUNCTION IF EXISTS public.get_linked_items(text, uuid, text[]);

DROP TABLE public.links;
