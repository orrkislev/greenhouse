-- 1. Add group_id, assigned_to, completed_by to tasks
ALTER TABLE public.tasks
  ADD COLUMN group_id     UUID REFERENCES public.groups(id) ON DELETE SET NULL,
  ADD COLUMN assigned_to  UUID[] NOT NULL DEFAULT '{}',
  ADD COLUMN completed_by UUID[] NOT NULL DEFAULT '{}';

CREATE INDEX idx_tasks_group_id ON public.tasks USING btree (group_id);

-- 2. Migrate existing group-task links → group_id (only where group still exists)
UPDATE public.tasks t
SET group_id = (
  SELECT CASE
    WHEN l.a_table = 'groups' THEN l.a_id
    ELSE l.b_id
  END
  FROM public.links l
  JOIN public.groups g ON g.id = CASE
    WHEN l.a_table = 'groups' THEN l.a_id
    ELSE l.b_id
  END
  WHERE (
    (l.a_table = 'tasks' AND l.a_id = t.id AND l.b_table = 'groups') OR
    (l.b_table = 'tasks' AND l.b_id = t.id AND l.a_table = 'groups')
  )
  LIMIT 1
)
WHERE t.group_id IS NULL;

-- 3. Migrate completed task_assignments → completed_by
UPDATE public.tasks t
SET completed_by = (
  SELECT ARRAY_AGG(ta.student_id)
  FROM public.task_assignments ta
  WHERE ta.task_id = t.id AND ta.status = 'completed'
)
WHERE t.group_id IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.task_assignments ta
    WHERE ta.task_id = t.id AND ta.status = 'completed'
  );

-- 4. Rewrite get_user_group_tasks_by_group RPC
CREATE OR REPLACE FUNCTION public.get_user_group_tasks_by_group(
  p_user_id uuid,
  p_group_id uuid,
  p_include_completed boolean DEFAULT false
)
RETURNS jsonb LANGUAGE sql STABLE AS $function$
WITH user_role AS (
  SELECT u.role FROM public.users u WHERE u.id = p_user_id LIMIT 1
),
group_tasks AS (
  SELECT t.id, t.title, t.description, t.status,
         t.due_date, t.created_at, t.updated_at,
         t.assigned_to, t.completed_by, t.created_by
  FROM public.tasks t
  WHERE t.group_id = p_group_id
    AND (
      p_include_completed = true
      OR t.status NOT IN ('completed', 'archived', 'closed')
    )
),
student_view AS (
  SELECT
    gt.id AS task_id,
    gt.title,
    gt.description,
    CASE WHEN p_user_id = ANY(gt.completed_by) THEN 'completed'::text ELSE 'todo'::text END AS status,
    gt.due_date,
    gt.created_at,
    gt.updated_at,
    gt.assigned_to,
    gt.completed_by
  FROM group_tasks gt
  WHERE cardinality(gt.assigned_to) = 0
     OR p_user_id = ANY(gt.assigned_to)
),
staff_view AS (
  SELECT
    gt.id AS task_id,
    gt.title,
    gt.description,
    gt.status::text AS status,
    gt.due_date,
    gt.created_at,
    gt.updated_at,
    gt.assigned_to,
    gt.completed_by
  FROM group_tasks gt
)
SELECT COALESCE(
  jsonb_agg(
    jsonb_build_object(
      'id',           v.task_id,
      'title',        v.title,
      'description',  v.description,
      'status',       v.status,
      'assigned_to',  v.assigned_to,
      'completed_by', v.completed_by,
      'due_date',     v.due_date,
      'created_at',   v.created_at,
      'updated_at',   v.updated_at
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
$function$;
;