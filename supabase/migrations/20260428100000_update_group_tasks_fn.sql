CREATE OR REPLACE FUNCTION public.get_user_group_tasks_by_group(
  p_user_id uuid,
  p_group_id uuid,
  p_include_completed boolean DEFAULT false
)
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
    t.status,
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
    AND (t.status = 'todo' OR (p_include_completed AND t.status = 'completed'))
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
